# Phase 10 — Deployment

**Status:** Ship  
**Depends on:** Phase 5+ stable enough; ideally Phase 9 feedback addressed for blockers  
**Unblocks:** real users / next iteration  
**Primary owners:** fullstack / devops-lite

---

## Purpose

Deploy **client and server** so people can play without running the repo locally.

Do not freeze infrastructure choices before local multiplayer works — by this phase, it should already work.

---

## Goals

- Public (or team-shared) client URL
- Public WebSocket-capable server URL
- Client configured to talk to the deployed server
- Basic runbook: how to deploy, how to roll back, known limits
- HTTPS / WSS in production

---

## Expected structure / ops notes

```text
apps/client/          → static host (e.g. Vercel, Netlify, Cloudflare Pages)
apps/server/          → Node host with WebSocket support
                      (e.g. Fly.io, Railway, Render, etc.)
docs/
└── DEPLOYMENT.md     # env vars, commands, URLs, caveats
```

### Suggested split

| Piece | Hosting style |
|-------|----------------|
| Client | Static frontend |
| Server | Long-lived Node process (Socket.IO) |

Avoid “serverless only” hosts that don’t fit sticky WebSocket sessions unless you know what you’re doing.

---

## What to build

| Item | Detail |
|------|--------|
| Env config | `VITE_SERVER_URL` (or equivalent); server `PORT`, CORS origins |
| Production build | Client build + server start scripts |
| CORS / origins | Allow the real client origin |
| Health check | Simple HTTP health route helps hosts |
| Docs | Deploy steps + “how to verify a room works in prod” |
| Monitoring lite | At least logs; fancy APM optional |

---

## What NOT to build

- Full observability platform
- Multi-region active-active (unless needed)
- Account systems “for deploy”
- Database for MVP room state (in-memory OK if documented; expect cold starts / single instance limits)
- CDN physics authority nonsense — server remains authority

---

## Smoke test in production

- [ ] Open client URL
- [ ] Create room → code works
- [ ] Second device/browser joins
- [ ] Complete a short match
- [ ] Refresh / mild disconnect behaves as documented
- [ ] WSS works (no mixed-content issues)

---

## Team expectations

| Role | Focus |
|------|--------|
| Deployer | Host setup, env, DNS |
| Backend | Socket.IO prod settings, CORS |
| Frontend | Correct server URL per environment |
| Reviewer | Smoke test on the live URL, not only localhost |

---

## Definition of Done

- [ ] Teammates can play from the deployed URLs without local servers
- [ ] `docs/DEPLOYMENT.md` (or README section) is accurate
- [ ] Known limits documented (single server memory rooms, no persistence, etc.)
- [ ] Rollback path known (redeploy previous image/build)

---

## After Phase 10

MVP loop is closed. Next work should come from playtest backlog and conscious new phases — not silent scope expansion into economy/accounts.

Return to the [phase index](./README.md) and [`docs/PLAN.md`](../PLAN.md) for rules that still govern future features.
