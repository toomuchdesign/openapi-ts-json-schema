const schema = {
  $id: "/components/schemas/Pets",
  type: "array",
  maxItems: 100,
  items: { $ref: "/components/schemas/Pet" },
} as const;

export default schema;
