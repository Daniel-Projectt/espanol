# Español — Speak it

A phone app (PWA) for learning to **speak** Spanish a little every day, in the parchment-and-gold style of the Greek study sheet.

**Live:** https://daniel-projectt.github.io/espanol/

- **Today**: review (spaced repetition), 5 new words, 5 sentences to say out loud, and the verb of the day.
- **Speak**: say-it drills (English → Spanish, out loud, then check), echo/shadowing, 10 role-play conversations, survival phrases. No microphone.
- **Words**: 270 high-frequency words, ten a day, each with a sentence.
- **Verbs**: 40+ verbs in 9 tenses, irregular forms marked; drills; the patterns (ir, ser, estar, tener, hacer first).
- **Connect**: sentence starters and connecting words.
- **Grammar**: 20 short lessons from Bradley & Mackenzie, *Spanish: An Essential Grammar*, and Kattán-Ibarra & Pountain, *Modern Spanish Grammar*.

Build: `sh build.sh` (assembles `index.html` from `src/` and runs `src/test.js`); browser test: `node src/test-dom.js <dir with jsdom>`.
**Voice:** every Spanish line is recorded once, free, with the open-source Piper voice `es_MX-claude-high` (`tools/record_piper.py`, runs on the laptop, no account). ElevenLabs was considered and declined (costs money); `tools/record.py` is kept but unused. Recording once with ElevenLabs (`tools/record.py`, reads `ELEVENLABS_API_KEY` from the environment; the key never goes into the site). The mp3s live in `audio/`; any line without a recording uses the phone's voice. `node tools/lines.js` lists the lines (~2,500, ~30,000 characters).
