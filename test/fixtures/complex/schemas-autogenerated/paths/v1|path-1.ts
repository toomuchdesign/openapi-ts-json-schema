export default {
  get: {
    responses: {
      '200': {
        description: 'A description',
        content: {
          'application/json': {
            schema: {
              oneOf: [
                {
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
                },
                {
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
                },
              ],
            },
          },
        },
      },
    },
  },
} as const;
