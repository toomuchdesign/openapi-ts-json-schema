import path from 'path';
import fs from 'fs';
import { describe, it, expect } from 'vitest';
import { openapiToTsJsonSchema } from '../src';

const fixtures = path.resolve(__dirname, 'fixtures');

describe('Returned "metaData"', async () => {
  it('returns expected data', async () => {
    const { metaData } = await openapiToTsJsonSchema({
      openApiSchema: path.resolve(fixtures, 'mini-referenced/specs.yaml'),
      definitionPathsToGenerateFrom: ['components.months'],
      experimentalImportRefs: true,
      silent: false,
    });

    const answerMeta = metaData.schemas.get('#/components/schemas/Answer');
    const januaryMeta = metaData.schemas.get('#/components/months/January');

    expect(answerMeta).toBeDefined();
    expect(januaryMeta).toBeDefined();
    expect(metaData.schemas.size).toBe(2);

    if (!answerMeta || !januaryMeta) {
      throw 'Unexpected undefined meta data';
    }

    expect(fs.existsSync(answerMeta.schemaAbsolutePath)).toBe(true);
    expect(fs.existsSync(januaryMeta.schemaAbsolutePath)).toBe(true);
  });
});
