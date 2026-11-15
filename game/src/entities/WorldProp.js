// game/src/entities/WorldProp.js
import { BaseEntity } from './BaseEntity.js';

export class WorldProp extends BaseEntity {
  /**
   * @param {Phaser.Scene} scene - Active Phaser scene
   * @param {number} x - World X position
   * @param {number} y - World Y position
   * @param {string} textureKey - Loaded spritesheet or atlas key
   * @param {number|string} frame - Frame index or name
   * @param {object} config - Collision & tint options
   */
  constructor(scene, x, y, textureKey, frame, config = {}) {
    super(scene, x, y, textureKey, frame);

    this.propType = config.type || 'prop';

    // Make static physics body so the player collides without pushing trees/rocks
    if (this.body) {
      this.body.setImmovable(true);
      this.body.moves = false;
    }

    // Apply Street-Fighter-style dynamic planet tint if provided
    if (config.tint) {
      this.setTint(config.tint);
    }

    // Optional scale variation for natural organic look
    if (config.scale) {
      this.setScale(config.scale);
    }

    // Adjust shadow & hitbox footprint based on whether the object is solid or walkable
    if (config.solid) {
      // Tighten hitbox strictly to the base/trunk so player can walk behind the top
      const hitW = this.displayWidth * 0.45;
      const hitH = this.displayHeight * 0.22;
      this.body.setSize(hitW, hitH);
      this.body.setOffset(
        (this.width - hitW / this.scaleX) * 0.5,
        this.height - (hitH / this.scaleY) - 4
      );
    } else {
      // Non-solid props (flowers, flat craters) have no physical collision
      this.body.enable = false;
      if (this.shadow) this.shadow.setVisible(false);
    }

    // Force initial 2.5D depth immediately upon spawn
    this.setDepth(this.y);
    if (this.shadow && this.shadow.visible) {
      this.shadow.setScale(this.displayWidth / 36, 1);
      this.shadow.setPosition(this.x, this.y + this.displayHeight * 0.42);
      this.shadow.setDepth(this.y - 1);
    }
  }
}