import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Mp3Encoder } from '@breezystack/lamejs';
import { lessons } from '../ielts-vi/assets/course.js';

const worker = fileURLToPath(new URL('./flite-wav.mjs', import.meta.url));
const temp = await mkdtemp(join(tmpdir(), 'ielts-audio-'));
const voices = ['slt', 'rms', 'awb'];
let index = 0;
try {
  for (const { context } of lessons.filter((lesson) => lesson.context?.audio)) {
    console.log(`Synthesizing ${context.audio}`);
    execFileSync(process.execPath, [worker, temp, voices[index++ % voices.length], context.text], { stdio: 'inherit' });
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
