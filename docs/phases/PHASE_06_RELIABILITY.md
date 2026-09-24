# Phase 6 — Reliability

**Status:** Hardening  
**Depends on:** Phase 5 (happy-path online match)  
**Unblocks:** Phase 7 (UI polish on a stable core)  
**Primary owners:** backend / QA

---

## Purpose

Make the online game **safe under bad input and bad networks**. Invalid actions must fail cleanly; disconnects must not corrupt match state.

The server must reject garbage without crashing or desyncing the honest client.

---

## Goals

- Validate every action against phase / turn / ownership / bounds
- Reject duplicates and out-of-turn launches
- Cancel optimistic anim when rejected
- Short reconnect window (don’t instantly destroy the match)
- Explicit abandonment rule if reconnect fails
- Documented test matrix green (or consciously deferred with tickets)

---

## Expected structure (end of Phase 6)

Mostly reinforcement of Phase 4–5 code:

```text
apps/server/src/
├── networking/validation.ts       # harden
├── matches/
│   ├── MatchManager.ts
│   ├── disconnectPolicy.ts        # reconnect window + abandon
│   └── actionGuard.ts             # idempotency / duplicate launch
apps/client/src/
├── networking/
│   ├── reconcile.ts
│   └── optimisticLaunch.ts        # cancel/restore on reject
└── ...
packages/game-engine/
└── tests/                         # expand edge-case coverage
```

Keep disconnect/abandon behavior **isolated** so policy can change later.

---

## Test matrix

### Actions / validation

- [ ] Duplicate click / double `LAUNCH_PUCK`
- [ ] Action during `PHYSICS_RESOLUTION`
- [ ] Action during opponent’s turn
- [ ] Action after `MATCH_END`
- [ ] Selecting / launching opponent puck
- [ ] Invalid puck ID
- [ ] Invalid power (<0, >1, NaN)
- [ ] Invalid angle (NaN / non-finite)
- [ ] Join when room is full
- [ ] Leave before match starts

### Network / session

- [ ] High latency (throttle in DevTools)
- [ ] Temporary disconnect + reconnect within window
- [ ] Disconnect during match past window → abandon rule fires
- [ ] Refresh mid-match behavior (documented: reconnect or forfeit)

### Rules still correct under stress

- [ ] Own goal scoring
- [ ] Midfield ball reset after goal
- [ ] Rejected shot restores shooter local state

---

## What to build

| Item | Detail |
|------|--------|
| Action guards | Phase + turn + ownership + numeric clamps |
| Idempotency | Duplicate launch doesn’t double-apply |
| Reject message | Client gets a clear failure → cancel optimistic anim |
| Reconnect | Short pause/wait; resume with authoritative state snapshot |
| Abandon | Isolated policy (e.g. opponent wins / draw / void — pick one, document it) |

---

## What NOT to build

- New modes or economy
- Perfect rollback netcode
- Spectator mode
- Fancy reconnect UX animations (functional first)
- Changing core physics feel “to fix flaky tests” without evidence

---

## Team expectations

| Role | Focus |
|------|--------|
| QA | Run the matrix; file repros |
| Backend | Make invalid paths boring and safe |
| Client | Reconcile / cancel optimistic paths |
| Reviewer | Require matrix notes in the PR or a checklist comment |

---

## Definition of Done

- [ ] Matrix items checked or explicitly ticketed with reason
- [ ] Server never trusts client score/timer/winner
- [ ] No crash on malformed events
- [ ] Reconnect window behaves as documented
- [ ] Team comfortable inviting outsiders without “don’t click twice” warnings

---

## Handoff to Phase 7

Core is stable enough that UI work won’t paper over desync bugs. Call out any remaining “known sharp edges” in the phase README or tickets.
