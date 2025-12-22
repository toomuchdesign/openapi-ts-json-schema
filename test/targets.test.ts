import fs from 'fs';
import path from 'path';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { openapiToTsJsonSchema } from '../src/index.js';
import { fixturesPath, makeTestOutputPath } from './test-utils/index.js';

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

describe('targets option', () => {
  describe('targets.single[]', () => {
    it('generates only specified path schema', async () => {
      const { outputPath } = await openapiToTsJsonSchema({
        openApiDocument: path.resolve(fixturesPath, 'paths/specs.yaml'),
        outputPath: makeTestOutputPath('targets-specific-path'),
        targets: {
          single: ['paths./users/{id}'],
        },
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

    describe('specific "components" paths generation', () => {
      it('generates only specified path schema', async () => {
        const { outputPath } = await openapiToTsJsonSchema({
          openApiDocument: path.resolve(fixturesPath, 'complex/specs.yaml'),
          outputPath: makeTestOutputPath('targets-specific-component'),
          targets: {
            single: ['components.schemas.March'],
          },
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

    describe('non-existing path', () => {
      it('throws expected error', async () => {
        await expect(
          openapiToTsJsonSchema({
            openApiDocument: path.resolve(fixturesPath, 'paths/specs.yaml'),
            outputPath: makeTestOutputPath(
              'targets-non-existing-specific-path',
            ),
            targets: {
              single: ['paths./non-existing-path'],
            },
            silent: true,
          }),
        ).rejects.toThrow(
          '[openapi-ts-json-schema] target not found in OAS definition: "paths./non-existing-path"',
        );
      });
    });
  });

  describe('targets.collections[]', () => {
    describe('path with trailing "."', () => {
      it('throws expected error', async () => {
        await expect(
          openapiToTsJsonSchema({
            openApiDocument: path.resolve(fixturesPath, 'complex/specs.yaml'),
            outputPath: makeTestOutputPath('targets-trailing-dot'),
            targets: {
              collections: ['components.schemas.'],
            },
            silent: true,
          }),
        ).rejects.toThrow(
          '[openapi-ts-json-schema] target not found in OAS definition: "components.schemas."',
        );
      });
    });

    describe('empty', async () => {
      it('logs expected message', async () => {
        await openapiToTsJsonSchema({
          openApiDocument: path.resolve(
            fixturesPath,
            'ref-property/specs.yaml',
          ),
          outputPath: makeTestOutputPath('targets-empty'),
          targets: {},
        });

        expect(console.log).toHaveBeenCalledWith(
          `[openapi-ts-json-schema] ⚠️ No schemas will be generated since targets option is empty`,
        );
      });
    });

    describe('non-existing definition object path', () => {
      it('throws expected error', async () => {
        await expect(
          openapiToTsJsonSchema({
            openApiDocument: path.resolve(
              fixturesPath,
              'ref-property/specs.yaml',
            ),
            outputPath: makeTestOutputPath(
              'targets-non-existing-definition-object-path',
            ),
            targets: {
              collections: ['non-existing-path'],
            },
            silent: true,
          }),
        ).rejects.toThrow(
          '[openapi-ts-json-schema] target not found in OAS definition: "non-existing-path"',
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
            outputPath: makeTestOutputPath('targets-non-relative-path'),
            targets: {
              collections: ['paths', '/components.schema'],
            },
          }),
        ).rejects.toThrow(
          '[openapi-ts-json-schema] "targets" must define relative paths. "/components.schema" found.',
        );
      });
    });
  });
});
