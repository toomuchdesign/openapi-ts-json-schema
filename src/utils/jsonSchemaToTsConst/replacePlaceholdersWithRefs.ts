import { PLACEHOLDER_REGEX } from '..';

/**
 * Replace Refs placeholders with original ref objects
 */
export function replacePlaceholdersWithRefs({
  schemaAsText,
}: {
  schemaAsText: string;
}): string {
  // Replace placeholder occurrences with a JSON schema $ref object
  let schema = schemaAsText.replaceAll(PLACEHOLDER_REGEX, (_match, ref) => {
    return `{ $ref: "${ref}" }`;
  });

  return schema;
}
