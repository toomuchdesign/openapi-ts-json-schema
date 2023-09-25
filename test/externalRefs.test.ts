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
      const externalDefinitionWithRefSchema = await import(
        path.resolve(outputPath, 'components/schemas/ExternalDefinitionWithRef')
      );

      expect(externalDefinitionWithRefSchema.default).toEqual({
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
          externalDefinitionWithRef: externalDefinitionWithRefSchema.default,
          externalDefinitionWholeDocument:
            externalDefinitionWholeDocumentSchema.default,
          externalDefinitionNestedRefs:
            externalDefinitionNestedRefsSchema.default,
        },
      });
    });
  });

  // @NOTE this feature has not been implemented
  describe('refHandling option === "import"', () => {
    describe('openAPI definitions imported multiple times', () => {
      it('dedupe imports and resolve against same schema', async () => {
        const { outputPath } = await openapiToTsJsonSchema({
          openApiSchema: path.resolve(fixtures, 'external-ref/specs.yaml'),
          outputPath: makeTestOutputPath('external-refs'),
          definitionPathsToGenerateFrom: ['components.schemas'],
          refHandling: 'import',
          silent: true,
        });

        // @NOTE What would be the $ref value of an external definition?
        const externalDefinitionWithRefSchema = await import(
          path.resolve(
            outputPath,
            'components/schemas/ExternalDefinitionWithRef',
          )
        );

        const externalDefinitionWithSameRefSchema = await import(
          path.resolve(
            outputPath,
            'components/schemas/ExternalDefinitionWithSameRef',
          )
        );

        // Same imported schemas should be resolved against the same entity (reference equality)
        expect(externalDefinitionWithRefSchema.default).toBe(
          externalDefinitionWithSameRefSchema.default,
        );
      });
    });

    // @NOTE this feature has not been implemented
    // @NOTE This test should be defined once decided what of the $ref value of external definitions
    // describe('refHandling option === "keep"', () => {});
  });
});
