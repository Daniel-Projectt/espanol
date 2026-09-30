"""Record every Spanish line of the app for FREE with Piper, an open-source voice that runs
on this computer (no account, no internet once the voice is downloaded, no cost).

Voice: es_MX-claude-high (Mexican Spanish, female, Apache-2.0),
       https://huggingface.co/rhasspy/piper-voices/tree/main/es/es_MX/claude/high

  pip install piper-tts lameenc          (a virtual environment is best)
  sh build.sh && node tools/lines.js     (writes audio/lines.json)
  python tools/record_piper.py --model path/to/es_MX-claude-high.onnx --id mx-f
  (each voice goes in its own folder under audio/ and is listed in audio/voices.json)
  sh build.sh                            (picks up src/02z-audio.js)

Lines already recorded are skipped, so it is safe to stop and rerun.
"""
import argparse, json, os, sys
import numpy as np
import lameenc
from piper import PiperVoice
from piper.config import SynthesisConfig

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from record import AUDIO, audio_key, write_keys   # same file names as the app


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", required=True)
    ap.add_argument("--id", required=True, help="folder under audio/, e.g. mx-f")
    ap.add_argument("--speaker", type=int, default=None, help="speaker number for voices with several")
    ap.add_argument("--slower", type=float, default=1.08, help="length scale: 1.0 = normal, higher = slower")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--redo", action="store_true", help="record again even if the file exists")
    a = ap.parse_args()

    voice = PiperVoice.load(a.model)
    cfg = SynthesisConfig(speaker_id=a.speaker, length_scale=a.slower, noise_scale=0.6, noise_w_scale=0.8)
    out = os.path.join(AUDIO, a.id); os.makedirs(out, exist_ok=True)
    lines = json.load(open(os.path.join(AUDIO, "lines.json"), encoding="utf-8"))
    todo = [l for l in lines if a.redo or not os.path.exists(os.path.join(out, l["key"] + ".mp3"))]
    if a.limit: todo = todo[:a.limit]
    print("%d lines to record" % len(todo))
    for n, l in enumerate(todo, 1):
        assert audio_key(l["text"]) == l["key"]
        chunks = list(voice.synthesize(l["text"], cfg))
        pcm = np.concatenate([c.audio_int16_array for c in chunks]) if chunks else np.zeros(0, dtype=np.int16)
        rate = chunks[0].sample_rate if chunks else 22050
        pad = np.zeros(int(rate * 0.06), dtype=np.int16)          # a breath of silence so phones don't clip the start
        pcm = np.concatenate([pad, pcm, pad]).astype(np.int16)
        enc = lameenc.Encoder()
        enc.set_bit_rate(40); enc.set_in_sample_rate(rate); enc.set_channels(1); enc.set_quality(2)
        mp3 = enc.encode(pcm.tobytes()) + enc.flush()
        tmp = os.path.join(out, l["key"] + ".part")
        open(tmp, "wb").write(mp3); os.replace(tmp, os.path.join(out, l["key"] + ".mp3"))
        if n % 200 == 0: print("  %d / %d" % (n, len(todo)))
    print("%d of %d lines now have a recording" % write_keys())


if __name__ == "__main__":
    main()
