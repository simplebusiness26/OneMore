# ONE MORE

**ONE MORE** is a family of fast, replayable arcade games built around one idea: when the run ends, you immediately want **one more**.

## Games

### ONE MORE — Precision Runner
The original one-tap auto-run platform game that started the collection.

- Automatic forward movement
- One-tap jump controls
- Six original levels
- Practice checkpoints
- Gems, unlocks and local progress
- Android APK workflow

The original game currently lives at the repository root.

### ONE MORE SECOND
Survive a chain of micro-challenges where every decision gets **one second**.

- Six challenge types at launch
- Score = seconds survived
- Instant `ONE MORE?` restart
- Mobile-first neon interface
- Local best score and haptics
- Offline web app
- Dedicated Android APK build

Source: [`games/one-more-second`](games/one-more-second)

### ONE MORE FLOOR
Climb an endless tower where every floor is a compact 3–8 second survival challenge.

- One-touch auto-run and jump controls
- 16 challenge categories including platforms, lasers, collapsing tiles, darkness, modifiers and boss floors
- Fair procedural difficulty progression built from constrained templates
- Deterministic daily mode: **THE 100 FLOORS**
- Local best score, coins and unlockable accent themes
- Synthesized sound, haptics and offline play
- Dedicated Android APK build and release

Source: [`games/one-more-floor`](games/one-more-floor)

## ONE MORE identity

Every game in the series should follow the same core rules:

1. The main mechanic is understandable almost immediately.
2. Controls are minimal and mobile-first.
3. Failure is fast and restart is faster.
4. Scores are easy to compare and chase.
5. Difficulty rewards mastery rather than grinding.
6. The final call-to-action is always **ONE MORE?**

## Android downloads

GitHub Actions builds installable Android debug APKs. Each game has its own build/release flow so adding future ONE MORE titles does not replace the others.

The precision runner publishes under `android-latest`, ONE MORE SECOND has its own release, and ONE MORE FLOOR publishes under `one-more-floor-android-latest`.
