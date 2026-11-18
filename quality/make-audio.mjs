import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { ConsoleStdout, File, OpenFile, PreopenDirectory, WASI } from '@bjorn3/browser_wasi_shim';
import { Mp3Encoder } from '@breezystack/lamejs';
import { lessons } from '../ielts-vi/assets/course.js';

const require = createRequire(import.meta.url);
const wasm = await WebAssembly.compile(await readFile(require.resolve('@echogarden/flite-wasi/flite.wasm')));
const voices = ['slt', 'rms', 'awb'];
for (const [index, { context }] of lessons.filter((lesson) => lesson.context?.audio).entries()) {
  // Keep the WAV in memory and avoid Node's native WASI crashes on Linux runners.
  const output = new File([]);
  const args = ['flite', '-voice', voices[index], '-t', context.text, '/out/speech.wav'];
  const wasi = new WASI(args, [], [
    new OpenFile(new File([])),
    ConsoleStdout.lineBuffered((line) => console.log(line)),
    ConsoleStdout.lineBuffered((line) => console.error(line)),
    new PreopenDirectory('/out', [['speech.wav', output]]),
  ]);
  const program = await WebAssembly.instantiate(wasm, { wasi_snapshot_preview1: wasi.wasiImport });
  if (wasi.start(program) !== 0) throw new Error(`Flite failed: ${context.audio}`);
  const wav = Buffer.from(output.data);
  const audioStart = wav.indexOf('data', 32, 'ascii');
  if (audioStart < 0 || wav.readUInt16LE(22) !== 1 || wav.readUInt16LE(34) !== 16) {
    throw new Error(`Expected a mono 16-bit WAV: ${context.audio}`);
  }
  const size = wav.readUInt32LE(audioStart + 4);
  const samples = new Int16Array(size / 2);
  for (let sample = 0; sample < samples.length; sample += 1) {
    samples[sample] = wav.readInt16LE(audioStart + 8 + sample * 2);
  }
  const encoder = new Mp3Encoder(1, wav.readUInt32LE(24), 48);
  const chunks = [];
  for (let start = 0; start < samples.length; start += 1152) {
    chunks.push(Buffer.from(encoder.encodeBuffer(samples.subarray(start, start + 1152))));
  }
  chunks.push(Buffer.from(encoder.flush()));
  await writeFile(new URL(`../ielts-vi/audio/${context.audio}`, import.meta.url), Buffer.concat(chunks));
}
