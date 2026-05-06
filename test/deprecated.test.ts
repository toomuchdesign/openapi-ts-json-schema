import fs from 'fs/promises';
import path from 'path';

import { describe, expect, it } from 'vitest';

import { openapiToTsJsonSchema } from '../src/index.js';
import { fixturesPath, makeTestOutputPath } from './test-utils/index.js';

describe('deprecated OpenAPI schemas', () => {
  it('emits /** @deprecated */ JSDoc on deprecated schemas', async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiDocument: path.resolve(fixturesPath, 'deprecated/specs.yaml'),
      outputPath: makeTestOutputPath('deprecated'),
      targets: {
        collections: ['components.schemas'],
      },
      silent: true,
    });

    const deprecatedFile = await fs.readFile(
      path.resolve(outputPath, 'components/schemas/DeprecatedSchema.ts'),
      'utf-8',
    );
    const activeFile = await fs.readFile(
      path.resolve(outputPath, 'components/schemas/ActiveSchema.ts'),
      'utf-8',
    );

    expect(deprecatedFile).toContain('/** @deprecated */');
    expect(activeFile).not.toContain('/** @deprecated */');
  });
});
