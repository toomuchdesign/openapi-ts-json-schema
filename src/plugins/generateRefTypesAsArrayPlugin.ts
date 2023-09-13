import { makeRelativePath, formatTypeScript, saveFile } from '../utils';
import type { Plugin, SchemaMetaData } from '../types';

const FILE_NAME = 'refTypesAsArray.ts';

const generateRefTypesAsArrayPlugin: Plugin = async ({
  outputPath,
  metaData,
}) => {
  const refs: SchemaMetaData[] = [];
  metaData.schemas.forEach((schema) => {
    if (schema.isRef) {
      refs.push(schema);
    }
  });

  const schemas = refs.map(
    ({ schemaAbsoluteImportPath, schemaUniqueName, schemaId }) => {
      return {
        importPath: makeRelativePath({
          fromDirectory: outputPath,
          to: schemaAbsoluteImportPath,
        }),
        schemaUniqueName,
        schemaId,
      };
    },
  );

  let output = '';

  schemas.forEach((schema) => {
    output += `\n import ${schema.schemaUniqueName} from "${schema.importPath}";`;
  });

  output += '\n\n';

  schemas.forEach((schema) => {
    output += `\n const ${schema.schemaUniqueName}WithId = {...${schema.schemaUniqueName}, $id: "${schema.schemaId}"} as const;`;
  });

  output += `\n\n
    type RefTypes = [
      ${schemas
        .map((schema) => `typeof ${schema.schemaUniqueName}WithId`)
        .join(',')}
  ];`;

  output += '\n\nexport default RefTypes';

  const formattedOutput = await formatTypeScript(output);
  await saveFile({
    path: [outputPath, FILE_NAME],
    data: formattedOutput,
  });
};

export default generateRefTypesAsArrayPlugin;
