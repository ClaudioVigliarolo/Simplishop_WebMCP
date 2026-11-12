# 01 — Project overview

WebMCP is an emerging browser API that lets a page offer named, described, schema-backed JavaScript tools to an AI agent. Instead of guessing which buttons to click, a compatible agent can ask the browser to discover a page's tools and invoke one with structured arguments. The page runs the action in its own document and can update its own UI.

WebMCP complements ordinary browser automation: automation inspects a rendered page and acts through clicks and typing; a WebMCP tool is a direct, purpose-built app capability. It complements server-side MCP too: a server-side MCP server exposes remote tools over a protocol connection, while WebMCP exposes page-local functions in the active browser tab. Neither makes the other obsolete.

SimpliShop demonstrates catalog lookup, filtering, product details and cart changes, with no checkout/payment action. The browser API documented here is `document.modelContext`; it is not `navigator.modelContext`. The WebMCP Community Group report is a draft, not a W3C Standard. Chrome documentation describes Chrome 149 origin trial and a local `chrome://flags/#enable-webmcp-testing` flag. This does not establish support in other browsers or guarantee any agent client. Compatibility is detected at runtime.

The project uses React, TypeScript, Vite and Vitest. `completed/` includes the tools and workbench; `starter/` is a separate no-WebMCP version. Both are static client apps with local mock product data and browser-local cart state. An optional `agent/` app adds a Python Gradio `ChatInterface`, OpenAI API function calling, and Playwright CDP control of a dedicated Chrome profile. The store itself needs no backend or AI key; the optional chat agent needs an OpenAI API key and WebMCP available in Chrome.
