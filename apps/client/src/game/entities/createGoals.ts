import type Phaser from "phaser";
import { PROTOTYPE_CONFIG, type GoalSide } from "../config/prototypeConfig";

export type GoalSensors = {
  player1: MatterJS.BodyType;
  player2: MatterJS.BodyType;
};

/**
 * Sensor zones just outside / in the goal mouths.
 * Phase 2 will use ballInGoalSide() for scoring.
 */
export function createGoals(scene: Phaser.Scene): GoalSensors {
  const { width, height, wallThickness } = PROTOTYPE_CONFIG.arena;
  const { openingHeight, depth, sensorPadding, color, sensorAlpha } =
    PROTOTYPE_CONFIG.goal;

  const matter = scene.matter;
  const sensorH = openingHeight - sensorPadding * 2;

  const player1 = matter.add.rectangle(
    wallThickness / 2,
    height / 2,
    depth,
    sensorH,
    {
      isStatic: true,
      isSensor: true,
      label: "goal_player1",
    },
  );

  const player2 = matter.add.rectangle(
    width - wallThickness / 2,
    height / 2,
    depth,
    sensorH,
    {
      isStatic: true,
      isSensor: true,
      label: "goal_player2",
    },
  );

  const viz = scene.add.graphics();
  viz.fillStyle(color, sensorAlpha);
  viz.fillRect(
    0,
    height / 2 - sensorH / 2,
    depth,
    sensorH,
  );
  viz.fillRect(
    width - depth,
    height / 2 - sensorH / 2,
    depth,
    sensorH,
  );

  scene.add
    .text(depth + 8, height / 2, "P1", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "14px",
      color: "#f4a261",
    })
    .setOrigin(0, 0.5);

  scene.add
    .text(width - depth - 8, height / 2, "P2", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "14px",
      color: "#f4a261",
    })
    .setOrigin(1, 0.5);

  return { player1, player2 };
}

export function ballInGoalSide(
  ball: MatterJS.BodyType,
  goals: GoalSensors,
): GoalSide | null {
  const bx = ball.position.x;
  const by = ball.position.y;

  if (pointInBodyBounds(bx, by, goals.player1)) {
    return "player1";
  }
  if (pointInBodyBounds(bx, by, goals.player2)) {
    return "player2";
  }
  return null;
}

function pointInBodyBounds(
  x: number,
  y: number,
  body: MatterJS.BodyType,
): boolean {
  const { min, max } = body.bounds;
  return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
}
