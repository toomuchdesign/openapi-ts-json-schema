import path from 'path';
import { describe, it, expect } from 'vitest';
import { importFresh } from './test-utils';
import { openapiToTsJsonSchema } from '../src';

const fixtures = path.resolve(__dirname, 'fixtures');

describe('Circular reference', () => {
  it('Works', async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiSchema: path.resolve(fixtures, 'circular-reference/specs.yaml'),
      definitionPathsToGenerateFrom: ['components.schemas'],
      experimentalImportRefs: true,
      silent: true,
    });

    const januarySchema = await importFresh(
      path.resolve(outputPath, 'components/schemas/January'),
    );

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
              type: 'object',
              // @NOTE JS engine seems to stop recursion
              properties: { nextMonth: undefined },
            },
          },
        },
      },
    });
  });
});
