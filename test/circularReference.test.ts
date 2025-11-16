import fs from 'fs/promises';
import path from 'path';

import { describe, expect, it } from 'vitest';

import { openapiToTsJsonSchema } from '../src';
import { fixtures, makeTestOutputPath } from './test-utils';

describe('Circular reference', () => {
  describe('"refHandling" option', () => {
    describe('inline', () => {
      it('Replaces 2nd circular reference occurrence with "{}"', async () => {
        const { outputPath } = await openapiToTsJsonSchema({
          openApiDocument: path.resolve(
            fixtures,
            'circular-reference/specs.yaml',
          ),
          outputPath: makeTestOutputPath('circular-inline'),
          definitionPathsToGenerateFrom: ['components.schemas'],
          refHandling: 'inline',
          silent: true,
        });

        const januarySchema = await import(
          path.resolve(outputPath, 'components/schemas/January')
        );

        // Parsed schema expectations
        expect(januarySchema.default).toEqual({
          description: 'January description',
          type: 'object',
          properties: {
            nextMonth: {
              description: 'February description',
              type: 'object',
              properties: {
                previousMonth: {
                  description: 'January description',
                  properties: {},
                  type: 'object',
                },
              },
            },
            nextMonthTwo: {
              description: 'February description',
              type: 'object',
              properties: {
                previousMonth: {
                  description: 'January description',
                  properties: {},
                  type: 'object',
                },
              },
            },
            nextMonthThree: {
              description: 'February description',
              type: 'object',
              properties: {
                previousMonth: {
                  description: 'January description',
                  properties: {},
                  type: 'object',
                },
              },
            },
          },
        });

        // Inline comments expectations
        const februarySchemaAsText = await fs.readFile(
          path.resolve(outputPath, 'components/schemas/February.ts'),
          {
            encoding: 'utf8',
          },
        );

        const expectedInlinedRef = `
    previousMonth: {
      // $ref: "#/components/schemas/January"
      description: "January description",
      type: "object",
      properties: {
        nextMonth: {
          // $ref: "#/components/schemas/February"
          description: "February description",
          type: "object",
          properties: {},
        },
        nextMonthTwo: {
          // $ref: "#/components/schemas/February"
          description: "February description",
          type: "object",
          properties: {},
        },
        nextMonthThree: {
          // $ref: "#/components/schemas/February"
          description: "February description",
          type: "object",
          properties: {},
        },
      },
    },`;

        expect(februarySchemaAsText).toEqual(
          expect.stringContaining(expectedInlinedRef),
        );
      });
    });

    describe('import', () => {
      it('Generates expected schema', async () => {
        const { outputPath } = await openapiToTsJsonSchema({
          openApiDocument: path.resolve(
            fixtures,
            'circular-reference/specs.yaml',
          ),
          outputPath: makeTestOutputPath('circular-import'),
          definitionPathsToGenerateFrom: ['components.schemas'],
          refHandling: 'import',
          silent: true,
        });

        const januarySchema = await import(
          path.resolve(outputPath, 'components/schemas/January')
        );

        expect(januarySchema.default).toEqual({
          description: 'January description',
          type: 'object',
          properties: {
            nextMonth: {
              description: 'February description',
              type: 'object',
              properties: {
                // Node.js seems to stop resolution recursion
                previousMonth: undefined,
              },
            },
            nextMonthTwo: {
              description: 'February description',
              type: 'object',
              properties: {
                // Node.js seems to stop resolution recursion
                previousMonth: undefined,
              },
            },
            nextMonthThree: {
              description: 'February description',
              type: 'object',
              properties: {
                // Node.js seems to stop resolution recursion
                previousMonth: undefined,
              },
            },
          },
        });
      });
    });

    describe('keep', () => {
      it('Generates expected schema', async () => {
        const { outputPath } = await openapiToTsJsonSchema({
          openApiDocument: path.resolve(
            fixtures,
            'circular-reference/specs.yaml',
          ),
          outputPath: makeTestOutputPath('circular-keep'),
          definitionPathsToGenerateFrom: ['components.schemas'],
          refHandling: 'keep',
          silent: true,
        });

        const januarySchema = await import(
          path.resolve(outputPath, 'components/schemas/January')
        );

        expect(januarySchema.default).toEqual({
          description: 'January description',
          type: 'object',
          properties: {
            nextMonth: {
              $ref: '/components/schemas/February',
            },
            nextMonthTwo: {
              $ref: '/components/schemas/February',
            },
            nextMonthThree: {
              $ref: '/components/schemas/February',
            },
          },
        });
      });
    });
  });
});
