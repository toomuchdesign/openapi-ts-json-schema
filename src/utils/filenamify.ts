import _filenamify from 'filenamify';

/**
 * Replace "/" occurrences with "_"
 * and any other file path unsafe character with "!"
 */

export function filenamify(name: string): string {
  return _filenamify(name.replaceAll('/', '_'), {
    replacement: '!',
  });
}
