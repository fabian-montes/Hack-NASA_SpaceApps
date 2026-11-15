// game/src/scenes/MenuScene.js
export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.cameras.main;

    // Papercut Watercolor Palette
    this.palette = {
      paper: 0xf6f3ec,
      paperDark: 0xebe5d8,
      card: 0xfffdf8,
      ink: 0x1e2530,
      orange: 0xe05a36,
      cyan: 0x2a9d8f,
      green: 0x38a169,
      amber: 0xd69e2e
    };

    // Mission Configuration State (passed to WorldScene on launch)
    this.missionConfig = {
      mode: 'SURVIVORS', // 'SURVIVORS' (be rescued) | 'RESCUE' (rescue squad)
      planetKey: 'MARS', // 'MOON' | 'MARS' | 'CUSTOM'
      customPlanet: {
        name: 'KEPLER-442B',
        groundColor: 0x90cdf4,
        propTint: 0xb2f5ea,
        radiation: 'HIGH',
        gravity: '0.65G'
      },
      crew: ['commander', 'cadets', 'dog'] // Default active crew IDs
    };

    // Catalog Definitions (DRY)
    this.planetPresets = {
      MOON: {
        title: 'THE MOON',
        tag: 'LOW GRAVITY // HIGH RADIATION',
        groundColor: 0xcbd2d9,
        propTint: 0xe2e8f0,
        radiation: 'EXTREME',
        gravity: '0.16G'
      },
      MARS: {
        title: 'MARS',
        tag: 'DUST STORMS // COLD DESERT',
        groundColor: 0xd97254,
        propTint: 0xffd6c9,
        radiation: 'MODERATE',
        gravity: '0.38G'
      },
      CUSTOM: {
        title: 'CUSTOM WORLD',
        tag: 'CONFIGURABLE PARAMETERS',
        groundColor: 0x90cdf4,
        propTint: 0xb2f5ea,
        radiation: 'HIGH',
        gravity: '0.65G'
      }
    };

    this.customColorSwatches = [
      { label: 'GLACIAL CYAN', ground: 0x90cdf4, tint: 0xb2f5ea },
      { label: 'SULFUR OCHRE', ground: 0xd69e2e, tint: 0xfefcbf },
      { label: 'VIOLET NEBULA', ground: 0xb794f4, tint: 0xe9d8fd },
      { label: 'EMERALD SPORE', ground: 0x68d391, tint: 0xc6f6d5 }
    ];
    this.customSwatchIndex = 0;

    this.crewRoster = [
      { id: 'commander', name: 'COMMANDER', role: 'Leader / Builder', required: true },
      { id: 'cadets', name: 'JUNIOR CADET', role: 'Science & Scans', required: false },
      { id: 'specialist', name: 'BIO-ENGINEER', role: 'Hydroponics & O2', required: false },
      { id: 'dog', name: 'ASTRO-PUP', role: 'Morale & Scout', required: false },
      { id: 'roach', name: 'NASA ROACH', role: 'Rad-Sensor', required: false }
    ];

    // 1. Textured Paper Background
    this.add.grid(width * 0.5, height * 0.5, width, height, 48, 48, this.palette.paper, 1, this.palette.ink, 0.05);

    // 2. Top Mission Header
    this.add.text(width * 0.5, 34, 'CRASHLANDED // MISSION CONFIGURATION', {
      fontFamily: 'Space Grotesk, sans-serif',
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#1e2530'
    }).setOrigin(0.5);

    this.add.text(width * 0.5, 64, 'SELECT OBJECTIVE, PLANETARY PARAMETERS & EXPEDITION CREW', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#4a5568'
    }).setOrigin(0.5);

    // 3. Three-Column Papercut Setup Layout
    const colY = 92;
    const colH = 510;

    this.buildObjectiveColumn(40, colY, 370, colH);
    this.buildPlanetColumn(435, colY, 410, colH);
    this.buildCrewColumn(870, colY, 370, colH);

    // 4. Bottom Launch Button
    this.createLaunchButton(width * 0.5, height - 48);
  }

  // =========================================================================
  // COLUMN 1: MISSION OBJECTIVE (BE RESCUED vs. RESCUE SQUAD)
  // =========================================================================
  buildObjectiveColumn(x, y, w, h) {
    const container = this.add.container(x, y);
    this.drawPapercutCard(container, 0, 0, w, h);

    container.add(this.add.text(20, 18, '01 // MISSION OBJECTIVE', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#e05a36'
    }));

    const modes = [
      {
        key: 'SURVIVORS',
        title: 'BE RESCUED (SURVIVORS)',
        desc: 'Survive the crash landing. Brave solar storms, manage O2/Power, and trek toward the extraction beacon.'
      },
      {
        key: 'RESCUE',
        title: 'RESCUE SQUAD',
        desc: 'Race against the clock with finite supplies. Deploy telemetry probes to locate and save stranded crew.'
      }
    ];

    this.modeCards = [];

    modes.forEach((m, index) => {
      const cardY = 56 + index * 205;
      const cardH = 185;
      const itemBox = this.add.container(18, cardY);

      const bg = this.add.graphics();
      itemBox.add(bg);

      const titleTxt = this.add.text(16, 16, m.title, {
        fontFamily: 'Space Grotesk, sans-serif',
        fontSize: '16px',
        fontStyle: 'bold',
        color: '#1e2530'
      });

      const descTxt = this.add.text(16, 46, m.desc, {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '13px',
        color: '#4a5568',
        wordWrap: { width: w - 68 }
      });

      const statusBadge = this.add.text(16, cardH - 34, '', {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '11px',
        fontStyle: 'bold'
      });

      itemBox.add([titleTxt, descTxt, statusBadge]);

      const hit = this.add.zone((w - 36) * 0.5, cardH * 0.5, w - 36, cardH)
        .setInteractive({ useHandCursor: true });

      hit.on('pointerdown', () => {
        this.missionConfig.mode = m.key;
        this.refreshModeSelection();
      });
      itemBox.add(hit);

      container.add(itemBox);
      this.modeCards.push({ key: m.key, bg, statusBadge, width: w - 36, height: cardH });
    });

    this.refreshModeSelection();
  }

  refreshModeSelection() {
    this.modeCards.forEach((card) => {
      const selected = this.missionConfig.mode === card.key;
      card.bg.clear();
      card.bg.fillStyle(selected ? 0xfffdf8 : this.palette.paperDark, 1);
      card.bg.fillRoundedRect(0, 0, card.width, card.height, 8);
      card.bg.lineStyle(selected ? 3 : 1.5, selected ? this.palette.orange : this.palette.ink, 1);
      card.bg.strokeRoundedRect(0, 0, card.width, card.height, 8);

      card.statusBadge.setText(selected ? '● SELECTED DIRECTIVE' : '○ CLICK TO SELECT');
      card.statusBadge.setColor(selected ? '#e05a36' : '#4a5568');
    });
  }

  // =========================================================================
  // COLUMN 2: PLANET SELECTOR (MOON, MARS & CUSTOMIZABLE PLANET)
  // =========================================================================
  buildPlanetColumn(x, y, w, h) {
    const container = this.add.container(x, y);
    this.drawPapercutCard(container, 0, 0, w, h);

    container.add(this.add.text(20, 18, '02 // PLANETARY SECTOR', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#2a9d8f'
    }));

    // Planet Selector Tabs (Moon | Mars | Custom)
    const keys = ['MOON', 'MARS', 'CUSTOM'];
    this.planetTabs = [];

    keys.forEach((k, idx) => {
      const tabW = 114;
      const tabX = 20 + idx * (tabW + 14);
      const tabY = 50;

      const tabBg = this.add.graphics();
      const tabTxt = this.add.text(tabX + tabW * 0.5, tabY + 18, k, {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#1e2530'
      }).setOrigin(0.5);

      const zone = this.add.zone(tabX + tabW * 0.5, tabY + 18, tabW, 36)
        .setInteractive({ useHandCursor: true });

      zone.on('pointerdown', () => {
        this.missionConfig.planetKey = k;
        this.refreshPlanetDisplay();
      });

      container.add([tabBg, tabTxt, zone]);
      this.planetTabs.push({ key: k, bg: tabBg, txt: tabTxt, x: tabX, y: tabY, w: tabW, h: 36 });
    });

    // Planet Visual Preview Circle (Watercolor Sphere)
    this.planetSphereShadow = this.add.circle(w * 0.5 + 4, 178, 56, this.palette.ink, 1);
    this.planetSphere = this.add.circle(w * 0.5, 174, 56, 0xd97254, 1)
      .setStrokeStyle(3, this.palette.ink);
    container.add([this.planetSphereShadow, this.planetSphere]);

    this.planetTitleTxt = this.add.text(w * 0.5, 248, '', {
      fontFamily: 'Space Grotesk, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#1e2530'
    }).setOrigin(0.5);

    this.planetStatsTxt = this.add.text(w * 0.5, 282, '', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#4a5568',
      align: 'center'
    }).setOrigin(0.5);

    container.add([this.planetTitleTxt, this.planetStatsTxt]);

    // Custom Planet Controls (Shown only when 'CUSTOM' is selected)
    this.customControlsContainer = this.add.container(20, 325).setVisible(false);

    const customBox = this.add.graphics();
    customBox.fillStyle(this.palette.paperDark, 1);
    customBox.fillRoundedRect(0, 0, w - 40, 155, 8);
    customBox.lineStyle(1.5, this.palette.ink, 1);
    customBox.strokeRoundedRect(0, 0, w - 40, 155, 8);
    this.customControlsContainer.add(customBox);

    this.customControlsContainer.add(this.add.text(14, 12, 'CUSTOMIZE BIOME PARAMETERS:', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#1e2530'
    }));

    // Cycle Surface Color Button
    this.colorBtn = this.createMiniButton(this.customControlsContainer, 14, 42, w - 68, 32, '🎨 SURFACE COLOR: GLACIAL CYAN', () => {
      this.customSwatchIndex = (this.customSwatchIndex + 1) % this.customColorSwatches.length;
      const swatch = this.customColorSwatches[this.customSwatchIndex];
      this.planetPresets.CUSTOM.groundColor = swatch.ground;
      this.planetPresets.CUSTOM.propTint = swatch.tint;
      this.colorBtn.setText(`🎨 SURFACE COLOR: ${swatch.label}`);
      this.refreshPlanetDisplay();
    });

    // Cycle Radiation Level Button
    const radLevels = ['LOW', 'MODERATE', 'HIGH', 'EXTREME'];
    this.radBtn = this.createMiniButton(this.customControlsContainer, 14, 82, w - 68, 30, '☢ RADIATION: HIGH', () => {
      const next = radLevels[(radLevels.indexOf(this.planetPresets.CUSTOM.radiation) + 1) % radLevels.length];
      this.planetPresets.CUSTOM.radiation = next;
      this.radBtn.setText(`☢ RADIATION: ${next}`);
      this.refreshPlanetDisplay();
    });

    // Cycle Gravity Button
    const gravLevels = ['0.16G (LUNAR)', '0.38G (MARTIAN)', '0.65G (SUPER)', '1.00G (EARTH)'];
    this.gravBtn = this.createMiniButton(this.customControlsContainer, 14, 118, w - 68, 30, '⚖ GRAVITY: 0.65G (SUPER)', () => {
      const next = gravLevels[(gravLevels.indexOf(this.planetPresets.CUSTOM.gravity) + 1) % gravLevels.length];
      this.planetPresets.CUSTOM.gravity = next;
      this.gravBtn.setText(`⚖ GRAVITY: ${next}`);
      this.refreshPlanetDisplay();
    });

    container.add(this.customControlsContainer);
    this.refreshPlanetDisplay();
  }

  refreshPlanetDisplay() {
    const activeKey = this.missionConfig.planetKey;
    const data = this.planetPresets[activeKey];

    this.planetTabs.forEach((t) => {
      const isSelected = t.key === activeKey;
      t.bg.clear();
      t.bg.fillStyle(isSelected ? this.palette.cyan : this.palette.paperDark, 1);
      t.bg.fillRoundedRect(t.x, t.y, t.w, t.h, 6);
      t.bg.lineStyle(2, this.palette.ink, 1);
      t.bg.strokeRoundedRect(t.x, t.y, t.w, t.h, 6);
      t.txt.setColor(isSelected ? '#ffffff' : '#1e2530');
    });

    this.planetSphere.setFillStyle(data.groundColor);
    this.planetTitleTxt.setText(data.title);
    this.planetStatsTxt.setText(
      `${data.tag}\nRADIATION: ${data.radiation}  |  GRAVITY: ${data.gravity}`
    );

    this.customControlsContainer.setVisible(activeKey === 'CUSTOM');
  }

  // =========================================================================
  // COLUMN 3: CREW SELECTION (MAX 4 MEMBERS)
  // =========================================================================
  buildCrewColumn(x, y, w, h) {
    const container = this.add.container(x, y);
    this.drawPapercutCard(container, 0, 0, w, h);

    container.add(this.add.text(20, 18, '03 // EXPEDITION CREW (MAX 4)', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#1e2530'
    }));

    this.crewRows = [];

    this.crewRoster.forEach((member, idx) => {
      const rowY = 54 + idx * 84;
      const rowH = 72;
      const rowBox = this.add.container(18, rowY);

      const bg = this.add.graphics();
      const nameTxt = this.add.text(14, 12, member.name, {
        fontFamily: 'Space Grotesk, sans-serif',
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#1e2530'
      });

      const roleTxt = this.add.text(14, 34, member.role, {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '12px',
        color: '#4a5568'
      });

      const checkTxt = this.add.text(w - 54, rowH * 0.5, '', {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '12px',
        fontStyle: 'bold'
      }).setOrigin(1, 0.5);

      rowBox.add([bg, nameTxt, roleTxt, checkTxt]);

      const hit = this.add.zone((w - 36) * 0.5, rowH * 0.5, w - 36, rowH)
        .setInteractive({ useHandCursor: true });

      hit.on('pointerdown', () => {
        if (member.required) return; // Commander is mandatory

        const exists = this.missionConfig.crew.includes(member.id);
        if (exists) {
          this.missionConfig.crew = this.missionConfig.crew.filter((id) => id !== member.id);
        } else if (this.missionConfig.crew.length < 4) {
          this.missionConfig.crew.push(member.id);
        }
        this.refreshCrewSelection();
      });

      rowBox.add(hit);
      container.add(rowBox);
      this.crewRows.push({ member, bg, checkTxt, width: w - 36, height: rowH });
    });

    this.refreshCrewSelection();
  }

  refreshCrewSelection() {
    this.crewRows.forEach((row) => {
      const active = this.missionConfig.crew.includes(row.member.id);
      row.bg.clear();
      row.bg.fillStyle(active ? 0xfffdf8 : this.palette.paperDark, 1);
      row.bg.fillRoundedRect(0, 0, row.width, row.height, 8);
      row.bg.lineStyle(active ? 2.5 : 1.5, active ? this.palette.green : this.palette.ink, 1);
      row.bg.strokeRoundedRect(0, 0, row.width, row.height, 8);

      if (row.member.required) {
        row.checkTxt.setText('[LEADER]');
        row.checkTxt.setColor('#e05a36');
      } else {
        row.checkTxt.setText(active ? '[✓ ACTIVE]' : '[+ ADD]');
        row.checkTxt.setColor(active ? '#38a169' : '#4a5568');
      }
    });
  }

  // =========================================================================
  // LAUNCH MISSION CTA & HELPERS
  // =========================================================================
  createLaunchButton(x, y) {
    const btnW = 340;
    const btnH = 54;
    const container = this.add.container(x - btnW * 0.5, y - btnH * 0.5);

    const gfx = this.add.graphics();
    gfx.fillStyle(this.palette.ink, 1);
    gfx.fillRoundedRect(4, 4, btnW, btnH, 10);
    gfx.fillStyle(this.palette.orange, 1);
    gfx.fillRoundedRect(0, 0, btnW, btnH, 10);
    gfx.lineStyle(2.5, this.palette.ink, 1);
    gfx.strokeRoundedRect(0, 0, btnW, btnH, 10);

    const label = this.add.text(btnW * 0.5, btnH * 0.5, '▶ LAUNCH EXPEDITION', {
      fontFamily: 'Space Grotesk, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);

    const hit = this.add.zone(btnW * 0.5, btnH * 0.5, btnW, btnH)
      .setInteractive({ useHandCursor: true });

    hit.on('pointerdown', () => {
      const selectedPlanet = this.planetPresets[this.missionConfig.planetKey];

      // Start WorldScene passing the player's chosen objective, planet & crew
      this.scene.start('WorldScene', {
        mode: this.missionConfig.mode,
        planet: selectedPlanet,
        crew: this.missionConfig.crew
      });
    });

    container.add([gfx, label, hit]);
  }

  drawPapercutCard(container, x, y, w, h) {
    const gfx = this.add.graphics();
    gfx.fillStyle(this.palette.ink, 1);
    gfx.fillRoundedRect(x + 5, y + 5, w, h, 12);
    gfx.fillStyle(this.palette.paper, 1);
    gfx.fillRoundedRect(x, y, w, h, 12);
    gfx.lineStyle(2.5, this.palette.ink, 1);
    gfx.strokeRoundedRect(x, y, w, h, 12);
    container.add(gfx);
  }

  createMiniButton(parent, x, y, w, h, text, onClick) {
    const bg = this.add.graphics();
    bg.fillStyle(0xfffdf8, 1);
    bg.fillRoundedRect(x, y, w, h, 6);
    bg.lineStyle(1.5, this.palette.ink, 1);
    bg.strokeRoundedRect(x, y, w, h, 6);

    const label = this.add.text(x + 12, y + h * 0.5, text, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#1e2530'
    }).setOrigin(0, 0.5);

    const zone = this.add.zone(x + w * 0.5, y + h * 0.5, w, h)
      .setInteractive({ useHandCursor: true });
    zone.on('pointerdown', onClick);

    parent.add([bg, label, zone]);
    return label;
  }
}