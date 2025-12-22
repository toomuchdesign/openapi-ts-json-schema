import fs from 'fs/promises';
import path from 'path';

import { describe, expect, it } from 'vitest';

import { openapiToTsJsonSchema } from '../src/index.js';
import { fixturesPath, makeTestOutputPath } from './test-utils/index.js';

describe('refHandling option === "inline"', () => {
  it('Preserves original "$ref" information as a commented prop', async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiDocument: path.resolve(fixturesPath, 'ref-property/specs.yaml'),
      outputPath: makeTestOutputPath('refHandling-inline'),
      targets: {
        collections: ['components.schemas'],
      },
      refHandling: 'inline',
      silent: true,
    });

    const januarySchemaAsText = await fs.readFile(
      path.resolve(outputPath, 'components/schemas/January.ts'),
      {
        encoding: 'utf8',
      },
    );

    const expectedInlinedRef = `
  properties: {
    isJanuary: {
      // $ref: "#/components/schemas/Answer"
      description: "isJanuary description",
      type: ["string", "null"],
      enum: ["yes", "no", null],
    },
    isFebruary: {
      // $ref: "#/components/schemas/Answer"
      description: "isFebruary description",
      type: ["string", "null"],
      enum: ["yes", "no", null],
    },
  },`;

    expect(januarySchemaAsText).toEqual(
      expect.stringContaining(expectedInlinedRef),
    );
  });
});
