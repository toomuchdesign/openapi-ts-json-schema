import path from 'path';
import fs from 'fs/promises';
import { describe, it, expect } from 'vitest';
import { importFresh, formatTypeScript } from './test-utils';
import { openapiToTsJsonSchema } from '../src';

const fixtures = path.resolve(__dirname, 'fixtures');

describe('Deferencing', () => {
  it('Dereferences and transforms even from paths not marked for generation', async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiSchema: path.resolve(fixtures, 'mini-referenced/specs.yaml'),
      definitionPathsToGenerateFrom: ['components.months'],
      silent: true,
    });

    const januarySchema = await importFresh(
      path.resolve(outputPath, 'components.months/January'),
    );

    expect(januarySchema.default).toEqual({
      description: 'January description',
      type: 'object',
      required: ['isJanuary'],
      properties: {
        isJanuary: { type: ['string', 'null'], enum: ['yes', 'no', null] },
      },
    });
  });

  it('Transforms deeply nested schemas', async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiSchema: path.resolve(fixtures, 'complex/specs.yaml'),
      definitionPathsToGenerateFrom: ['paths'],
      silent: true,
    });

    const pathsSchema = await importFresh(
      path.resolve(outputPath, 'paths/v1|path-1'),
    );

    expect(
      pathsSchema.default.get.responses[200].content['application/json'].schema
        .oneOf[0],
    ).toEqual({
      description: 'January description',
      type: 'object',
      required: ['isJanuary'],
      properties: {
        isJanuary: { type: ['string', 'null'], enum: ['yes', 'no', null] },
      },
    });
  });

  it('Preserves original "$ref" information as a commented prop', async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiSchema: path.resolve(fixtures, 'mini-referenced/specs.yaml'),
      definitionPathsToGenerateFrom: ['components.months'],
      silent: true,
    });

    const januarySchemaAsText = await fs.readFile(
      path.resolve(outputPath, 'components.months/January.ts'),
      {
        encoding: 'utf8',
      },
    );

    const expectedInlinedRef = await `
  properties: {
    isJanuary: {
      // $ref: "#/components/schemas/Answer"
      type: ["string", "null"],
      enum: ["yes", "no", null],
    },
  },`;

    expect(januarySchemaAsText).toEqual(
      expect.stringContaining(expectedInlinedRef),
    );
  });
});
