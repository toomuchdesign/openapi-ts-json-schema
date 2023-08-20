export default {
  // $ref: "#/components/months/February"
  description: 'February description',
  type: 'object',
  required: ['isFebruary'],
  properties: {
    isFebruary: {
      // $ref: "#/components/schemas/Answer"
      type: ['string', 'null'],
      enum: ['yes', 'no', null],
    },
  },
} as const;
