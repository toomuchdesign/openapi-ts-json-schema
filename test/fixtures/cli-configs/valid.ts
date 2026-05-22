import path from 'node:path';
import url from 'node:url';

import type { Options } from '../../../src/types.js';

const here = path.dirname(url.fileURLToPath(import.meta.url));

const config: Options = {
  openApiDocument: path.resolve(here, '../ref-property/specs.yaml'),
  targets: { collections: ['components.schemas'] },
  outputPath: path.resolve(
    here,
    '../../test-temp/cli.test/valid-config-output',
  ),
  silent: true,
};

export default config;
