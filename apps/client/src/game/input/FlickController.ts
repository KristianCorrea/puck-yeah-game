import type Phaser from "phaser";
import { PROTOTYPE_CONFIG } from "../config/prototypeConfig";
import { applyImpulse, type PuckEntity } from "../entities/createPuck";
import { AimIndicator } from "../ui/AimIndicator";

type DragState = {
  active: boolean;
  pointerId: number;
};

/**
 * Pointer drag on puck → aim + power → impulse on release.
 * Drag away from puck; launch direction is opposite the drag vector (slingshot).
 */
export class FlickController {
  private readonly scene: Phaser.Scene;
  private readonly puck: PuckEntity;
  private readonly aim: AimIndicator;
  private readonly drag: DragState = { active: false, pointerId: -1 };
  private enabled = true;

  constructor(scene: Phaser.Scene, puck: PuckEntity) {
    this.scene = scene;
    this.puck = puck;
    this.aim = new AimIndicator(scene);

    // Sprite hit-test is more reliable than manual world-distance checks under FIT scale.
    puck.sprite.on("pointerdown", this.onPuckDown, this);
    scene.input.on("pointermove", this.onPointerMove, this);
    scene.input.on("pointerup", this.onPointerUp, this);
    scene.input.on("pointerupoutside", this.onPointerUp, this);
  }

  setEnabled(value: boolean): void {
    this.enabled = value;
    if (!value) {
      this.drag.active = false;
      this.aim.hide();
    }
  }

  destroy(): void {
    this.puck.sprite.off("pointerdown", this.onPuckDown, this);
    this.scene.input.off("pointermove", this.onPointerMove, this);
    this.scene.input.off("pointerup", this.onPointerUp, this);
    this.scene.input.off("pointerupoutside", this.onPointerUp, this);
    this.aim.destroy();
  }

  private onPuckDown(
    pointer: Phaser.Input.Pointer,
    _localX: number,
    _localY: number,
    event: Phaser.Types.Input.EventData,
  ): void {
    if (!this.enabled || this.drag.active) return;
    event.stopPropagation();
    this.drag.active = true;
    this.drag.pointerId = pointer.id;
    this.updateAim(pointer);
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    if (!this.drag.active || pointer.id !== this.drag.pointerId) return;
    this.updateAim(pointer);
  }

  private onPointerUp(pointer: Phaser.Input.Pointer): void {
    if (!this.drag.active || pointer.id !== this.drag.pointerId) return;

    const shot = this.computeShot(pointer);
    this.drag.active = false;
    this.aim.hide();

    if (!shot) return;

    applyImpulse(this.puck, shot.angle, shot.power);
  }

  private updateAim(pointer: Phaser.Input.Pointer): void {
    const shot = this.computeShot(pointer);
    if (!shot) {
      this.aim.hide();
      return;
    }
    const { x, y } = this.puck.body.position;
    this.aim.show(x, y, shot.angle, shot.power);
  }

  private pointerWorld(pointer: Phaser.Input.Pointer): { x: number; y: number } {
    const cam = this.scene.cameras.main;
    const out = cam.getWorldPoint(pointer.x, pointer.y);
    return { x: out.x, y: out.y };
  }

  private computeShot(
    pointer: Phaser.Input.Pointer,
  ): { angle: number; power: number } | null {
    const { x, y } = this.puck.body.position;
    const world = this.pointerWorld(pointer);
    const dragX = world.x - x;
    const dragY = world.y - y;
    const dist = Math.hypot(dragX, dragY);
    if (dist < 6) return null;

    const power = Math.min(1, dist / PROTOTYPE_CONFIG.shot.maxDragPx);
    const angle = Math.atan2(-dragY, -dragX);
    return { angle, power };
  }
}
