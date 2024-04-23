import { PLACEHOLDER_REGEX } from '..';

/**
 * Replace Refs placeholders with original ref objects
 */
export function replacePlaceholdersWithRefs({
  schemaAsText,
  refMapper = ({ ref }) => ref,
}: {
  schemaAsText: string;
  refMapper?: (input: { ref: string }) => string;
}): string {
  // Replace placeholder occurrences with a JSON schema $ref object
  let schema = schemaAsText.replaceAll(PLACEHOLDER_REGEX, (_match, ref) => {
    return `{ $ref: "${refMapper({ ref })}" }`;
  });

  return schema;
}
