// One WASI instance per process: Flite's embedded voice tables are large and
// the Node 22 runner can crash during GC when several instances share an isolate.
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { WASI } from 'node:wasi';

const [directory, voice, text] = process.argv.slice(2);
const require = createRequire(import.meta.url);
const binary = await readFile(require.resolve('@echogarden/flite-wasi/flite.wasm'));
const wasi = new WASI({
  version: 'preview1', args: ['flite', '-voice', voice, '-t', text, '/out/speech.wav'],
  preopens: { '/out': directory },
});
const { instance } = await WebAssembly.instantiate(binary, wasi.getImportObject());
process.exitCode = wasi.start(instance);
