import path from 'path';
import fs from 'fs/promises';
import { describe, it, expect } from 'vitest';
import { openapiToTsJsonSchema } from '../src';

const fixtures = path.resolve(__dirname, 'fixtures');

describe('refHandling option === "inline"', () => {
  it('Preserves original "$ref" information as a commented prop', async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiSchema: path.resolve(fixtures, 'mini-referenced/specs.yaml'),
      definitionPathsToGenerateFrom: ['components.months'],
      refHandling: 'inline',
      silent: true,
    });

    const januarySchemaAsText = await fs.readFile(
      path.resolve(outputPath, 'components/months/January.ts'),
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
