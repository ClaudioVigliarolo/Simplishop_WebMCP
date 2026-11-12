# 04 — Seven course lessons (about 68 minutes)

| Lesson / time | Objectives and explanation | Files and code changes | Practical demo / result |
|---|---|---|---|
| 1. Introduction to WebMCP · 8 min | Define tools, structured schemas, browser agents; compare DOM automation and server MCP. Stress experimental status. | `01-PROJECT-OVERVIEW.md`, `webmcp.ts` | Show the ordinary storefront and compatibility badge. Students can explain progressive enhancement. |
| 2. React setup · 9 min | Explain Vite, product fixtures, filtering and cart state. | `products.ts`, `cart.ts`, `main.tsx` | Search headphones, set a max price, add to bag. |
| 3. First tool · 10 min | Detect `document.modelContext`, register a read tool, clean up through AbortSignal. | `webmcp.ts`, `tools.ts` | Run `get_products` in workbench; identify that this alone does not prove agent access. |
| 4. Search and filtering · 9 min | Define optional inputs and validate category and price. | `searchProducts`, search schema | Ask workbench for laptops under €900 and inspect returned list. |
| 5. Cart actions · 11 min | Share app logic and state between React and tools; validate quantities. | `cart.ts`, add/remove handlers | Add two headphones, open bag, read total, remove item. |
| 6. Agent test · 12 min | Explain browser setup, tool discovery, confirmation and human oversight. | Chrome docs, `/dev-tools` | With a compatible agent: prompt “Show me all laptops under €900.” Then add two selected headphones and ask for cart. Requires actual agent. |
| 7. Best practices · 9 min | Discuss least capability, clear descriptions, input validation, errors, no checkout tool, experimental API. | `tools.ts`, this guide | Try an unknown product ID and invalid quantity; review surfaced errors and known limitations. |

Total: about 68 minutes. Timing includes brief transitions and questions.
