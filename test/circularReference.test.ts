import path from 'path';
import { describe, it, expect } from 'vitest';
import { fixtures, makeTestOutputPath } from './test-utils';
import { openapiToTsJsonSchema } from '../src';

describe('Circular reference', () => {
  it("Doesn't break", async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiSchema: path.resolve(fixtures, 'circular-reference/specs.yaml'),
      outputPath: makeTestOutputPath('circular'),
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
            // Node stops recursion
            previousMonth: undefined,
          },
        },
      },
    });
  });
});
