"""Record every Spanish line of the app ONCE with an ElevenLabs voice.

The key is read from the environment and never written anywhere; the website only
gets the finished mp3 files, so using the app costs nothing.

  1. sh build.sh && node tools/lines.js            (writes audio/lines.json)
  2. set ELEVENLABS_API_KEY in your shell
  3. python tools/record.py --list-voices          (pick a Spanish voice id)
  4. python tools/record.py --voice <id> --dry-run (shows characters and credits)
  5. python tools/record.py --voice <id>           (records; safe to stop and rerun:
                                                    lines already recorded are skipped)
  6. sh build.sh, commit audio/ and src/02z-audio.js

Options: --only sentences   record just the sentences (about half the cost); single words
                            and verb forms keep the phone voice
         --model            eleven_flash_v2_5 (default, half price) or eleven_multilingual_v2
         --limit N          record at most N new lines (try a few first and listen)
"""
import argparse, json, os, sys, time, urllib.request, urllib.error

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
AUDIO = os.path.join(ROOT, "audio")
API = "https://api.elevenlabs.io/v1"
COST = {"eleven_flash_v2_5": 0.5, "eleven_turbo_v2_5": 0.5, "eleven_multilingual_v2": 1.0}


def audio_key(text):
    """FNV-1a over the UTF-16 code units: the same as audioKey() in the app."""
    h = 0x811C9DC5
    b = text.encode("utf-16-le")
    for i in range(0, len(b), 2):
        h ^= b[i] | (b[i + 1] << 8)
        h = (h * 0x01000193) & 0xFFFFFFFF
    return "%08x" % h


def is_sentence(t):
    return any(c in t for c in ".?!,") or len(t.split()) > 3


def request(method, path, key, body=None):
    req = urllib.request.Request(API + path, method=method, headers={"xi-api-key": key, "Content-Type": "application/json"},
                                 data=json.dumps(body).encode() if body is not None else None)
    return urllib.request.urlopen(req, timeout=60)


def write_keys():
    lines = json.load(open(os.path.join(AUDIO, "lines.json"), encoding="utf-8"))
    have = [l["key"] for l in lines if os.path.exists(os.path.join(AUDIO, l["key"] + ".mp3"))]
    with open(os.path.join(ROOT, "src", "02z-audio.js"), "w", encoding="utf-8", newline="\n") as f:
        f.write("/* written by tools/record.py: the recordings that exist in audio/ (empty = use the phone voice) */\n")
        f.write('var AUDIO_KEYS = "' + " ".join(have) + '";\n')
    return len(have), len(lines)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice"); ap.add_argument("--model", default="eleven_flash_v2_5")
    ap.add_argument("--only", choices=["all", "sentences"], default="all")
    ap.add_argument("--limit", type=int, default=0); ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--list-voices", action="store_true"); ap.add_argument("--keys-only", action="store_true")
    a = ap.parse_args()

    if a.keys_only:
        print("%d of %d lines recorded" % write_keys()); return
    key = os.environ.get("ELEVENLABS_API_KEY", "").strip()
    if a.list_voices:
        if not key: sys.exit("Set ELEVENLABS_API_KEY first.")
        voices = json.load(request("GET", "/voices", key))["voices"]
        for v in voices:
            lab = v.get("labels") or {}
            langs = [x.get("language") for x in (v.get("verified_languages") or [])]
            tag = " ".join(str(x) for x in [lab.get("accent"), lab.get("gender"), lab.get("age"), ",".join(filter(None, langs))] if x)
            star = "  <- Spanish" if "es" in langs or "spanish" in tag.lower() or "latin" in tag.lower() else ""
            print("%-28s %s  %s%s" % (v["name"][:28], v["voice_id"], tag, star))
        return

    lines = json.load(open(os.path.join(AUDIO, "lines.json"), encoding="utf-8"))
    for l in lines:
        assert audio_key(l["text"]) == l["key"], "recording names differ from the app: " + l["text"]
    todo = [l for l in lines if (a.only == "all" or is_sentence(l["text"])) and not os.path.exists(os.path.join(AUDIO, l["key"] + ".mp3"))]
    if a.limit: todo = todo[:a.limit]
    chars = sum(len(l["text"]) for l in todo)
    print("%d lines to record, %d characters, about %d credits on %s" % (len(todo), chars, chars * COST.get(a.model, 1), a.model))
    if a.dry_run or not todo: print("%d of %d lines recorded" % write_keys()); return
    if not key or not a.voice: sys.exit("Set ELEVENLABS_API_KEY and pass --voice <id>.")

    body_base = {"model_id": a.model,
                 "voice_settings": {"stability": 0.6, "similarity_boost": 0.75, "style": 0.0, "use_speaker_boost": True, "speed": 0.95}}
    if a.model.endswith("v2_5"): body_base["language_code"] = "es"
    done = 0
    try:
        for l in todo:
            for attempt in range(5):
                try:
                    r = request("POST", "/text-to-speech/%s?output_format=mp3_22050_32" % a.voice, key, dict(body_base, text=l["text"]))
                    data = r.read()
                    tmp = os.path.join(AUDIO, l["key"] + ".part")
                    open(tmp, "wb").write(data); os.replace(tmp, os.path.join(AUDIO, l["key"] + ".mp3"))
                    done += 1
                    if done % 50 == 0: print("  %d / %d" % (done, len(todo)))
                    break
                except urllib.error.HTTPError as e:
                    msg = e.read().decode(errors="replace")[:300]
                    if e.code == 429 and "quota" not in msg: time.sleep(2 + attempt * 3); continue
                    sys.exit("Stopped at %r: HTTP %d %s" % (l["text"], e.code, msg))
            else:
                sys.exit("Too many retries at %r" % l["text"])
    finally:
        print("recorded %d new; %d of %d lines now have a recording" % ((done,) + write_keys()))


if __name__ == "__main__":
    main()
