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
      openApiSchema: path.resolve(fixtures, 'ref-property/specs.yaml'),
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
      id: '/components/schemas/Answer',
      uniqueName: 'componentsSchemasAnswer',
      originalSchema: expect.any(Object),
      isRef: true,

      absoluteDirName: `${outputPath}/components/schemas`.replaceAll(
        '/',
        path.sep,
      ),
      absolutePath: `${outputPath}/components/schemas/Answer.ts`.replaceAll(
        '/',
        path.sep,
      ),
      absoluteImportPath: `${outputPath}/components/schemas/Answer`.replaceAll(
        '/',
        path.sep,
      ),
    };

    const expectedJanuaryMetaData: SchemaMetaData = {
      id: '/components/months/January',
      uniqueName: 'componentsMonthsJanuary',
      originalSchema: expect.any(Object),
      isRef: false,

      absoluteDirName: `${outputPath}/components/months`.replaceAll(
        '/',
        path.sep,
      ),
      absolutePath: `${outputPath}/components/months/January.ts`.replaceAll(
        '/',
        path.sep,
      ),
      absoluteImportPath: `${outputPath}/components/months/January`.replaceAll(
        '/',
        path.sep,
      ),
    };

    expect(answerMetaData).toEqual(expectedAnswerMetaData);
    expect(januaryMetaData).toEqual(expectedJanuaryMetaData);

    // absolutePath matches generated schema path
    expect(fs.existsSync(answerMetaData.absolutePath)).toBe(true);
    expect(fs.existsSync(januaryMetaData.absolutePath)).toBe(true);
  });
});
