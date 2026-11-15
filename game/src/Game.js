// game/src/Game.js
import { GameConfig } from './config/GameConfig.js';

export class Game extends Phaser.Game {
  constructor(config = GameConfig) {
    super(config);
  }
}

window.addEventListener('load', () => {
  window.outpostGame = new Game();
});