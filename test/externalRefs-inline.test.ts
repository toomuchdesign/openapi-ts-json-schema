import path from 'path';
import { describe, it, expect } from 'vitest';
import { fixtures, makeTestOutputPath } from './test-utils';
import { openapiToTsJsonSchema } from '../src';

describe('External $refs', () => {
  describe('refHandling option === "inline"', () => {
    it('Resolves external refs', async () => {
      const { outputPath } = await openapiToTsJsonSchema({
        openApiSchema: path.resolve(fixtures, 'external-ref/specs.yaml'),
        outputPath: makeTestOutputPath('external-refs'),
        definitionPathsToGenerateFrom: ['components.schemas'],
        silent: true,
      });

      // $ref: './external-definition.yaml#/components/schemas/Foo'
      const externalDefinitionSchema = await import(
        path.resolve(outputPath, 'components/schemas/ExternalDefinition')
      );

      expect(externalDefinitionSchema.default).toEqual({
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

      expect(localDefinitionReferencingExternalSchemas.default).toEqual({
        type: 'object',
        properties: {
          externalDefinition: externalDefinitionSchema.default,
          externalDefinitionWholeDocument:
            externalDefinitionWholeDocumentSchema.default,
          externalDefinitionNestedRefs:
            externalDefinitionNestedRefsSchema.default,
        },
      });
    });
  });
});
