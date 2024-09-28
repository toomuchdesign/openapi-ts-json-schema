import type { FastifyPluginAsync } from 'fastify';
import { getSchema, type GetSchema } from '../schema/get';
import type { JsonSchemaToTsProviderWithRefs } from '../../../types';

export const getRoute: FastifyPluginAsync = async (fastify) => {
  const server = fastify.withTypeProvider<JsonSchemaToTsProviderWithRefs>();

  server.get('/pet', {
    schema: getSchema,
    handler: (req) => {
      // req.param is fully typed
      // @NOTE VSC seems not to be able to type this while type TS check does
      const { id } = req.query;
      // Return type type checked to fit schema.response[200] schema
      const response: GetSchema['response']['200'] = [
        {
          id,
          name: 'Pet name',
          tag: 'tag',
        },
      ];

      return response;
    },
  });
};
