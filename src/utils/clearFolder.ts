import { existsSync } from 'fs';
import fs from 'fs/promises';

export async function clearFolder(folderAbsolute: string): Promise<void> {
  if (existsSync(folderAbsolute)) {
    await fs.rm(folderAbsolute, { recursive: true, force: true });
  }
}
