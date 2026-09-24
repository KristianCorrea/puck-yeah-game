import Phaser from "phaser";
import { PROTOTYPE_CONFIG } from "../config/prototypeConfig";

export type PuckEntity = {
  sprite: Phaser.GameObjects.Arc;
  body: MatterJS.BodyType;
};

export function createPuck(scene: Phaser.Scene): PuckEntity {
  const { width, height } = PROTOTYPE_CONFIG.arena;
  const cfg = PROTOTYPE_CONFIG.puck;
  const x = width * cfg.startXRatio;
  const y = height * cfg.startYRatio;

  const sprite = scene.add.circle(x, y, cfg.radius, cfg.color);
  sprite.setStrokeStyle(3, cfg.strokeColor);
  sprite.setDepth(10);

  scene.matter.add.gameObject(sprite, {
    shape: { type: "circle", radius: cfg.radius },
    label: "puck",
    friction: cfg.friction,
    frictionAir: cfg.frictionAir,
    restitution: cfg.restitution,
    frictionStatic: 0.2,
  });

  const body = sprite.body as MatterJS.BodyType;
  scene.matter.body.setMass(body, cfg.mass);

  sprite.setInteractive({ useHandCursor: true });

  return { sprite, body };
}

/** Apply a normalized shot. angle is radians; power is 0..1. */
export function applyImpulse(puck: PuckEntity, angle: number, power: number): void {
  const clamped = Math.min(
    1,
    Math.max(PROTOTYPE_CONFIG.shot.minPower, power),
  );
  const speed = clamped * PROTOTYPE_CONFIG.shot.maxSpeed;
  const vx = Math.cos(angle) * speed;
  const vy = Math.sin(angle) * speed;

  const body = puck.body;
  body.isSleeping = false;

  const matterBody = puck.sprite.scene.matter.body;
  matterBody.setAngularVelocity(body, 0);
  matterBody.setVelocity(body, { x: vx, y: vy });
}
