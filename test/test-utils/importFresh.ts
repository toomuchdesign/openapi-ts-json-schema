// https://github.com/small-tech/import-fresh
export async function importFresh(absolutePathToModule: string) {
  const cacheBustingModulePath = `${absolutePathToModule}?update=${Date.now()}`;
  return await import(cacheBustingModulePath);
}
