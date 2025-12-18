// paths.{definitionName}
const SINGLE_DEFINITION_PATHS_REGEX = /^paths\.([^.]+)$/;
// components.schemas.{definitionName}
const SINGLE_DEFINITION_COMPONENTS_REGEX = /^components\.schemas\.([^.]+)$/;

/**
 * Parse a dotted definition path and check whether it matches known single definition paths:
 * - paths.{definitionName}
 * - components.schemas.{definitionName}
 *
 * @returns An object indicating whether the path is a single definition path and the extracted schema name and relative directory name if applicable
 */
export function parseSingleDefinitionPath(path: string):
  | {
      isSingleDefinitionPath: true;
      result: {
        schemaName: string;
        schemaRelativeDirName: string;
      };
    }
  | {
      isSingleDefinitionPath: false;
      result: undefined;
    } {
  {
    const match = SINGLE_DEFINITION_PATHS_REGEX.exec(path);
    if (match && match[1]) {
      return {
        isSingleDefinitionPath: true,
        result: {
          schemaName: match[1],
          schemaRelativeDirName: 'paths',
        },
      };
    }
  }

  {
    const match = SINGLE_DEFINITION_COMPONENTS_REGEX.exec(path);
    if (match && match[1]) {
      return {
        isSingleDefinitionPath: true,
        result: {
          schemaName: match[1],
          schemaRelativeDirName: 'components.schemas',
        },
      };
    }
  }

  return {
    isSingleDefinitionPath: false,
    result: undefined,
  };
}
