import { PLACEHOLDER_REGEX } from '..';

/**
 * Replace id placeholders with their relevant $ref object
 */
export function replacePlaceholdersWithRefs({
  schemaAsText,
  refMapper,
}: {
  schemaAsText: string;
  refMapper: (input: { id: string }) => string;
}): string {
  // Replace placeholder occurrences with a JSON schema $ref object
  let output = schemaAsText.replaceAll(PLACEHOLDER_REGEX, (_match, id) => {
    return `{ $ref: "${refMapper({ id })}" }`;
  });

  return output;
}
