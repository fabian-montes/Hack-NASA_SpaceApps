// game/src/systems/MapGenerator.js
import { WorldProp } from '../entities/WorldProp.js';

export class MapGenerator {
  static ASSET_CATALOG = [
    {
      key: 'env_rocks',
      path: 'assets/objects/rocks.png',
      frameWidth: 128,
      frameHeight: 128,
      frames: [0, 1, 2, 3], // Adjust indices to your rock/crater frames
      count: 45,
      solid: true,
      minDistance: 110,
      tintable: true
    },
    {
      key: 'env_trees',
      path: 'assets/objects/trees.png',
      frameWidth: 160,
      frameHeight: 192,
      frames: [0, 1, 2, 3], // Adjust indices to your alien tree frames
      count: 35,
      solid: true,
      minDistance: 140,
      tintable: true
    },
    {
      key: 'env_vegetation',
      path: 'assets/objects/vegetation.png',
      frameWidth: 96,
      frameHeight: 96,
      frames: [0, 1, 2, 3, 4, 5], // Plants & flowers
      count: 85,
      solid: false, // Walkable ground flora
      minDistance: 55,
      tintable: true
    }
  ];

  /**
   * Call in WorldScene.preload() to load all environment sprite sheets
   */
  static preload(scene) {
    MapGenerator.ASSET_CATALOG.forEach((item) => {
      scene.load.spritesheet(item.key, item.path, {
        frameWidth: item.frameWidth,
        frameHeight: item.frameHeight
      });
    });
  }

  constructor(scene, worldWidth, worldHeight, planetTint = null) {
    this.scene = scene;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.planetTint = planetTint;

    // Physics group for solid obstacles (trees & boulders)
    this.solidObstacles = this.scene.physics.add.staticGroup();
    this.placedPoints = [];
  }

  /**
   * Generates all procedural props across the map while keeping spawn zone clear
   */
  generate(safeZone = { x: 1000, y: 1000, radius: 220 }) {
    this.placedPoints.push(safeZone);

    MapGenerator.ASSET_CATALOG.forEach((category) => {
      let spawned = 0;
      let attempts = 0;
      const maxAttempts = category.count * 15;

      while (spawned < category.count && attempts < maxAttempts) {
        attempts++;

        const x = Phaser.Math.Between(120, this.worldWidth - 120);
        const y = Phaser.Math.Between(120, this.worldHeight - 120);

        if (this.isValidPosition(x, y, category.minDistance)) {
          const randomFrame = Phaser.Utils.Array.GetRandom(category.frames);
          const randomScale = Phaser.Math.FloatBetween(0.85, 1.15);

          const prop = new WorldProp(this.scene, x, y, category.key, randomFrame, {
            type: category.key,
            solid: category.solid,
            scale: randomScale,
            tint: category.tintable ? this.planetTint : null
          });

          // Mirror randomly on X for extra visual variety (DRY)
          if (Math.random() > 0.5) prop.setFlipX(true);

          if (category.solid) {
            this.solidObstacles.add(prop);
          }

          this.placedPoints.push({ x, y, radius: category.minDistance * 0.6 });
          spawned++;
        }
      }
    });

    return this.solidObstacles;
  }

  isValidPosition(x, y, minDistance) {
    for (const pt of this.placedPoints) {
      const dist = Phaser.Math.Distance.Between(x, y, pt.x, pt.y);
      if (dist < Math.max(minDistance, pt.radius || 0)) {
        return false;
      }
    }
    return true;
  }
}