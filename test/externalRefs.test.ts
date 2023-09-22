import path from 'path';
import { describe, it, expect } from 'vitest';
import { fixtures, makeTestOutputPath } from './test-utils';
import { openapiToTsJsonSchema } from '../src';

describe('External $ref', () => {
  it('Resolve external refs', async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiSchema: path.resolve(fixtures, 'external-ref/specs.yaml'),
      outputPath: makeTestOutputPath('external-refs'),
      definitionPathsToGenerateFrom: ['components.schemas'],
      silent: true,
    });

    // $ref: './external-definition.yaml#/components/schemas/Foo1'
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

    // Local definition referencing external schemas
    const localDefinitionReferencingExternalSchemas = await import(
      path.resolve(
        outputPath,
        'components/schemas/LocalDefinitionReferencingExternal',
      )
    );

    expect(localDefinitionReferencingExternalSchemas.default).toEqual({
      type: 'object',
      properties: {
        externalDefinitionWithRef: {
          description: 'External Foo description',
          type: ['string', 'null'],
          enum: ['yes', 'no', null],
        },
        externalDefinitionWholeDocument: {
          description: 'External definition whole document',
          type: ['string', 'null'],
          enum: ['yes', 'no', null],
        },
        externalDefinitionNestedRefs: {
          description: 'External Bar description',
          type: ['string', 'null'],
          enum: ['yes', 'no', null],
        },
      },
    });
  });
});
