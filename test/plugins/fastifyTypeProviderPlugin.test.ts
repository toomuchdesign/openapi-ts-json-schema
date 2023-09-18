import path from 'path';
import fs from 'fs/promises';
import { describe, it, expect } from 'vitest';
import { openapiToTsJsonSchema } from '../../src';
import { fastifyTypeProviderPlugin } from '../../src';
import { fixtures, makeTestOutputPath } from '../test-utils';
import { formatTypeScript } from '../../src/utils';

describe('fastifyTypeProviderPlugin plugin', () => {
  it('generates expected file', async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiSchema: path.resolve(fixtures, 'complex/specs.yaml'),
      outputPath: makeTestOutputPath('plugin-fastify'),
      definitionPathsToGenerateFrom: ['components.months', 'paths'],
      refHandling: 'keep',
      plugins: [fastifyTypeProviderPlugin()],
      silent: true,
    });

    const actualAsText = await fs.readFile(
      path.resolve(outputPath, 'fastifyTypeProvider.ts'),
      {
        encoding: 'utf8',
      },
    );

    // @TODO find a better way to assert against generated types
    const expectedAsText = await formatTypeScript(`
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

      export type References = [
        typeof componentsSchemasAnswerWithId,
        typeof componentsMonthsJanuaryWithId,
        typeof componentsMonthsFebruaryWithId,
      ];

      export const referenceSchemas = [
        componentsSchemasAnswerWithId,
        componentsMonthsJanuaryWithId,
        componentsMonthsFebruaryWithId,
      ]`);

    expect(actualAsText).toBe(expectedAsText);

    // Ref schemas for fastify.addSchema
    const answerSchema = await import(
      path.resolve(outputPath, 'components/schemas/Answer')
    );
    const januarySchema = await import(
      path.resolve(outputPath, 'components/months/January')
    );
    const februarySchema = await import(
      path.resolve(outputPath, 'components/months/February')
    );
    const actualParsed = await import(
      path.resolve(outputPath, 'fastifyTypeProvider')
    );

    expect(actualParsed.referenceSchemas).toEqual([
      { ...answerSchema.default, $id: '#/components/schemas/Answer' },
      { ...januarySchema.default, $id: '#/components/months/January' },
      { ...februarySchema.default, $id: '#/components/months/February' },
    ]);
  });
});
