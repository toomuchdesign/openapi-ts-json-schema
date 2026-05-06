// @ts-expect-error no type defs for namify
import namify from 'namify';

export function makeUniqueName(id: string): string {
  const raw = namify(id) as string;
  return /^\d/.test(raw) ? `_${raw}` : raw;
}
