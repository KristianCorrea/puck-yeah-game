# Phase 0 — Thin Project Setup

**Status:** Foundation  
**Depends on:** nothing  
**Unblocks:** Phase 1  
**Primary owners:** anyone comfortable with Vite/TS tooling

---

## Purpose

Get a minimal runnable client so Phase 1 can focus entirely on feel — not tooling fights.

This phase is deliberately **thin**. Do **not** scaffold the full monorepo, Socket.IO lobby, or `game-engine` package yet.

---

## Goals

- Repo exists and is cloneable
- TypeScript + Vite client starts
- A Phaser scene renders a blank/clear canvas (or simple placeholder)
- Team can run one or two commands and see the game window

---

## Expected structure (end of Phase 0)

Something close to this is enough:

```text
puck-off/
├── apps/
│   └── client/                 # or just /client at repo root
│       ├── index.html
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       └── src/
│           ├── main.ts         # or main.tsx if React already present
│           └── game/
│               └── BootScene.ts  # or ArenaScene.ts placeholder
├── docs/
│   ├── PLAN.md                 # rules + architecture (source of truth)
│   └── phases/
├── AGENTS.md                   # short AI/team bootstrap
├── package.json                # optional workspace root
└── README.md                   # how to install + run client
```

### Optional (nice, not required to finish Phase 0)

- pnpm/npm workspaces root
- ESLint / Prettier
- `.gitignore`, `.nvmrc`
- Empty `apps/server` stub (no Socket.IO yet)
- Empty `packages/shared` or `packages/game-engine` folders

If optional pieces create debate, skip them. Phase 1 does not need them.

---

## What to build

| Item | Notes |
|------|--------|
| Vite + TypeScript client | Prefer Vite’s TS template |
| Phaser 3 dependency | Scene that mounts into a `#game` (or similar) container |
| Dev script | e.g. `npm run dev` opens the client |
| Root README | Install + run instructions for teammates |

React is allowed in Phase 0 if you want the shell early, but **not required**. A Phaser-only canvas is fine.

---

## What NOT to build

- Socket.IO / rooms / matchmaking
- Matter.js arena (that’s Phase 1)
- Full React lobby UI
- Accounts / auth
- Economy / cosmetics
- Full monorepo extraction “because architecture”
- CI/CD deployment pipelines

---

## Team expectations

| Role | Focus |
|------|--------|
| Anyone | Repo + Vite + Phaser boot |
| Reviewer | “Can I clone, install, run, see a scene?” |

Keep PRs small. Prefer one “boot the client” PR over a giant scaffold PR.

---

## Definition of Done

- [ ] `npm install` (or pnpm/yarn) works from documented path
- [ ] Dev server starts without undocumented env vars
- [ ] Browser shows a Phaser scene (solid color / text / empty arena outline is fine)
- [ ] README documents how to run
- [ ] No broken imports / TypeScript errors on start

---

## Handoff to Phase 1

Phase 1 expects:

- A place to put an `ArenaScene` (or equivalent)
- Ability to add Matter.js and draw simple shapes
- No requirement that server or shared packages exist

**Suggested first Phase 1 commit:** add walls + ball + one puck in the existing Phaser scene.
