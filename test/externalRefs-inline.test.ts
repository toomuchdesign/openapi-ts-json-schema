import path from 'path';

import { describe, expect, it } from 'vitest';

import { openapiToTsJsonSchema } from '../src/index.js';
import { fixturesPath, makeTestOutputPath } from './test-utils/index.js';

describe('External $refs', () => {
  describe('refHandling option === "inline"', () => {
    it('Resolves external refs', async () => {
      const { outputPath } = await openapiToTsJsonSchema({
        openApiDocument: path.resolve(fixturesPath, 'external-ref/specs.yaml'),
        outputPath: makeTestOutputPath('external-refs-inline'),
        targets: {
          collections: ['components.schemas'],
        },
        refHandling: 'inline',
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
