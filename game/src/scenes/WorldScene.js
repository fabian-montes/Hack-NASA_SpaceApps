// game/src/scenes/WorldScene.js
import { Character } from '../entities/Character.js';

export class WorldScene extends Phaser.Scene {
  constructor() {
    super('WorldScene');
  }

  preload() {
    Character.preload(this);
  }

  create() {
    // 1. Set World Boundaries (Procedural sector size)
    this.physics.world.setBounds(0, 0, 2000, 2000);
    this.cameras.main.setBounds(0, 0, 2000, 2000);

    // 2. Watercolor Paper Grid Background
    this.add.grid(
      1000, 1000, 2000, 2000, 64, 64,
      0xf6f3ec, 1, 0x1e2530, 0.08
    );

    // 3. Instantiate Player Character at Center
    this.player = new Character(this, 1000, 1000);

    // 4. Smooth Camera Follow
    this.cameras.main.startFollow(this.player, true, 0.15, 0.15);

    // 5. Debug HUD (Fixed to Camera)
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

    // Live telemetry readout for MVP verification
    const currentAnim = this.player.anims.currentAnim
      ? this.player.anims.currentAnim.key.toUpperCase()
      : 'IDLE';

    this.debugText.setText([
      'OUTPOST HORIZONS // MVP CHARACTER TEST',
      'Controls: [ARROW KEYS] Move | [SPACE] Build',
      `State: ${currentAnim}`,
      `O2: ${this.player.stats.oxygen}% | PWR: ${this.player.stats.power}%`
    ]);
  }
}