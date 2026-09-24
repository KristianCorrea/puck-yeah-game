# Phase 5 — Online Match

**Status:** Online vertical slice  
**Depends on:** Phase 4 (two windows can play)  
**Unblocks:** Phase 6  
**Primary owners:** full-stack / gameplay QA

---

## Purpose

Complete the **real online match loop** so a stranger (or teammate) can create/join a room and finish a match with shared authoritative results.

This phase is about flow completeness and state consistency — not art polish (Phase 7–8) or chaos testing (Phase 6).

---

## Goals

End-to-end:

```text
Create room
  → Join room
  → Both ready
  → Countdown
  → Turns with optimistic shooter / waiting opponent
  → Goals (incl. own goals) + midfield ball reset
  → First to 3 OR timer expiry
  → Match end (win / loss / draw)
```

Both clients must finish every turn on the **same** authoritative result.

---

## Expected structure (end of Phase 5)

Phase 4 structure plus clearer screen/flow ownership:

```text
apps/client/src/
├── screens/                       # can be simple React or Phaser overlays
│   ├── CreateJoin.tsx             # or .ts Phaser UI
│   ├── Lobby.tsx
│   ├── Match.tsx                  # hosts Phaser game
│   └── Result.tsx
├── networking/
└── game/
apps/server/src/
├── matches/MatchManager.ts        # full lifecycle: WAITING → … → MATCH_END
└── ...
```

Match phases should match the plan:

```ts
type MatchPhase =
  | "WAITING"
  | "COUNTDOWN"
  | "PLAYER_TURN"
  | "PHYSICS_RESOLUTION"
  | "GOAL_RESOLUTION"
  | "MATCH_END";
```

---

## What to build / harden

| Area | Expectation |
|------|-------------|
| Lobby flow | Create, join by code, waiting, ready |
| Countdown | Both see same start |
| Turn loop | Full online turns until end condition |
| Goal path | Score update, midfield reset, continue or end |
| Timer | Server-authored remaining time in sync messages |
| Result | Both clients show consistent winner/draw |
| Rematch | Optional; simple “back to lobby / new room” is OK |

---

## What NOT to build

- Ranked / matchmaking
- Friends / chat
- Formation picker
- Cosmetics
- Heavy VFX suite (Phase 8)
- Exhaustive reliability matrix (Phase 6) — fix blockers only

---

## Acceptance playthrough

Two people / two windows:

1. P1 creates → shares code  
2. P2 joins → both ready  
3. Countdown → P1 turn  
4. P1 scores → both see 1-0, ball midfield, pucks stayed  
5. Play until 3 goals **or** force a timer end in a debug build  
6. Confirm result screen matches on both sides  

Also run one own-goal and confirm opponent scored.

---

## Team expectations

| Role | Focus |
|------|--------|
| Backend | Lifecycle correctness |
| Client | Screen flow + reconcile at boundaries |
| QA | Scripted playthrough above |
| Reviewer | Must reproduce create→end without console hacks |

---

## Definition of Done

- [ ] Full flow works without manual server restarts mid-match
- [ ] Both clients agree on score, turn, and end result every time
- [ ] Disconnect mid-flow may still be rough (Phase 6), but happy path is solid
- [ ] No client-authored score/winner anywhere in the path

---

## Handoff to Phase 6

List known sharp edges now (duplicate clicks, refresh mid-match, latency). Phase 6 exists to systematize and fix them.
