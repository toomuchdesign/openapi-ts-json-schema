export default {
  type: "array",
  maxItems: 100,
  items: { $ref: "#/components/schemas/Pet" },
} as const;
