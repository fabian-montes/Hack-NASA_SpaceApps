// game/src/systems/PlanetGround.js
export class PlanetGround {
  /**
   * Generates a procedural pale-watercolor & ink-speckled surface texture
   * and covers the world using a high-performance TileSprite.
   *
   * @param {Phaser.Scene} scene - The active Phaser scene
   * @param {number} worldWidth - Total width of the world
   * @param {number} worldHeight - Total height of the world
   * @param {number} baseColor - Hex color of the planet surface (e.g., 0xd97254 for Mars)
   */
  constructor(scene, worldWidth, worldHeight, baseColor = 0xd97254) {
    this.scene = scene;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.tileSize = 512;
    this.textureKey = `planet_ground_${baseColor.toString(16)}`;

    this.generateProceduralTexture(baseColor);
    this.createGroundLayer();
  }

  generateProceduralTexture(baseColor) {
    // Avoid regenerating if this planet palette already exists in cache (DRY)
    if (this.scene.textures.exists(this.textureKey)) return;

    const size = this.tileSize;
    const gfx = this.scene.make.graphics({ x: 0, y: 0, add: false });

    // Derive pale watercolor & ink shades from the base planet color
    const colorObj = Phaser.Display.Color.IntegerToColor(baseColor);
    const lightWash = colorObj.clone().lighten(18).color;
    const darkWash = colorObj.clone().darken(15).color;
    const inkSpeckle = colorObj.clone().darken(42).color;

    // 1. Base surface coat
    gfx.fillStyle(baseColor, 1);
    gfx.fillRect(0, 0, size, size);

    // 2. Soft watercolor blotches (wrapped at edges for seamless tiling)
    for (let i = 0; i < 28; i++) {
      const x = Phaser.Math.Between(0, size);
      const y = Phaser.Math.Between(0, size);
      const radius = Phaser.Math.Between(35, 110);
      const isLight = i % 2 === 0;

      gfx.fillStyle(isLight ? lightWash : darkWash, 0.22);

      // Draw across edges so the 512x512 tile loops seamlessly
      this.drawWrappedCircle(gfx, x, y, radius, size);
    }

    // 3. Hand-drawn papercut grain & pebbles
    for (let i = 0; i < 90; i++) {
      const x = Phaser.Math.Between(0, size);
      const y = Phaser.Math.Between(0, size);
      const r = Phaser.Math.Between(1, 3);

      gfx.fillStyle(inkSpeckle, 0.35);
      gfx.fillCircle(x, y, r);
    }

    // 4. Subtle hand-sketched terrain cracks / contour lines
    gfx.lineStyle(1.5, inkSpeckle, 0.28);
    for (let i = 0; i < 12; i++) {
      let cx = Phaser.Math.Between(20, size - 20);
      let cy = Phaser.Math.Between(20, size - 20);

      gfx.beginPath();
      gfx.moveTo(cx, cy);
      for (let step = 0; step < 3; step++) {
        cx += Phaser.Math.Between(-18, 18);
        cy += Phaser.Math.Between(-10, 10);
        gfx.lineTo(cx, cy);
      }
      gfx.strokePath();
    }

    gfx.generateTexture(this.textureKey, size, size);
    gfx.destroy();
  }

  drawWrappedCircle(gfx, x, y, radius, size) {
    const offsets = [0];
    if (x - radius < 0) offsets.push(size);
    if (x + radius > size) offsets.push(-size);

    const yOffsets = [0];
    if (y - radius < 0) yOffsets.push(size);
    if (y + radius > size) yOffsets.push(-size);

    for (const ox of offsets) {
      for (const oy of yOffsets) {
        gfx.fillCircle(x + ox, y + oy, radius);
      }
    }
  }

  createGroundLayer() {
    this.groundSprite = this.scene.add
      .tileSprite(0, 0, this.worldWidth, this.worldHeight, this.textureKey)
      .setOrigin(0, 0)
      .setDepth(-1000); // Always behind shadows (-1) and Y-sorted entities
  }

  /**
   * Allows changing the planet surface color dynamically on the fly
   */
  setPlanetColor(newBaseColor) {
    this.textureKey = `planet_ground_${newBaseColor.toString(16)}`;
    this.generateProceduralTexture(newBaseColor);
    this.groundSprite.setTexture(this.textureKey);
  }
}