# Puck Yeah — Plan

Project plan for **Puck Yeah**, a browser-based 1v1 competitive physics soccer game.

This document is the **source of truth** for game rules, architecture, stack, and MVP scope. Use it for team and AI context.

- Agent bootstrapping: [`AGENTS.md`](../AGENTS.md)
- Phase execution guides: [`docs/phases/README.md`](./phases/README.md)

Do not invent major mechanics or features that are not described here. If something is ambiguous, choose the simplest implementation that preserves the core gameplay and isolate the decision so it can be changed later.

---

# 0. LOCKED DECISIONS

These decisions are locked for the MVP unless explicitly changed later:

| Topic | Decision |
|--------|----------|
| Pucks per player | Exactly **5** |
| Starting layout | **Defense-oriented** (pucks biased toward each player's own goal / back half) |
| Custom formations | Future feature — not MVP |
| Own goal | Ball in your own goal → **opponent scores +1** |
| Ball after goal | Reset to **midfield** (center of the arena) |
| Arena after goal | **Pucks stay**; board does not reset |
| Physics feel (shooter) | **Optimistic local animation** on release — snappy, immediate |
| Physics sync (opponent) | **Wait for `TURN_RESOLVED`** — no `LAUNCH_CONFIRMED` required for MVP |
| Authority | Server Matter.js is truth; client Matter.js is visual playback only |
| Build order | **Thin first** — prove the flick in one client app before full monorepo/server |

---

# 1. GAME CONCEPT

**Puck Yeah** is a 1v1 turn-based physics soccer game.

The game combines elements of:

- Air hockey
- Mini soccer
- Billiards
- Physics puzzles
- Turn-based competitive games

Each player controls **5 pucks** positioned on their side of a rectangular arena in a defense-oriented starting layout.

The objective is simple:

> Flick your pucks into the ball, manipulate its trajectory, and get the ball into your opponent's goal.

Players alternate turns.

A player makes one move, physics completely resolves, and then the opponent gets their turn.

The arena is persistent throughout the match. Pucks remain where they end up and can continue being used throughout the entire game.

The first player to score **3 goals** wins.

If the timer expires before either player reaches 3 goals, the player with the higher score wins.

If the score is tied when time expires, the match is a draw.

---

# 2. CORE GAME LOOP

The fundamental gameplay loop is:

```text
PLAYER 1 TURN
     ↓
Select puck
     ↓
Aim
     ↓
Choose power
     ↓
Release
     ↓
Physics simulation
     ↓
Everything settles
     ↓
Check for goal
     ↓
Update score
     ↓
Check win conditions
     ↓
PLAYER 2 TURN
     ↓
Select puck
     ↓
Aim
     ↓
Choose power
     ↓
Release
     ↓
...
```

The game is strictly turn-based.

There is NEVER simultaneous player control.

A player cannot make another move until the previous physics simulation has completely resolved.

---

# 3. GAME RULES

## Players

There are exactly two players:

```text
Player 1
Player 2
```

Each player owns exactly **5 pucks**.

There is no limit on how many times a puck can be used.

There is no puck consumption system.

There is no ammunition/resource system.

A player can repeatedly use their pucks throughout the entire match.

---

# 3.1 STARTING LAYOUT

The initial puck layout is **defense-oriented**:

- Each player's 5 pucks start on their own half.
- Positions are biased toward their own goal / back half (protecting, not crowded at midfield).
- Layout is symmetric between Player 1 and Player 2.
- Ball starts at midfield.

Exact coordinates belong in `GAME_CONFIG` / a layout preset so they can be tuned.

**Future (not MVP):** players may choose among starting formation presets before the match. Do not build a formation picker until the core match works.

---

# 4. PUCK RULES

Pucks are permanent physical objects.

When a player flicks a puck:

1. The puck receives an impulse.
2. The puck moves according to the physics simulation.
3. It can collide with:
   - the ball
   - other pucks
   - walls
4. The puck eventually comes to rest.
5. It remains at its final position.
6. The player can use that same puck again on a future turn.

Used pucks are NOT removed.

Pucks should NOT reset after goals.

The board should become progressively more dynamic as pucks move around the arena.

This persistent board state is an important part of the strategy.

---

# 5. TURN RULES

Only one player can act at a time.

Example:

```text
Player 1
   ↓
Flick
   ↓
Physics resolves
   ↓
Player 2
   ↓
Flick
   ↓
Physics resolves
   ↓
Player 1
```

A player cannot:

- make multiple shots in one turn
- shoot while physics is running
- shoot during another player's turn
- shoot after the match has ended
- control the opponent's pucks

The server must validate all of these rules.

---

# 6. FLICK MECHANIC

The primary control mechanic is a mouse/touch drag.

The player:

1. Selects one of their pucks.
2. Clicks/touches and drags away from the puck.
3. An aiming arrow shows the direction.
4. Drag distance determines shot power.
5. Releasing launches the puck.
6. Physics takes over.

Conceptually:

```text
        Drag direction
             ↑
             |
             |
          [ PUCK ]
```

The longer the drag, the stronger the shot.

Power should be normalized:

```ts
power: number // 0.0 - 1.0
```

The server should clamp/validate power.

The client should never directly determine the official physics result.

---

# 7. ACTION MODEL

Represent a player's move as an intent:

```ts
type LaunchAction = {
  playerId: string;
  puckId: string;
  angle: number;
  power: number;
};
```

The client sends this action to the server.

The client does NOT send:

```text
ball position
puck position after collision
score
winner
physics result
```

The client sends what the player intended to do.

The server determines what actually happened.

---

# 8. BALL

There is one soccer ball in the arena.

The ball is a physics object.

It can:

- collide with pucks
- collide with walls
- move through the arena
- enter goals

The ball should feel lighter and more responsive than the pucks.

Physics should be tuned for fun rather than strict real-world realism.

---

# 9. GOALS

There is one goal on each side of the arena.

```text
┌───────────────────────────────────────┐
│                                       │
│  GOAL                            GOAL │
│   ←                                 → │
│                                       │
│                 BALL                  │
│                                       │
└───────────────────────────────────────┘
```

The goal on Player 1's side belongs to Player 1 (defending that goal).

The goal on Player 2's side belongs to Player 2 (defending that goal).

## Scoring

If the ball enters the **opponent's** goal:

```text
scoring player +1
```

If the ball enters **your own** goal (own goal):

```text
opponent +1
```

Own goals count the same as a normal goal for win conditions (first to 3, timer, etc.).

After any goal, the match immediately checks whether either player has reached 3 goals.

---

# 10. IMPORTANT: ARENA DOES NOT RESET

After a goal:

- Pucks remain where they are.
- Used pucks remain in the arena.
- Puck positions are preserved.
- The board is NOT recreated.
- Players do NOT get new/reset positions.

The goal should not wipe the current strategic state of the arena.

The exact handling of the ball after a goal should be isolated in a function such as:

```ts
handleGoal()
```

This allows the ball reset/reposition behavior to be tuned later without changing the rest of the game engine.

**Locked initial behavior:**

- Preserve the arena.
- Preserve all puck positions.
- Reposition the ball to **midfield** (center of the arena).
- Clear ball velocity.

---

# 11. WIN CONDITIONS

A player wins immediately when they reach:

```text
3 goals
```

Example:

```text
Player 1: 3
Player 2: 1

PLAYER 1 WINS
```

The match ends immediately.

No additional turn is given.

---

# 12. TIMER

Matches have a configurable timer.

If the timer reaches zero before either player reaches 3 goals:

```text
Higher score = winner
Equal score = draw
```

Example:

```text
Player 1: 2
Player 2: 1

TIME EXPIRES

Player 1 wins.
```

Example:

```text
Player 1: 2
Player 2: 2

TIME EXPIRES

DRAW
```

The timer is authoritative on the server.

Never trust a client-provided timer.

---

# 13. MATCH STATE

Use a state machine.

Recommended phases:

```ts
type MatchPhase =
  | "WAITING"
  | "COUNTDOWN"
  | "PLAYER_TURN"
  | "PHYSICS_RESOLUTION"
  | "GOAL_RESOLUTION"
  | "MATCH_END";
```

A match should have a canonical state similar to:

```ts
interface MatchState {
  matchId: string;

  phase: MatchPhase;

  players: {
    player1: PlayerState;
    player2: PlayerState;
  };

  score: {
    player1: number;
    player2: number;
  };

  currentTurn: string | null;

  remainingTimeMs: number;

  ball: BallState;

  pucks: PuckState[];

  winner: string | null;

  result: "WIN" | "LOSS" | "DRAW" | null;

  turnNumber: number;
}
```

Puck state:

```ts
interface PuckState {
  id: string;
  ownerId: string;

  x: number;
  y: number;

  vx: number;
  vy: number;
}
```

There should NOT be a `used` property because pucks are reusable.

---

# 14. PHYSICS

Use a physics engine rather than manually implementing collision math.

Recommended:

**Matter.js**

Physics needs to support:

- puck/wall collisions
- puck/ball collisions
- puck/puck collisions
- ball/wall collisions
- friction
- restitution
- momentum
- goal detection

Starting physics should prioritize satisfying gameplay rather than realism.

Suggested design:

```text
Pucks:
- relatively heavy
- strong impact
- moderate friction

Ball:
- lighter
- responsive
- moderate friction
```

These values should be centralized in configuration.

---

# 15. PHYSICS RESOLUTION

After a player launches a puck, the server should simulate the physics until the action has resolved.

Do NOT simply wait for an arbitrary fixed delay.

Prefer a settling condition such as:

```ts
const settled =
  allRelevantBodiesHaveLowVelocity &&
  simulationStableForEnoughFrames;
```

Also implement a maximum simulation timeout as a safety mechanism.

Example:

```text
Launch
 ↓
Physics running
 ↓
Bodies moving
 ↓
Bodies slow down
 ↓
Stable
 ↓
Evaluate goal
 ↓
Next turn
```

The next player cannot act until this process finishes.

---

# 16. SERVER AUTHORITATIVE MULTIPLAYER

The game must use a server-authoritative architecture.

Architecture:

```text
┌──────────────────────┐
│      CLIENT 1        │
│ React + Phaser       │
│ Input + Rendering    │
└──────────┬───────────┘
           │
           │ WebSocket
           │
           ▼
┌──────────────────────┐
│        SERVER        │
│                      │
│ Match Manager        │
│ Room Manager         │
│ Validation           │
│ Game Engine          │
│ Physics              │
│ Game Rules           │
└──────────┬───────────┘
           │
           │ WebSocket
           │
           ▼
┌──────────────────────┐
│      CLIENT 2        │
│ React + Phaser       │
│ Input + Rendering    │
└──────────────────────┘
```

The server owns:

- match state
- turns
- physics
- score
- timer
- goal detection
- winner
- match result
- player ownership
- validation

The clients own:

- rendering
- input
- UI
- visual effects
- sound

---

# 17. CLIENT-SERVER PRINCIPLE

The most important networking rule:

> Clients send intent. The server determines the result.

GOOD:

```json
{
  "type": "LAUNCH_PUCK",
  "puckId": "p1_2",
  "angle": 1.42,
  "power": 0.78
}
```

BAD:

```json
{
  "ballX": 412,
  "ballY": 219,
  "score": 2,
  "winner": "player1"
}
```

Never trust client-provided:

- score
- winner
- turn
- puck ownership
- physics result
- timer
- match result

---

# 18. NETWORKING

Recommended stack:

- Node.js
- TypeScript
- Socket.IO (WebSockets)

Socket.IO is acceptable for the MVP because it simplifies:

- rooms
- connection handling
- reconnects
- events

Do NOT send physics coordinates every frame.

Because gameplay is turn-based, the network model can be much simpler.

## MVP message flow

```text
Shooter:  release → local Matter animation + send LAUNCH_PUCK
Server:   validate → simulate until settled → broadcast TURN_RESOLVED
Opponent: waits for TURN_RESOLVED → apply/play result
Shooter:  on TURN_RESOLVED → reconcile to server final state
```

The client sends intent:

```text
LAUNCH_PUCK  { puckId, angle, power }
```

The server broadcasts the authoritative result:

```text
TURN_RESOLVED  { final positions, score, currentTurn, phase, winner/result if any }
```

## Client feel (locked)

- **Shooter:** optimistic local animation on release — snappiest possible feel. Do not wait for the server before starting motion.
- **Opponent:** wait for `TURN_RESOLVED`. No early `LAUNCH_CONFIRMED` message is required for MVP.
- **Authority:** client Matter.js is visual only. Server Matter.js decides score, goals, finals, and next turn.
- **Reconciliation:** if local end state differs from server finals, snap/correct to server. If the shot is rejected, cancel local anim and restore pre-shot state.

Optional later (not MVP): include keyframes in `TURN_RESOLVED` so the opponent sees a replay of the shot path instead of a snap/lerp. Still no need for `LAUNCH_CONFIRMED` unless playtesting shows the opponent wait feels dead.

---

# 19. ROOMS

The MVP should use private room codes.

No matchmaking is required.

Example:

```text
CREATE MATCH
     ↓
Generate room code
     ↓
Player 1 waits
     ↓
Player 2 enters code
     ↓
Player 2 joins
     ↓
Both players ready
     ↓
Match starts
```

Example room code:

```text
AB7K2
```

No account system is required for the MVP.

Players can use temporary session IDs.

---

# 20. DISCONNECTS

Do not immediately destroy a match when someone disconnects.

Use a short reconnect window.

Example:

```text
Player disconnects
       ↓
Match pauses / waits
       ↓
Reconnect window
       ↓
Player reconnects
       ↓
Resume match
```

If they do not reconnect, apply an explicit abandonment rule.

Keep this behavior isolated so it can be changed later.

---

# 21. TECHNOLOGY STACK

This stack is intentional and conventional for browser multiplayer games — not experimental. The risk is wiring ownership wrong, not the library choices.

## Frontend

Use:

- React
- Vite
- TypeScript
- Phaser 3
- Matter.js
- Tailwind CSS or simple CSS

## Ownership

| Concern | Owner |
|--------|--------|
| Menus, lobby, room code, result screen, connection status | React |
| Arena drawing, aim UI, particles, local flick feel | Phaser |
| Official physics, score, turns, win conditions | `game-engine` on the **server** |
| Instant flick animation | Local Matter.js in Phaser (**visual only**) |

React should handle:

- main menu
- create match
- join match
- lobby
- room code
- waiting screen
- result screen
- settings
- connection status

Phaser should handle:

- arena
- ball
- pucks
- goals
- physics visualization / local playback
- player input
- aiming
- effects
- game rendering

Do NOT use React state for continuously changing physics positions.

Do NOT create a React component for every physics object.

Use **one shared `GAME_CONFIG`** for masses, friction, sizes, and layout on both client and server. Do not maintain two divergent physics setups.

Server Matter.js must run on a **fixed timestep** until settled (plus a max timeout). Validate headless Node physics early when multiplayer starts — not after UI polish.

---

# 22. GAME ENGINE

Create a separate game engine package **after** the local match works (see Phase 3). Do not extract it on day one.

The game engine should contain:

- match rules
- turn system
- scoring (including own goals)
- win conditions
- timer rules
- player validation
- game state
- physics integration (`handleGoal` midfield reset, settling)

Example API:

```ts
const game = new Match(config);

game.start();

game.applyAction({
  playerId: "player1",
  puckId: "p1_1",
  angle: 1.2,
  power: 0.75
});
```

The engine should be independent from React.

The server should be able to use the game engine without importing UI code.

---

# 23. PROJECT STRUCTURE

**End-state** monorepo (build toward this; do not require it for Phase 1):

```text
puck-yeah/
│
├── apps/
│   ├── client/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── game/
│   │   │   ├── networking/
│   │   │   ├── screens/
│   │   │   └── main.tsx
│   │   └── package.json
│   │
│   └── server/
│       ├── src/
│       │   ├── server.ts
│       │   ├── matches/
│       │   ├── networking/
│       │   └── rooms/
│       └── package.json
│
├── packages/
│   ├── game-engine/
│   │   ├── src/
│   │   │   ├── Match.ts
│   │   │   ├── MatchState.ts
│   │   │   ├── GameRules.ts
│   │   │   ├── TurnManager.ts
│   │   │   ├── physics/
│   │   │   ├── entities/
│   │   │   └── systems/
│   │   └── package.json
│   │
│   └── shared/
│       ├── src/
│       │   ├── types/
│       │   ├── protocol/
│       │   └── constants/
│       └── package.json
│
├── docs/
│   ├── PLAN.md
│   ├── README.md
│   └── phases/
│
├── AGENTS.md
├── package.json
└── tsconfig.json
```

**Thin-first rule:** Phase 1 may live as a single Vite + Phaser client (Matter local). Add server, `shared`, and `game-engine` when the local match and rules exist — not before the flick feels good.

Keep the architecture simple.

Do not create abstractions simply for the sake of abstraction.

---

# 24. GAME CONFIGURATION

Centralize gameplay constants.

Example:

```ts
export const GAME_CONFIG = {
  maxGoals: 3,

  matchDurationMs: 180000,

  pucksPerPlayer: 5,

  maxShotPower: 1,

  ballReset: "midfield",

  startingLayout: "defense",

  physics: {
    puckMass: 10,
    ballMass: 1,
    friction: 0.2,
    restitution: 0.8,
  },
};
```

Actual values should be tuned during playtesting.

Do not scatter magic numbers throughout the codebase.

---

# 25. VISUAL DESIGN

The first version should prioritize readability and gameplay.

Start with:

- rectangular arena
- clear boundaries
- obvious goals
- circular soccer ball
- circular pucks
- distinct player puck colors
- simple shadows
- clean HUD
- simple particles

Do not spend significant development time on elaborate art before the gameplay works.

The game should immediately communicate:

```text
WHOSE TURN IS IT?
WHAT IS THE SCORE?
HOW MUCH TIME IS LEFT?
WHICH PUCKS BELONG TO ME?
WHERE IS THE BALL?
WHERE IS THE GOAL?
```

---

# 26. AIMING UI

When the player selects their puck:

```text
       ← aim direction

        ↑
        |
        |
      [PUCK]
```

Show:

- direction arrow
- shot power
- selected puck

Power should visually increase with drag distance.

Optional future feature:

- trajectory preview

Do NOT prioritize trajectory prediction during the first prototype.

---

# 27. HUD

The HUD should display:

```text
PLAYER 1        2 - 1        PLAYER 2

                 01:24

             YOUR TURN
```

At minimum show:

- Player 1 score
- Player 2 score
- timer
- current turn
- connection status

Because pucks are reusable, there is no need to display "remaining pucks."

---

# 28. RESPONSIVE DESIGN

Desktop mouse input is the first priority.

Touch support should be designed into the input system but does not need to be perfected before desktop gameplay works.

Use Phaser pointer input so mouse and touch can share the same control system.

Use a fixed logical game coordinate system.

Scale the game to fit the available screen rather than changing the physics dimensions based on screen size.

---

# 29. DEVELOPMENT PLAN

Build thin first. Do not scaffold the full monorepo, server, and engine before the flick feels good.

**Team phase guides** (structure, scope, DoD, handoffs):

→ [`phases/README.md`](./phases/README.md)

| Phase | Guide |
|-------|--------|
| 0 Setup | [PHASE_00_SETUP.md](./phases/PHASE_00_SETUP.md) |
| 1 Physics prototype | [PHASE_01_PHYSICS_PROTOTYPE.md](./phases/PHASE_01_PHYSICS_PROTOTYPE.md) |
| 2 Local match | [PHASE_02_LOCAL_MATCH.md](./phases/PHASE_02_LOCAL_MATCH.md) |
| 3 Game engine | [PHASE_03_GAME_ENGINE.md](./phases/PHASE_03_GAME_ENGINE.md) |
| 4 Multiplayer server | [PHASE_04_MULTIPLAYER_SERVER.md](./phases/PHASE_04_MULTIPLAYER_SERVER.md) |
| 5 Online match | [PHASE_05_ONLINE_MATCH.md](./phases/PHASE_05_ONLINE_MATCH.md) |
| 6 Reliability | [PHASE_06_RELIABILITY.md](./phases/PHASE_06_RELIABILITY.md) |
| 7 UI | [PHASE_07_UI.md](./phases/PHASE_07_UI.md) |
| 8 Game feel | [PHASE_08_GAME_FEEL.md](./phases/PHASE_08_GAME_FEEL.md) |
| 9 Playtesting | [PHASE_09_PLAYTESTING.md](./phases/PHASE_09_PLAYTESTING.md) |
| 10 Deployment | [PHASE_10_DEPLOYMENT.md](./phases/PHASE_10_DEPLOYMENT.md) |

The summaries below are the canonical phase order. Use the guides above for team expectations and folder structure.

## PHASE 0 - THIN PROJECT SETUP

Create the minimum needed to start the physics prototype:

- Git repository
- TypeScript + Vite client
- Phaser scene renders
- Matter.js available in the client

Optional later in this phase (not required to start Phase 1):

- server stub
- shared package
- game engine package

Success criteria for starting Phase 1:

```text
Client starts
Phaser scene renders
```

---

# PHASE 1 - PHYSICS PROTOTYPE

Build ONLY (single client app is fine):

```text
Arena
+
Walls
+
One ball
+
One puck
+
Two goals
+
Mouse drag
+
Aim indicator
+
Flick impulse
+
Matter.js physics
```

Do NOT build:

- multiplayer
- rooms
- accounts
- economy
- progression
- matchmaking
- cosmetics
- full monorepo extraction
- Socket.IO lobby

The goal is:

> Can I flick a puck at a ball and does the collision feel satisfying?

Test:

- weak shot
- strong shot
- direct collision
- glancing collision
- wall bounce
- ball movement
- puck movement
- friction
- resting

Do not move on until the basic interaction feels good.

---

# PHASE 2 - COMPLETE LOCAL MATCH

Implement:

- 5 pucks per player
- defense-oriented starting layout
- puck ownership
- reusable pucks
- alternating turns
- score
- goals + own goals (opponent +1)
- persistent arena (pucks stay)
- ball reset to midfield after goals
- timer
- first-to-3
- timer expiration
- draw
- match-end state

Two people should be able to play a complete match on one computer.

---

# PHASE 3 - SEPARATE GAME ENGINE

Move authoritative rules into the game engine.

Example:

```ts
const game = new Match(config);

game.start();

game.applyAction({
  playerId: "player1",
  puckId: "p1_1",
  angle: 1.2,
  power: 0.75
});
```

The renderer should not own game rules.

Also extract `shared` types/constants (`GAME_CONFIG`, protocol shapes) as needed.

---

# PHASE 4 - MULTIPLAYER SERVER

Implement:

- Socket.IO
- rooms
- room codes
- player assignment
- ready state
- server game engine
- action validation
- authoritative physics (fixed timestep on Node)
- `TURN_RESOLVED` broadcasting

Shooter client: optimistic local Matter animation + reconcile on `TURN_RESOLVED`.

Opponent client: wait for `TURN_RESOLVED` (no `LAUNCH_CONFIRMED` in MVP).

Milestone:

> Two browser windows can join the same room and play.

---

# PHASE 5 - ONLINE MATCH

Full flow:

```text
Player 1 creates room
        ↓
Player 2 joins room
        ↓
Both ready
        ↓
Countdown
        ↓
Player 1 flicks (local anim starts immediately)
        ↓
Server validates + resolves physics
        ↓
TURN_RESOLVED → both clients apply authoritative result
        ↓
Player 2 flicks (local anim starts immediately)
        ↓
Server resolves physics
        ↓
TURN_RESOLVED
        ↓
...
        ↓
3 goals OR timer expires
        ↓
Match ends
```

Both clients must end each turn on the same authoritative result.

---

# PHASE 6 - RELIABILITY

Test:

- high latency
- temporary disconnect
- reconnect
- duplicate click
- duplicate launch message
- action during physics
- action during opponent's turn
- action after match ends
- opponent puck selection
- invalid puck ID
- invalid power
- invalid angle
- rejected shot cancels optimistic local anim
- full room
- leaving before match
- disconnecting during match
- own goal scoring
- midfield ball reset after goal

The server must reject invalid actions safely.

---

# PHASE 7 - UI

Implement:

- main menu
- create match
- join match
- room code
- waiting screen
- ready button
- countdown
- HUD
- turn indicator
- result screen
- rematch
- connection status

---

# PHASE 8 - GAME FEEL

Only after gameplay works, add:

- impact particles
- goal animation
- screen shake
- puck trails
- ball trails
- sound effects
- turn transitions
- victory animation
- defeat animation
- draw animation
- improved aim indicator
- optional: keyframes in `TURN_RESOLVED` for opponent replay

Prioritize game feel over visual complexity.

---

# PHASE 9 - PLAYTESTING

Test with real players.

Ask:

- Is flicking intuitive?
- Does the puck feel satisfying?
- Does the ball feel responsive?
- Is physics predictable enough?
- Is the game too slow?
- Is the game too chaotic?
- Are goals too easy?
- Are goals too difficult?
- Is the arena the right size?
- Are goals the right size?
- Is the timer long enough?
- Does persistent board state create interesting strategy?
- Is it obvious whose turn it is?
- Does the defense-oriented start feel right?
- Does the opponent wait for `TURN_RESOLVED` feel acceptable?

Tune existing mechanics before adding new mechanics.

---

# PHASE 10 - DEPLOYMENT

Deploy the client and server separately if necessary.

Client options:

- Vercel
- similar static/frontend hosting

Server options:

- Render
- Fly.io
- Railway
- similar WebSocket-compatible hosting

Do not make the final infrastructure decision before the local multiplayer prototype works.

---

# 30. TESTING

Write unit tests for:

- turn switching
- puck ownership
- reusable pucks
- scoring
- own goals
- midfield ball reset after goal
- first-to-3
- timer expiration
- draw
- invalid actions
- match completion
- 5 pucks per player / defense starting layout spawn

Game engine tests should cover complete turn sequences.

Multiplayer tests should cover:

- two clients joining
- room capacity
- player assignment
- messages
- invalid actions
- rejected optimistic launch reconciliation
- disconnect
- reconnect
- match completion

---

# 31. DEBUG MODE

Create a development-only debug mode.

It should be able to display:

- physics body outlines
- velocity vectors
- puck IDs
- ball state
- current turn
- match phase
- connection state
- score
- settling status
- whether client is awaiting TURN_RESOLVED

This will make physics and multiplayer debugging much easier.

---

# 32. MVP EXCLUSIONS

DO NOT implement these unless explicitly requested later:

- coins
- daily rewards
- leagues
- ranked mode
- Elo
- matchmaking
- accounts
- OAuth
- persistent profiles
- friends
- chat
- notifications
- skins
- cosmetics
- battle pass
- advertisements
- purchases
- tournaments
- clans
- spectator mode
- advanced analytics
- large database infrastructure
- player-chosen starting formations
- `LAUNCH_CONFIRMED` early opponent playback (unless playtesting demands it)

The goal is to prove the core game first.

---

# 33. FUTURE ECONOMY

The economy is a future system and MUST NOT be part of the MVP.

Potential future system:

```text
Match Result
     ↓
Economy
     ↓
Rewards / Losses
     ↓
League Progression
```

Possible future concepts:

- daily free coins
- league entry fees
- higher-risk leagues
- higher rewards
- bankroll progression
- lower leagues for rebuilding
- higher leagues for risk/reward

The economy must never control physics.

---

# 34. ARCHITECTURAL RULES

Always follow these rules:

1. Do not add major features outside this plan without explaining why.
2. Do not implement the economy in the MVP.
3. Do not make clients authoritative.
4. Do not put game rules inside React components.
5. Do not use React state for continuous physics positions.
6. Do not reset the arena after goals — pucks stay; ball returns to midfield.
7. Each player has exactly 5 reusable pucks throughout the match.
8. Never allow a player to act while physics is resolving.
9. Never allow a player to control an opponent's puck.
10. Never trust client-provided score, winner, timer, or physics results.
11. Prefer simple implementations over elaborate abstractions.
12. Use TypeScript.
13. Centralize gameplay configuration in one shared `GAME_CONFIG`.
14. Write tests for important game rules.
15. If a rule is ambiguous, isolate the decision behind a small function/config value.
16. Prioritize gameplay feel over visual complexity.
17. Build the local game loop before online multiplayer.
18. Do not build the economy before the core game is fun.
19. Do not send physics state every frame over the network.
20. The server owns the official match state.
21. Own goals award the opponent +1.
22. Shooter uses optimistic local animation; opponent waits for `TURN_RESOLVED` in MVP.
23. Build thin first — do not over-scaffold monorepo/server/engine before the flick feels good.
24. Client Matter.js is visual only; server Matter.js is truth.

---

# 35. FINAL ARCHITECTURE

```text
                         ┌─────────────────────┐
                         │       CLIENT        │
                         │                     │
                         │ React (UI chrome)   │
                         │ Phaser (render)     │
                         │ Local Matter (feel) │
                         │ Input               │
                         └──────────┬──────────┘
                                    │
                         LAUNCH_PUCK / TURN_RESOLVED
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │       SERVER        │
                         │                     │
                         │ Match Manager       │
                         │ Room Manager        │
                         │ Validation          │
                         │ Socket.IO           │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │     GAME ENGINE     │
                         │                     │
                         │ Match Rules         │
                         │ Turn System         │
                         │ Score / Own Goals   │
                         │ Win Conditions      │
                         │ Matter (authority)  │
                         │ handleGoal midfield │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    MATCH STATE      │
                         │                     │
                         │ Players             │
                         │ 5 pucks each        │
                         │ Ball                │
                         │ Score               │
                         │ Turn                │
                         │ Timer               │
                         │ Phase               │
                         └─────────────────────┘
```

The client renders the game and plays snappy local feedback.

The server owns the match.

The game engine owns the rules.

Server physics resolves official interactions.

---

# 36. FIRST TASK

DO NOT attempt to build the entire game immediately.

DO NOT start by scaffolding the full monorepo, server, rooms, or economy.

Start with exactly this (thin Vite + Phaser client is enough):

```text
Rectangular arena
      +
One ball
      +
One puck
      +
Two goals
      +
Mouse drag
      +
Aim indicator
      +
Flick impulse
      +
Matter.js physics
```

The first milestone is:

> **Can I flick a puck at a ball and does the collision feel satisfying?**

Everything else comes after that.

Build the smallest working version first.

Do not prematurely implement multiplayer, rooms, accounts, economy, progression, formation pickers, or complex UI.

Focus on making the core interaction fun.
