import prettier from 'prettier';

export async function formatTypeScript(text: string): Promise<string> {
  return prettier.format(text, {
    parser: 'typescript',
  });
}
