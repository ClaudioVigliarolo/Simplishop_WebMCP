# 07 — Changelog and developer summary

## Created

- `completed/`: independent Vite + React + TypeScript app, 16 local products, responsive CSS, catalog filtering, details modal, cart drawer, six WebMCP tools; no developer workbench is included in the storefront.
- `completed/src/products.ts`: product/category fixtures, search/category/price filters, detail lookup.
- `completed/src/cart.ts`: validated add/remove and cart summaries.
- `completed/src/tools.ts`: tool descriptions, JSON Schema objects, shared handlers and runtime validation.
- `completed/src/webmcp.ts`: `document.modelContext` feature detection, registration and AbortSignal cleanup.
- `completed/src/core.test.ts`: catalog, filtering, cart, validation, unsupported API, mocked registration cleanup, and state synchronization tests.
- `completed/src/main.tsx`, `style.css`: storefront, state wiring, WebMCP status, and responsive layout.
- `starter/`: separate React store without the WebMCP integration.
- `agent/app.py`: Gradio chat agent using OpenAI Responses API function calling and Playwright CDP to execute the site's actual WebMCP tools in a dedicated Chrome session; `agent/requirements.txt` lists Python dependencies and `agent/.env.example` documents configuration.
- `course-docs/01` through `08`: overview, architecture, implementation, lessons, recording guide, troubleshooting, summary and instructor cheat sheet.

The dependency list adds React, React DOM, TypeScript, Vite, Vitest, jsdom, ESLint, React hooks linting and type packages. Cart changes are local memory only. Product imagery uses local CSS compositions and emoji illustrations so there are no remote image dependencies. Fonts use Google Fonts with system fallback.

## WebMCP facts and boundaries

Official references checked: [WebMCP draft report](https://webmachinelearning.github.io/webmcp/) and [Chrome for Developers WebMCP guide](https://developer.chrome.com/docs/ai/webmcp). The interface is `document.modelContext`, with `registerTool`, JSON Schema objects, an async `execute(inputObject, options)` callback, and a registration options signal that unregisters on abort. Browser `executeTool()` resolves to a JSON string; the page's registered callback returns serializable structured objects. The spec is a draft Community Group Report. Chrome docs currently say Chrome 149 origin trial and local testing flag. Support and agent connectivity were not tested here.

## Status

Latest verification: `cd completed && npm run build` passes after removing the developer workbench. The completed app's 10 Vitest tests passed in the previous verification before this UI-only removal; they were not rerun for this change. ESLint and browser automation were not run for this change. The optional Python agent still needs a configured OpenAI API key, Chrome with WebMCP enabled, and a compatible tool-calling setup for a live agent demo. API requests send chat and tool results to OpenAI. Each store folder has its own package lock and installs independently.
