import path from 'path';
import { describe, it, expect } from 'vitest';
import { fixtures, makeTestOutputPath } from './test-utils';
import { openapiToTsJsonSchema } from '../src';

describe('External $refs', () => {
  describe('refHandling option === "import"', () => {
    describe('multiple definitions aliasing same external definition', () => {
      it('dedupe imports and resolve against same schema (aliases)', async () => {
        const { outputPath } = await openapiToTsJsonSchema({
          openApiSchema: path.resolve(fixtures, 'external-ref/specs.yaml'),
          outputPath: makeTestOutputPath('external-refs'),
          definitionPathsToGenerateFrom: ['components.schemas'],
          refHandling: { strategy: 'import' },
          silent: true,
        });

        const externalDefinitionSchema = await import(
          path.resolve(outputPath, 'components/schemas/ExternalDefinition')
        );

        const externalDefinitionAliasSchema = await import(
          path.resolve(outputPath, 'components/schemas/ExternalDefinitionAlias')
        );

        // Same imported schemas should be resolved against the same entity (reference equality)
        expect(externalDefinitionSchema.default).toBe(
          externalDefinitionAliasSchema.default,
        );
      });
    });

    describe('multiple definitions aliasing same whole document', () => {
      it('dedupe imports and resolve against same document', async () => {
        const { outputPath } = await openapiToTsJsonSchema({
          openApiSchema: path.resolve(fixtures, 'external-ref/specs.yaml'),
          outputPath: makeTestOutputPath('external-refs'),
          definitionPathsToGenerateFrom: ['components.schemas'],
          refHandling: { strategy: 'import' },
          silent: true,
        });

        const externalDefinitionWholeDocumentSchema = await import(
          path.resolve(
            outputPath,
            'components/schemas/ExternalDefinitionWholeDocument',
          )
        );

        const externalDefinitionWholeDocumentAliasSchema = await import(
          path.resolve(
            outputPath,
            'components/schemas/ExternalDefinitionWholeDocumentAlias',
          )
        );

        // Same imported schemas should be resolved against the same entity (reference equality)
        expect(externalDefinitionWholeDocumentSchema.default).toBe(
          externalDefinitionWholeDocumentAliasSchema.default,
        );
      });
    });
  });
});
