// game/src/scenes/WorldScene.js
import { Character } from '../entities/Character.js';
import { PlanetGround } from '../systems/PlanetGround.js';
import { MapGenerator } from '../systems/MapGenerator.js';
import { CommsProbe } from '../entities/CommsProbe.js';
import { BuildSystem } from '../systems/BuildSystem.js';
import { CrewNPC } from '../entities/CrewNPC.js';

const PLANET_THEMES = {
  MARS:   { ground: 0xd97254, propTint: 0xffd6c9 },
  MOON:   { ground: 0xcbd2d9, propTint: 0xe2e8f0 },
  EUROPA: { ground: 0x90cdf4, propTint: 0xb2f5ea },
  TITAN:  { ground: 0xd69e2e, propTint: 0xfefcbf }
};

export class WorldScene extends Phaser.Scene {
  constructor() {
    super('WorldScene');
  }

  init(data) {
    this.missionData = data || {
      mode: 'SURVIVORS',
      planet: { title: 'MARS', groundColor: 0xd97254, propTint: 0xffd6c9 },
      crew: ['commander']
    };
  }

  preload() {
    CrewNPC.preload(this);
    Character.preload(this);
    MapGenerator.preload(this);
    CommsProbe.preload(this);
  }

  create() {
    const WORLD_WIDTH = 2400;
    const WORLD_HEIGHT = 2400;
    const currentPlanet = PLANET_THEMES.MARS;

    // 1. World Boundaries
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // 2. Procedural Watercolor Ground
    this.ground = new PlanetGround(
      this,
      WORLD_WIDTH,
      WORLD_HEIGHT,
      this.missionData.planet.groundColor
    );

    // 3. Procedural Environment Props (Rocks, Trees, Vegetation)
    const mapGen = new MapGenerator(
      this,
      WORLD_WIDTH,
      WORLD_HEIGHT,
      currentPlanet.propTint
    );
    const obstacles = mapGen.generate({ x: 1200, y: 1200, radius: 240 });

    // 4. Player Character & Collisions
    this.player = new Character(this, 1200, 1200);
    this.physics.add.collider(this.player, obstacles);
    this.buildSystem = new BuildSystem(this, this.player, obstacles);
    this.physics.add.collider(this.player, this.buildSystem.deployedProbes);

    // 5. Camera Follow
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    // 6. Debug HUD
    this.debugText = this.add.text(20, 20, '', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '14px',
      color: '#1e2530',
      backgroundColor: '#ebe5d8',
      padding: { x: 10, y: 8 }
    }).setScrollFactor(0).setDepth(9999);

    this.scene.launch('UIScene');
    this.createFullscreenButton();
    this.spawnCrewMembers(WORLD_WIDTH, WORLD_HEIGHT, obstacles);
  }

  update(time) {
    this.player.update();
    this.buildSystem.update();

    const currentAnim = this.player.anims.currentAnim
      ? this.player.anims.currentAnim.key.toUpperCase()
      : 'IDLE';

    this.debugText.setText([
      'OUTPOST HORIZONS // PROCEDURAL BIOME TEST',
      'Controls: [ARROW KEYS] Move | [SPACE] Build',
      `State: ${currentAnim}`,
      `O2: ${this.player.stats.oxygen}% | PWR: ${this.player.stats.power}%`
    ]);

    this.crewGroup.getChildren().forEach((npc) => npc.update(time));
  }

  createFullscreenButton() {
    const { width } = this.cameras.main;

    const fsButton = this.add.text(width - 20, 20, '[ ⛶ FULLSCREEN ]', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffffff',
      backgroundColor: '#e05a36',
      padding: { x: 12, y: 8 }
    })
    .setOrigin(1, 0)
    .setScrollFactor(0)
    .setDepth(9999)
    .setInteractive({ useHandCursor: true });

    const toggleScreen = () => {
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    };

    fsButton.on('pointerdown', toggleScreen);

    // Update button label automatically when entering/exiting fullscreen (including ESC key)
    this.scale.on('enterfullscreen', () => fsButton.setText('[ ✕ EXIT FULLSCREEN ]'));
    this.scale.on('leavefullscreen', () => fsButton.setText('[ ⛶ FULLSCREEN ]'));

    // Optional keyboard shortcut: 'F' key
    this.input.keyboard.on('keydown-F', toggleScreen);
  }

  spawnCrewMembers(worldW, worldH, obstacles) {
    this.crewGroup = this.physics.add.group();

    // Spawn selected crew (excluding 'commander' which is the player) or default survivors
    const npcIds = (this.missionData.crew || ['cadets', 'specialist', 'dog'])
      .filter((id) => id !== 'commander');

    npcIds.forEach((id, idx) => {
      const angle = (idx / Math.max(1, npcIds.length)) * Math.PI * 2;
      const dist = Phaser.Math.Between(220, 480);
      const sx = Phaser.Math.Clamp(this.player.x + Math.cos(angle) * dist, 150, worldW - 150);
      const sy = Phaser.Math.Clamp(this.player.y + Math.sin(angle) * dist, 150, worldH - 150);

      const npc = new CrewNPC(this, sx, sy, id);
      npc.setInteractive({ useHandCursor: true });

      // Allow healing via tap/click when close (supports mobile & mouse)
      npc.on('pointerdown', () => {
        if (Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y) <= 95) {
          npc.heal();
        }
      });

      this.crewGroup.add(npc);
    });

    // Prevent healed NPCs from walking through rocks or trees
    this.physics.add.collider(this.crewGroup, obstacles);

    // Desktop 'E' key interaction to heal nearby injured crew
    this.input.keyboard.on('keydown-E', () => {
      this.crewGroup.getChildren().forEach((npc) => {
        if (npc.state === 'INJURED' &&
            Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y) <= 95) {
          this.player.play('build', true);
          npc.heal();
        }
      });
    });
  }
}