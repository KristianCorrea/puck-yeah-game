import Phaser from "phaser";
import { ArenaScene } from "./game/ArenaScene";
import { PROTOTYPE_CONFIG } from "./game/config/prototypeConfig";

const parent = document.getElementById("game");

if (!parent) {
  throw new Error("Missing #game container");
}

const { width, height } = PROTOTYPE_CONFIG.arena;

new Phaser.Game({
  type: Phaser.AUTO,
  parent,
  backgroundColor: "#0b1220",
  width,
  height,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width,
    height,
  },
  physics: {
    default: "matter",
    matter: {
      gravity: { x: 0, y: 0 },
      // Settling is handled in ArenaScene; sleeping + setVelocity caused stuck pucks.
      enableSleeping: false,
      positionIterations: 8,
      velocityIterations: 6,
    },
  },
  scene: [ArenaScene],
});
