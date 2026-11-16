import { categories, products, searchProducts, getProductDetails } from "./products";
import { summarizeCart, type CartLine } from "./cart";
export type ToolContext = {
  getCart: () => CartLine[];
  add: (id: unknown, q?: unknown) => CartLine[];
  remove: (id: unknown) => CartLine[];
};
export const toolSpecs = [
  {
    name: "get_products",
    title: "Get products", //human friendly title for the tool
    description: "Returns all products available in the SimpliShop catalog.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
  },
  {
    name: "search_products",
    title: "Search products",
    description:
      "Find products by optional text query, exact category, and maximum price.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Words to find in product names, descriptions or categories.",
        },
        category: {
          type: "string",
          enum: [
            "Computers",
            "Phones",
            "Audio",
            "Wearables",
            "Accessories",
            "Cameras",
          ],
          description: "Exact product category.",
        },
        maxPrice: {
          type: "number",
          minimum: 0,
          description: "Maximum price in euros.",
        },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
  },
  {
    name: "get_product_details",
    title: "Get product details",
    description: "Returns information for one product by its catalog ID.",
    inputSchema: {
      type: "object",
      properties: { productId: { type: "string", minLength: 1 } },
      required: ["productId"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
  },
  {
    name: "add_to_cart",
    title: "Add to cart",
    description:
      "Adds a product to the shopping cart. This changes the visible cart; it does not purchase anything.",
    inputSchema: {
      type: "object",
      properties: {
        productId: { type: "string", minLength: 1 },
        quantity: { type: "integer", minimum: 1, maximum: 99, default: 1 },
      },
      required: ["productId"],
      additionalProperties: false,
    },
    annotations: { consequentialHint: false },
  },
  {
    name: "get_cart",
    title: "Get cart",
    description:
      "Returns current cart products, quantities, item count and total in euros.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
  },
  {
    name: "remove_from_cart",
    title: "Remove from cart",
    description:
      "Removes one product and all its quantity from the shopping cart.",
    inputSchema: {
      type: "object",
      properties: { productId: { type: "string", minLength: 1 } },
      required: ["productId"],
      additionalProperties: false,
    },
    annotations: { consequentialHint: false },
  },
] as const;
export const createToolHandlers = (ctx: ToolContext) => ({
  get_products: () => ({ products }),
  search_products: (input: Record<string, unknown>) => ({
    products: searchProducts(input),
  }),
  get_product_details: (input: Record<string, unknown>) => ({
    product: getProductDetails(input.productId),
  }),
  add_to_cart: (input: Record<string, unknown>) => {
    const items = ctx.add(input.productId, input.quantity ?? 1);
    return { success: true, cart: summarizeCart(items) };
  },
  get_cart: () => summarizeCart(ctx.getCart()),
  remove_from_cart: (input: Record<string, unknown>) => {
    const items = ctx.remove(input.productId);
    return { success: true, cart: summarizeCart(items) };
  },
});
export type ToolName = keyof ReturnType<typeof createToolHandlers>;
type ToolInput = Record<string, unknown>;

function asToolInput(input: unknown): ToolInput {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("Input must be a JSON object");
  return input as ToolInput;
}

function allowOnly(input: ToolInput, allowedKeys: string[]): void {
  for (const key of Object.keys(input)) {
    if (!allowedKeys.includes(key)) throw new Error(`Unexpected parameter: ${key}`);
  }
}

export function validateGetProductsInput(input: unknown): ToolInput {
  const value = asToolInput(input);
  allowOnly(value, []);
  return value;
}

export function validateSearchProductsInput(input: unknown): ToolInput {
  const value = asToolInput(input);
  allowOnly(value, ["query", "category", "maxPrice"]);

  if (value.query !== undefined && typeof value.query !== "string") {
    throw new Error("query must be a string");
  }
  if (
    value.category !== undefined &&
    (typeof value.category !== "string" ||
      !categories.filter((category) => category !== "All").includes(value.category))
  ) {
    throw new Error("category must be a known category");
  }
  if (
    value.maxPrice !== undefined &&
    (typeof value.maxPrice !== "number" ||
      !Number.isFinite(value.maxPrice) ||
      value.maxPrice < 0)
  ) {
    throw new Error("maxPrice must be a non-negative number");
  }
  return value;
}

export function validateGetProductDetailsInput(input: unknown): ToolInput {
  const value = asToolInput(input);
  allowOnly(value, ["productId"]);
  if (typeof value.productId !== "string" || !value.productId.trim()) {
    throw new Error("productId must be a non-empty string");
  }
  return value;
}

export function validateAddToCartInput(input: unknown): ToolInput {
  const value = asToolInput(input);
  allowOnly(value, ["productId", "quantity"]);
  if (typeof value.productId !== "string" || !value.productId.trim()) {
    throw new Error("productId must be a non-empty string");
  }
  if (
    value.quantity !== undefined &&
    (!Number.isInteger(value.quantity) ||
      Number(value.quantity) < 1 ||
      Number(value.quantity) > 99)
  ) {
    throw new Error("quantity must be a positive integer from 1 to 99");
  }
  return value;
}

export function validateGetCartInput(input: unknown): ToolInput {
  const value = asToolInput(input);
  allowOnly(value, []);
  return value;
}

export function validateRemoveFromCartInput(input: unknown): ToolInput {
  const value = asToolInput(input);
  allowOnly(value, ["productId"]);
  if (typeof value.productId !== "string" || !value.productId.trim()) {
    throw new Error("productId must be a non-empty string");
  }
  return value;
}

const inputValidators: Record<ToolName, (input: unknown) => ToolInput> = {
  get_products: validateGetProductsInput,
  search_products: validateSearchProductsInput,
  get_product_details: validateGetProductDetailsInput,
  add_to_cart: validateAddToCartInput,
  get_cart: validateGetCartInput,
  remove_from_cart: validateRemoveFromCartInput,
};

/** Routes a dynamic WebMCP tool name to that tool's focused input validator. */
export function validateInputForTool(
  name: ToolName,
  input: unknown,
): ToolInput {
  return inputValidators[name](input);
}
