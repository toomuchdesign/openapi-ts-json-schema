import path from 'path';
import fs from 'fs';
import { describe, it, expect } from 'vitest';
import { openapiToTsJsonSchema } from '../src';
import { importFresh } from './test-utils';

const fixtures = path.resolve(__dirname, 'fixtures');

describe('$id export', async () => {
  it('exposes schema id as $id named export', async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiSchema: path.resolve(fixtures, 'complex/specs.yaml'),
      definitionPathsToGenerateFrom: ['components.months'],
      silent: false,
    });

    const januarySchema = await importFresh(
      path.resolve(outputPath, 'components/months/January'),
    );
    const februarySchema = await importFresh(
      path.resolve(outputPath, 'components/months/February'),
    );

    expect(januarySchema['$id']).toBe('#/components/months/January');
    expect(februarySchema['$id']).toBe('#/components/months/February');
  });
});
