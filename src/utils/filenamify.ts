import _filenamify from 'filenamify';

/**
 * Replace "/" occurrences with "_"
 * and any other file path unsafe character with "!"
 */

const TRAILING_SLASH_REGEX = /^\//;
export function filenamify(name: string): string {
  return _filenamify(
    name.replace(TRAILING_SLASH_REGEX, '').replaceAll('/', '_'),
    {
      replacement: '!',
    },
  );
}
