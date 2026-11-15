export class BaseEntity extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, frame = 0) {
    super(scene, x, y, texture, frame);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);

    // Subtle papercut ground shadow for 2.5D depth
    this.shadow = scene.add.ellipse(x, y, 32, 12, 0x1e2530, 0.4);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    // 2.5D Y-Depth sorting: Lower Y (higher on screen) = lower depth
    this.setDepth(this.y);

    if (this.shadow) {
      this.shadow.setPosition(this.x, this.y + this.displayHeight * 0.45);
      this.shadow.setDepth(this.y - 1); // Shadow always just behind entity
    }
  }
}