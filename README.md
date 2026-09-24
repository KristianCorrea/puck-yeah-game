# Puck Yeah

Browser-based 1v1 turn-based physics soccer. See [`docs/PLAN.md`](./docs/PLAN.md) and [`AGENTS.md`](./AGENTS.md).

## Requirements

- Node.js 20+ (see `.nvmrc`)
- npm 10+ (workspaces)

## Setup

```bash
npm install
```

## Run the client (Phase 0)

```bash
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). You should see a Phaser boot scene with the **Puck Yeah** title.

## Workspace

```text
apps/client   Vite + TypeScript + Phaser 3
docs/         Plan + phase guides
```

## Docs

| Doc | Purpose |
|-----|--------|
| [AGENTS.md](./AGENTS.md) | Short bootstrap for humans / coding agents |
| [docs/PLAN.md](./docs/PLAN.md) | Rules, architecture, MVP scope |
| [docs/phases/](./docs/phases/README.md) | Phase-by-phase guides |

Currently at **Phase 0** — thin client boot. Next: [Phase 1 physics prototype](./docs/phases/PHASE_01_PHYSICS_PROTOTYPE.md).
