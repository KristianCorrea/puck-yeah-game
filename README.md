# Puck Off

Browser-based 1v1 turn-based physics soccer. See [`docs/PLAN.md`](./docs/PLAN.md) and [`AGENTS.md`](./AGENTS.md).

## Requirements

- Node.js 20+ (see `.nvmrc`)
- npm 10+ (workspaces)

## Setup

```bash
npm install
```

## Run the client

```bash
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

**Phase 1:** drag the teal puck and release to flick it into the ball. Tune feel in `apps/client/src/game/config/prototypeConfig.ts`.

## Workspace

```text
apps/client   Vite + TypeScript + Phaser 3 (+ Matter physics)
docs/         Plan + phase guides
```

## Docs

| Doc | Purpose |
|-----|--------|
| [AGENTS.md](./AGENTS.md) | Short bootstrap for humans / coding agents |
| [docs/PLAN.md](./docs/PLAN.md) | Rules, architecture, MVP scope |
| [docs/phases/](./docs/phases/README.md) | Phase-by-phase guides |

Currently at **Phase 1** — physics prototype. Next: [Phase 2 local match](./docs/phases/PHASE_02_LOCAL_MATCH.md).
