import path from 'path';
import fs from 'fs/promises';
import { describe, it, expect } from 'vitest';
import { openapiToTsJsonSchema } from '../../src';
import generateRefTypesAsArrayPlugin from '../../src/plugins/generateRefTypesAsArrayPlugin';
import { importFresh } from '../test-utils';
import { formatTypeScript } from '../../src/utils';

const fixtures = path.resolve(__dirname, '../fixtures');

describe('generateRefTypesAsArrayPlugin plugin', async () => {
  it('generates expected file', async () => {
    const { outputPath, metaData } = await openapiToTsJsonSchema({
      openApiSchema: path.resolve(fixtures, 'complex/specs.yaml'),
      definitionPathsToGenerateFrom: ['components.months', 'paths'],
      refHandling: 'keep',
      silent: true,
    });

    await generateRefTypesAsArrayPlugin({ outputPath, metaData });

    const actual = await fs.readFile(
      path.resolve(outputPath, 'refTypesAsArray.ts'),
      {
        encoding: 'utf8',
      },
    );

    // @TODO find a better way to assert against generated types
    const expected = await formatTypeScript(`
      import componentsSchemasAnswer from "./components/schemas/Answer";
      import componentsMonthsJanuary from "./components/months/January";
      import componentsMonthsFebruary from "./components/months/February";

      const componentsSchemasAnswerWithId = {
        ...componentsSchemasAnswer,
        $id: "#/components/schemas/Answer",
      } as const;
      const componentsMonthsJanuaryWithId = {
        ...componentsMonthsJanuary,
        $id: "#/components/months/January",
      } as const;
      const componentsMonthsFebruaryWithId = {
        ...componentsMonthsFebruary,
        $id: "#/components/months/February",
      } as const;

      type RefTypes = [
        typeof componentsSchemasAnswerWithId,
        typeof componentsMonthsJanuaryWithId,
        typeof componentsMonthsFebruaryWithId,
      ];

      export default RefTypes;`);

    expect(actual).toBe(expected);
  });
});
