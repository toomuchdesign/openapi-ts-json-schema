const schema = {
  type: "array",
  maxItems: 100,
  items: { $ref: "/components/schemas/Pet" },
} as const;
export default schema;

const with$id = { $id: "/components/schemas/Pets", ...schema };
export { with$id };
