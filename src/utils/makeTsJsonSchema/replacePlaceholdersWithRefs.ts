import { PLACEHOLDER_REGEX } from '..';

/**
 * Replace Refs placeholders with original ref objects
 */
export function replacePlaceholdersWithRefs({
  schemaAsText,
  refMapper = ({ id }) => `#${id}`,
}: {
  schemaAsText: string;
  refMapper?: (input: { id: string }) => string;
}): string {
  // Replace placeholder occurrences with a JSON schema $ref object
  let schema = schemaAsText.replaceAll(PLACEHOLDER_REGEX, (_match, id) => {
    return `{ $ref: "${refMapper({ id })}" }`;
  });

  return schema;
}
