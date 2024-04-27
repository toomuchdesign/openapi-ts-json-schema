const schema = {
  $id: "/paths/pets_{petId}",
  get: {
    summary: "Info for a specific pet",
    operationId: "showPetById",
    tags: ["pets"],
    parameters: {
      path: {
        properties: {
          petId: {
            type: "string",
          },
        },
        required: ["petId"],
        type: "object",
      },
    },
    responses: {
      "200": {
        description: "Expected response to a valid request",
        content: {
          "application/json": {
            schema: { $ref: "/components/schemas/Pet" },
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
} as const;

export default schema;
