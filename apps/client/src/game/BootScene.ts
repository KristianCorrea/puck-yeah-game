import Phaser from "phaser";

/**
 * Phase 0 placeholder scene.
 * Phase 1 will replace / extend this with ArenaScene + Matter.js.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create(): void {
    const { width, height } = this.scale;

    this.add
      .rectangle(width / 2, height / 2, width, height, 0x0b1220)
      .setOrigin(0.5);

    // Simple arena outline so the canvas clearly "is a game"
    const margin = Math.min(width, height) * 0.08;
    const arena = this.add.graphics();
    arena.lineStyle(3, 0x3d5a80, 1);
    arena.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

    this.add
      .text(width / 2, height / 2 - 24, "PUCK YEAH", {
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: "48px",
        color: "#e8eef7",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 28, "Phase 0 — client boot", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "16px",
        color: "#8ba3c7",
      })
      .setOrigin(0.5);

    this.scale.on("resize", (gameSize: Phaser.Structs.Size) => {
      this.cameras.main.setSize(gameSize.width, gameSize.height);
    });
  }
}
