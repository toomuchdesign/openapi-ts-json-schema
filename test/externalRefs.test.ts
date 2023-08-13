import path from 'path';
import { describe, it, expect } from 'vitest';
import { importFresh } from './utils';
import { openapiToTsJsonSchema } from '../src';

const fixtures = path.resolve(__dirname, 'fixtures');

describe('External $ref', () => {
  it('Resolve external refs', async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiSchema: path.resolve(fixtures, 'external-ref/specs.yaml'),
      definitionPathsToGenerateFrom: ['components.schemas'],
      silent: true,
    });

    const externalDefinitionSchema = await importFresh(
      path.resolve(outputPath, 'components.schemas/ExternalDefinition'),
    );

    expect(externalDefinitionSchema.default).toEqual({
      description: 'External Foo description',
      type: ['string', 'null'],
      enum: ['yes', 'no', null],
    });

    const localDefinitionReferencingExternalSchema = await importFresh(
      path.resolve(
        outputPath,
        'components.schemas/LocalDefinitionReferencingExternal',
      ),
    );

    expect(localDefinitionReferencingExternalSchema.default).toEqual({
      type: 'object',
      properties: {
        remoteDefinition: {
          description: 'External Foo description',
          type: ['string', 'null'],
          enum: ['yes', 'no', null],
        },
      },
    });
  });
});