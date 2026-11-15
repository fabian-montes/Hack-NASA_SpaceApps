// game/src/systems/BuildSystem.js
import { CommsProbe } from '../entities/CommsProbe.js';

export class BuildSystem {
  constructor(scene, player, obstaclesGroup) {
    this.scene = scene;
    this.player = player;
    this.obstacles = obstaclesGroup;

    this.isBuildMode = false;
    this.probePowerCost = 15;
    this.deployedProbes = this.scene.physics.add.staticGroup();

    // Ghost preview sprite shown when Build Mode is active
    this.ghost = this.scene.add.sprite(0, 0, CommsProbe.TEXTURE_KEY)
      .setAlpha(0.65)
      .setVisible(false);

    this.hintText = this.scene.add.text(0, 0, '[SPACE / CLICK] DEPLOY PROBE (-15 PWR)', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#ffffff',
      backgroundColor: '#1e2530',
      padding: { x: 6, y: 3 }
    }).setOrigin(0.5).setVisible(false);

    this.initInputs();
  }

  initInputs() {
    // Toggle build preview mode with 'B' key
    this.scene.input.keyboard.on('keydown-B', () => {
      this.toggleBuildMode();
    });

    // Confirm placement with SPACE (when in build mode) or Left Click
    this.scene.input.keyboard.on('keydown-SPACE', () => {
      if (this.isBuildMode) this.tryDeployProbe();
    });

    this.scene.input.on('pointerdown', (pointer) => {
      if (this.isBuildMode && pointer.leftButtonDown()) {
        this.tryDeployProbe();
      }
    });
  }

  toggleBuildMode() {
    this.isBuildMode = !this.isBuildMode;
    this.ghost.setVisible(this.isBuildMode);
    this.hintText.setVisible(this.isBuildMode);
  }

  getPlacementCoords() {
    // Place 64px in front of the player based on facing direction
    const offsetX = this.player.flipX ? -64 : 64;
    return {
      x: Phaser.Math.Clamp(this.player.x + offsetX, 80, this.scene.physics.world.bounds.width - 80),
      y: Phaser.Math.Clamp(this.player.y + 8, 80, this.scene.physics.world.bounds.height - 80)
    };
  }

  canPlaceAt(x, y) {
    // Check player has enough power
    if (this.player.stats.power < this.probePowerCost) return false;

    // Check distance against existing rocks/trees and other probes
    const allSolids = [
      ...this.obstacles.getChildren(),
      ...this.deployedProbes.getChildren()
    ];

    for (const obj of allSolids) {
      if (Phaser.Math.Distance.Between(x, y, obj.x, obj.y) < 75) {
        return false;
      }
    }
    return true;
  }

  tryDeployProbe() {
    const { x, y } = this.getPlacementCoords();
    if (!this.canPlaceAt(x, y)) return;

    // Deduct engineering trade-off cost (Power)
    this.player.stats.power -= this.probePowerCost;

    // Trigger commander's back-facing build animation briefly
    this.player.play('build', true);

    // Spawn the Comms Probe entity
    const probe = new CommsProbe(this.scene, x, y);
    this.deployedProbes.add(probe);

    // Exit build mode after successful deployment
    this.toggleBuildMode();
  }

  update() {
    if (!this.isBuildMode) return;

    const { x, y } = this.getPlacementCoords();
    const valid = this.canPlaceAt(x, y);

    this.ghost.setPosition(x, y).setDepth(y + 2);
    this.ghost.setTint(valid ? 0x38a169 : 0xe53e3e); // Green if valid, Red if blocked/no power

    this.hintText.setPosition(x, y - 54).setDepth(y + 15);
    this.hintText.setText(
      valid
        ? '[SPACE / CLICK] DEPLOY COMMS PROBE (-15 PWR)'
        : 'BLOCKED OR INSUFFICIENT POWER'
    );
  }
}