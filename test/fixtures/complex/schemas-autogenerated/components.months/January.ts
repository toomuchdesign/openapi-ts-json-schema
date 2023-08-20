export default {
  // $ref: "#/components/months/January"
  description: 'Patched January description',
  type: 'object',
  required: ['isJanuary'],
  properties: {
    isJanuary: {
      // $ref: "#/components/schemas/Answer"
      type: ['string', 'null'],
      enum: ['yes', 'no', null],
    },
  },
} as const;
