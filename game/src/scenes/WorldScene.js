// game/src/scenes/WorldScene.js
import { Character } from '../entities/Character.js';
import { PlanetGround } from '../systems/PlanetGround.js';
import { MapGenerator } from '../systems/MapGenerator.js';

const PLANET_THEMES = {
  MARS:   { ground: 0xd97254, propTint: 0xffd6c9 },
  MOON:   { ground: 0xcbd2d9, propTint: 0xe2e8f0 },
  EUROPA: { ground: 0x90cdf4, propTint: 0xb2f5ea },
  TITAN:  { ground: 0xd69e2e, propTint: 0xfefcbf }
};

export class WorldScene extends Phaser.Scene {
  constructor() {
    super('WorldScene');
  }

  preload() {
    Character.preload(this);
    MapGenerator.preload(this);
  }

  create() {
    const WORLD_WIDTH = 2400;
    const WORLD_HEIGHT = 2400;
    const currentPlanet = PLANET_THEMES.MARS;

    // 1. World Boundaries
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // 2. Procedural Watercolor Ground
    this.ground = new PlanetGround(
      this,
      WORLD_WIDTH,
      WORLD_HEIGHT,
      currentPlanet.ground
    );

    // 3. Procedural Environment Props (Rocks, Trees, Vegetation)
    const mapGen = new MapGenerator(
      this,
      WORLD_WIDTH,
      WORLD_HEIGHT,
      currentPlanet.propTint
    );
    const obstacles = mapGen.generate({ x: 1200, y: 1200, radius: 240 });

    // 4. Player Character & Collisions
    this.player = new Character(this, 1200, 1200);
    this.physics.add.collider(this.player, obstacles);

    // 5. Camera Follow
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    // 6. Debug HUD
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
      'OUTPOST HORIZONS // PROCEDURAL BIOME TEST',
      'Controls: [ARROW KEYS] Move | [SPACE] Build',
      `State: ${currentAnim}`,
      `O2: ${this.player.stats.oxygen}% | PWR: ${this.player.stats.power}%`
    ]);
  }
}