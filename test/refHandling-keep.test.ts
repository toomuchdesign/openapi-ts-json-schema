import path from 'path';
import { describe, it, expect } from 'vitest';
import { importFresh } from './test-utils';
import { openapiToTsJsonSchema } from '../src';

const fixtures = path.resolve(__dirname, 'fixtures');

describe('refHandling option === "keep"', () => {
  it('Generates expected schemas preserving $ref pointer', async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiSchema: path.resolve(fixtures, 'complex/specs.yaml'),
      definitionPathsToGenerateFrom: ['paths'],
      silent: true,
      refHandling: 'keep',
    });

    const path1 = await importFresh(
      path.resolve(outputPath, 'paths/v1|path-1'),
    );

    // Expectations against parsed root schema
    expect(path1.default).toEqual({
      get: {
        responses: {
          '200': {
            description: 'A description',
            content: {
              'application/json': {
                schema: {
                  oneOf: [
                    { $ref: '#/components/months/January' },
                    { $ref: '#/components/months/February' },
                  ],
                },
              },
            },
          },
        },
      },
    });
  });

  it('Generates expected $ref schemas preserving $ref pointer', async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiSchema: path.resolve(fixtures, 'complex/specs.yaml'),
      definitionPathsToGenerateFrom: ['paths'],
      silent: true,
      refHandling: 'keep',
    });

    const januarySchema = await importFresh(
      path.resolve(outputPath, 'components/months/January'),
    );

    expect(januarySchema.default).toEqual({
      description: 'January description',
      type: 'object',
      required: ['isJanuary'],
      properties: {
        isJanuary: { $ref: '#/components/schemas/Answer' },
      },
    });

    const answerSchema = await importFresh(
      path.resolve(outputPath, 'components/schemas/Answer'),
    );

    expect(answerSchema.default).toEqual({
      type: ['string', 'null'],
      enum: ['yes', 'no', null],
    });
  });
});
