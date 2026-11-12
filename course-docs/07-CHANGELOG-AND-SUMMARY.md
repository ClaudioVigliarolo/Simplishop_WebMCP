# 07 — Changelog and developer summary

## Created

- `completed/`: independent Vite + React + TypeScript app, 16 local products, responsive CSS, catalog filtering, details modal, cart drawer, six WebMCP tools and `/dev-tools` workbench.
- `completed/src/products.ts`: product/category fixtures, search/category/price filters, detail lookup.
- `completed/src/cart.ts`: validated add/remove and cart summaries.
- `completed/src/tools.ts`: tool descriptions, JSON Schema objects, shared handlers and runtime validation.
- `completed/src/webmcp.ts`: `document.modelContext` feature detection, registration and AbortSignal cleanup.
- `completed/src/core.test.ts`: catalog, filtering, cart, validation, unsupported API, mocked registration cleanup, and state synchronization tests.
- `completed/src/main.tsx`, `style.css`: storefront, state wiring, workbench and responsive layout.
- `starter/`: separate React store without the integration or workbench.
- `agent/app.py`: Gradio chat agent using OpenAI Responses API function calling and Playwright CDP to execute the site's actual WebMCP tools in a dedicated Chrome session; `agent/requirements.txt` lists Python dependencies and `agent/.env.example` documents configuration.
- `course-docs/01` through `08`: overview, architecture, implementation, lessons, recording guide, troubleshooting, summary and instructor cheat sheet.

The dependency list adds React, React DOM, TypeScript, Vite, Vitest, jsdom, ESLint, React hooks linting and type packages. Cart changes are local memory only. Product imagery uses local CSS compositions and emoji illustrations so there are no remote image dependencies. Fonts use Google Fonts with system fallback.

## WebMCP facts and boundaries

Official references checked: [WebMCP draft report](https://webmachinelearning.github.io/webmcp/) and [Chrome for Developers WebMCP guide](https://developer.chrome.com/docs/ai/webmcp). The interface is `document.modelContext`, with `registerTool`, JSON Schema objects, an async `execute(inputObject, options)` callback, and a registration options signal that unregisters on abort. Browser `executeTool()` resolves to a JSON string; the page's registered callback returns serializable structured objects. The spec is a draft Community Group Report. Chrome docs currently say Chrome 149 origin trial and local testing flag. Support and agent connectivity were not tested here.

## Status

Implementation is present. `npm install` was attempted but this environment cannot resolve `registry.npmjs.org` (`ENOTFOUND`), and its offline cache does not contain the dependencies. The normal project scripts therefore report `tsc: command not found`, `vitest: command not found` and `eslint: command not found`. I used the adjacent workspace's existing Vite/React packages read-only to produce a successful Vite production bundle for both apps; this bypassed TypeScript checking and is not equivalent to `npm run build`. Vitest tests, ESLint and browser automation were not run. Starting a local HTTP server was blocked by the environment's `listen EPERM` restriction. The Python agent source was syntax-checked with `py_compile`, but its runtime workflow could not be tested because Python dependencies, an OpenAI API key, and a WebMCP-enabled Chrome session are unavailable. Run the declared scripts and the README agent workflow in a fully provisioned environment before recording. API requests send chat and tool results to OpenAI. A package lock is present for each web app. No actual compatible agent session was available. The starter and completed copies need dependency installation independently.
