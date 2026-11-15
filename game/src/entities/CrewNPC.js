// game/src/entities/CrewNPC.js
import { BaseEntity } from './BaseEntity.js';

const CREW_PROFILES = {
  cadets:     { label: 'JUNIOR CADET',  suitColor: 0x2a9d8f, helmet: true },
  specialist: { label: 'BIO-ENGINEER',  suitColor: 0xe05a36, helmet: true },
  dog:        { label: 'ASTRO-PUP',     suitColor: 0xd69e2e, helmet: true },
  roach:      { label: 'NASA ROACH',    suitColor: 0x805ad5, helmet: false }
};

export class CrewNPC extends BaseEntity {
  static preload(scene) {
    Object.entries(CREW_PROFILES).forEach(([id, profile]) => {
      const texKey = `npc_${id}`;
      if (scene.textures.exists(texKey)) return;

      const gfx = scene.make.graphics({ x: 0, y: 0, add: false });

      // Stickman limbs (papercut ink)
      gfx.lineStyle(2.5, 0x1e2530, 1);
      gfx.lineBetween(26, 42, 24, 56);
      gfx.lineBetween(38, 42, 40, 56);
      gfx.lineBetween(22, 32, 14, 42);
      gfx.lineBetween(42, 32, 50, 42);

      // Oversimplified suit torso
      gfx.fillStyle(profile.suitColor, 1);
      gfx.fillRoundedRect(22, 28, 20, 16, 4);
      gfx.lineStyle(2, 0x1e2530, 1);
      gfx.strokeRoundedRect(22, 28, 20, 16, 4);

      // Oversized Don't Starve style head + visor
      gfx.fillStyle(0xf6f3ec, 1);
      gfx.fillCircle(32, 17, 13);
      gfx.lineStyle(2.5, 0x1e2530, 1);
      gfx.strokeCircle(32, 17, 13);

      // Visor glass
      gfx.fillStyle(0x90cdf4, 0.85);
      gfx.fillRoundedRect(24, 12, 16, 9, 4);
      gfx.strokeRoundedRect(24, 12, 16, 9, 4);

      gfx.generateTexture(texKey, 64, 64);
      gfx.destroy();
    });
  }

  constructor(scene, x, y, crewId = 'cadets') {
    const profile = CREW_PROFILES[crewId] || CREW_PROFILES.cadets;
    super(scene, x, y, `npc_${crewId}`, 0);

    this.crewId = crewId;
    this.profile = profile;
    this.state = 'INJURED'; // 'INJURED' | 'WANDERING'
    this.walkSpeed = 75;
    this.moveTimer = 0;

    // Tighten physics hitbox at feet
    this.body.setSize(24, 18);
    this.body.setOffset(20, 44);

    // Start lying flat on the ground
    this.setAngle(-90);
    this.setTint(0xcbd5e0);

    // Floating status & interaction prompt
    this.statusBadge = scene.add.text(x, y - 34, `✚ ${profile.label} [E TO HEAL]`, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#ffffff',
      backgroundColor: '#c53030',
      padding: { x: 6, y: 2 }
    }).setOrigin(0.5).setDepth(y + 20);
  }

  heal() {
    if (this.state !== 'INJURED') return false;

    this.state = 'WANDERING';
    this.setAngle(0);
    this.clearTint();

    // Update badge to healthy state
    this.statusBadge.setText(`♥ ${this.profile.label}`);
    this.statusBadge.setBackgroundColor('#2a9d8f');

    // Healing burst ring feedback
    const healRing = this.scene.add.circle(this.x, this.y, 10)
      .setStrokeStyle(2.5, 0x38a169, 1)
      .setDepth(this.y + 10);

    this.scene.tweens.add({
      targets: healRing,
      radius: 55,
      alpha: 0,
      duration: 650,
      onComplete: () => healRing.destroy()
    });

    this.pickNextWanderAction();
    return true;
  }

  pickNextWanderAction() {
    // 60% chance to walk in a random direction, 40% chance to pause and idle
    if (Math.random() < 0.6) {
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const vx = Math.cos(angle) * this.walkSpeed;
      const vy = Math.sin(angle) * this.walkSpeed;
      this.body.setVelocity(vx, vy);
      this.setFlipX(vx < 0);
    } else {
      this.body.setVelocity(0, 0);
    }

    // Schedule next decision in 1.5s to 3.5s
    this.moveTimer = this.scene.time.now + Phaser.Math.Between(1500, 3500);
  }

  update(time) {
    // Keep floating badge synced above the NPC
    this.statusBadge.setPosition(this.x, this.y - (this.state === 'INJURED' ? 28 : 42));
    this.statusBadge.setDepth(this.y + 20);

    if (this.state !== 'WANDERING') return;

    // Gentle papercut hop animation while moving
    if (this.body.velocity.length() > 5) {
      this.y += Math.sin(time * 0.015) * 0.35;
    }

    if (time >= this.moveTimer) {
      this.pickNextWanderAction();
    }
  }
}