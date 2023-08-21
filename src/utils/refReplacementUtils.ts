export const REF_SYMBOL = Symbol('ref');

const _REF_MARKER_START_ = '_OTJS-START_';
const _REF_MARKER_END_ = '_OTJS-END_';

const PLACEHOLDER_REGEX = new RegExp(
  `["']${_REF_MARKER_START_}(.+)${_REF_MARKER_END_}["']`,
  'g',
);

/**
 * Generate a string placeholder containing the ref value to be retrieved later
 */
export function refToPlaceholder(ref: string): string {
  return _REF_MARKER_START_ + ref + _REF_MARKER_END_;
}

/**
 * Search placeholder in a text file and replace them with
 * the value returned by the replacer
 */
export function replacePlaceholdersWith({
  text,
  replacer,
}: {
  text: string;
  replacer: (ref: string) => string;
}): string {
  return text.replaceAll(PLACEHOLDER_REGEX, (_match, ref) => replacer(ref));
}
