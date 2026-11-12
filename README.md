# SimpliShop: React + WebMCP course demo

This workspace contains two independently runnable store apps, a Python chat agent that uses the OpenAI API, and eight course documents.

## Run the store

```sh
cd completed
npm install
npm run dev
```

Open `/dev-tools` to exercise the shared functions without an AI agent. For the no-WebMCP student baseline, run the same commands from `starter/`.

## Run the local Gradio AI agent

The agent uses OpenAI's Responses API and connects to a dedicated Chrome session over Chrome DevTools Protocol (CDP). It discovers the tools exposed by the completed site and invokes them through `document.modelContext.executeTool()`. It does not call a SimpliShop HTTP API; the tools run in the actual site tab and update its React UI. Gradio's `ChatInterface` is the chat UI, OpenAI supplies model tool-calling, and Playwright attaches to Chrome. [Gradio ChatInterface docs](https://gradio.app/docs/gradio/chatinterface), [OpenAI function calling](https://developers.openai.com/api/docs/guides/function-calling), [Playwright CDP docs](https://playwright.dev/python/docs/api/class-browsertype#browser-type-connect-over-cdp)

### 1. Start the completed store

In terminal 1:

```sh
cd completed
npm install
npm run dev
```

The default Vite address is `http://localhost:5173`.

### 2. Enable WebMCP in a dedicated Chrome profile

Start a separate, persistent Chrome profile with remote debugging enabled. On macOS:

```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --user-data-dir="$HOME/.simplishop-chrome" \
  --remote-debugging-port=9222
```

In that Chrome window, open `chrome://flags/#enable-webmcp-testing`, enable the flag, and relaunch Chrome. Then open `http://localhost:5173` in that profile. The WebMCP flag is saved in this profile, so enable it once. Keep using the exact same `--user-data-dir` path on later runs. The debugging port is a launch argument, so start Chrome with this command each time you want to run the Python agent. If Chrome's flag relaunch closes the debugging connection, run the command again; the saved WebMCP flag should remain enabled.

This is a normal, separate Chrome profile, **not Incognito**. Keep this profile for the demo and don't use your everyday profile with remote debugging. CDP lets the agent control pages in the connected browser. The agent uses port `9222` in the background; you do not chat at that address. You can open `http://127.0.0.1:9222/json/version` to check that Chrome's debugging service is listening.

Chrome currently documents the testing flag for local development and an origin trial for supported Chrome releases. WebMCP is experimental and the flag/version can change. [Chrome WebMCP setup](https://developer.chrome.com/docs/ai/webmcp)

### 3. Configure OpenAI API access

Create an API key in your OpenAI Platform project and place it in `agent/.env`. Start from the example file:

```sh
cd agent
cp .env.example .env
```

Edit `agent/.env` and replace `put_your_project_api_key_here` with your key. The `.env` file is git-ignored. The default model is `gpt-6-astra`; change `OPENAI_MODEL` there if you want another model available to your API project. The agent sends chat messages and SimpliShop tool results to the OpenAI API. ChatGPT and API billing are managed separately; eligible ChatGPT subscriptions may have an API credit benefit that must be activated. [OpenAI API key setup](https://developers.openai.com/api/docs/guides/api-keys) · [ChatGPT/API billing details](https://help.openai.com/en/articles/20001626-api-credits-benefit-for-eligible-chatgpt-subscriptions)

To point the local agent at the deployed store, set `SIMPLISHOP_URL` in `agent/.env` to its public origin, for example `SIMPLISHOP_URL=https://your-store.example`. The Python app loads this file from its own folder, so the setting works whether you start it from the repository root or from `agent/`.

### 4. Install and run the Gradio agent

In terminal 2:

```sh
cd agent
python --version  # Python 3.10 or newer recommended
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

On Windows, activate with `.venv\\Scripts\\activate`. Open `http://127.0.0.1:7860` in your regular browser window. This Gradio page can be in your normal browser; it is separate from the dedicated Chrome profile hosting SimpliShop. The agent attaches to that Chrome profile on port 9222, finds the SimpliShop tab (or opens it), discovers the six allowed site tools, and lets OpenAI choose and invoke them.

Optional environment settings: `OPENAI_MODEL`, `CHROME_CDP_URL`, and `SIMPLISHOP_URL` (these can be set in `agent/.env`).

### Example prompts to try

- “Show me all laptops under €900.”
- “Find the cheapest headphones.”
- “Add two Soundwave Pro headphones to my bag.”
- “What's currently in my bag?”
- “Remove the Soundwave Pro headphones from my bag.”
- “Show me the Nova Air 14 details.”

After a cart prompt, look at the SimpliShop Chrome tab: its cart count and contents should update. These prompts require OpenAI API access, a Chrome CDP connection, and a WebMCP-enabled completed app. They will not work through the starter app or the `/dev-tools` function tester alone.

### What the agent reads

The agent connects only to the Chrome profile listening on port 9222. It uses the first/default browser context and requires exactly one SimpliShop tab there; if duplicate store tabs are open, it asks you to close extras instead of choosing a cart silently. It does not scrape unrelated tabs. It reads SimpliShop's six tool descriptions/schemas and only the product or cart data returned by tools the model calls. The chat prompt/history, tool schemas, and tool results are sent to the OpenAI API using the configured model. Gradio chat history is also saved in the browser's local storage because `save_history=True`. The app has no database.

## Course material

See [course-docs/01-PROJECT-OVERVIEW.md](course-docs/01-PROJECT-OVERVIEW.md), [course-docs/04-COURSE-LESSONS.md](course-docs/04-COURSE-LESSONS.md), [course-docs/05-VIDEO-DEMO-GUIDE.md](course-docs/05-VIDEO-DEMO-GUIDE.md), and [course-docs/06-SETUP-AND-TROUBLESHOOTING.md](course-docs/06-SETUP-AND-TROUBLESHOOTING.md). The store itself continues to work without WebMCP; the real agent workflow depends on experimental browser support.
