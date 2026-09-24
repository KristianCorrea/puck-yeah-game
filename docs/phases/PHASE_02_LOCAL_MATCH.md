# Phase 2 — Complete Local Match

**Status:** Local gameplay MVP  
**Depends on:** Phase 1 (flick feels good)  
**Unblocks:** Phase 3  
**Primary owners:** gameplay / rules

---

## Purpose

Turn the flick prototype into a **complete match on one computer** (hot-seat / pass-the-keyboard).

Two people should finish a real game: turns, goals, timer, win/draw — no network yet.

---

## Goals

- 5 pucks per player, reusable
- Defense-oriented starting layout
- Alternating turns
- Scoring including own goals
- Persistent arena (pucks never reset)
- Ball → midfield after goals
- First to 3 **or** timer → higher score / draw
- Clear match-end state

---

## Locked rules to implement here

| Rule | Behavior |
|------|----------|
| Pucks | Exactly 5 each; reusable; no ammo |
| Start | Defense-oriented, symmetric halves; ball midfield |
| Own goal | Ball in your goal → opponent +1 |
| After goal | Pucks stay; ball to midfield; clear ball velocity |
| Win | First to 3 ends immediately |
| Timer | Expiry → higher score wins; tie → draw |

Isolate ball reset in something like `handleGoal()` even if still inside the client.

---

## Expected structure (end of Phase 2)

Still client-centric; rules may live next to the scene for now:

```text
apps/client/src/game/
├── ArenaScene.ts
├── match/
│   ├── MatchController.ts     # phase: turn → physics → goal → end
│   ├── TurnManager.ts
│   ├── ScoreKeeper.ts
│   ├── Timer.ts
│   └── layouts/
│       └── defenseLayout.ts   # 5+5 spawn positions
├── input/FlickController.ts
├── entities/
└── config/gameConfig.ts       # pucksPerPlayer, maxGoals, duration, physics
```

Suggested match phases (local):

```ts
type MatchPhase =
  | "PLAYER_TURN"
  | "PHYSICS_RESOLUTION"
  | "GOAL_RESOLUTION"
  | "MATCH_END";
```

HUD can be Phaser text or a thin React overlay — keep it simple.

---

## What to build

| Item | Detail |
|------|--------|
| Ownership | Only current player’s pucks selectable |
| Turns | One flick → wait until settled → other player |
| Settling | Velocity threshold + stability frames + max timeout |
| Goals | Detect side; apply score / own-goal rule |
| Persistence | Never respawn pucks after goals |
| Timer | Counts during match; authoritative later on server |
| End states | Win / loss / draw screens or banners |

Local “Player 1 / Player 2” labels are enough. No accounts.

---

## What NOT to build

- Socket.IO / rooms
- Optimistic net reconcile (no server yet)
- Formation picker UI
- Accounts / economy
- Full `packages/game-engine` extraction (Phase 3)
- Fancy VFX beyond what’s needed to read turn/score

---

## Manual playtest script

- [ ] P1 scores on P2 → score 1-0; pucks stay; ball midfield
- [ ] P2 own-goals → P1 gets the point
- [ ] Reach 3 goals → match ends immediately
- [ ] Expire timer with 2-1 → higher score wins
- [ ] Expire timer with 2-2 → draw
- [ ] Cannot flick opponent puck
- [ ] Cannot flick while bodies still moving
- [ ] Same puck usable every turn

---

## Team expectations

| Role | Focus |
|------|--------|
| Rules | Turn machine, scoring, timer edge cases |
| Gameplay | Layout spacing; goal size; match length feel |
| Reviewer | Play a full match hot-seat before approving |

---

## Definition of Done

- [ ] Full match playable without refresh hacks
- [ ] All locked rules above behave correctly
- [ ] HUD shows score, timer, whose turn
- [ ] Team can play without a developer narrating the rules
- [ ] Known ambiguities (if any) documented for Phase 3 isolation

---

## Handoff to Phase 3

Phase 3 will lift rules out of the scene. Prefer:

- Match state as plain data (`score`, `pucks[]`, `ball`, `currentTurn`, `phase`)
- `applyAction({ playerId, puckId, angle, power })` style entry point
- `GAME_CONFIG` already centralized

Renderer should already be separable from “who won.”
