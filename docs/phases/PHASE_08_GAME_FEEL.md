# Phase 8 — Game Feel

**Status:** Juice / polish  
**Depends on:** Phase 5–7 (game works; UI readable)  
**Unblocks:** Phase 9  
**Primary owners:** gameplay feel / audio-visual

---

## Purpose

Make the already-correct game **feel good** — impacts, goals, turns, and outcomes should have presence without burying readability.

Prioritize feel over visual complexity.

---

## Goals

Add (as fits the art direction):

- Impact particles
- Goal animation
- Screen shake (subtle)
- Puck / ball trails
- Sound effects
- Turn transitions
- Win / loss / draw animations
- Improved aim indicator

Optional:

- Keyframes inside `TURN_RESOLVED` so the opponent sees a short replay instead of a pure snap/lerp

Still **no** `LAUNCH_CONFIRMED` unless playtesting (Phase 9) demands it.

---

## Expected structure (end of Phase 8)

```text
apps/client/src/game/
├── fx/
│   ├── ImpactFx.ts
│   ├── GoalFx.ts
│   ├── ScreenShake.ts
│   └── Trails.ts
├── audio/
│   ├── sounds.ts
│   └── manifest.ts
└── ui/
    └── AimIndicator.ts          # upgraded
```

Keep FX driven by game events (collision, goal, turn change, match end) — not by rewriting rules into the VFX layer.

---

## What to build

| Feel beat | Guidance |
|-----------|----------|
| Flick release | Instant motion already exists; reinforce with SFX/aim polish |
| Hit ball/puck | Short particles + hit sound |
| Goal | Clear celebration; don’t obscure score update |
| Turn change | Brief cue so “whose turn” stays obvious |
| Match end | Distinct win/loss/draw |

Audio should work muted / missing files without crashing.

---

## What NOT to build

- New mechanics
- Economy / cosmetics systems
- Heavy post-processing stacks
- Cinematics that delay next turn unreasonably
- Reworking net architecture for juice alone (keyframes OK if additive)

---

## Team expectations

| Role | Focus |
|------|--------|
| Feel | Timing, intensity, readability first |
| Audio | Few solid SFX > huge library |
| Reviewer | Toggle FX off/on; confirm rules unchanged |

---

## Definition of Done

- [ ] At least the core beats above exist at a basic level
- [ ] Juice does not hide score/turn/timer
- [ ] Performance acceptable on a typical laptop
- [ ] No new authoritative rules introduced via FX code
- [ ] Optional keyframe replay is either shipped or explicitly deferred

---

## Handoff to Phase 9

Feel is good enough to show outsiders. Phase 9 will ask whether opponent wait, goal difficulty, and layout need tuning — bring a build, not a feature list.
