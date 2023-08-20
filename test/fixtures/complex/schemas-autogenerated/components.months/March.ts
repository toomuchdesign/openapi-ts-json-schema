export default {
  description: 'March description',
  type: 'object',
  required: ['isMarch'],
  properties: {
    isMarch: {
      // $ref: "#/components/schemas/Answer"
      type: ['string', 'null'],
      enum: ['yes', 'no', null],
    },
  },
} as const;
