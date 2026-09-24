import type Phaser from "phaser";
import { PROTOTYPE_CONFIG } from "../config/prototypeConfig";

export type WallBodies = {
  top: MatterJS.BodyType;
  bottom: MatterJS.BodyType;
  leftTop: MatterJS.BodyType;
  leftBottom: MatterJS.BodyType;
  rightTop: MatterJS.BodyType;
  rightBottom: MatterJS.BodyType;
};

export function createWalls(scene: Phaser.Scene): WallBodies {
  const { width, height, wallThickness } = PROTOTYPE_CONFIG.arena;
  const { openingHeight } = PROTOTYPE_CONFIG.goal;
  const matter = scene.matter;

  const halfOpen = openingHeight / 2;
  const sideWallHeight = (height - openingHeight) / 2;
  const wallOpts = {
    isStatic: true,
    label: "wall",
    friction: 0.2,
    restitution: 0.7,
  };

  const top = matter.add.rectangle(
    width / 2,
    wallThickness / 2,
    width,
    wallThickness,
    wallOpts,
  );

  const bottom = matter.add.rectangle(
    width / 2,
    height - wallThickness / 2,
    width,
    wallThickness,
    wallOpts,
  );

  // Left side split around goal opening (player1 defends left)
  const leftTop = matter.add.rectangle(
    wallThickness / 2,
    sideWallHeight / 2,
    wallThickness,
    sideWallHeight,
    wallOpts,
  );

  const leftBottom = matter.add.rectangle(
    wallThickness / 2,
    height - sideWallHeight / 2,
    wallThickness,
    sideWallHeight,
    wallOpts,
  );

  // Right side split around goal opening (player2 defends right)
  const rightTop = matter.add.rectangle(
    width - wallThickness / 2,
    sideWallHeight / 2,
    wallThickness,
    sideWallHeight,
    wallOpts,
  );

  const rightBottom = matter.add.rectangle(
    width - wallThickness / 2,
    height - sideWallHeight / 2,
    wallThickness,
    sideWallHeight,
    wallOpts,
  );

  // Visual wall frame (goals left open)
  const g = scene.add.graphics();
  g.fillStyle(PROTOTYPE_CONFIG.arena.wallColor, 1);
  g.fillRect(0, 0, width, wallThickness);
  g.fillRect(0, height - wallThickness, width, wallThickness);
  g.fillRect(0, 0, wallThickness, sideWallHeight);
  g.fillRect(0, height - sideWallHeight, wallThickness, sideWallHeight);
  g.fillRect(width - wallThickness, 0, wallThickness, sideWallHeight);
  g.fillRect(
    width - wallThickness,
    height - sideWallHeight,
    wallThickness,
    sideWallHeight,
  );

  // Soft markers at goal mouth edges
  g.lineStyle(2, PROTOTYPE_CONFIG.goal.color, 0.9);
  g.strokeRect(
    0,
    height / 2 - halfOpen,
    wallThickness,
    openingHeight,
  );
  g.strokeRect(
    width - wallThickness,
    height / 2 - halfOpen,
    wallThickness,
    openingHeight,
  );

  return { top, bottom, leftTop, leftBottom, rightTop, rightBottom };
}
