import type { FromSchemaWithRefs } from '../../../types';

export const getSchema = {
  summary: 'Pet get route',
  querystring: {
    type: 'object',
    required: ['id'],
    properties: {
      id: {
        type: 'integer',
      },
    },
  } as const,
  response: {
    200: { $ref: '/components/schemas/Pets' },
  },
} as const;

export type GetSchema = {
  response: {
    200: FromSchemaWithRefs<(typeof getSchema.response)[200]>;
  };
};
