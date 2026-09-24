# AGENTS.md — Puck Yeah

Bootstrapping notes for humans and coding agents working in this repo.

## What this project is

**Puck Yeah** is a browser-based **1v1 turn-based physics soccer** game. Players flick permanent pucks into a ball and try to score into the opponent’s goal. First to **3** wins (or higher score when the timer ends).

## Read these first

1. **[`docs/PLAN.md`](./docs/PLAN.md)** — game rules, architecture, stack, MVP scope (source of truth)
2. **[`docs/phases/README.md`](./docs/phases/README.md)** — phase-by-phase team guides (structure, DoD, handoffs)

If a phase guide disagrees with `docs/PLAN.md`, **follow the plan** and update the phase guide.

## Current build posture

- **Thin first:** prove the flick (Phase 0–1) before full monorepo / server / engine.
- **Do not** invent economy, accounts, matchmaking, cosmetics, or formation pickers for MVP.
- If something is ambiguous, choose the simplest option that preserves core play and isolate it (config / small function).

## Locked MVP decisions (quick)

| Topic | Decision |
|--------|----------|
| Pucks | 5 per player, reusable |
| Start layout | Defense-oriented |
| Own goal | Opponent +1 |
| Ball after goal | Midfield; pucks stay |
| Net feel | Shooter: optimistic local anim; opponent: wait for `TURN_RESOLVED` |
| Authority | Server Matter.js = truth; client Matter.js = visual only |

## Stack (MVP)

- Client: React + Vite + TypeScript + Phaser 3 + Matter.js
- Server: Node + TypeScript + Socket.IO
- Packages (later phases): `game-engine`, `shared`

## Ownership cheat sheet

| Concern | Owner |
|--------|--------|
| Menus / lobby / HUD chrome | React |
| Arena / aim / bodies | Phaser |
| Official score, turns, physics | `game-engine` on the **server** |
| Snappy flick animation | Local Matter in Phaser (visual only) |

## Working rules for agents

- Prefer the **active phase** guide’s in/out of scope lists.
- Don’t put continuous physics positions in React state.
- Clients send **intent** (`LAUNCH_PUCK`); never trust client score/winner/timer/physics results.
- Don’t send physics every frame over the network.
- Don’t reset the arena after goals (pucks persist; ball → midfield via `handleGoal()`).

## First milestone

> Can I flick a puck at a ball and does the collision feel satisfying?

Start with Phase 0 → Phase 1. Everything else comes after.
