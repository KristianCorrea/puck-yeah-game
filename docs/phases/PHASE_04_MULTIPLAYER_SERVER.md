# Phase 4 — Multiplayer Server

**Status:** Networking foundation  
**Depends on:** Phase 3 (`game-engine` + `shared`)  
**Unblocks:** Phase 5  
**Primary owners:** backend / netcode

---

## Purpose

Stand up a server that owns the match and lets **two browser windows** join a private room and play.

Milestone:

> Two browser windows can join the same room and play.

---

## Goals

- Node + TypeScript + Socket.IO server
- Private room codes (no matchmaking)
- Server runs `game-engine` (authoritative Matter, fixed timestep)
- Client sends `LAUNCH_PUCK` intent only
- Server broadcasts `TURN_RESOLVED`
- Shooter: optimistic local anim + reconcile
- Opponent: waits for `TURN_RESOLVED` (no `LAUNCH_CONFIRMED` in MVP)

---

## Expected structure (end of Phase 4)

```text
apps/
├── client/
│   └── src/
│       ├── networking/
│       │   ├── socket.ts
│       │   └── handlers.ts      # apply TURN_RESOLVED, reconcile
│       └── game/                # optimistic local Matter playback
└── server/
    ├── package.json
    └── src/
        ├── server.ts
        ├── rooms/
        │   ├── RoomManager.ts
        │   └── roomCode.ts      # e.g. AB7K2
        ├── matches/
        │   └── MatchManager.ts  # wraps game-engine Match
        └── networking/
            ├── events.ts
            └── validation.ts
packages/
├── game-engine/                 # imported by server (and client visuals/helpers)
└── shared/
    └── src/protocol/
        ├── LaunchPuck.ts
        └── TurnResolved.ts
```

### MVP protocol

**Client → Server**

```ts
// LAUNCH_PUCK
{ type: "LAUNCH_PUCK"; puckId: string; angle: number; power: number }
```

Also needed for lobby (names flexible):

- `CREATE_ROOM`
- `JOIN_ROOM { code }`
- `READY`

**Server → Clients**

```ts
// TURN_RESOLVED (authoritative)
{
  type: "TURN_RESOLVED";
  ball: { x; y; vx?; vy? };
  pucks: Array<{ id; x; y; vx?; vy? }>;
  score: { player1; player2 };
  currentTurn: string | null;
  phase: MatchPhase;
  winner: string | null;
  result: "WIN" | "LOSS" | "DRAW" | null;
  remainingTimeMs?: number;
  turnNumber?: number;
}
```

Plus lobby/state sync messages as needed (`ROOM_CREATED`, `PLAYER_JOINED`, `MATCH_START`, etc.).

Do **not** stream per-frame physics over the wire.

---

## Client feel (locked)

```text
Shooter:  release → local Matter anim + LAUNCH_PUCK
Server:   validate → simulate → TURN_RESOLVED
Opponent: idle until TURN_RESOLVED → apply result
Shooter:  TURN_RESOLVED → reconcile to server finals
```

If launch rejected: cancel local anim, restore pre-shot positions.

---

## What to build

| Item | Detail |
|------|--------|
| Room codes | Short codes; capacity 2 |
| Session IDs | Temporary; no accounts |
| Assignment | player1 / player2 on join |
| Ready → start | Both ready then countdown/start |
| Validation | turn, ownership, phase, power/angle bounds |
| Headless physics | Fixed dt settle + max timeout on Node |
| Broadcast | Same `TURN_RESOLVED` to both clients |

Minimal join UI is OK (hardcoded inputs / debug panel). Pretty menus are Phase 7.

---

## What NOT to build

- Matchmaking / ranked / Elo
- Accounts / OAuth
- `LAUNCH_CONFIRMED` early opponent playback
- Keyframe replay packing (optional later, Phase 8+)
- Economy
- Production deploy hardening (Phase 10)

---

## Manual test script

- [ ] Create room → code shown
- [ ] Second window joins with code
- [ ] Both ready → match starts
- [ ] Shooter sees immediate flick motion
- [ ] Opponent sees update after `TURN_RESOLVED`
- [ ] Both end turn with same score/positions
- [ ] Invalid flick (wrong turn / opponent puck) rejected safely
- [ ] Goal / own-goal / midfield reset agree on both clients

---

## Team expectations

| Role | Focus |
|------|--------|
| Server | Rooms, validation, engine loop on Node |
| Client net | Socket wiring + reconcile |
| Gameplay | Confirm feel didn’t die under net delay |
| Reviewer | Two-window playthrough required |

---

## Definition of Done

- [ ] Server starts; client connects
- [ ] Two clients play a short match in one room
- [ ] Server is authority for score/turn/finals
- [ ] Optimistic reconcile works for shooter
- [ ] No per-frame physics spam on the socket
- [ ] Shared protocol types live in `packages/shared`

---

## Handoff to Phase 5

Phase 5 is the polished **full online match flow** (create → join → ready → countdown → play → end). Phase 4 may still be rough around lobby UX; Phase 5 closes the loop and consistency.
