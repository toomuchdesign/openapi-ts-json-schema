export default {
  parameters: {
    headers: {
      properties: {
        'path-headers-param-1': {
          type: 'string',
        },
      },
      required: ['path-headers-param-1'],
    },
  },
  get: {
    parameters: {
      body: {
        type: 'string',
        enum: ['foo', 'bar'],
      },
      headers: {
        properties: {
          'headers-param-1': {
            type: 'string',
          },
          'headers-param-2': {
            // $ref: "#/components/schemas/Answer"
            type: 'string',
            enum: ['yes', 'no'],
          },
        },
        required: ['headers-param-1', 'headers-param-2'],
      },
      path: {
        properties: {
          'path-param-1': {
            type: 'string',
          },
        },
        required: ['path-param-1'],
      },
      query: {
        properties: {
          'query-param-1': {
            type: 'string',
          },
        },
        required: ['query-param-1'],
      },
    },
    responses: {
      '200': {
        content: {
          'application/json': {
            schema: {
              type: 'string',
            },
          },
        },
      },
    },
  },
} as const;
