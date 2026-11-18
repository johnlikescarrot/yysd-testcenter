"""Encode static listening copies; keep the publisher audio unmodified in the library."""
import hashlib
import os
import shutil
import subprocess
import tempfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

# Speech at 24 kHz, mono. Same MP3 URLs, section boundaries and timing as the paper.
OPTIONS = ['-map', '0:a:0', '-vn', '-ac', '1', '-ar', '24000', '-c:a', 'libmp3lame',
           '-b:a', '48k', '-compression_level', '2', '-map_metadata', '-1']


def prepare(sources, cache):
    binary = os.environ.get('FFMPEG_PATH') or shutil.which('ffmpeg')
    if not binary:
        try:
            from imageio_ffmpeg import get_ffmpeg_exe
        except ImportError as exc:
            raise SystemExit('Install FFmpeg or pip install -r scripts/studio/requirements.txt') from exc
        binary = get_ffmpeg_exe()
    encoder = subprocess.check_output([binary, '-version']).splitlines()[0]
    cache.mkdir(parents=True, exist_ok=True)

    def encode(src):
        options = OPTIONS if src.suffix == '.mp3' else ['-map', '0:a:0', '-vn', '-ac', '1', '-ar', '24000',
                       '-c:a', 'aac', '-b:a', '48k', '-movflags', '+faststart', '-map_metadata', '-1']
        with src.open('rb') as stream:
            digest = hashlib.file_digest(stream, 'sha256')
        digest.update(encoder + ' '.join(options).encode())
        out = cache / (digest.hexdigest()+src.suffix)
        if not out.is_file():
            with tempfile.NamedTemporaryFile(dir=cache, suffix=src.suffix, delete=False) as f:
                temp = Path(f.name)
            try:
                subprocess.run([binary, '-nostdin', '-hide_banner', '-loglevel', 'error', '-xerror',
                                '-threads', '1', '-i', src, *options, '-threads', '1', '-y', temp], check=True)
                if temp.stat().st_size < 1024:
                    raise ValueError(f'Empty encoding: {src.name}')
                temp.replace(out)
            finally:
                temp.unlink(missing_ok=True)
        return src, out

    with ThreadPoolExecutor(max_workers=2) as pool:
        return dict(pool.map(encode, sorted(sources)))
