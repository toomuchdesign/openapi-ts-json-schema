import path from 'path';
import { describe, it, expect } from 'vitest';
import { fixtures, makeTestOutputPath } from './test-utils';
import { openapiToTsJsonSchema } from '../src';

describe('External $refs', () => {
  describe('refHandling option === "import"', () => {
    describe('multiple definitions aliasing same external definition', () => {
      it('dedupe imports and resolve against same schema', async () => {
        const { outputPath } = await openapiToTsJsonSchema({
          openApiSchema: path.resolve(fixtures, 'external-ref/specs.yaml'),
          outputPath: makeTestOutputPath(
            'external-refs-import-definition-alias',
          ),
          definitionPathsToGenerateFrom: ['components.schemas'],
          refHandling: 'import',
          silent: true,
        });

        const externalDefinitionSchema = await import(
          path.resolve(outputPath, 'components/schemas/ExternalDefinition')
        );

        const externalDefinitionAliasSchema = await import(
          path.resolve(outputPath, 'components/schemas/ExternalDefinitionAlias')
        );

        expect(externalDefinitionSchema.default).toEqual({
          description: 'External Foo description',
          type: ['string', 'null'],
          enum: ['yes', 'no', null],
        });

        expect(externalDefinitionAliasSchema.default).toEqual(
          externalDefinitionSchema.default,
        );
      });
    });

    describe('multiple definitions aliasing same whole document', () => {
      it('dedupe imports and resolve against same document', async () => {
        const { outputPath } = await openapiToTsJsonSchema({
          openApiSchema: path.resolve(fixtures, 'external-ref/specs.yaml'),
          outputPath: makeTestOutputPath('external-refs-import-document-alias'),
          definitionPathsToGenerateFrom: ['components.schemas'],
          refHandling: 'import',
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
        expect(externalDefinitionWholeDocumentSchema.default).toEqual({
          description: 'External definition whole document',
          type: ['string', 'null'],
          enum: ['yes', 'no', null],
        });

        expect(externalDefinitionWholeDocumentAliasSchema.default).toEqual(
          externalDefinitionWholeDocumentSchema.default,
        );
      });
    });
  });
});
