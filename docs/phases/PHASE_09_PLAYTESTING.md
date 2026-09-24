# Phase 9 — Playtesting

**Status:** Learning / tuning  
**Depends on:** Phase 8 (or a solid Phase 7 build if feel is “good enough”)  
**Unblocks:** Phase 10 (and targeted fix PRs)  
**Primary owners:** whole team + external players

---

## Purpose

Put the game in front of **real players** and tune what exists.

Default response to feedback: **adjust config and clarity**, not add systems.

---

## Goals

- Run structured sessions with notes
- Answer the question list below with evidence
- Produce a prioritized tuning / bug list
- Resist feature creep (formations, economy, ranked, etc.)

---

## Playtest question list

Ask every session (or as many as time allows):

- Is flicking intuitive?
- Does the puck feel satisfying?
- Does the ball feel responsive?
- Is physics predictable enough?
- Is the game too slow?
- Is the game too chaotic?
- Are goals too easy / too hard?
- Is the arena the right size?
- Are goals the right size?
- Is the timer long enough?
- Does persistent board state create interesting strategy?
- Is it obvious whose turn it is?
- Does the defense-oriented start feel right?
- Does the opponent wait for `TURN_RESOLVED` feel acceptable?

Also note: disconnects, confusing UI, room-code friction.

---

## Expected artifacts (end of Phase 9)

```text
docs/
├── phases/
└── playtesting/
    ├── SESSION_TEMPLATE.md      # optional but useful
    ├── YYYY-MM-DD-session-notes.md
    └── TUNING_BACKLOG.md        # prioritized; config vs bug vs later-feature
```

You don’t need fancy tooling — a shared doc works.

### Suggested note format

```text
Build: <commit / date>
Players: ...
Setup: online / local
Observations:
- ...
Quotes:
- ...
Proposed changes:
- [config] friction 0.2 → 0.25
- [bug] ...
- [later] formation picker (NOT now)
```

---

## What to change in this phase

| Allowed | Examples |
|---------|----------|
| Config tuning | masses, friction, goal size, timer, layout coords |
| Clarity fixes | HUD wording, turn highlight, aim affordance |
| Bug fixes | scoring edge cases, desyncs |

| Defer | Examples |
|-------|----------|
| New modes | ranked, 2v2 |
| Meta systems | economy, cosmetics, accounts |
| Big net redesign | unless opponent-wait feedback is severe — then consider keyframes / `LAUNCH_CONFIRMED` as a scoped follow-up |

---

## Team expectations

| Role | Focus |
|------|--------|
| Facilitator | Run sessions; keep notes honest |
| Gameplay | Config PRs from evidence |
| Everyone | Watch without coaching unless testing onboarding |

---

## Definition of Done

- [ ] At least a few external (or non-author) sessions completed
- [ ] Question list answered with notes (even if some answers are “unsure”)
- [ ] Tuning backlog prioritized
- [ ] No major new feature merged “because a playtester mentioned it once”
- [ ] Team agrees the build is worth deploying (Phase 10) or needs one more tune pass

---

## Handoff to Phase 10

Ship a known build. Attach: commit hash, env notes, and any “known issues” from the backlog that aren’t blockers.
