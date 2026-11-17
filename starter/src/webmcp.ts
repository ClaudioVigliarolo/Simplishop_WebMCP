import {
  createToolHandlers,
  toolSpecs,
  validateInputForTool,
} from "./tools";

type ModelContextLike = {
  registerTool: (
    tool: Record<string, unknown>,
    options?: { signal?: AbortSignal },
  ) => Promise<void>;
};

export function getModelContext(): ModelContextLike | undefined {
  if (typeof document === "undefined") return undefined;
  try {
    return (document as Document & { modelContext?: ModelContextLike })
      .modelContext;
  } catch {
    return undefined;
  }
}

export async function registerWebMCP(modelContext = getModelContext()) {
  if (!modelContext) {
    return { supported: false, cleanup: () => {} };
  }

  const controller = new AbortController();
  const handlers = createToolHandlers();

  try {
    for (const spec of toolSpecs) {
      const name = spec.name;
      await modelContext.registerTool(
        {
          ...spec,
          execute: async (input: unknown) => {
            const validInput = validateInputForTool(name, input);
            return (
              handlers[name] as (args: Record<string, unknown>) => unknown
            )(validInput);
          },
        },
        { signal: controller.signal },
      );
    }

    return { supported: true, cleanup: () => controller.abort() };
  } catch (error) {
    controller.abort();
    throw error;
  }
}
