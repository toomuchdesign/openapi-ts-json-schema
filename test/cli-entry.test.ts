import { describe, expect, it, vi } from 'vitest';

import { cliCommand } from '../src/cli/cliCommand.js';

const { runMain } = vi.hoisted(() => ({ runMain: vi.fn() }));

vi.mock('citty', async (importOriginal) => {
  const actual = await importOriginal<typeof import('citty')>();
  return { ...actual, runMain };
});

describe.skip('cli entry point', () => {
  it('invokes runMain with cliCommand on startup', async () => {
    await import('../src/cli/cli.js');

    expect(runMain).toHaveBeenCalledTimes(1);
    expect(runMain).toHaveBeenCalledWith(cliCommand);
  });
});
