// game/src/scenes/WorldScene.js
import { Character } from '../entities/Character.js';
import { PlanetGround } from '../systems/PlanetGround.js';

// Planet surface presets (Pale Watercolor Palette)
const PLANET_PALETTES = {
  MARS: 0xd97254,     // Terracotta rust
  MOON: 0xcbd2d9,     // Regolith ash grey
  EUROPA: 0x90cdf4,   // Pale glacial cyan
  TITAN: 0xd69e2e     // Ochre hydrocarbon haze
};

export class WorldScene extends Phaser.Scene {
  constructor() {
    super('WorldScene');
  }

  preload() {
    Character.preload(this);
  }

  create() {
    const WORLD_WIDTH = 2000;
    const WORLD_HEIGHT = 2000;

    // 1. Set World Boundaries
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // 2. Procedural Watercolor Planet Surface
    this.ground = new PlanetGround(
      this,
      WORLD_WIDTH,
      WORLD_HEIGHT,
      PLANET_PALETTES.MARS // <-- Cambia aquí a MOON, EUROPA o TITAN
    );

    // 3. Instantiate Player Character at Center
    this.player = new Character(this, 1000, 1000);

    // 4. Smooth Camera Follow
    this.cameras.main.startFollow(this.player, true, 0.15, 0.15);

    // 5. Debug HUD
    this.debugText = this.add.text(20, 20, '', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '14px',
      color: '#1e2530',
      backgroundColor: '#ebe5d8',
      padding: { x: 10, y: 8 }
    }).setScrollFactor(0).setDepth(9999);
  }

  update() {
    this.player.update();

    const currentAnim = this.player.anims.currentAnim
      ? this.player.anims.currentAnim.key.toUpperCase()
      : 'IDLE';

    this.debugText.setText([
      'OUTPOST HORIZONS // PLANET SURFACE TEST',
      'Controls: [ARROW KEYS] Move | [SPACE] Build',
      `State: ${currentAnim}`,
      `O2: ${this.player.stats.oxygen}% | PWR: ${this.player.stats.power}%`
    ]);
  }
}