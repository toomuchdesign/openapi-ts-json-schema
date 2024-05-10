import path from 'path';
import { describe, it, expect } from 'vitest';
import { fixtures, makeTestOutputPath } from './test-utils';
import { openapiToTsJsonSchema } from '../src';

describe('OpenAPI paths parameters', () => {
  describe.each([
    { refHandling: 'import' } as const,
    { refHandling: 'inline' } as const,
    { refHandling: 'keep' } as const,
  ])('refHandling: "$refHandling"', ({ refHandling }) => {
    it('Transforms parameters array into valid JSON schema', async () => {
      const { outputPath } = await openapiToTsJsonSchema({
        openApiSchema: path.resolve(fixtures, 'paths-parameters/specs.yaml'),
        outputPath: makeTestOutputPath(`paths-parameters--${refHandling}`),
        definitionPathsToGenerateFrom: ['paths'],
        refHandling,
        silent: true,
      });

      const pathSchema = await import(
        path.resolve(outputPath, 'paths/_v1_path-1')
      );

      expect(pathSchema.default).toEqual({
        $id: '/paths/_v1_path-1',
        parameters: {
          headers: {
            type: 'object',
            required: ['path-header-param'],
            properties: {
              'path-header-param': {
                type: 'string',
              },
              'path-header-param-overridden-at-operation-level': {
                type: 'string',
              },
            },
          },
        },
        get: {
          parameters: {
            headers: {
              type: 'object',
              properties: {
                'header-param-1': {
                  type: 'string',
                },
                // Parameters schema $refs are fully supported
                'header-param-2':
                  refHandling === 'keep'
                    ? {
                        $ref: '/components/schemas/Answer',
                      }
                    : {
                        type: 'string',
                        enum: ['yes', 'no'],
                      },
                // Merges path level parameters
                'path-header-param': {
                  type: 'string',
                },
                // Overrides path level parameters
                'path-header-param-overridden-at-operation-level': {
                  type: 'number',
                },
              },
              required: [
                'path-header-param',
                'header-param-1',
                'header-param-2',
              ],
            },
            body: { type: 'string', enum: ['foo', 'bar'] },
            path: {
              type: 'object',
              properties: {
                'path-param-1': {
                  type: 'string',
                },
              },
              required: ['path-param-1'],
            },
            query: {
              type: 'object',
              properties: {
                'query-param-1': {
                  type: 'string',
                },
                // $ref parameters are currently always inlined
                'component-parameter-name': {
                  type: ['integer', 'null'],
                },
              },
              required: ['query-param-1', 'component-parameter-name'],
            },
          },
          responses: {
            '200': {
              content: { 'application/json': { schema: { type: 'string' } } },
            },
          },
        },
      });

      /**
       * Generates components.parameters schemas as JSON schema
       */
      if (refHandling === 'import') {
        const sharedParametersSchema = await import(
          path.resolve(outputPath, 'components/parameters/componentParameter')
        );

        expect(sharedParametersSchema.default).toEqual({
          $id: '/components/parameters/componentParameter',
          type: ['integer', 'null'],
        });
      }
    });
  });
});
