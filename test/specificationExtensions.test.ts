import path from 'path';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { openapiToTsJsonSchema } from '../src/index.js';
import { fixturesPath, makeTestOutputPath } from './test-utils/index.js';

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

describe('specification extensions (x- fields)', () => {
  it('preserves x- extensions on schema objects through the full pipeline', async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiDocument: path.resolve(fixturesPath, 'spec-extensions/specs.yaml'),
      outputPath: makeTestOutputPath('spec-extensions-schemas'),
      targets: { collections: ['components.schemas'] },
      silent: true,
    });

    const statusSchema = await import(
      path.resolve(outputPath, 'components/schemas/Status')
    );

    expect(statusSchema.default).toEqual({
      // OAS nullable is converted to JSON Schema type union
      type: ['string', 'null'],
      // x- extensions are preserved as-is
      'x-internal': true,
      enum: ['active', 'inactive', null],
      'x-enum-descriptions': {
        active: 'The entity is active',
        inactive: 'The entity is inactive',
      },
    });

    const userSchema = await import(
      path.resolve(outputPath, 'components/schemas/User')
    );

    expect(userSchema.default).toEqual({
      type: 'object',
      'x-owner': 'platform-team',
      properties: {
        id: { type: 'string' },
        status: statusSchema.default,
      },
    });
  });
});
