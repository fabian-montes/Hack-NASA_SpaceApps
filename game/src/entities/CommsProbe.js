// game/src/entities/CommsProbe.js
import { BaseEntity } from './BaseEntity.js';

export class CommsProbe extends BaseEntity {
  static TEXTURE_KEY = 'comms_probe';

  /**
   * Generates a papercut-styled fallback texture if no PNG asset is loaded yet
   */
  static preload(scene) {
    if (scene.textures.exists(CommsProbe.TEXTURE_KEY)) return;

    const gfx = scene.make.graphics({ x: 0, y: 0, add: false });

    // Tripod legs (ink outlines)
    gfx.lineStyle(3, 0x1e2530, 1);
    gfx.lineBetween(32, 48, 14, 72);
    gfx.lineBetween(32, 48, 50, 72);
    gfx.lineBetween(32, 48, 32, 76);

    // Core telemetry body (papercut off-white + NASA orange stripe)
    gfx.fillStyle(0xf6f3ec, 1);
    gfx.fillRoundedRect(20, 28, 24, 24, 4);
    gfx.lineStyle(2.5, 0x1e2530, 1);
    gfx.strokeRoundedRect(20, 28, 24, 24, 4);

    gfx.fillStyle(0xe05a36, 1);
    gfx.fillRect(21, 36, 22, 6);

    // Parabolic dish & antenna spire
    gfx.fillStyle(0xebe5d8, 1);
    gfx.fillEllipse(32, 20, 26, 12);
    gfx.lineStyle(2.5, 0x1e2530, 1);
    gfx.strokeEllipse(32, 20, 26, 12);

    gfx.lineBetween(32, 20, 32, 6);
    gfx.fillStyle(0x2a9d8f, 1);
    gfx.fillCircle(32, 6, 4);
    gfx.strokeCircle(32, 6, 4);

    gfx.generateTexture(CommsProbe.TEXTURE_KEY, 64, 80);
    gfx.destroy();
  }

  constructor(scene, x, y) {
    super(scene, x, y, CommsProbe.TEXTURE_KEY, 0);

    // Static immovable physics footprint at tripod base
    this.body.setImmovable(true);
    this.body.moves = false;
    this.body.setSize(34, 18);
    this.body.setOffset(15, 58);

    // Signal & link state
    this.signalStrength = 0; // 0 to 100%
    this.isLinked = false;

    // Floating status label above the dish
    this.statusLabel = scene.add.text(x, y - 52, 'CALIBRATING SIGNAL...', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#1e2530',
      backgroundColor: '#f6f3ec',
      padding: { x: 5, y: 2 }
    }).setOrigin(0.5).setDepth(y + 10);

    // Periodic signal pulse timer (every 1.6 seconds)
    this.pulseTimer = scene.time.addEvent({
      delay: 1600,
      callback: () => this.emitSignalWave(),
      loop: true
    });

    // Immediate first pulse upon deployment
    this.emitSignalWave();
  }

  emitSignalWave() {
    if (!this.active) return;

    // Increase link progress on each transmission pulse
    if (!this.isLinked) {
      this.signalStrength = Math.min(100, this.signalStrength + 25);
      if (this.signalStrength >= 100) {
        this.isLinked = true;
        this.statusLabel.setText('📡 COMMS LINK: ONLINE');
        this.statusLabel.setColor('#2a9d8f');
      } else {
        this.statusLabel.setText(`📡 UPLINK: ${this.signalStrength}%`);
      }
    }

    // Visual expanding cyan radio ring from antenna tip
    const wave = this.scene.add.circle(this.x, this.y - 34, 8)
      .setStrokeStyle(2.5, this.isLinked ? 0x38a169 : 0x2a9d8f, 0.9)
      .setDepth(this.y + 5);

    this.scene.tweens.add({
      targets: wave,
      radius: 95,
      alpha: 0,
      duration: 1300,
      ease: 'Cubic.easeOut',
      onComplete: () => wave.destroy()
    });
  }
}