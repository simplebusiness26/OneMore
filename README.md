# ONE MORE

**ONE MORE** is the original one-tap precision runner and the first game in the ONE MORE series.

## This repository

This repository now contains only the original **ONE MORE** game and its Android build/release workflow.

## Automated Android gameplay checks

Agent Device runs the game on an Android emulator whenever gameplay, interface, or device-test files change. It verifies that the APK launches, the main menu and level selector work, gameplay starts, and pause, resume, restart, jump input, and return-to-menu controls remain operable.

Every run uploads review evidence containing screenshots, video, replay timing, logs, and a JUnit report. The checks run remotely in GitHub Actions, so no local Android development machine is required.

- Workflow: `Agent Device Android QA`
- Replay scripts: `tests/agent-device/`
- Evidence artifact: `one-more-agent-device-evidence`

## ONE MORE series

Each additional game has its own dedicated repository:

- [ONE MORE SECOND](https://github.com/simplebusiness26/OneMore-Second)
- [ONE MORE FLOOR](https://github.com/simplebusiness26/OneMore-Floor)
- [ONE MORE DOOR](https://github.com/simplebusiness26/OneMore-Door)

Each repository owns its own source code, Android app identity, GitHub Actions APK workflow, signing material, and Releases page.

## Series rules

1. The core mechanic should be understandable immediately.
2. Controls stay minimal and mobile-first.
3. Failure is fast and restart is faster.
4. Scores/progression are easy to understand and chase.
5. Difficulty rewards mastery rather than grinding.
6. The final temptation is always **ONE MORE?**
