import fs from 'fs';
import path from 'path';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { openapiToTsJsonSchema } from '../src';
import { fixturesPath, makeTestOutputPath } from './test-utils';

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

describe('definitionPathsToGenerateFrom option', () => {
  describe('specific "paths" paths generation', () => {
    it('Generates only specified path schema', async () => {
      const { outputPath } = await openapiToTsJsonSchema({
        openApiDocument: path.resolve(fixturesPath, 'paths/specs.yaml'),
        outputPath: makeTestOutputPath(
          'definitionPathsToGenerateFrom-specific-path',
        ),
        definitionPathsToGenerateFrom: ['paths./users/{id}'],
        silent: true,
      });

      const pathsFolderContents = fs.readdirSync(
        path.resolve(outputPath, 'paths'),
      );
      expect(pathsFolderContents).toEqual(['_users_{id}.ts']);

      const usersPathSchema = await import(
        path.resolve(outputPath, 'paths/_users_{id}')
      );

      expect(usersPathSchema.default).toEqual(expect.any(Object));
    });

    describe('non-existing path', () => {
      it('Throws expected error', async () => {
        await expect(
          openapiToTsJsonSchema({
            openApiDocument: path.resolve(fixturesPath, 'paths/specs.yaml'),
            outputPath: makeTestOutputPath(
              'definitionPathsToGenerateFrom-non-existing-specific-path',
            ),
            definitionPathsToGenerateFrom: ['paths./non-existing-path'],
            silent: true,
          }),
        ).rejects.toThrow(
          '[openapi-ts-json-schema] "definitionPathsToGenerateFrom" entry not found in OAS definition: "paths./non-existing-path"',
        );
      });
    });
  });

  describe('specific "components" paths generation', () => {
    it('Generates only specified path schema', async () => {
      const { outputPath } = await openapiToTsJsonSchema({
        openApiDocument: path.resolve(fixturesPath, 'complex/specs.yaml'),
        outputPath: makeTestOutputPath(
          'definitionPathsToGenerateFrom-specific-component',
        ),
        definitionPathsToGenerateFrom: ['components.schemas.March'],
        silent: true,
      });

      const pathsFolderContents = fs.readdirSync(
        path.resolve(outputPath, 'components', 'schemas'),
      );

      /**
       * @NOTE currently all referenced components get generated, too
       * it's a known shortcoming
       */
      expect(pathsFolderContents).toEqual([
        'Answer.ts',
        'February.ts',
        'January.ts',
        'March.ts',
      ]);

      const marchComponentSchema = await import(
        path.resolve(outputPath, 'components/schemas/March')
      );

      expect(marchComponentSchema.default).toEqual(expect.any(Object));
    });
  });

  describe('path with trailing "."', () => {
    it('Throws expected error', async () => {
      await expect(
        openapiToTsJsonSchema({
          openApiDocument: path.resolve(fixturesPath, 'complex/specs.yaml'),
          outputPath: makeTestOutputPath(
            'definitionPathsToGenerateFrom-trailing-dot',
          ),
          definitionPathsToGenerateFrom: ['components.schemas.'],
          silent: true,
        }),
      ).rejects.toThrow(
        '[openapi-ts-json-schema] "definitionPathsToGenerateFrom" entry not found in OAS definition: "components.schemas."',
      );
    });
  });

  describe('empty', async () => {
    it('logs expected message', async () => {
      await openapiToTsJsonSchema({
        openApiDocument: path.resolve(fixturesPath, 'ref-property/specs.yaml'),
        outputPath: makeTestOutputPath('definitionPathsToGenerateFrom-empty'),
        definitionPathsToGenerateFrom: [],
      });

      expect(console.log).toHaveBeenCalledWith(
        `[openapi-ts-json-schema] ⚠️ No schemas will be generated since definitionPathsToGenerateFrom option is empty`,
      );
    });
  });

  describe('non-existing definition object path', () => {
    it('Throws expected error', async () => {
      await expect(
        openapiToTsJsonSchema({
          openApiDocument: path.resolve(
            fixturesPath,
            'ref-property/specs.yaml',
          ),
          outputPath: makeTestOutputPath(
            'definitionPathsToGenerateFrom-non-existing-definition-object-path',
          ),
          definitionPathsToGenerateFrom: ['paths'],
          silent: true,
        }),
      ).rejects.toThrow(
        '[openapi-ts-json-schema] "definitionPathsToGenerateFrom" entry not found in OAS definition: "paths"',
      );
    });
  });

  describe('contains non-relative paths', async () => {
    it('throws with expected message', async () => {
      await expect(
        openapiToTsJsonSchema({
          openApiDocument: path.resolve(
            fixturesPath,
            'ref-property/specs.yaml',
          ),
          outputPath: makeTestOutputPath(
            'definitionPathsToGenerateFrom-non-relative-path',
          ),
          definitionPathsToGenerateFrom: ['paths', '/components.schema'],
        }),
      ).rejects.toThrow(
        '[openapi-ts-json-schema] "definitionPathsToGenerateFrom" must be an array of relative paths. "/components.schema" found.',
      );
    });
  });
});
