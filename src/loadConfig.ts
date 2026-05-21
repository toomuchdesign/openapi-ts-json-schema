import { existsSync } from 'node:fs';
import path from 'node:path';

import { createJiti } from 'jiti';

import type { Options } from './types.js';

/**
 * Load a CLI config file via jiti and return its default export.
 *
 * The default export is expected to be an `Options` object; shape validation
 * is delegated to `openapiToTsJsonSchema`.
 */
export async function loadConfig(configPath: string): Promise<Options> {
  const absoluteConfigPath = path.resolve(configPath);

  if (!existsSync(absoluteConfigPath)) {
    throw new Error(
      `[openapi-ts-json-schema] Config file not found: ${absoluteConfigPath}`,
    );
  }

  const jiti = createJiti(absoluteConfigPath);
  const loaded = await jiti.import<{ default?: Options } | Options>(
    absoluteConfigPath,
  );

  const config =
    loaded && typeof loaded === 'object' && 'default' in loaded
      ? loaded.default
      : (loaded as Options);

  if (!config || typeof config !== 'object') {
    throw new Error(
      `[openapi-ts-json-schema] Config file must export an Options object as its default export: ${absoluteConfigPath}`,
    );
  }

  return config;
}
