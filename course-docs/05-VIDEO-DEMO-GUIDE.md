# 05 — Video demo guide

## Recording sequence

1. Open `completed/` storefront at desktop width; show the SimpliShop mark, catalog and experimental status indicator.
2. Search “headphones”; select Audio; lower max price. Show results changing without a reload.
3. Open Soundwave Pro detail view, then add it to the bag. Open bag and explain subtotal and that checkout is intentionally absent.
4. Open `/dev-tools`. Explain that the panel calls the same functions but is not an AI agent.
5. Run `search_products` with `{"query":"laptop","maxPrice":900}`. Run `add_to_cart` with `{"productId":"soundwave-pro","quantity":2}` and then `get_cart`. Point back to the storefront to show synchronized state.
6. Run `get_product_details` with a made-up ID, and `add_to_cart` with quantity 0, showing useful errors.
7. For the bundled Python agent demo, configure `OPENAI_API_KEY` in `agent/.env` and start `agent/app.py` as described in the root README. Enter the sample prompt in Gradio, then show the matching tool call effect in the SimpliShop Chrome tab. The OpenAI model selects tools and the page executes them through WebMCP.
8. If a compatible Chrome build and external agent/inspector are configured, those are also valid agent demos. Explain that they are separate integrations and disclose any required API key.

Sample prompts for an actual connected agent:

- “Show me all laptops under €900.”
- “Find the cheapest wireless headphones.”
- “Add two of those headphones to my cart.”
- “What's currently in my cart?”

Steps 1–6 can be recorded without WebMCP support. The Gradio agent demo requires Chrome with WebMCP enabled, an OpenAI API key with API access, the Python dependencies, and the completed app. An external agent/inspector has its own setup. Do not describe the workbench as agent testing.
