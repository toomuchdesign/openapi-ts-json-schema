export const SCHEMA_ID_SYMBOL = Symbol('id');

const SCHEMA_ID_MARKER_START = '_OTJS-START_';
const SCHEMA_ID_MARKER_END = '_OTJS-END_';

export const PLACEHOLDER_REGEX = new RegExp(
  `["']${SCHEMA_ID_MARKER_START}(?<id>.+)${SCHEMA_ID_MARKER_END}["']`,
  'g',
);

/**
 * Generate a string placeholder containing the internal schema id value to be retrieved later
 */
export function idToPlaceholder(id: string): string {
  return SCHEMA_ID_MARKER_START + id + SCHEMA_ID_MARKER_END;
}
