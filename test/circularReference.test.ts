import path from 'path';
import { describe, it, expect } from 'vitest';
import { importFresh } from './test-utils';
import { openapiToTsJsonSchema } from '../src';

const fixtures = path.resolve(__dirname, 'fixtures');

describe('Circular reference', () => {
  it.fails('Works', async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiSchema: path.resolve(fixtures, 'circular-reference/specs.yaml'),
      definitionPathsToGenerateFrom: ['components.schemas'],
      silent: true,
    });

    const januarySchema = await importFresh(
      path.resolve(outputPath, 'components/schemas/January'),
    );

    expect(januarySchema).toBeDefined();
  });
});
