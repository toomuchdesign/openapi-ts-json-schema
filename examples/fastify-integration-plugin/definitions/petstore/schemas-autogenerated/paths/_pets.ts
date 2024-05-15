const schema = {
  get: {
    summary: "List all pets",
    operationId: "listPets",
    tags: ["pets"],
    parameters: {
      query: {
        properties: {
          limit: {
            type: "integer",
            maximum: 100,
            format: "int32",
            minimum: -2147483648,
          },
        },
        required: [],
        type: "object",
      },
    },
    responses: {
      "200": {
        description: "A paged array of pets",
        headers: {
          "x-next": {
            description: "A link to the next page of responses",
            schema: {
              type: "string",
            },
          },
        },
        content: {
          "application/json": {
            schema: { $ref: "/components/schemas/Pets" },
          },
        },
      },
      default: {
        description: "unexpected error",
        content: {
          "application/json": {
            schema: { $ref: "/components/schemas/Error" },
          },
        },
      },
    },
  },
  post: {
    summary: "Create a pet",
    operationId: "createPets",
    tags: ["pets"],
    responses: {
      "201": {
        description: "Null response",
      },
      default: {
        description: "unexpected error",
        content: {
          "application/json": {
            schema: { $ref: "/components/schemas/Error" },
          },
        },
      },
    },
  },
} as const;
export default schema;

const with$id = { $id: "/paths/_pets", ...schema } as const;
export { with$id };
