"""Tạo MP3 cho các đoạn nghe gốc: espeakng-loader==0.2.4, lameenc==1.9.0."""

import ctypes as ct
import json
import subprocess
from pathlib import Path

import espeakng_loader
import lameenc

ROOT = Path(__file__).resolve().parents[1]
VOICES = {"library": (b"en", 147), "workshop": (b"en-us", 150), "trees": (b"en-gb-scotland", 152)}


def main():
    clips = json.loads(subprocess.check_output(
        ["node", "--input-type=module", "-e",
         "import { lessons } from './lessons.js'; console.log(JSON.stringify(lessons.filter(l => l.audio)));"],
        cwd=ROOT, text=True,
    ))
    speech = espeakng_loader.load_library()
    capture = ct.CFUNCTYPE(ct.c_int, ct.POINTER(ct.c_short), ct.c_int, ct.c_void_p)
    speech.espeak_Initialize.argtypes = [ct.c_int, ct.c_int, ct.c_char_p, ct.c_int]
    speech.espeak_SetSynthCallback.argtypes = [capture]
    speech.espeak_Synth.argtypes = [ct.c_char_p, ct.c_size_t, ct.c_uint, ct.c_int,
                                   ct.c_uint, ct.c_uint, ct.c_void_p, ct.c_void_p]
    data = espeakng_loader.get_data_path().encode()
    rate = speech.espeak_Initialize(2, 0, data, 0)
    if rate <= 0:
        raise RuntimeError("Không khởi tạo được eSpeak NG")

    pcm = bytearray()

    @capture
    def collect(pointer, count, _):
        if pointer and count:
            pcm.extend(ct.string_at(pointer, count * ct.sizeof(ct.c_short)))
        return 0

    speech.espeak_SetSynthCallback(collect)
    for clip in clips:
        name = clip["audio"]
        voice, speed = VOICES[name]
        if speech.espeak_SetVoiceByName(voice) != 0:
            raise RuntimeError(f"Không tìm thấy giọng {voice}")
        speech.espeak_SetParameter(1, speed, 0)
        pcm.clear()
        content = clip["text"].encode()
        if speech.espeak_Synth(content, len(content) + 1, 0, 1, 0, 1, None, None) != 0 or not pcm:
            raise RuntimeError(f"Không tạo được đoạn nghe {name}")
        encoder = lameenc.Encoder()
        encoder.set_in_sample_rate(rate)
        encoder.set_channels(1)
        encoder.set_bit_rate(48)
        encoder.set_quality(2)
        target = ROOT / "media" / f"{name}.mp3"
        target.write_bytes(encoder.encode(bytes(pcm)) + encoder.flush())
        print(target.relative_to(ROOT))
    speech.espeak_Terminate()


if __name__ == "__main__":
    main()
