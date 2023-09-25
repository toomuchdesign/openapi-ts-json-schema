const REF_MARKER_START = '_OTJS-START_';
const REF_MARKER_END = '_OTJS-END_';

export const PLACEHOLDER_REGEX = new RegExp(
  `["']${REF_MARKER_START}(?<ref>.+)${REF_MARKER_END}["']`,
  'g',
);

/**
 * Generate a string placeholder containing the ref value to be retrieved later
 */
export function refToPlaceholder(ref: string): string {
  return REF_MARKER_START + ref + REF_MARKER_END;
}
