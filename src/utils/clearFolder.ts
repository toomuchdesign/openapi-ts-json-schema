import fs from 'fs/promises';
import { existsSync } from 'fs';

export async function clearFolder(folderAbsolute: string): Promise<void> {
  if (existsSync(folderAbsolute)) {
    await fs.rm(folderAbsolute, { recursive: true, force: true });
  }
}
