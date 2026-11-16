# Tríada Reader: project notes for Claude

Context carried over from the session that built this app. Read it before changing anything.

## The user and how to work with them
- The user writes in Thai. Reply in Thai, with code and commands left as they are.
- The user isn't a programmer. Explain in plain terms and give click-by-click steps for anything they must do themselves (GitHub settings, Firebase console). Firebase's console UI changes often; give deep links such as `https://console.firebase.google.com/project/triada---reader/...` instead of menu paths.
- They usually want the change shipped: after a change, rebuild, test, commit, push to `main`, and republish the artifact (see Deploy).
- Be upfront about anything that couldn't be verified. This sandbox can't reach Firebase, Wikinews, Wikipedia, Wiktionary, MyMemory or github.io, so those calls are only tested against mocks.

## What the app is
An offline-first PWA for reading French, Spanish and Dutch, with a Thai interface (English optional). It has no AI calls at runtime and uses zero tokens. The user asked about AI-generated posts. If they want them, a Claude API key needs a small backend (Cloudflare Worker or Firebase Functions), and the recommended design is batch pre-generation with Haiku 5.5 via the Batch API, not generating on every visit.

Tabs:
1. **Feed** (mode 3.1): social posts with comments, filtered by topic and CEFR level. Posts already read are hidden.
2. **Articles** (mode 3.2): factual articles with a 5-question exam-style quiz and Thai explanations. Also news: Wikinews latest, Wikipedia trending, paste-your-own text, and articles saved for offline. Online articles get an estimated level, auto vocab and a generated quiz.
3. **Stories** (mode 3.3): short fiction in 5 genres.
4. **Cards**: hard words are saved automatically after real reading and reviewed with SM-2-like spaced repetition.
5. **Dictionary**: built-in, with accent-insensitive and reverse (Thai/English) search, plus an online fallback.

Settings cover the interface language (TH/EN), translation language (TH/EN), theme, accent colour, font size and family, the hard-word threshold, card options, voices, sync and export/import.

Links:
- Live app (GitHub Pages, from `docs/` on `main`): https://6934468323-hash.github.io/Triada/
- Repo: https://github.com/6934468323-hash/Triada. It was renamed from `triada`, so pushes print a harmless "repository moved" note.
- Artifact preview on claude.ai: https://claude.ai/artifact/Sy471sn1PZptcNPDBJCJzA. It's a body-only build that can't fetch external sites or sign in.

## Layout and build
- `src/app.js` is the whole app: one IIFE in vanilla JS with no framework. `/*__SYNC__*/` marks where `src/sync.js` is spliced in at build time (they share a scope).
- `src/app.css` holds styles. Tokens are on `:root`, with dark mode and `data-skin="sepia"` variants. Thai needs taller line heights and no letter-spacing (`html[lang="th"]` rules).
- `src/i18n.js` maps Thai interface strings and fragments to English (see i18n below).
- `src/firebase-config.js` holds the Firebase web config for project `triada---reader`. These values are public identifiers, not secrets.
- `src/data/{fr,es,nl}{,2,3,4,5}.js` holds the content. Every file must be listed in `DATA` in `build.py`.
- `src/fonts/` holds self-hosted woff2 files (Fontsource: IBM Plex Sans Thai, Literata, Bricolage Grotesque).
- `python3 build.py` writes:
  - `docs/index.html`, `sw.js`, `manifest.webmanifest`, icons and `fonts/`: the PWA. The cache version is a hash of the sources, so installed apps update.
  - `docs/triada-offline.html`: a single file with the fonts embedded.
  - `artifact/index.html`: the body-only build for claude.ai, using Google Fonts.
- PNG icons are rendered with Playwright (Node). The Python build skips them, but the PNGs are already committed in `docs/`.

## Content format
- A sentence is `[original, English, Thai]`. Vocab entries are `"LEVEL|pos|English|Thai|lemma"` (lemma optional). Multi-word keys such as `"peu à peu"` are idioms, and the word sheet shows them.
- `vv` is extra vocab that gets merged into `v`. Use it for words that appear in comments.
- Feed post: `{id, cat, lvl, user, handle, time, likes, s:[...], v:{}, c:[{u, s:[...]}]}`. Topics are the keys of `FEED_CATS` in app.js.
- Article: `{id, cat, lvl, src, title:[o,en,th], p:[[...paragraph...], ...], v, q:[{t, q:[question, thai], o:[4 options], a, x:"Thai explanation"}]}`. Options are shuffled when shown, and A-D letters inside `x` are remapped automatically. Question types are listed in `QTYPES`.
- Story: `{id, genre, lvl, title, blurb (Thai), p:[...paragraphs..., "* * *", ...], v}`. Genres are listed in `GENRES`.
- Current counts per language: about 25 feed posts, 10 articles and 6 stories.
- Articles must be factual. Fact-check every number and date; nothing is invented except the stories and the feed posts.
- After adding content, run the validation snippet: it checks for duplicate ids, sentences with three parts, quiz shape and vocab with four or more fields (see git history), then rebuild.

## Key mechanisms
- **Real-read detection (feed):** a post is read once its end marker (`.post-end`, after the comments) has been fully visible and its accumulated "focus" time reaches `needMs`. That is words ÷ WPM by level (`WPM` = A1 60 to C2 150) × 0.5, or × 0.25 once the reader engages (taps a word, translates, listens, likes, opens comments). It's clamped to 4–45 s, or 2 s minimum when engaged. Time only counts while the page is visible and focused and scroll speed is ≤ 1.2 px/ms, and it's shared between the posts in focus. Read posts are excluded from the queue unless "include read posts" is on.
- **Stories:** they finish only if active time ≥ 35% of reading time (minimum 20 s); otherwise an "I really finished it" button appears.
- **Hard-word autosave:** words whose level is ≥ the threshold are saved. The default threshold ("auto") is one level above the text's level, with B1 as the minimum.
- **Auto quiz for online articles:** fill-in-the-blank questions (distractors from the dictionary, same part of speech, ±1 level), a meaning-in-context question, and "which sentence is NOT in the text".
- **Level estimator:** `0.12·avgSentenceLen + 0.9·(avgWordLen−4) + 1.2·unknownRatio`, with thresholds 1.8/2.6/3.4/4.2/5.0. It matched 16 of 21 built-in articles exactly; the rest were off by one level.
- **i18n:** templates are written in Thai. In English mode a MutationObserver replaces Thai fragments with `I18N` values (longest match first), skipping reading content (the `CONTENT` selector, plus the `.c` and `.xq` classes). When adding Thai interface text, add its English to `src/i18n.js` and run `tests/i18n-english-ui.test.js`, which must print `NO THAI LEFT IN UI`. Built-in quiz explanations (`x`) are Thai only; they're labelled as such in English mode. Translating them is an open offer.
- **Voices:** Web Speech API. `voiceScore` ranks voices (Natural, Neural, Enhanced, Premium, Google and Siri up; eSpeak and compact down). Settings show quality labels and platform-specific install help.
- **Sync (`src/sync.js`):** Firebase Auth (Google popup, with redirect as fallback) and Firestore doc `users/{uid}` = `{data: stableJSON(progress), client, updatedAt}`. The merge is deterministic: the newest card edit wins, deletions are tombstoned in `S.deleted` (pruned after 120 days), quiz scores keep the max, settings follow `settingsAt`, and stories and history are unions. Nothing is pushed when the content equals what the cloud holds, so devices don't loop. Required Firestore rule: `match /users/{uid} { allow read, write: if request.auth != null && request.auth.uid == uid; }`. The authorised domain must include `6934468323-hash.github.io`.
- **Storage:** localStorage key `triada.v1`. Online articles are capped at 40.

## Testing
Serve `docs/` and run the Playwright scripts. Playwright and Chromium come pre-installed in cloud sessions.
```bash
(cd docs && python3 -m http.server 8765) &
node tests/read-detection.test.js
node tests/i18n-english-ui.test.js
node tests/sync-two-devices.test.js   # mocks Firebase, simulates two devices
```
Screenshots go to the current directory (they're git-ignored in `tests/`).

## Deploy checklist
1. `python3 build.py`
2. Run the relevant tests.
3. Commit, ending the message with the Co-Authored-By trailer, and `git push origin main`.
4. Republish the artifact: Artifact tool, publish `artifact/index.html` with url `https://claude.ai/artifact/Sy471sn1PZptcNPDBJCJzA`. Read it first if this is a new session.
5. Tell the user: wait 1–2 minutes for Pages, then open the installed app twice while online to pick up the new version.

## Open items and ideas raised with the user
- Google sign-in has never been tested against real Firebase. Ask the user whether login works; common errors are `auth/unauthorized-domain`, `auth/operation-not-allowed` and `permission-denied` (Firestore rules).
- Offered, not yet done: translate the quiz explanations into English for English-mode users.
- Offered, not yet done: clear feed read history recorded by the old, looser read rule.
- Offered, not yet done: a higher-quality online voice (Google Cloud or Azure TTS) would need an API key and a backend, and may cost money.
- Discussed: AI-generated posts would cost tokens (see above); the user hasn't decided.
