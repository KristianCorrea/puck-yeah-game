import Phaser from "phaser";
import { PROTOTYPE_CONFIG } from "../config/prototypeConfig";

export type BallEntity = {
  sprite: Phaser.GameObjects.Arc;
  body: MatterJS.BodyType;
};

export function createBall(scene: Phaser.Scene): BallEntity {
  const { width, height } = PROTOTYPE_CONFIG.arena;
  const cfg = PROTOTYPE_CONFIG.ball;

  const sprite = scene.add.circle(width / 2, height / 2, cfg.radius, cfg.color);
  sprite.setStrokeStyle(2, cfg.strokeColor);
  sprite.setDepth(11);

  scene.matter.add.gameObject(sprite, {
    shape: { type: "circle", radius: cfg.radius },
    label: "ball",
    friction: cfg.friction,
    frictionAir: cfg.frictionAir,
    restitution: cfg.restitution,
    frictionStatic: 0.1,
  });

  const body = sprite.body as MatterJS.BodyType;
  scene.matter.body.setMass(body, cfg.mass);

  return { sprite, body };
}
