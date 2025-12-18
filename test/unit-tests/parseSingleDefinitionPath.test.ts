import { describe, expect, it } from 'vitest';

import { parseSingleDefinitionPath } from '../../src/utils/parseSingleDefinitionPath.js';

type TestCase = {
  input: string;
  expected: ReturnType<typeof parseSingleDefinitionPath>;
};

const cases: TestCase[] = [
  {
    input: 'paths.pet',
    expected: {
      isSingleDefinitionPath: true,
      result: {
        schemaName: 'pet',
        schemaRelativeDirName: 'paths',
      },
    },
  },
  {
    input: 'paths.',
    expected: {
      isSingleDefinitionPath: false,
      result: undefined,
    },
  },
  {
    input: 'paths.pet.extra',
    expected: {
      isSingleDefinitionPath: false,
      result: undefined,
    },
  },
  {
    input: 'components.schemas.User',
    expected: {
      isSingleDefinitionPath: true,
      result: {
        schemaName: 'User',
        schemaRelativeDirName: 'components.schemas',
      },
    },
  },
  {
    input: 'components.schemas.',
    expected: {
      isSingleDefinitionPath: false,
      result: undefined,
    },
  },
  {
    input: 'components.schemas.User.extra',
    expected: {
      isSingleDefinitionPath: false,
      result: undefined,
    },
  },
  {
    input: 'random.path',
    expected: {
      isSingleDefinitionPath: false,
      result: undefined,
    },
  },
];

describe.each(cases)(
  'parseSingleDefinitionPath util',
  ({ input, expected }) => {
    it(`parses "${input}" correctly`, () => {
      expect(parseSingleDefinitionPath(input)).toEqual(expected);
    });
  },
);
