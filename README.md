# ONE MORE

A free, original one-tap auto-run platform game built for mobile first.

## Current game

- One-tap / space-to-jump controls
- Automatic forward movement
- Instant death and restart loop
- Six original levels with increasing speed and difficulty
- Spikes, double spikes and block obstacles
- Attempt counter and per-level best progress
- Unlockable level progression
- Practice mode with automatic checkpoints
- Gems awarded on completion
- Pause/resume/restart flow
- Local save data
- Lightweight generated sound effects
- Responsive neon mobile UI
- Offline PWA support
- Original SVG app icon
- Capacitor Android packaging
- GitHub Actions APK build

## Play locally

Serve the repository over HTTP and open `index.html`. A static host such as GitHub Pages, Cloudflare Pages, Vercel or Netlify can host it without a backend.

## Android APK

The workflow `.github/workflows/android-apk.yml` runs on pushes to `main` and can also be started manually from GitHub Actions. It installs Capacitor, creates the Android project, builds a debug APK and uploads it as the `one-more-debug-apk` workflow artifact.

## Design direction

ONE MORE is intentionally original. It takes inspiration from the broad one-button precision-platformer genre without copying another game's levels, art, music, code or branding.

Visual identity: dark navy/black environments, white geometry, electric-blue motion, orange highlights and rapid feedback.

## Next production passes

The core game is playable. Production expansion should focus on hand-tuned rhythm level design, original soundtrack, haptics, more obstacle types, cosmetic unlocks, daily challenges, leaderboards, a level editor, accessibility options and signed Play Store release builds.
