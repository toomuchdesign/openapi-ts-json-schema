import fs from 'fs/promises';
import nodePath from 'node:path';

export async function saveFile({
  path,
  data,
}: {
  path: string[];
  data: string;
}): Promise<void> {
  const absolutePath = nodePath.resolve(...path);
  const dirname = nodePath.dirname(absolutePath);
  await fs.mkdir(dirname, { recursive: true });
  await fs.writeFile(absolutePath, data);
}
