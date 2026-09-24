# Phase 1 — Physics Prototype (Walkthrough)

**Status:** Core feel  
**Depends on:** Phase 0 complete (`npm run dev` shows the boot scene)  
**Unblocks:** Phase 2  
**Primary owners:** gameplay / physics

---

## Purpose

Prove the one interaction that makes or breaks the game:

> Can I flick a puck at a ball and does the collision feel satisfying?

This guide is a **step-by-step tutorial**. Follow the steps in order. Stick to the patterns below so Phase 2 can extend your scene without a rewrite.

---

## End goal (what “done” looks like)

When finished you can:

1. Open `http://localhost:5173` after `npm run dev`
2. See a rectangular arena with walls, midfield line, **P1 / P2** goal mouths
3. **Drag the teal puck** → yellow aim arrow (direction + power)
4. **Release** → puck launches (slingshot: opposite drag), hits the white ball, bounces off walls
5. Bodies slow and stop cleanly
6. Status text updates when the ball enters a goal sensor (no scoring yet)

No turns, timer, multiplayer, or React lobby.

---

## Final file structure

Replace Phase 0’s `BootScene` with this layout:

```text
apps/client/src/
├── main.ts                          # Phaser.Game + Matter config + ArenaScene
└── game/
    ├── ArenaScene.ts                # playground: create world, update settle/goals
    ├── config/
    │   └── prototypeConfig.ts       # ALL tunable numbers (masses, friction, shot)
    ├── entities/
    │   ├── createWalls.ts           # static walls with goal openings
    │   ├── createGoals.ts           # sensor zones + ballInGoalSide()
    │   ├── createBall.ts            # light Matter game object
    │   └── createPuck.ts            # heavy Matter game object + applyImpulse()
    ├── input/
    │   └── FlickController.ts       # drag → aim → release → applyImpulse
    └── ui/
        └── AimIndicator.ts          # yellow arrow + power ticks
```

Delete `BootScene.ts` once `ArenaScene` is wired.

---

## Walkthrough

### Step 0 — Confirm Phase 0

```bash
npm install
npm run dev
```

Confirm the Phase 0 boot screen still works, then proceed.

---

### Step 1 — Centralize config (`prototypeConfig.ts`)

Create `apps/client/src/game/config/prototypeConfig.ts`.

Put **every** magic number here. You will tune constantly. Minimum groups:

| Group | What it controls |
|--------|------------------|
| `arena` | Fixed logical size (e.g. 1100×640), wall thickness, colors |
| `goal` | Opening height, sensor depth/colors |
| `puck` | Radius, mass (~10), friction, restitution, start position ratios |
| `ball` | Radius, mass (~1.2), lighter / bouncier than puck |
| `shot` | `maxDragPx`, `maxSpeed`, `minPower` |
| `settle` | `stopSpeed` for killing micro-jitter |

Export `GoalSide = "player1" | "player2"` for later scoring.

---

### Step 2 — Wire Phaser Matter in `main.ts`

Replace `BootScene` with `ArenaScene`. Use a **fixed logical size** + `Phaser.Scale.FIT` (physics size must not change with the window).

Critical Matter settings:

```ts
physics: {
  default: "matter",
  matter: {
    gravity: { x: 0, y: 0 },
    enableSleeping: false, // IMPORTANT — see Pitfalls
    positionIterations: 8,
    velocityIterations: 6,
  },
},
scale: {
  mode: Phaser.Scale.FIT,
  autoCenter: Phaser.Scale.CENTER_BOTH,
  width: PROTOTYPE_CONFIG.arena.width,
  height: PROTOTYPE_CONFIG.arena.height,
},
```

---

### Step 3 — Arena walls with goal gaps (`createWalls.ts`)

Build static Matter rectangles:

- Full **top** and **bottom** walls
- **Left / right** walls split into top + bottom segments so a center **goal opening** remains

Also draw matching visuals (wall fill + orange goal mouth outlines).

Disable default world bounds walls (you own the walls):

```ts
this.matter.world.setBounds(0, 0, width, height, 0, false, false, false, false);
this.matter.world.disableGravity();
```

---

### Step 4 — Goal sensors (`createGoals.ts`)

Add **sensor** bodies in each goal mouth (`isSensor: true`) labeled for P1 (left) and P2 (right).

Export:

```ts
ballInGoalSide(ball, goals): "player1" | "player2" | null
```

Phase 1 only needs readability + a status string. Phase 2 will call this for scoring / own goals.

---

### Step 5 — Ball and puck as Matter **game objects**

Do **not** create a bare `matter.add.circle` body and a separate `add.circle` sprite that you sync by hand. That path is fragile.

**Recommended pattern:**

1. `scene.add.circle(...)` for the visual  
2. `scene.matter.add.gameObject(sprite, { shape: { type: "circle", radius }, ... })`  
3. `scene.matter.body.setMass(body, cfg.mass)` after create (mass in options is unreliable)  
4. Puck: `sprite.setInteractive({ useHandCursor: true })`

Puck = heavier / stronger impact. Ball = lighter / more restitution. Ball starts midfield; puck starts on the left half (`startXRatio` ~ 0.22).

Export from puck module:

```ts
applyImpulse(puck, angle, power)  // power 0..1 → velocity via matter.body.setVelocity
```

Implementation notes:

- Clamp power with `minPower` / `1`
- `speed = power * maxSpeed`
- `matter.body.setVelocity(body, { x: cos*speed, y: sin*speed })`
- Clear angular velocity on launch

---

### Step 6 — Aim UI (`AimIndicator.ts`)

While dragging, draw:

- Line from puck along **launch** direction  
- Arrow head  
- Power ticks that fill with drag distance  

Hide on release / cancel.

---

### Step 7 — Flick input (`FlickController.ts`)

Slingshot feel:

- Pointer down **on the puck sprite**  
- Drag **away** from the puck  
- Launch direction = **opposite** the drag vector  
- Power = `min(1, dragDistance / maxDragPx)`  
- On release → `applyImpulse(puck, angle, power)`

Use camera world points under FIT scale:

```ts
const world = cam.getWorldPoint(pointer.x, pointer.y);
```

Prefer `puck.sprite.on("pointerdown", ...)` over manual distance hit-tests against `pointer.worldX` — FIT letterboxing makes manual checks easy to get wrong.

Listen for `pointermove` / `pointerup` / `pointerupoutside` on `scene.input` while a drag is active.

---

### Step 8 — Assemble `ArenaScene.ts`

In `create()`:

1. Floor + midfield line/circle (readability)  
2. `createWalls` → `createGoals` → `createBall` → `createPuck`  
3. `new FlickController(this, puck)`  
4. HUD hint text (“Drag the teal puck…”)

In `update()`:

1. Dampen micro-velocities (`speed < settle.stopSpeed` → zero velocity)  
2. If `ballInGoalSide(...)` → update status text  

Matter game objects sync transforms automatically — do not manually copy body → sprite every frame unless you have a reason.

---

### Step 9 — Run and tune

```bash
npm run dev
```

Hard-refresh the browser after code changes. Tune **only** `prototypeConfig.ts` until collisions feel good.

---

## Pitfalls (read before debugging “puck won’t move”)

Common traps for this stack:

| Pitfall | Symptom | Fix |
|--------|---------|-----|
| `enableSleeping: true` + `setVelocity` | Puck aims but never moves after resting | Set `enableSleeping: false`; settle with velocity clamp |
| Calling `MatterJS.Sleeping.set` | Flick throws at runtime (`MatterJS` is TS-only) | Don’t use it; wake via `body.isSleeping = false` if needed |
| Separate Matter body + decorative sprite | Desync / confusion | Use `matter.add.gameObject(sprite, …)` |
| Manual hit-test with `pointer.worldX` under FIT | Drag never starts / no aim arrow | `sprite.setInteractive` + `cameras.main.getWorldPoint` |
| Putting `mass` only in create options | Mass ignored / odd collisions | `matter.body.setMass(body, mass)` after create |
| Scaling physics to window size | Non-deterministic feel | Fixed arena size + `Scale.FIT` |

**Debug split:**

- **No yellow aim arrow** → input / hit-test problem (Step 7)  
- **Arrow works, no motion** → velocity / sleeping / Matter wiring (Steps 2 & 5)

---

## What NOT to build in Phase 1

- Turns / scoring / timer / first-to-3  
- 5-puck layouts / defense formation  
- Multiplayer / Socket.IO  
- React menus  
- Server authority  
- Trajectory prediction  
- Particles / screen shake (unless tiny and helps tuning)  
- Accounts, economy, cosmetics  

---

## Tuning checklist (manual)

Play your build and check:

- [ ] Weak shot  
- [ ] Strong shot  
- [ ] Direct hit on ball  
- [ ] Glancing hit  
- [ ] Wall bounce (puck and ball)  
- [ ] Friction feels right (not ice, not glue)  
- [ ] Resting is stable (no infinite jitter)  
- [ ] Goal zones readable; status text updates when ball enters  

---

## Definition of Done

- [ ] Structure matches the file tree above (or clearly equivalent)  
- [ ] Teammate can `npm run dev` and flick within seconds  
- [ ] Aim direction and power are obvious  
- [ ] Collisions feel intentional  
- [ ] All gameplay numbers live in `prototypeConfig.ts`  
- [ ] Phase 2 seams below exist so match rules can plug in  
- [ ] Team agrees: “fun enough to build a match around”

---

## Handoff to Phase 2

Keep these seams:

| Seam | Where |
|------|--------|
| `applyImpulse(puck, angle, power)` | `createPuck.ts` |
| `PROTOTYPE_CONFIG` / future `GAME_CONFIG` | `prototypeConfig.ts` |
| `ballInGoalSide(...)` | `createGoals.ts` |
| `FlickController.setEnabled(false)` | disable input while “physics resolving” later |

Phase 2 adds: 5 pucks, turns, score (incl. own goals), midfield ball reset, timer, first-to-3 — **on top of this scene**, without rewriting Matter wiring.

Do not extract `packages/game-engine` yet — that is Phase 3.
