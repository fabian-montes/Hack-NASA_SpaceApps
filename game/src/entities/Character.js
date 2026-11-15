// game/src/entities/Character.js
import { BaseEntity } from './BaseEntity.js';

export class Character extends BaseEntity {
  static SPRITE_KEY = 'me';
  static FRAME_WIDTH = 2048 / 6;  // Ajusta al ancho real de tu frame
  static FRAME_HEIGHT = 2048 / 4; // Ajusta al alto real de tu frame

  constructor(scene, x, y) {
    super(scene, x, y, Character.SPRITE_KEY, 0);

    // 1. Basic & Extended Survival Stats (0 - 100 scale)
    this.stats = {
      health: 100,
      oxygen: 100,
      power: 85,
      speed: 190,
      buildPower: 10
    };

    this.isBuilding = false;

    // Tighten physics hitbox around the character's feet for 2.5D collisions
    this.body.setSize(28, 20);
    this.body.setOffset(18, 42);

    this.initAnimations();
    this.initControls();
    this.play('idle');
    this.setScale(0.35);
  }

  // 2. Spritesheet Loader (Called in WorldScene preload)
  static preload(scene) {
    scene.load.spritesheet(
      Character.SPRITE_KEY,
      'assets/sprites/characters/me.png',
      {
        frameWidth: Character.FRAME_WIDTH,
        frameHeight: Character.FRAME_HEIGHT
      }
    );
  }

  // 3. Animations Setup (Maps to the 4x6 spritesheet layout)
  initAnimations() {
    const anims = this.scene.anims;
    if (anims.exists('idle')) return; // Prevent duplicate registration (DRY)

    const key = Character.SPRITE_KEY;

    // Row 1 (Frames 0-5): IDLE
    anims.create({
      key: 'idle',
      frames: anims.generateFrameNumbers(key, { start: 0, end: 5 }),
      frameRate: 6,
      repeat: -1
    });

    // Row 2 (Frames 6-11): WALK (Bouncy animation covering Down, Left, Right)
    anims.create({
      key: 'walk-side',
      frames: anims.generateFrameNumbers(key, { start: 6, end: 11 }),
      frameRate: 10,
      repeat: -1
    });

    // Row 3 (Frames 12-17): BUILD / INTERACT (Back view)
    anims.create({
      key: 'build',
      frames: anims.generateFrameNumbers(key, { start: 12, end: 17 }),
      frameRate: 12,
      repeat: -1
    });

    // Row 4 (Frames 18-23): WALK UPWARDS (Back view)
    anims.create({
      key: 'walk-up',
      frames: anims.generateFrameNumbers(key, { start: 18, end: 23 }),
      frameRate: 10,
      repeat: -1
    });
  }

  // 4. Input Controls (Arrow Keys + Spacebar)
  initControls() {
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.spaceKey = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
  }

  update() {
    this.body.setVelocity(0);

    // Priority 1: Building / Interacting (Spacebar held down)
    if (this.spaceKey.isDown) {
      this.isBuilding = true;
      this.setFlipX(false);
      this.play('build', true);
      return;
    }

    this.isBuilding = false;

    // Priority 2: 4-Directional Movement (Arrow Keys)
    const { left, right, up, down } = this.cursors;
    let vx = 0;
    let vy = 0;

    if (left.isDown) vx = -1;
    else if (right.isDown) vx = 1;

    if (up.isDown) vy = -1;
    else if (down.isDown) vy = 1;

    if (vx !== 0 || vy !== 0) {
      this.body.setVelocity(vx, vy);
      this.body.velocity.normalize().scale(this.stats.speed);

      // Play directional animation and mirror sprite horizontally for left/right
      if (vy < 0 && vx === 0) {
        this.setFlipX(false);
        this.play('walk-up', true);
      } else if (vy > 0 && vx === 0) {
        this.setFlipX(false);
        this.play('walk-side', true);
      } else if (vx < 0) {
        this.setFlipX(true); // Mirror side walk for left
        this.play('walk-side', true);
      } else if (vx > 0) {
        this.setFlipX(false);
        this.play('walk-side', true);
      }
    } else {
      // Priority 3: Default to IDLE
      this.play('idle', true);
    }
  }
}