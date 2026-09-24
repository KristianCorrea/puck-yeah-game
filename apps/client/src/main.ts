import Phaser from "phaser";
import { BootScene } from "./game/BootScene";

const parent = document.getElementById("game");

if (!parent) {
  throw new Error('Missing #game container');
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent,
  backgroundColor: "#0b1220",
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: parent.clientWidth || 800,
    height: parent.clientHeight || 600,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene],
});
