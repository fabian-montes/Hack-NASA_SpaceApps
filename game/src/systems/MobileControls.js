// game/src/systems/MobileControls.js
export class MobileControls {
  constructor(uiScene) {
    this.scene = uiScene;
    this.vector = { x: 0, y: 0 };
    this.isActive = !this.scene.sys.game.device.os.desktop;
    this.nearbyInjuredNPC = null;

    if (!this.isActive) return;

    // Enable multi-touch (Joystick + Action Button simultaneously)
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

    this.baseShadow = this.scene.add.circle(baseX + 3, baseY + 3, this.maxRadius, 0x1e2530, 0.9).setDepth(300);
    this.baseRing = this.scene.add.circle(baseX, baseY, this.maxRadius, 0xf6f3ec, 0.85)
      .setStrokeStyle(2.5, 0x1e2530)
      .setDepth(301);

    this.thumb = this.scene.add.circle(baseX, baseY, 22, 0xe05a36, 0.95)
      .setStrokeStyle(2, 0x1e2530)
      .setDepth(302);

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

    const force = clampedDist / this.maxRadius;
    this.vector.x = Math.cos(angle) * force;
    this.vector.y = Math.sin(angle) * force;
  }

  createActionButton(x, y) {
    const radius = 36;

    this.actionShadow = this.scene.add.circle(x + 3, y + 3, radius, 0x1e2530, 1).setDepth(300);
    this.actionBtn = this.scene.add.circle(x, y, radius, 0x2a9d8f, 0.95)
      .setStrokeStyle(2.5, 0x1e2530)
      .setInteractive()
      .setDepth(301);

    this.actionLabel = this.scene.add.text(x, y, '📡\nBUILD', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5).setDepth(302);

    this.actionBtn.on('pointerdown', () => {
      const worldScene = this.scene.scene.get('WorldScene');
      if (!worldScene) return;

      // Priority 1: Heal nearby injured crew member
      if (this.nearbyInjuredNPC && this.nearbyInjuredNPC.state === 'INJURED') {
        worldScene.player.play('build', true);
        this.nearbyInjuredNPC.heal();
        this.nearbyInjuredNPC = null;
        return;
      }

      // Priority 2: Build / Deploy Comms Probe
      if (!worldScene.buildSystem) return;
      if (!worldScene.buildSystem.isBuildMode) {
        worldScene.buildSystem.toggleBuildMode();
      } else {
        worldScene.buildSystem.tryDeployProbe();
      }
    });
  }

  /**
   * Called every frame by UIScene.update() to swap button to [✚ HEAL] when close to an injured NPC
   */
  update() {
    if (!this.isActive || !this.actionBtn) return;

    const worldScene = this.scene.scene.get('WorldScene');
    if (!worldScene || !worldScene.player || !worldScene.crewGroup) return;

    // Find closest injured crew member within 105px
    let closest = null;
    let minDist = 105;

    worldScene.crewGroup.getChildren().forEach((npc) => {
      if (npc.state === 'INJURED') {
        const d = Phaser.Math.Distance.Between(
          worldScene.player.x,
          worldScene.player.y,
          npc.x,
          npc.y
        );
        if (d <= minDist) {
          minDist = d;
          closest = npc;
        }
      }
    });

    this.nearbyInjuredNPC = closest;

    // Update contextual icon & color
    if (this.nearbyInjuredNPC) {
      this.actionBtn.setFillStyle(0xc53030, 0.98); // Emergency Medical Red
      this.actionLabel.setText('✚\nHEAL');
      const pulse = 1 + Math.sin(this.scene.time.now * 0.012) * 0.07;
      this.actionBtn.setScale(pulse);
      this.actionLabel.setScale(pulse);
    } else {
      this.actionBtn.setScale(1);
      this.actionLabel.setScale(1);

      if (worldScene.buildSystem && worldScene.buildSystem.isBuildMode) {
        this.actionBtn.setFillStyle(0xe05a36, 0.95);
        this.actionLabel.setText('✓\nDEPLOY');
      } else {
        this.actionBtn.setFillStyle(0x2a9d8f, 0.95);
        this.actionLabel.setText('📡\nBUILD');
      }
    }
  }
}