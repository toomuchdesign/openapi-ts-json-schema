export default {
  type: 'object',
  properties: {
    remoteDefinition: {
      // $ref: "#/components/schemas/ExternalDefinition"
      description: 'External Foo description',
      type: ['string', 'null'],
      enum: ['yes', 'no', null],
    },
  },
} as const;
