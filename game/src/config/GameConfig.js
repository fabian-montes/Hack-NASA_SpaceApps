// game/src/config/GameConfig.js
import { WorldScene } from '../scenes/WorldScene.js';

export const GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#f6f3ec',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: '100%',
    height: '100%'
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [WorldScene]
};