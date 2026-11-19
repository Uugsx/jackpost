import fs from 'fs';
import path from 'path';

/**
 * Minimal on-disk `.jp` collection builders for tests that need a precisely named / structured
 * collection built before the app opens it (so it mounts in one read).
 *
 * Use these when you need exact control over item names and nesting. For a bulk auto-generated
 * collection (parametric request count / depth), use `./generator.ts` instead.
 */

export interface WriteRequestOptions {
  /** Sort order within the parent */
  seq: number;
  /** HTTP verb (lowercased into the request block); default 'get' */
  method?: string;
  /** Request URL; default 'https://echo.usejackpost.com' */
  url?: string;
  /** Names of saved response examples to attach to the request */
  examples?: string[];
}

/** Create the collection directory + `jackpost.json` (the marker that makes a dir a Jackpost collection). */
export const initJpCollection = (dir: string, name: string) => {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'jackpost.json'),
    JSON.stringify({ version: '1', name, type: 'collection' }, null, 2)
  );
};

/** Create a folder subdir + its `folder.jp` meta. Returns the folder's path. */
export const writeJpFolder = (dir: string, name: string, seq: number) => {
  const folderDir = path.join(dir, name);
  fs.mkdirSync(folderDir, { recursive: true });
  fs.writeFileSync(path.join(folderDir, 'folder.jp'), `meta {\n  name: ${name}\n  seq: ${seq}\n}\n`);
  return folderDir;
};

/**
 * Write an HTTP request `.jp`, optionally with saved response examples. The `example { ... }`
 * block shape matches the jp serializer output (see
 * packages/jackpost-lang/v2/tests/examples/fixtures/jp/jpToJson-single-example.jp).
 */
export const writeJpRequest = (dir: string, name: string, options: WriteRequestOptions) => {
  const { seq, method = 'get', url = 'https://echo.usejackpost.com', examples = [] } = options;
  const exampleBlocks = examples
    .map((ex) => `\nexample {\n  name: ${ex}\n  request: {\n    url: ${url}\n    method: ${method}\n    mode: none\n  }\n}\n`)
    .join('');
  fs.writeFileSync(
    path.join(dir, `${name}.jp`),
    `meta {\n  name: ${name}\n  type: http\n  seq: ${seq}\n}\n\n${method} {\n  url: ${url}\n}\n${exampleBlocks}`
  );
};
