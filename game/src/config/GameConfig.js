// game/src/config/GameConfig.js
import { MenuScene } from '../scenes/MenuScene.js';
import { WorldScene } from '../scenes/WorldScene.js';
import { UIScene } from '../scenes/UIScene.js';

export const GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#f6f3ec',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    fullscreenTarget: 'game-container',
    width: 1280,
    height: 720
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [MenuScene, WorldScene, UIScene]
};