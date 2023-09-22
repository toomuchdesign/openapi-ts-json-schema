export default {
  type: "object",
  required: ["id", "name", "pets"],
  properties: {
    id: {
      type: "integer",
      format: "int64",
      minimum: -9223372036854776000,
      maximum: 9223372036854776000,
    },
    name: {
      type: "string",
    },
    pets: {
      type: "array",
      maxItems: 100,
      items: { $ref: "#/components/schemas/Pet" },
    },
  },
} as const;

export const $id = "/components/schemas/Owner";
