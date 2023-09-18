import path from 'path';
import { describe, it, expect } from 'vitest';
import { openapiToTsJsonSchema } from '../src';
import { fixtures, makeTestOutputPath } from './test-utils';

describe('$id export', async () => {
  it('exposes schema id as $id named export', async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiSchema: path.resolve(fixtures, 'complex/specs.yaml'),
      outputPath: makeTestOutputPath('id-export'),
      definitionPathsToGenerateFrom: ['components.months'],
      silent: true,
    });

    const januarySchema = await import(
      path.resolve(outputPath, 'components/months/January')
    );
    const februarySchema = await import(
      path.resolve(outputPath, 'components/months/February')
    );

    expect(januarySchema['$id']).toBe('#/components/months/January');
    expect(februarySchema['$id']).toBe('#/components/months/February');
  });
});
