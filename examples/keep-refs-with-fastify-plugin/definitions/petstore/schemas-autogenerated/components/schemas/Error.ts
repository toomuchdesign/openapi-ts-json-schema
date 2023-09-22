export default {
  type: "object",
  required: ["code", "message"],
  properties: {
    code: {
      type: "integer",
      format: "int32",
      minimum: -2147483648,
      maximum: 2147483647,
    },
    message: {
      type: "string",
    },
  },
} as const;

export const $id = "/components/schemas/Error";
