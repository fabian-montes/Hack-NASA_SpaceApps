// game/src/systems/MobileControls.js
export class MobileControls {
  constructor(uiScene) {
    this.scene = uiScene;
    this.vector = { x: 0, y: 0 };
    this.isActive = !this.scene.sys.game.device.os.desktop;

    if (!this.isActive) return;

    // Enable extra pointer for simultaneous move + build tap
    this.scene.input.addPointer(1);

    const { width, height } = this.scene.cameras.main;
    this.createVirtualJoystick(115, height - 115);
    this.createActionButton(width - 95, height - 125);
  }

  createVirtualJoystick(baseX, baseY) {
    this.baseX = baseX;
    this.baseY = baseY;
    this.maxRadius = 48;
    this.activePointerId = null;

    // Outer papercut joystick ring
    this.baseShadow = this.scene.add.circle(baseX + 3, baseY + 3, this.maxRadius, 0x1e2530, 0.9).setDepth(300);
    this.baseRing = this.scene.add.circle(baseX, baseY, this.maxRadius, 0xf6f3ec, 0.85)
      .setStrokeStyle(2.5, 0x1e2530)
      .setDepth(301);

    // Movable thumb stick
    this.thumb = this.scene.add.circle(baseX, baseY, 22, 0xe05a36, 0.95)
      .setStrokeStyle(2, 0x1e2530)
      .setDepth(302);

    // Interactive touch zone around the joystick
    const hitZone = this.scene.add.circle(baseX, baseY, this.maxRadius + 28, 0x000000, 0)
      .setInteractive()
      .setDepth(303);

    hitZone.on('pointerdown', (pointer) => {
      this.activePointerId = pointer.id;
      this.updateThumb(pointer.x, pointer.y);
    });

    this.scene.input.on('pointermove', (pointer) => {
      if (pointer.id === this.activePointerId && pointer.isDown) {
        this.updateThumb(pointer.x, pointer.y);
      }
    });

    const resetStick = (pointer) => {
      if (pointer.id === this.activePointerId) {
        this.activePointerId = null;
        this.thumb.setPosition(this.baseX, this.baseY);
        this.vector.x = 0;
        this.vector.y = 0;
      }
    };

    this.scene.input.on('pointerup', resetStick);
    this.scene.input.on('pointerupoutside', resetStick);
  }

  updateThumb(px, py) {
    const dx = px - this.baseX;
    const dy = py - this.baseY;
    const dist = Math.hypot(dx, dy);

    if (dist === 0) {
      this.vector.x = 0;
      this.vector.y = 0;
      return;
    }

    const clampedDist = Math.min(dist, this.maxRadius);
    const angle = Math.atan2(dy, dx);

    this.thumb.setPosition(
      this.baseX + Math.cos(angle) * clampedDist,
      this.baseY + Math.sin(angle) * clampedDist
    );

    // Normalized directional vector (-1 to 1)
    const force = clampedDist / this.maxRadius;
    this.vector.x = Math.cos(angle) * force;
    this.vector.y = Math.sin(angle) * force;
  }

  createActionButton(x, y) {
    const radius = 34;

    const shadow = this.scene.add.circle(x + 3, y + 3, radius, 0x1e2530, 1).setDepth(300);
    const btn = this.scene.add.circle(x, y, radius, 0x2a9d8f, 0.95)
      .setStrokeStyle(2.5, 0x1e2530)
      .setInteractive()
      .setDepth(301);

    const label = this.scene.add.text(x, y, '📡\nBUILD', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5).setDepth(302);

    // First tap opens holographic preview; second tap deploys the Comms Probe
    btn.on('pointerdown', () => {
      const worldScene = this.scene.scene.get('WorldScene');
      if (!worldScene || !worldScene.buildSystem) return;

      if (!worldScene.buildSystem.isBuildMode) {
        worldScene.buildSystem.toggleBuildMode();
        label.setText('✓\nDEPLOY');
        btn.setFillStyle(0xe05a36, 0.95);
      } else {
        worldScene.buildSystem.tryDeployProbe();
        label.setText('📡\nBUILD');
        btn.setFillStyle(0x2a9d8f, 0.95);
      }
    });
  }
}