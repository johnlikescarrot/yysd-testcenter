// One native WASI instance per child, like the flite command line. Do not
// retain WASI file descriptors or linear memories between different voices.
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { WASI } from 'node:wasi';

const [dir, voice, script] = process.argv.slice(2);
const wasi = new WASI({
  version: 'preview1', returnOnExit: false,
  args: ['flite', '-voice', voice, '-t', script, '/out/speech.wav'],
  preopens: { '/out': dir },
});
const path = createRequire(import.meta.url).resolve('@echogarden/flite-wasi/flite.wasm');
const { instance } = await WebAssembly.instantiate(await readFile(path), wasi.getImportObject());
wasi.start(instance);
