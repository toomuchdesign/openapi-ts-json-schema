import path from 'path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { openapiToTsJsonSchema } from '../src';
import { fixtures, makeTestOutputPath } from './test-utils';

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementationOnce(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('"silent" option', async () => {
  it('console.log user messages', async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiDocument: path.resolve(fixtures, 'ref-property/specs.yaml'),
      outputPath: makeTestOutputPath('silent-option'),
      definitionPathsToGenerateFrom: ['paths'],
      silent: false,
    });

    expect(console.log).toHaveBeenCalledWith(
      `[openapi-ts-json-schema] ✅ JSON schema models generated at ${outputPath}`,
    );
  });
});
