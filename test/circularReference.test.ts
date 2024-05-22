import path from 'path';
import { describe, it, expect } from 'vitest';
import fs from 'fs/promises';
import { fixtures, makeTestOutputPath } from './test-utils';
import { openapiToTsJsonSchema } from '../src';

describe('Circular reference', () => {
  describe('"refHandling" option', () => {
    describe('inline', () => {
      it('Replaces 2nd circular reference occurrence with "{}"', async () => {
        const { outputPath } = await openapiToTsJsonSchema({
          openApiSchema: path.resolve(
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
                previousMonth: {},
              },
            },
            nextMonthTwo: {
              description: 'February description',
              type: 'object',
              properties: {
                previousMonth: {},
              },
            },
            nextMonthThree: {
              description: 'February description',
              type: 'object',
              properties: {
                previousMonth: {},
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
        nextMonth: {},
        nextMonthTwo: {},
        nextMonthThree: {},
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
          openApiSchema: path.resolve(
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
          openApiSchema: path.resolve(
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
