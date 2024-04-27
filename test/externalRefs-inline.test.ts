import path from 'path';
import { describe, it, expect } from 'vitest';
import { fixtures, makeTestOutputPath } from './test-utils';
import { openapiToTsJsonSchema } from '../src';

describe('External $refs', () => {
  describe('refHandling option === "inline"', () => {
    it('Resolves external refs', async () => {
      const { outputPath } = await openapiToTsJsonSchema({
        openApiSchema: path.resolve(fixtures, 'external-ref/specs.yaml'),
        outputPath: makeTestOutputPath('external-refs-inline'),
        definitionPathsToGenerateFrom: ['components.schemas'],
        refHandling: 'inline',
        silent: true,
      });

      // $ref: './external-definition.yaml#/components/schemas/Foo'
      const externalDefinitionSchema = await import(
        path.resolve(outputPath, 'components/schemas/ExternalDefinition')
      );

      expect(externalDefinitionSchema.default).toEqual({
        $id: '/components/schemas/ExternalDefinition',
        description: 'External Foo description',
        type: ['string', 'null'],
        enum: ['yes', 'no', null],
      });

      // $ref: './external-definition-whole-document.yaml'
      const externalDefinitionWholeDocumentSchema = await import(
        path.resolve(
          outputPath,
          'components/schemas/ExternalDefinitionWholeDocument',
        )
      );

      expect(externalDefinitionWholeDocumentSchema.default).toEqual({
        $id: '/components/schemas/ExternalDefinitionWholeDocument',
        description: 'External definition whole document',
        type: ['string', 'null'],
        enum: ['yes', 'no', null],
      });

      // $ref: './external-definition-nested-refs.yaml#/components/schemas/BarFromRef'
      const externalDefinitionNestedRefsSchema = await import(
        path.resolve(
          outputPath,
          'components/schemas/ExternalDefinitionNestedRefs',
        )
      );

      expect(externalDefinitionNestedRefsSchema.default).toEqual({
        $id: '/components/schemas/ExternalDefinitionNestedRefs',
        description: 'External Bar description',
        type: ['string', 'null'],
        enum: ['yes', 'no', null],
      });

      // Local definition referencing previous external schemas
      const localDefinitionReferencingExternalSchemas = await import(
        path.resolve(
          outputPath,
          'components/schemas/LocalDefinitionReferencingExternal',
        )
      );

      const { $id: _, ...externalDefinitionSchemaWithout$id } =
        externalDefinitionSchema.default;
      const { $id: __, ...externalDefinitionWholeDocumentWithout$id } =
        externalDefinitionWholeDocumentSchema.default;
      const { $id: ___, ...externalDefinitionNestedRefsSchemaWithout$id } =
        externalDefinitionNestedRefsSchema.default;

      expect(localDefinitionReferencingExternalSchemas.default).toEqual({
        $id: '/components/schemas/LocalDefinitionReferencingExternal',
        type: 'object',
        properties: {
          externalDefinition: externalDefinitionSchemaWithout$id,
          externalDefinitionWholeDocument:
            externalDefinitionWholeDocumentWithout$id,
          externalDefinitionNestedRefs:
            externalDefinitionNestedRefsSchemaWithout$id,
        },
      });
    });
  });
});
