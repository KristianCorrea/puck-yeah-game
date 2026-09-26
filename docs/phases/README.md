# Puck Off — Phase Guides

Team reference for how the game is built, phase by phase.

These docs are **rough expectation guides**, not rigid contracts. They describe:

- what each phase is for
- what the repo/structure should look like by the end
- what is in / out of scope
- how to know the phase is done
- what the next phase expects as input

Canonical game rules and architecture live in [`docs/PLAN.md`](../PLAN.md). Agent bootstrapping: [`AGENTS.md`](../../AGENTS.md). If a phase guide disagrees with the plan, **follow the plan** and update the phase guide.

## Phase index

| Phase | Doc | Goal |
|-------|-----|------|
| 0 | [PHASE_00_SETUP.md](./PHASE_00_SETUP.md) | Thin client boots; Phaser scene renders |
| 1 | [PHASE_01_PHYSICS_PROTOTYPE.md](./PHASE_01_PHYSICS_PROTOTYPE.md) | Flick feels good |
| 2 | [PHASE_02_LOCAL_MATCH.md](./PHASE_02_LOCAL_MATCH.md) | Full hot-seat match on one machine |
| 3 | [PHASE_03_GAME_ENGINE.md](./PHASE_03_GAME_ENGINE.md) | Rules extracted into `game-engine` |
| 4 | [PHASE_04_MULTIPLAYER_SERVER.md](./PHASE_04_MULTIPLAYER_SERVER.md) | Two browsers, same room, play |
| 5 | [PHASE_05_ONLINE_MATCH.md](./PHASE_05_ONLINE_MATCH.md) | End-to-end online match flow |
| 6 | [PHASE_06_RELIABILITY.md](./PHASE_06_RELIABILITY.md) | Invalid actions, disconnects, edge cases |
| 7 | [PHASE_07_UI.md](./PHASE_07_UI.md) | Menus, lobby, HUD, results |
| 8 | [PHASE_08_GAME_FEEL.md](./PHASE_08_GAME_FEEL.md) | Juice: VFX, audio, polish |
| 9 | [PHASE_09_PLAYTESTING.md](./PHASE_09_PLAYTESTING.md) | Real players; tune, don’t feature-creep |
| 10 | [PHASE_10_DEPLOYMENT.md](./PHASE_10_DEPLOYMENT.md) | Ship client + server |

## How to use these as a team

1. **One active phase at a time** for core path work. Parallel work is fine only when it doesn’t invent Phase N+2 features.
2. **Do not start multiplayer until Phase 2 feels fun.** Thin-first is intentional.
3. **Definition of Done** in each guide is the review checklist before merging “phase complete.”
4. **Out of scope** lists are as important as the in-scope lists — push economy, accounts, matchmaking, formations, etc. later.
5. When something is ambiguous, isolate it behind config/`handleGoal()`-style seams and note it in the phase handoff.

## Locked MVP reminders

- 5 pucks per player, reusable
- Defense-oriented starting layout
- Own goal → opponent +1
- Ball reset → midfield; pucks stay
- Shooter: optimistic local anim; opponent: wait for `TURN_RESOLVED`
- Server Matter.js = truth; client Matter.js = feel
