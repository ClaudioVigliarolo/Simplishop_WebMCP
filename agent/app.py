"""A Gradio/OpenAI agent that invokes SimpliShop's WebMCP tools in Chrome."""

from __future__ import annotations

import json
import os
import threading
from contextlib import contextmanager
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
import gradio as gr
from openai import OpenAI, OpenAIError
from playwright.sync_api import Error as PlaywrightError
from playwright.sync_api import sync_playwright

load_dotenv(Path(__file__).with_name(".env"))

OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-6-astra")
CDP_URL = os.getenv("CHROME_CDP_URL", "http://127.0.0.1:9222")
APP_URL = os.getenv("SIMPLISHOP_URL", "http://localhost:5173")
ALLOWED_TOOLS = {
    "get_products",
    "search_products",
    "get_product_details",
    "add_to_cart",
    "get_cart",
    "remove_from_cart",
}
MAX_TOOL_ROUNDS = 8
browser_lock = threading.Lock()

SYSTEM_PROMPT = """You are SimpliShop's helpful shopping assistant. You can answer using the
products and cart tools exposed by the open SimpliShop page. Use tools to check live
catalog or cart state instead of guessing. Never claim an action succeeded unless its
tool returned success. You may search and change the cart, but you cannot purchase,
checkout, or make payments. Keep answers concise and include euro prices when useful."""


def _openai_request(input_items: list[dict[str, Any]], tools: list[dict[str, Any]]) -> Any:
    """Send one tool-calling request to the OpenAI Responses API."""
    if not os.getenv("OPENAI_API_KEY"):
        raise RuntimeError(
            "OPENAI_API_KEY is not set. Create an OpenAI API key and set it in agent/.env, "
            "and restart the Gradio agent. ChatGPT sign-in alone is not API authentication."
        )
    try:
        client = OpenAI(timeout=180)
        return client.responses.create(
            model=OPENAI_MODEL,
            instructions=SYSTEM_PROMPT,
            input=input_items,
            tools=tools,
            store=False,
        )
    except OpenAIError as exc:
        raise RuntimeError(f"OpenAI API request failed: {exc}") from exc


def _active_page(browser: Any) -> Any:
    """Find the SimpliShop tab, or open it in the connected Chrome context."""
    if not browser.contexts:
        raise RuntimeError("Chrome has no browser context available over CDP.")
    context = browser.contexts[0]
    base = APP_URL.rstrip("/")
    matching_pages = [
        page
        for page in context.pages
        if page.url.rstrip("/") == base or page.url.startswith(base + "/")
    ]
    if len(matching_pages) > 1:
        raise RuntimeError(
            "More than one SimpliShop tab is open in the connected Chrome profile. "
            "Close duplicates and leave one store tab open so the agent uses the intended cart."
        )
    if matching_pages:
        return matching_pages[0]
    page = context.new_page()
    page.goto(APP_URL, wait_until="domcontentloaded", timeout=30000)
    return page


@contextmanager
def _site_tools() -> Any:
    """Connect to Chrome, then yield its SimpliShop page and discovered tool schemas."""
    playwright = None
    browser = None
    try:
        playwright = sync_playwright().start()
        browser = playwright.chromium.connect_over_cdp(CDP_URL, timeout=5000)
    except PlaywrightError as exc:
        if playwright is not None:
            playwright.stop()
        raise RuntimeError(
            f"Could not connect to Chrome at {CDP_URL}. Start Chrome with remote debugging, "
            "enable WebMCP, and open SimpliShop."
        ) from exc
    try:
        page = _active_page(browser)
        try:
            page.wait_for_function(
                "async () => Boolean(document.modelContext && "
                "(await document.modelContext.getTools()).length)",
                timeout=10000,
            )
        except PlaywrightError as exc:
            raise RuntimeError(
                "SimpliShop's WebMCP tools were not found. Check Chrome's WebMCP testing "
                "flag, reload the site, and make sure you opened the completed app."
            ) from exc

        raw_tools = page.evaluate(
            "async () => (await document.modelContext.getTools()).map("
            "({name, description, inputSchema}) => ({name, description, inputSchema}))"
        )
        tools = []
        for tool in raw_tools:
            if tool.get("name") not in ALLOWED_TOOLS:
                continue
            tools.append(
                {
                    "type": "function",
                    "name": tool["name"],
                    "description": tool["description"],
                    "parameters": tool.get("inputSchema")
                    or {"type": "object", "properties": {}},
                }
            )
        if not tools:
            raise RuntimeError("The open page did not expose any allowed SimpliShop tools.")
        yield page, tools
    except Exception:
        raise
    finally:
        if browser is not None and browser.is_connected():
            # CDP detach leaves the user's Chrome process running.
            browser.close()
        if playwright is not None:
            playwright.stop()


def _call_site_tool(name: str, arguments: Any, page: Any) -> str:
    """Invoke a discovered WebMCP tool in its owning page and return its JSON result."""
    if name not in ALLOWED_TOOLS:
        raise RuntimeError(f"Tool is not allowed by this demo: {name}")
    if not isinstance(arguments, dict):
        raise RuntimeError("Tool arguments must be a JSON object.")

    result = page.evaluate(
        "async ({name, input}) => {"
        " const context = document.modelContext;"
        " if (!context || typeof context.getTools !== 'function') {"
        "   throw new Error('document.modelContext is unavailable in this Chrome tab. "
        "Enable WebMCP in the Chrome profile connected on port 9222, then reload SimpliShop.');"
        " }"
        " const tools = await context.getTools();"
        " const tool = tools.find((item) => item.name === name);"
        " if (!tool) throw new Error(`Tool not found: ${name}`);"
        " return await context.executeTool(tool, input);"
        "}",
        {"name": name, "input": arguments},
    )
    return result if isinstance(result, str) else json.dumps(result, ensure_ascii=False)


def _history_messages(history: list[dict[str, Any]]) -> list[dict[str, str]]:
    messages: list[dict[str, str]] = []
    for item in history:
        role = item.get("role")
        content = item.get("content")
        if role in {"user", "assistant"} and isinstance(content, str):
            messages.append({"role": role, "content": content})
    return messages


def chat(message: str, history: list[dict[str, Any]]) -> str:
    """Gradio ChatInterface callback: let OpenAI choose and execute site tools."""
    try:
        with browser_lock:
            with _site_tools() as (page, available_tools):
                messages = _history_messages(history)
                messages.append({"role": "user", "content": message})

                for _ in range(MAX_TOOL_ROUNDS):
                    response = _openai_request(messages, available_tools)
                    output_items = [item.model_dump(exclude_none=True) for item in response.output]
                    messages.extend(output_items)
                    tool_calls = [item for item in response.output if item.type == "function_call"]
                    if not tool_calls:
                        return response.output_text or "I couldn't find a response."

                    for call in tool_calls:
                        name = call.name
                        try:
                            arguments = json.loads(call.arguments)
                        except (TypeError, json.JSONDecodeError):
                            arguments = {}
                        try:
                            result = _call_site_tool(name, arguments, page)
                        except Exception as exc:  # Return tool failures to the model for recovery.
                            result = json.dumps({"error": str(exc)}, ensure_ascii=False)
                        messages.append(
                            {"type": "function_call_output", "call_id": call.call_id, "output": result}
                        )

                return "I stopped after several tool calls to avoid an endless loop. Try a simpler request."
    except Exception as exc:
        return f"Agent error: {exc}"


demo = gr.ChatInterface(
    fn=chat,
    title="SimpliShop AI Agent",
    description=(
        "An OpenAI model that discovers and calls SimpliShop's WebMCP tools in Chrome. "
        "Run the completed store with WebMCP enabled before chatting."
    ),
    examples=[
        "Show me all laptops under €900.",
        "Find the cheapest headphones.",
        "Add two Soundwave Pro headphones to my bag.",
        "What's currently in my bag?",
    ],
    save_history=True,
    concurrency_limit=1,
)


if __name__ == "__main__":
    demo.launch(server_name="127.0.0.1", server_port=7860)
