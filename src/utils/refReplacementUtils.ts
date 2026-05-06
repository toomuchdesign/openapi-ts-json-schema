import {
  SCHEMA_ID_MARKER_END,
  SCHEMA_ID_MARKER_START,
  SCHEMA_ID_SYMBOL,
} from '../constants.js';

export { SCHEMA_ID_SYMBOL };

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
