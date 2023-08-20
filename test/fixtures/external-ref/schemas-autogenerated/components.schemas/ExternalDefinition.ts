export default {
  // $ref: "#/components/schemas/ExternalDefinition"
  description: 'External Foo description',
  type: ['string', 'null'],
  enum: ['yes', 'no', null],
} as const;
