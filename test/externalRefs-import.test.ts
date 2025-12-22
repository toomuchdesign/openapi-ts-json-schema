import path from 'path';

import { describe, expect, it } from 'vitest';

import { openapiToTsJsonSchema } from '../src/index.js';
import { fixturesPath, makeTestOutputPath } from './test-utils/index.js';

describe('External $refs', () => {
  describe('refHandling option === "import"', () => {
    describe('multiple definitions aliasing same external definition', () => {
      it('dedupe imports and resolve against same schema', async () => {
        const { outputPath } = await openapiToTsJsonSchema({
          openApiDocument: path.resolve(
            fixturesPath,
            'external-ref/specs.yaml',
          ),
          outputPath: makeTestOutputPath(
            'external-refs-import-definition-alias',
          ),
          targets: {
            collections: ['components.schemas'],
          },
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
          openApiDocument: path.resolve(
            fixturesPath,
            'external-ref/specs.yaml',
          ),
          outputPath: makeTestOutputPath('external-refs-import-document-alias'),
          targets: {
            collections: ['components.schemas'],
          },
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
