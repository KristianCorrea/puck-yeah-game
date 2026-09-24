# Phase 7 — UI

**Status:** Product shell  
**Depends on:** Phase 5–6 (online match + basic reliability)  
**Unblocks:** Phase 8  
**Primary owners:** frontend / UX

---

## Purpose

Replace debug panels and placeholder text with a clear product UI around the already-working game.

Players should understand flow without a developer present.

---

## Goals

Ship these screens/states:

- Main menu
- Create match
- Join match (room code entry)
- Waiting / lobby
- Ready button
- Countdown
- In-match HUD
- Turn indicator
- Result screen
- Rematch (or clear path back to menu)
- Connection status

---

## Expected structure (end of Phase 7)

```text
apps/client/src/
├── app/                         # React shell
├── screens/
│   ├── MainMenu.tsx
│   ├── CreateMatch.tsx
│   ├── JoinMatch.tsx
│   ├── Lobby.tsx
│   ├── MatchScreen.tsx          # mounts Phaser; does NOT own physics positions in React state
│   └── ResultScreen.tsx
├── components/
│   ├── Hud.tsx                  # score, timer, turn, connection
│   └── ConnectionBadge.tsx
├── game/                        # Phaser remains arena owner
└── networking/
```

### Ownership reminder

| UI chrome | React |
|-----------|--------|
| Arena, aim, bodies | Phaser |
| Continuous x/y of pucks/ball | **Not** React state |

HUD may read discrete match fields (score, timer, turn) via events/store updates — not per-frame body sync into React.

---

## HUD minimum

```text
PLAYER 1        2 - 1        PLAYER 2

                 01:24

             YOUR TURN
```

Also show connection status. No “remaining pucks” meter (pucks are reusable).

---

## What to build

| Screen | Must communicate |
|--------|------------------|
| Main menu | Create / Join |
| Create | Room code to share |
| Join | Code entry + errors (full/invalid) |
| Lobby | Who’s in, ready state |
| Match | Whose turn, score, time |
| Result | Win / loss / draw + next action |

Keep visuals readable and simple. Brand polish can wait; clarity cannot.

---

## What NOT to build

- Cosmetics shop / battle pass
- Friends list / chat
- Ranked screens
- Formation editor
- Elaborate marketing landing page inside the game client
- Phase 8 particle systems (unless tiny)

---

## Team expectations

| Role | Focus |
|------|--------|
| Frontend | Flows, empty/error states, mobile-ish layout basics |
| Design-lite | Contrast, turn clarity, code readability |
| Reviewer | Click through create→result without console |

---

## Definition of Done

- [ ] New player can create/join without reading the plan
- [ ] HUD answers: whose turn, score, time, connection
- [ ] Result screen matches server outcome
- [ ] Rematch or return-to-menu works
- [ ] No React per-frame physics binding

---

## Handoff to Phase 8

UI is clear enough that juice (VFX/SFX) won’t be used to hide confusing flow. List any UI debt that shouldn’t block feel work.
