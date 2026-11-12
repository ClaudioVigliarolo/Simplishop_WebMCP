# 08 — Instructor cheat sheet

## WebMCP in 30 seconds

WebMCP lets a website describe specific JavaScript actions as structured tools that a compatible browser agent can discover and call. The callback runs inside the page and can use the app's existing logic, so the visible interface can update alongside the agent's result. It is an experimental browser capability, not a universal agent connection.

## Terminology and six tools

- **Tool:** a named capability with a description, schema and execute callback.
- **ModelContext:** page API exposed as `document.modelContext`.
- **Schema:** JSON Schema object documenting accepted tool input.
- **Registration signal:** AbortSignal used to withdraw registered tools.
- `get_products`: full catalog.
- `search_products`: optional text, category, maximum price.
- `get_product_details`: product ID lookup.
- `add_to_cart`: product ID and optional positive integer quantity.
- `get_cart`: lines, quantity count and euro total.
- `remove_from_cart`: remove one product from cart.

## Code locations

- `completed/src/webmcp.ts`: browser detection and API integration.
- `completed/src/tools.ts`: schemas, validation and handlers.
- `completed/src/cart.ts`: shared cart logic.
- `completed/src/main.tsx`: visible state and developer workbench.
- `completed/src/products.ts`: sample catalog/search.
- `agent/app.py`: optional Gradio + OpenAI API agent that calls the live page's WebMCP tools over Playwright CDP.

Core registration shape:

```ts
await document.modelContext.registerTool({
  name, title, description, inputSchema,
  execute: async input => handler(validateToolInput(name, input)),
}, { signal: controller.signal });
```

## Common questions

**Is this the same as MCP?** MCP commonly connects clients to remote servers; WebMCP exposes page-local tools in a browser tab. It is related in purpose, not the same transport or deployment.

**Does WebMCP replace clicking?** No. It offers a direct structured path when a supporting agent/browser chooses to use it; normal UI still works.

**Does the developer panel prove an agent can use the tools?** No. It exercises the shared local functions only.

**Is there a chat agent demo?** Yes. Run the optional Python Gradio app with an OpenAI API key and a dedicated WebMCP-enabled Chrome profile. It drives the page tools; it is separate from Chrome's own agent UI. ChatGPT and OpenAI API access/billing are managed separately.

**What if the API is missing?** The store works normally; only browser tool registration is skipped. Use `/dev-tools` for function demos.

**Can the agent buy something?** No. The example exposes cart changes but has no checkout/payment tool.

## Compatibility and teaching caveats

Chrome's docs currently describe the Chrome 149 origin trial and `chrome://flags/#enable-webmcp-testing` for local testing. The Community Group report is a draft, not a W3C Standard. Do not present API detection as proof of agent integration. Agent/extension availability and any model API-key requirements are separate. Avoid saying WebMCP is universally supported, guaranteed safer, or a server-side MCP replacement.
