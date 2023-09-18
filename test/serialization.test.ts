import path from 'path';
import { describe, it, expect } from 'vitest';
import { openapiToTsJsonSchema } from '../src';
import { importFresh, fixtures } from './test-utils';

describe('openapiToTsJsonSchema', async () => {
  it('serializes strings as expected', async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiSchema: path.resolve(fixtures, 'serialization/specs.yaml'),
      definitionPathsToGenerateFrom: ['components.schemas'],
      silent: true,
    });

    const actual = await importFresh(
      path.resolve(outputPath, 'components/schemas/Foo'),
    );

    const expected = {
      description: 'Foo description',
      type: 'object',
      properties: {
        one: {
          type: 'string',
          pattern1: "([a-zA-Z\\s\\-']){1,50}",
          pattern2: "([a-zA-Z\\s\\-']){1,50}",
        },
      },
    };

    expect(actual.default).toEqual(expected);
  });
});
