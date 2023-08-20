export default {
  description: 'January description',
  type: 'object',
  required: ['isJanuary'],
  properties: {
    isJanuary: {
      type: ['string', 'null'],
      enum: ['yes', 'no', null],
    },
  },
} as const;
