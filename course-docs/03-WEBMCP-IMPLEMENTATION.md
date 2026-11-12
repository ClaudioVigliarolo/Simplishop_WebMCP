# 03 — WebMCP implementation

The six schemas and shared handler mapping live in `completed/src/tools.ts`; registration is in `completed/src/webmcp.ts`. The standard API is `document.modelContext.registerTool({name,title,description,inputSchema,execute,annotations}, {signal})`. `execute` receives an input object and execution options and may return a value or Promise. Its result is serialized by the browser API. Registration cleanup is an `AbortController`, not a made-up unregister method.

| Tool | Inputs | Result / errors |
|---|---|---|
| `get_products` | none | `{products}`; catalog array |
| `search_products` | optional `query`, `category`, `maxPrice` | `{products}`; invalid type, unknown category or negative/non-finite price returns an error |
| `get_product_details` | `productId: string` | `{product}`; unknown IDs produce “Product not found” |
| `add_to_cart` | `productId: string`, optional positive integer `quantity` (default 1) | `{success, cart}`; quantity bounded 1–99; invalid product/quantity returns error |
| `get_cart` | none | `{items,total,itemCount}` |
| `remove_from_cart` | `productId: string` | `{success,cart}`; invalid ID returns error |

Unknown fields are rejected by `validateToolInput`; schemas also describe object properties and required fields to the browser/agent. Errors throw from the callback, letting the browser reject the execution. The workbench catches errors and renders their message for direct testing.

```ts
await modelContext.registerTool({
  name: 'add_to_cart', title: 'Add to cart',
  description: 'Adds a product to the shopping cart. This changes the visible cart; it does not purchase anything.',
  inputSchema: { type: 'object', properties: {
    productId: { type: 'string', minLength: 1 },
    quantity: { type: 'integer', minimum: 1, maximum: 99, default: 1 },
  }, required: ['productId'], additionalProperties: false },
  execute: async input => handler(validateToolInput('add_to_cart', input)),
}, { signal: controller.signal });
```

Demonstrate underlying behavior at `/dev-tools` in any modern browser. That proves app logic, not agent discovery. Actual WebMCP testing requires a supporting browser and a compatible agent/inspector. No agent workflow was available to verify in this build environment.
