import { describe, it, expect } from 'vitest';
import { makeServer } from '../../../examples/fastify-integration-plugin/server';

/**
 * This test runs against the example setup in
 * examples/fastify-integration-plugin/server.ts
 */
describe('fastifyIntegration plugin', () => {
  describe('integration example', () => {
    it('generates expected OpenAPI definition', async () => {
      const server = await makeServer();
      const response = await server.inject({
        method: 'GET',
        path: 'documentation/json',
      });

      const actual = JSON.parse(response.body);
      const expected = {
        openapi: '3.0.3',
        info: { title: 'Test swagger', version: '0.1.0' },
        components: {
          schemas: {
            Pet: {
              type: 'object',
              required: ['id', 'name'],
              properties: {
                id: {
                  type: 'integer',
                  format: 'int64',
                  minimum: -9223372036854776000,
                  maximum: 9223372036854776000,
                },
                name: { type: 'string' },
                tag: { type: 'string' },
              },
            },
            Pets: {
              type: 'array',
              maxItems: 100,
              items: { $ref: '#/components/schemas/Pet' },
            },
            Error: {
              type: 'object',
              required: ['code', 'message'],
              properties: {
                code: {
                  type: 'integer',
                  format: 'int32',
                  minimum: -2147483648,
                  maximum: 2147483647,
                },
                message: { type: 'string' },
              },
            },
            Owner: {
              type: 'object',
              required: ['id', 'name', 'pets'],
              properties: {
                id: {
                  type: 'integer',
                  format: 'int64',
                  minimum: -9223372036854776000,
                  maximum: 9223372036854776000,
                },
                name: { type: 'string' },
                pets: {
                  type: 'array',
                  maxItems: 100,
                  items: { $ref: '#/components/schemas/Pet' },
                },
              },
            },
          },
        },
        paths: {
          '/pet': {
            get: {
              parameters: [
                {
                  schema: { type: 'integer' },
                  in: 'path',
                  name: 'id',
                  required: true,
                },
              ],
              responses: {
                '200': {
                  description: 'Default Response',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Pets' },
                    },
                  },
                },
              },
            },
          },
        },
        servers: [{ url: 'http://localhost' }],
      };

      expect(actual).toEqual(expected);
    });
  });
});
