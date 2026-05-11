import { describe, expect, it } from 'vitest';

import type { OpenApiDocument } from '../../src/types.js';
import { validateTargets } from '../../src/utils/validateTargets.js';

const document: OpenApiDocument = {
  openapi: '3.0.3',
  info: { title: 'title', version: '1.0.0' },
  servers: [{ url: 'https://example.com' }],
  components: {
    schemas: {
      January: {
        type: 'object',
        required: ['isJanuary'],
        properties: { isJanuary: { type: 'boolean' } },
      },
      February: {
        type: 'object',
        properties: { isFebruary: { type: 'boolean' } },
      },
    },
  },
  paths: {
    '/v1/path-1': {
      get: { responses: { '200': { description: 'ok' } } },
    },
  },
};

describe('validateTargets util', () => {
  describe('valid targets', () => {
    it('passes for a record-of-schemas as collection', () => {
      expect(() =>
        validateTargets({
          document,
          targets: { single: [], collections: ['components.schemas'] },
        }),
      ).not.toThrow();
    });

    it('passes for a leaf schema as single', () => {
      expect(() =>
        validateTargets({
          document,
          targets: {
            single: ['components.schemas.January'],
            collections: [],
          },
        }),
      ).not.toThrow();
    });

    it('passes for a path item as single', () => {
      expect(() =>
        validateTargets({
          document,
          targets: { single: ['paths./v1/path-1'], collections: [] },
        }),
      ).not.toThrow();
    });

    it('passes when both targets lists are empty', () => {
      expect(() =>
        validateTargets({
          document,
          targets: { single: [], collections: [] },
        }),
      ).not.toThrow();
    });
  });

  describe('targets.single', () => {
    it('throws on non-existing path', () => {
      expect(() =>
        validateTargets({
          document,
          targets: { single: ['components.schemas.NotThere'], collections: [] },
        }),
      ).toThrow(
        '[openapi-ts-json-schema] target not found in OAS definition: "components.schemas.NotThere". Check that the path exists in your OpenAPI document.',
      );
    });

    it('throws when resolving to a primitive', () => {
      expect(() =>
        validateTargets({
          document,
          targets: { single: ['info.title'], collections: [] },
        }),
      ).toThrow(
        '[openapi-ts-json-schema] "targets.single" target "info.title" must resolve to an object, got a string.',
      );
    });

    it('throws when resolving to an array', () => {
      expect(() =>
        validateTargets({
          document,
          targets: { single: ['servers'], collections: [] },
        }),
      ).toThrow(
        '[openapi-ts-json-schema] "targets.single" target "servers" must resolve to an object, got an array.',
      );
    });
  });

  describe('targets.collections', () => {
    it('throws on non-existing path', () => {
      expect(() =>
        validateTargets({
          document,
          targets: { single: [], collections: ['not.a.real.path'] },
        }),
      ).toThrow(
        '[openapi-ts-json-schema] target not found in OAS definition: "not.a.real.path". Check that the path exists in your OpenAPI document.',
      );
    });

    it('throws when resolving to a primitive', () => {
      expect(() =>
        validateTargets({
          document,
          targets: { single: [], collections: ['info.title'] },
        }),
      ).toThrow(
        '[openapi-ts-json-schema] "targets.collections" target "info.title" must resolve to an object, got a string.',
      );
    });

    it('throws when resolving to a leaf schema (non-object child)', () => {
      expect(() =>
        validateTargets({
          document,
          targets: {
            single: [],
            collections: ['components.schemas.January'],
          },
        }),
      ).toThrow(
        '[openapi-ts-json-schema] "targets.collections" target "components.schemas.January" must be a record of definition objects, but child "type" is a string. Did you mean to use "targets.single"?',
      );
    });
  });
});
