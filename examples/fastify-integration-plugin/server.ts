import Fastify from 'fastify';
import { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import {
  RefSchemas,
  refSchemas,
  sharedSchemas,
} from './definitions/petstore/schemas-autogenerated/fastify-integration';

export async function makeServer() {
  const fastify = Fastify({
    logger: true,
  });

  const server =
    fastify.withTypeProvider<
      JsonSchemaToTsProvider<{ references: RefSchemas }>
    >();

  await server.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Test swagger',
        version: '0.1.0',
      },
      servers: [
        {
          url: 'http://localhost',
        },
      ],
    },
    /**
     * This is needed since Fastify by default names components as "def-${i}"
     * https://github.com/fastify/fastify-swagger?tab=readme-ov-file#managing-your-refs
     */
    refResolver: {
      buildLocalReference: (json, baseUri, fragment, i) => {
        const OPEN_API_COMPONENTS_SCHEMAS_PATH = '/components/schemas/';
        if (
          typeof json.$id === 'string' &&
          json.$id.startsWith(OPEN_API_COMPONENTS_SCHEMAS_PATH)
        ) {
          const name = json.$id.replace(OPEN_API_COMPONENTS_SCHEMAS_PATH, '');
          if (name) {
            return name;
          }
        }

        // @TODO Support naming component schemas different than "components.schema"
        return `def-${i}`;
      },
    },
  });

  await fastify.register(fastifySwaggerUI, {
    routePrefix: '/documentation',
  });

  // Register `$ref` schemas individually so that they `$ref`s get resolved runtime.
  refSchemas.forEach((schema) => {
    server.addSchema(schema);
  });

  // Register other schemas to let @fastify/swagger re-export them as shared openAPI components
  sharedSchemas.forEach((schema) => {
    server.addSchema(schema);
  });

  // Register route
  server.get('/pet', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
          },
        },
        required: ['id'],
      },
      response: {
        200: { $ref: '/components/schemas/Pet#' },
      },
    } as const,
    handler: (req) => {
      // req.param is fully typed
      const { id } = req.params;
      // Return type type checked to fit schema.response[200] schema
      return {
        id,
        name: 'Pet name',
        tag: '3',
      };
    },
  });

  return server;
}