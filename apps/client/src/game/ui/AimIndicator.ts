import Phaser from "phaser";
import { PROTOTYPE_CONFIG } from "../config/prototypeConfig";

/**
 * Slingshot aim: drag away from puck; arrow shows launch direction (opposite drag).
 */
export class AimIndicator {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private visible = false;

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics().setDepth(20);
  }

  show(
    originX: number,
    originY: number,
    angle: number,
    power: number,
  ): void {
    this.visible = true;
    const g = this.graphics;
    g.clear();

    const length =
      40 + power * (PROTOTYPE_CONFIG.shot.maxDragPx * 0.85);
    const endX = originX + Math.cos(angle) * length;
    const endY = originY + Math.sin(angle) * length;

    const strength = 0.45 + power * 0.55;
    g.lineStyle(4, 0xffe066, strength);
    g.beginPath();
    g.moveTo(originX, originY);
    g.lineTo(endX, endY);
    g.strokePath();

    // Arrow head
    const head = 14 + power * 8;
    const left = angle + Math.PI * 0.82;
    const right = angle - Math.PI * 0.82;
    g.fillStyle(0xffe066, strength);
    g.fillTriangle(
      endX,
      endY,
      endX + Math.cos(left) * head,
      endY + Math.sin(left) * head,
      endX + Math.cos(right) * head,
      endY + Math.sin(right) * head,
    );

    // Power ticks near puck
    const ticks = 5;
    for (let i = 1; i <= ticks; i++) {
      const t = i / ticks;
      if (t > power) break;
      const px = originX + Math.cos(angle) * (18 + t * 28);
      const py = originY + Math.sin(angle) * (18 + t * 28);
      g.fillStyle(0xff9f1c, 0.9);
      g.fillCircle(px, py, 3);
    }
  }

  hide(): void {
    if (!this.visible) return;
    this.visible = false;
    this.graphics.clear();
  }

  destroy(): void {
    this.graphics.destroy();
  }
}
