# Phase 3 — Separate Game Engine

**Status:** Architecture extraction  
**Depends on:** Phase 2 (local match works)  
**Unblocks:** Phase 4  
**Primary owners:** engine / shared types

---

## Purpose

Move authoritative match rules into a **UI-free `game-engine` package** so the server can run the same logic later without importing Phaser/React.

The renderer must stop being the source of truth for score, turns, and winners.

---

## Goals

- `packages/game-engine` owns match rules + physics integration
- `packages/shared` holds types, protocol shapes, `GAME_CONFIG`
- Client uses the engine (or a thin adapter) for local play
- Engine has **no** React/Phaser imports
- Unit tests cover core rules

---

## Expected structure (end of Phase 3)

```text
puck-yeah/
├── apps/
│   └── client/                    # Phaser/React consume engine
├── packages/
│   ├── game-engine/
│   │   ├── package.json
│   │   └── src/
│   │       ├── Match.ts           # public API
│   │       ├── MatchState.ts
│   │       ├── GameRules.ts
│   │       ├── TurnManager.ts
│   │       ├── handleGoal.ts      # midfield reset; pucks stay
│   │       ├── physics/
│   │       │   ├── MatterWorld.ts
│   │       │   └── settle.ts
│   │       ├── entities/
│   │       └── index.ts
│   └── shared/
│       ├── package.json
│       └── src/
│           ├── constants/GAME_CONFIG.ts
│           ├── types/
│           │   ├── LaunchAction.ts
│           │   ├── MatchState.ts
│           │   └── MatchPhase.ts
│           └── protocol/          # message types (can be stubs until Phase 4)
└── ...
```

### Public engine shape (target)

```ts
const game = new Match(config);

game.start();

game.applyAction({
  playerId: "player1",
  puckId: "p1_1",
  angle: 1.2,
  power: 0.75,
});

const state = game.getState();
```

---

## What to build

| Item | Detail |
|------|--------|
| Match API | start / applyAction / getState |
| Validation | turn, ownership, phase, power clamp |
| Physics | Matter sim until settled + max timeout |
| Scoring | normal + own goal |
| Goals | `handleGoal()` → ball midfield, clear velocity, pucks unchanged |
| Win / timer / draw | same as Phase 2 |
| Layout | defense layout from config |
| Tests | unit tests for rules (see checklist) |

Client becomes a **view + input** over engine state (still local; no net).

---

## What NOT to build

- Socket.IO server (Phase 4)
- Optimistic net reconcile
- Production deploy
- New game modes / economy / formations
- Rewriting Phase 1 feel “while we’re here” unless a bug is found

---

## Test checklist (engine)

- [ ] Turn switching
- [ ] Cannot control opponent puck
- [ ] Reusable pucks (no `used` flag required)
- [ ] Scoring + own goals
- [ ] Midfield ball reset; pucks persist
- [ ] First to 3 ends immediately
- [ ] Timer expiry win / draw
- [ ] Invalid action rejected (wrong turn, bad power, etc.)
- [ ] Full short match sequence

---

## Team expectations

| Role | Focus |
|------|--------|
| Engine | Extract without changing rules |
| Client | Wire scene to `Match` API; keep flick feel |
| Reviewer | Diff should be mostly moves + tests; behavior parity with Phase 2 |

**Parity rule:** a Phase 2 hot-seat match and a Phase 3 engine-driven match should feel the same.

---

## Definition of Done

- [ ] `game-engine` builds independently
- [ ] Client match uses engine for rules/physics outcomes
- [ ] No Phaser/React imports inside `game-engine`
- [ ] Shared `GAME_CONFIG` used by engine (and client visuals)
- [ ] Rule unit tests pass
- [ ] Local match still playable end-to-end

---

## Handoff to Phase 4

Phase 4 will run this engine on Node behind Socket.IO.

Call out early:

- Headless Matter / fixed timestep needs to work in Node
- `TURN_RESOLVED` payload shape (final positions, score, turn, phase, winner)
- Client will keep a **visual** Matter world for optimistic playback; engine on server is authority
