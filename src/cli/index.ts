#!/usr/bin/env node
import { runMain } from 'citty';

import { cliCommand } from './cliCommand.js';

await runMain(cliCommand);
