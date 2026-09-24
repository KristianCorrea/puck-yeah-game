# Phase 1 — Physics Prototype

**Status:** Core feel  
**Depends on:** Phase 0  
**Unblocks:** Phase 2  
**Primary owners:** gameplay / physics

---

## Purpose

Prove the one interaction that makes or breaks the game:

> Can I flick a puck at a ball and does the collision feel satisfying?

Nothing else matters until this is yes.

---

## Goals

- Rectangular arena with walls
- One ball, one puck, two goal mouths (visual + collision sensors ok)
- Mouse drag → aim indicator → release → impulse
- Matter.js physics with friction / bounce that feel good
- Bodies come to rest predictably

---

## Expected structure (end of Phase 1)

Still mostly a **single client**:

```text
apps/client/src/
├── main.ts
├── game/
│   ├── ArenaScene.ts          # main playground
│   ├── input/
│   │   └── FlickController.ts # drag → angle/power → impulse
│   ├── entities/              # optional helpers
│   │   ├── createBall.ts
│   │   ├── createPuck.ts
│   │   └── createWalls.ts
│   ├── ui/
│   │   └── AimIndicator.ts
│   └── config/
│       └── prototypeConfig.ts # masses, friction, sizes (proto of GAME_CONFIG)
└── ...
```

Keep numbers in one config file even in the prototype — you will tune constantly.

---

## What to build

| Item | Detail |
|------|--------|
| Arena | Fixed logical size; scale to fit screen |
| Walls | Static Matter bodies |
| Ball | Lighter, responsive |
| Puck | Heavier, strong impact |
| Goals | Visible openings; detection can be rough (sensor / zone) |
| Flick input | Pointer down on puck → drag away → aim arrow → power by distance → release |
| Settling | Bodies slow and stop; no infinite micro-jitter if avoidable |

Desktop mouse first. Touch can share Phaser pointer APIs but does not need polish yet.

---

## What NOT to build

- Turns / scoring / timer / first-to-3
- 5-puck layouts
- Multiplayer / Socket.IO
- React menus
- Server authority
- Trajectory prediction
- Particles / screen shake (save for Phase 8 unless tiny debug juice helps tuning)
- Accounts, economy, cosmetics

---

## Tuning checklist (manual)

Run these by hand before calling the phase done:

- [ ] Weak shot
- [ ] Strong shot
- [ ] Direct hit on ball
- [ ] Glancing hit
- [ ] Wall bounce (puck and ball)
- [ ] Friction feels right (not ice, not glue)
- [ ] Resting is stable
- [ ] Goal zone is readable even if scoring isn’t implemented yet

---

## Team expectations

| Role | Focus |
|------|--------|
| Gameplay | Impulse feel, masses, friction, restitution |
| Art-lite | Distinct colors for puck vs ball vs goals — readability only |
| Reviewer | Play the build; reject “architecture-only” PRs |

**Rule:** if a PR doesn’t improve flick feel or prototype clarity, it probably belongs in a later phase.

---

## Definition of Done

- [ ] Teammate can open the client and flick within seconds
- [ ] Aim direction and power are obvious
- [ ] Collisions feel intentional, not random mush
- [ ] Physics config is centralized (no magic numbers scattered)
- [ ] Team agrees: “this is fun enough to build a match around”

---

## Handoff to Phase 2

Phase 2 will add match rules on top of this scene. Leave seams where possible:

- `applyImpulse(puck, angle, power)`
- config for arena size / masses
- goal zone queries (`ballInGoalSide?: 'player1' | 'player2'`)

Do not rewrite into a full engine yet — that is Phase 3.
