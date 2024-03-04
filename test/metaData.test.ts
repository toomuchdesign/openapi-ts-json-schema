import path from 'path';
import fs from 'fs';
import { describe, it, expect } from 'vitest';
import { openapiToTsJsonSchema } from '../src';
import { fixtures, makeTestOutputPath } from './test-utils';
import type { SchemaMetaData } from '../src/types';

describe('Returned "metaData"', async () => {
  it('returns expected data', async () => {
    const outputPath = makeTestOutputPath('meta-data');
    const { metaData } = await openapiToTsJsonSchema({
      openApiSchema: path.resolve(fixtures, 'mini-referenced/specs.yaml'),
      outputPath,
      definitionPathsToGenerateFrom: ['components.months'],
      refHandling: 'import',
      silent: true,
    });

    const answerMetaData = metaData.schemas.get('#/components/schemas/Answer');
    const januaryMetaData = metaData.schemas.get('#/components/months/January');

    expect(answerMetaData).toBeDefined();
    expect(januaryMetaData).toBeDefined();
    expect(metaData.schemas.size).toBe(2);

    if (!answerMetaData || !januaryMetaData) {
      throw 'Unexpected undefined meta data';
    }

    const expectedAnswerMetaData: SchemaMetaData = {
      schemaFileName: 'Answer',
      schemaAbsoluteDirName: `${outputPath}/components/schemas`.replaceAll(
        '/',
        path.sep,
      ),
      schemaAbsolutePath:
        `${outputPath}/components/schemas/Answer.ts`.replaceAll('/', path.sep),
      schemaAbsoluteImportPath:
        `${outputPath}/components/schemas/Answer`.replaceAll('/', path.sep),
      schemaUniqueName: 'componentsSchemasAnswer',
      schemaId: '/components/schemas/Answer',
      originalSchema: expect.any(Object),
      isRef: true,
    };

    const expectedJanuaryMetaData: SchemaMetaData = {
      schemaFileName: 'January',
      schemaAbsoluteDirName: `${outputPath}/components/months`.replaceAll(
        '/',
        path.sep,
      ),
      schemaAbsolutePath:
        `${outputPath}/components/months/January.ts`.replaceAll('/', path.sep),
      schemaAbsoluteImportPath:
        `${outputPath}/components/months/January`.replaceAll('/', path.sep),
      schemaUniqueName: 'componentsMonthsJanuary',
      schemaId: '/components/months/January',
      originalSchema: expect.any(Object),
      isRef: false,
    };

    expect(answerMetaData).toEqual(expectedAnswerMetaData);
    expect(januaryMetaData).toEqual(expectedJanuaryMetaData);

    // schemaAbsolutePath matches generated schema path
    expect(fs.existsSync(answerMetaData.schemaAbsolutePath)).toBe(true);
    expect(fs.existsSync(januaryMetaData.schemaAbsolutePath)).toBe(true);
  });
});
