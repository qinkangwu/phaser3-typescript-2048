import "phaser";

import {LoadScene} from './scenes/Load';
import {PlayScene} from './scenes/Play';
import { ConsValue } from './constant'

const config: GameConfig = {
  type: Phaser.AUTO,
  width : ConsValue.TILE_SIZE * 4 + ConsValue.TILE_SPACING * 5,
  height : (ConsValue.TILE_SIZE * 4 + ConsValue.TILE_SPACING * 5) / .5625,
  parent : 'content',
  backgroundColor: 0xbbada0,
  physics: {
    default: 'arcade',
    arcade: {
        gravity: { y: 300 },
        debug: false
    }
  },
  scale: {
    mode: Phaser.DOM.FIT,
    autoCenter: Phaser.DOM.CENTER_BOTH
  },
  scene : [LoadScene,PlayScene]
};

export class StarfallGame extends Phaser.Game {
  constructor(config: GameConfig) {
    super(config);
  }
}

window.onload = () => {
  window.phaserGame = new StarfallGame(config);
};