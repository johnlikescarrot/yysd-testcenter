import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { WASI } from 'node:wasi';
import { Mp3Encoder } from '@breezystack/lamejs';
import { lessons } from '../ielts-vi/assets/course.js';

const require = createRequire(import.meta.url);
const wasm = await WebAssembly.compile(await readFile(require.resolve('@echogarden/flite-wasi/flite.wasm')));
const temp = await mkdtemp(join(tmpdir(), 'ielts-audio-'));
const voices = ['slt', 'rms', 'awb'];
let index = 0;
try {
  for (const { context } of lessons.filter((lesson) => lesson.context?.audio)) {
    const wasi = new WASI({
      version: 'preview1', args: ['flite', '-voice', voices[index++ % voices.length], '-t', context.text, '/out/speech.wav'],
      preopens: { '/out': temp },
    });
    const program = await WebAssembly.instantiate(wasm, wasi.getImportObject());
    if (wasi.start(program) !== 0) throw new Error(`Flite failed: ${context.audio}`);
    const wav = await readFile(join(temp, 'speech.wav'));
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
} finally {
  await rm(temp, { recursive: true, force: true });
}
