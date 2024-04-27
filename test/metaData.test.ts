import path from 'path';
import fs from 'fs';
import { describe, it, expect } from 'vitest';
import { openapiToTsJsonSchema } from '../src';
import { fixtures, makeTestOutputPath } from './test-utils';
import type { SchemaMetaData } from '../src/types';

describe('Returned "metaData"', async () => {
  it('returns expected data', async () => {
    const { metaData, outputPath } = await openapiToTsJsonSchema({
      openApiSchema: path.resolve(fixtures, 'ref-property/specs.yaml'),
      outputPath: makeTestOutputPath('meta-data'),
      definitionPathsToGenerateFrom: ['components.schemas'],
      refHandling: { strategy: 'import' },
      silent: true,
    });

    const answerMetaData = metaData.schemas.get('/components/schemas/Answer');
    const januaryMetaData = metaData.schemas.get('/components/schemas/January');

    expect(answerMetaData).toBeDefined();
    expect(januaryMetaData).toBeDefined();
    expect(metaData.schemas.size).toBe(2);

    if (!answerMetaData || !januaryMetaData) {
      throw 'Unexpected undefined meta data';
    }

    const expectedAnswerMetaData: SchemaMetaData = {
      id: '/components/schemas/Answer',
      $id: '/components/schemas/Answer',
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
      id: '/components/schemas/January',
      $id: '/components/schemas/January',
      uniqueName: 'componentsSchemasJanuary',
      originalSchema: expect.any(Object),
      isRef: false,

      absoluteDirName: `${outputPath}/components/schemas`.replaceAll(
        '/',
        path.sep,
      ),
      absolutePath: `${outputPath}/components/schemas/January.ts`.replaceAll(
        '/',
        path.sep,
      ),
      absoluteImportPath: `${outputPath}/components/schemas/January`.replaceAll(
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
