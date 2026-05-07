import fs from 'fs/promises';
import path from 'path';

import { describe, expect, it } from 'vitest';

import { openapiToTsJsonSchema } from '../src/index.js';
import { formatTypeScript } from '../src/utils/index.js';
import { fixturesPath, makeTestOutputPath } from './test-utils/index.js';

/**
 * Tests for chained alias definitions: AnswerChainedAlias -> AnswerAlias -> Answer
 *
 * Known limitation: the chain is not preserved for "import" and "keep" modes.
 * Both AnswerAlias and AnswerChainedAlias resolve to the ultimate target (Answer)
 * rather than the immediate $ref. This is a consequence of how json-schema-ref-parser
 * resolves transitive $refs during the dereference step.
 */
describe('Chained alias definitions', () => {
  describe('refHandling === "import"', () => {
    it('both aliases re-export the ultimate target', async () => {
      const { outputPath } = await openapiToTsJsonSchema({
        openApiDocument: path.resolve(fixturesPath, 'chained-alias/specs.yaml'),
        outputPath: makeTestOutputPath('chained-alias-import'),
        targets: {
          collections: ['components.schemas'],
        },
        silent: true,
        refHandling: 'import',
      });

      const answerSchema = await import(
        path.resolve(outputPath, 'components/schemas/Answer')
      );
      const answerAliasSchema = await import(
        path.resolve(outputPath, 'components/schemas/AnswerAlias')
      );
      const answerChainedAliasSchema = await import(
        path.resolve(outputPath, 'components/schemas/AnswerChainedAlias')
      );

      expect(answerAliasSchema.default).toEqual({ ...answerSchema.default });
      expect(answerChainedAliasSchema.default).toEqual({
        ...answerSchema.default,
      });

      const expectedAliasFile = await formatTypeScript(`
        import componentsSchemasAnswer from "./Answer.js";

        const schema = componentsSchemasAnswer as const;
        export default schema;`);

      const answerAliasFile = await fs.readFile(
        path.resolve(outputPath, 'components/schemas/AnswerAlias.ts'),
        { encoding: 'utf8' },
      );
      const answerChainedAliasFile = await fs.readFile(
        path.resolve(outputPath, 'components/schemas/AnswerChainedAlias.ts'),
        { encoding: 'utf8' },
      );

      expect(answerAliasFile).toEqual(expectedAliasFile);
      // Chain is not preserved: AnswerChainedAlias also imports directly from Answer
      expect(answerChainedAliasFile).toEqual(expectedAliasFile);
    });
  });

  describe('refHandling === "keep"', () => {
    it('both aliases preserve a $ref to the ultimate target', async () => {
      const { outputPath } = await openapiToTsJsonSchema({
        openApiDocument: path.resolve(fixturesPath, 'chained-alias/specs.yaml'),
        outputPath: makeTestOutputPath('chained-alias-keep'),
        targets: {
          collections: ['components.schemas'],
        },
        silent: true,
        refHandling: 'keep',
      });

      const answerAliasSchema = await import(
        path.resolve(outputPath, 'components/schemas/AnswerAlias')
      );
      const answerChainedAliasSchema = await import(
        path.resolve(outputPath, 'components/schemas/AnswerChainedAlias')
      );

      const expectedRef = { $ref: '/components/schemas/Answer' };
      expect(answerAliasSchema.default).toEqual(expectedRef);
      // Chain is not preserved: AnswerChainedAlias also points directly to Answer
      expect(answerChainedAliasSchema.default).toEqual(expectedRef);

      const expectedFile = await formatTypeScript(`
        const schema = { $ref: "/components/schemas/Answer" } as const;
        export default schema;`);

      const answerAliasFile = await fs.readFile(
        path.resolve(outputPath, 'components/schemas/AnswerAlias.ts'),
        { encoding: 'utf8' },
      );
      const answerChainedAliasFile = await fs.readFile(
        path.resolve(outputPath, 'components/schemas/AnswerChainedAlias.ts'),
        { encoding: 'utf8' },
      );

      expect(answerAliasFile).toEqual(expectedFile);
      expect(answerChainedAliasFile).toEqual(expectedFile);
    });
  });

  describe('refHandling === "inline"', () => {
    it('both aliases inline the ultimate target schema', async () => {
      const { outputPath } = await openapiToTsJsonSchema({
        openApiDocument: path.resolve(fixturesPath, 'chained-alias/specs.yaml'),
        outputPath: makeTestOutputPath('chained-alias-inline'),
        targets: {
          collections: ['components.schemas'],
        },
        silent: true,
        refHandling: 'inline',
      });

      const answerAliasSchema = await import(
        path.resolve(outputPath, 'components/schemas/AnswerAlias')
      );
      const answerChainedAliasSchema = await import(
        path.resolve(outputPath, 'components/schemas/AnswerChainedAlias')
      );

      const expectedValue = {
        type: ['string', 'null'],
        enum: ['yes', 'no', null],
      };
      expect(answerAliasSchema.default).toEqual(expectedValue);
      expect(answerChainedAliasSchema.default).toEqual(expectedValue);

      const expectedFile = await formatTypeScript(`
        const schema = {
          // $ref: "#/components/schemas/Answer"
          type: ["string", "null"],
          enum: ["yes", "no", null],
        } as const;
        export default schema;`);

      const answerAliasFile = await fs.readFile(
        path.resolve(outputPath, 'components/schemas/AnswerAlias.ts'),
        { encoding: 'utf8' },
      );
      const answerChainedAliasFile = await fs.readFile(
        path.resolve(outputPath, 'components/schemas/AnswerChainedAlias.ts'),
        { encoding: 'utf8' },
      );

      expect(answerAliasFile).toEqual(expectedFile);
      expect(answerChainedAliasFile).toEqual(expectedFile);
    });
  });
});
