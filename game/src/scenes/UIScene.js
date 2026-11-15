// game/src/scenes/UIScene.js
export class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  create() {
    const { width, height } = this.cameras.main;

    // Mock UI state (ready to be connected to ResourceManager / MissionManager later)
    this.uiState = {
      health: 88,
      hunger: 74,
      solDay: 'SOL 01 // 08:40',
      missionProgress: 0.42, // 42% toward extraction beacon
      activeEvent: 'SOLAR FLARE WATCH (M-CLASS)',
      tasks: [
        { text: 'Reach Extraction Beacon (640m)', done: false },
        { text: 'Scan North Crater Regolith', done: true },
        { text: 'Maintain Suit Integrity > 50%', done: false }
      ],
      inventorySlots: 8
    };

    // Papercut Watercolor Palette
    this.palette = {
      paper: 0xf6f3ec,
      paperDark: 0xebe5d8,
      ink: 0x1e2530,
      orange: 0xe05a36,
      red: 0xc53030,
      amber: 0xd69e2e,
      cyan: 0x2a9d8f,
      green: 0x38a169
    };

    this.createInsightsPanel(20, 20);
    this.createVitalsHUD(width - 140, 62);
    this.createInventoryBar(width * 0.5, height - 46);

    this.createWorldMapOverlay(width, height);
  }

  // =========================================================================
  // 1. TOP-LEFT: MINIMALIST INTELLIGENCE INSIGHTS (DATE, PROGRESS, EVENTS, TASKS)
  // =========================================================================
  createInsightsPanel(x, y) {
    const panelW = 295;
    const panelH = 188;
    const container = this.add.container(x, y);

    // Papercut shadow + background card
    const bg = this.add.graphics();
    bg.fillStyle(this.palette.ink, 1);
    bg.fillRoundedRect(4, 4, panelW, panelH, 10);
    bg.fillStyle(this.palette.paper, 0.95);
    bg.fillRoundedRect(0, 0, panelW, panelH, 10);
    bg.lineStyle(2, this.palette.ink, 1);
    bg.strokeRoundedRect(0, 0, panelW, panelH, 10);
    container.add(bg);

    // Date / Sol Header
    const dateText = this.add.text(14, 12, `📅 ${this.uiState.solDay}`, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#1e2530'
    });
    container.add(dateText);

    // Event Pill (NASA DONKI Space Weather Alert)
    const eventBg = this.add.graphics();
    eventBg.fillStyle(this.palette.orange, 0.16);
    eventBg.fillRoundedRect(12, 34, panelW - 24, 24, 5);
    eventBg.lineStyle(1.5, this.palette.orange, 1);
    eventBg.strokeRoundedRect(12, 34, panelW - 24, 24, 5);
    container.add(eventBg);

    const eventText = this.add.text(20, 40, `⚡ ${this.uiState.activeEvent}`, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#c53030'
    });
    container.add(eventText);

    // Mission Progress Bar
    const pct = Math.round(this.uiState.missionProgress * 100);
    const progLabel = this.add.text(14, 66, `MISSION PROGRESS: ${pct}%`, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#4a5568'
    });
    container.add(progLabel);

    const barW = panelW - 28;
    const progBar = this.add.graphics();
    progBar.fillStyle(this.palette.paperDark, 1);
    progBar.fillRoundedRect(14, 82, barW, 10, 4);
    progBar.fillStyle(this.palette.cyan, 1);
    progBar.fillRoundedRect(14, 82, barW * this.uiState.missionProgress, 10, 4);
    progBar.lineStyle(1.5, this.palette.ink, 1);
    progBar.strokeRoundedRect(14, 82, barW, 10, 4);
    container.add(progBar);

    // Active Tasks List
    const taskHeader = this.add.text(14, 102, 'ACTIVE DIRECTIVES:', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#1e2530'
    });
    container.add(taskHeader);

    this.uiState.tasks.forEach((task, idx) => {
      const prefix = task.done ? '☑' : '☐';
      const color = task.done ? '#2a9d8f' : '#1e2530';
      const item = this.add.text(14, 118 + idx * 20, `${prefix} ${task.text}`, {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
        color
      });
      container.add(item);
    });
  }

  // =========================================================================
  // 2. TOP-RIGHT: DON'T STARVE STYLE VITALS BADGES (HEALTH & HUNGER)
  // =========================================================================
  createVitalsHUD(startX, y) {
    // Health Medallion
    this.healthBadge = this.createCircularMeter(
      startX,
      y,
      28,
      this.uiState.health,
      this.palette.red,
      '♥',
      'HP'
    );

    // Hunger Medallion
    this.hungerBadge = this.createCircularMeter(
      startX + 74,
      y,
      28,
      this.uiState.hunger,
      this.palette.amber,
      '🍖',
      'HUNGER'
    );
  }

  createCircularMeter(x, y, radius, value, fillColor, icon, label) {
    const container = this.add.container(x, y);

    // Hard papercut offset shadow
    const shadow = this.add.circle(3, 3, radius, this.palette.ink, 1);
    container.add(shadow);

    // Dark interior background
    const backCircle = this.add.circle(0, 0, radius, this.palette.paperDark, 1);
    container.add(backCircle);

    // Dynamic vertical fill level (Don't Starve style draining from top)
    const fillGfx = this.add.graphics();
    const drawFill = (pct) => {
      fillGfx.clear();
      const clamped = Phaser.Math.Clamp(pct, 0, 100) / 100;
      const fillHeight = radius * 2 * clamped;
      const topY = radius - fillHeight;

      fillGfx.fillStyle(fillColor, 0.9);
      fillGfx.fillRect(-radius, topY, radius * 2, fillHeight);
    };
    drawFill(value);

    // Circular mask so the liquid fill stays inside the medallion
    const maskShape = this.make.graphics({ x, y, add: false });
    maskShape.fillStyle(0xffffff);
    maskShape.fillCircle(0, 0, radius - 1);
    fillGfx.setMask(maskShape.createGeometryMask());
    container.add(fillGfx);

    // Ink border ring
    const ring = this.add.graphics();
    ring.lineStyle(2.5, this.palette.ink, 1);
    ring.strokeCircle(0, 0, radius);
    container.add(ring);

    // Center icon & numeric value
    const iconTxt = this.add.text(0, -5, icon, {
      fontSize: '16px',
      color: '#ffffff',
      stroke: '#1e2530',
      strokeThickness: 3
    }).setOrigin(0.5);

    const valTxt = this.add.text(0, 12, `${value}`, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#1e2530',
      strokeThickness: 3
    }).setOrigin(0.5);

    const tagTxt = this.add.text(0, radius + 11, label, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '9px',
      fontStyle: 'bold',
      color: '#1e2530',
      backgroundColor: '#f6f3ec',
      padding: { x: 4, y: 1 }
    }).setOrigin(0.5);

    container.add([iconTxt, valTxt, tagTxt]);

    return { container, drawFill, valTxt };
  }

  // =========================================================================
  // 3. BOTTOM-CENTER: PAPERCUT INVENTORY HOTBAR (8 SLOTS)
  // =========================================================================
  createInventoryBar(centerX, bottomY) {
    const slots = this.uiState.inventorySlots;
    const slotSize = 46;
    const gap = 8;
    const pad = 10;
    const totalW = slots * slotSize + (slots - 1) * gap + pad * 2;
    const totalH = slotSize + pad * 2;

    const container = this.add.container(centerX - totalW * 0.5, bottomY - totalH * 0.5);

    // Tray papercut shadow + card
    const tray = this.add.graphics();
    tray.fillStyle(this.palette.ink, 1);
    tray.fillRoundedRect(4, 4, totalW, totalH, 10);
    tray.fillStyle(this.palette.paper, 0.96);
    tray.fillRoundedRect(0, 0, totalW, totalH, 10);
    tray.lineStyle(2, this.palette.ink, 1);
    tray.strokeRoundedRect(0, 0, totalW, totalH, 10);
    container.add(tray);

    // Individual empty slots (ready for items later)
    for (let i = 0; i < slots; i++) {
      const sx = pad + i * (slotSize + gap);
      const sy = pad;

      const slotBox = this.add.graphics();
      slotBox.fillStyle(this.palette.paperDark, 1);
      slotBox.fillRoundedRect(sx, sy, slotSize, slotSize, 6);
      slotBox.lineStyle(1.5, this.palette.ink, 0.85);
      slotBox.strokeRoundedRect(sx, sy, slotSize, slotSize, 6);
      container.add(slotBox);

      // Slot hotkey number (1 - 8)
      const numLabel = this.add.text(sx + 5, sy + 3, `${i + 1}`, {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '9px',
        fontStyle: 'bold',
        color: '#4a5568'
      });
      container.add(numLabel);
    }
  }

  // =========================================================================
  // 4. COLLAPSIBLE TACTICAL WORLD MAP OVERLAY (BUTTON + 'M' KEY)
  // =========================================================================
  createWorldMapOverlay(screenW, screenH) {
    this.isMapOpen = false;

    // 1. Toggle Button (Bottom-Right Corner)
    const btnW = 138;
    const btnH = 42;
    const btnX = screenW - btnW - 20;
    const btnY = screenH - btnH - 24;

    const btnContainer = this.add.container(btnX, btnY).setDepth(200);

    const btnBg = this.add.graphics();
    btnBg.fillStyle(this.palette.ink, 1);
    btnBg.fillRoundedRect(3, 3, btnW, btnH, 8);
    btnBg.fillStyle(this.palette.paper, 0.98);
    btnBg.fillRoundedRect(0, 0, btnW, btnH, 8);
    btnBg.lineStyle(2, this.palette.ink, 1);
    btnBg.strokeRoundedRect(0, 0, btnW, btnH, 8);
    btnContainer.add(btnBg);

    this.mapBtnLabel = this.add.text(btnW * 0.5, btnH * 0.5, '🗺️ MAP [M]', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#1e2530'
    }).setOrigin(0.5);
    btnContainer.add(this.mapBtnLabel);

    // Hit area for mouse / touch toggle
    const hitZone = this.add.zone(btnW * 0.5, btnH * 0.5, btnW, btnH)
      .setInteractive({ useHandCursor: true });
    hitZone.on('pointerdown', () => this.toggleWorldMap());
    btnContainer.add(hitZone);

    // Keyboard shortcut ('M' key)
    this.input.keyboard.on('keydown-M', () => this.toggleWorldMap());

    // 2. Full Collapsible Map Modal (Centered on Screen, Hidden by Default)
    const mapW = 540;
    const mapH = 400;
    const mapX = (screenW - mapW) * 0.5;
    const mapY = (screenH - mapH) * 0.5 - 10;

    this.mapModal = this.add.container(mapX, mapY)
      .setDepth(500)
      .setVisible(false);

    // Papercut card frame
    const card = this.add.graphics();
    card.fillStyle(this.palette.ink, 1);
    card.fillRoundedRect(6, 6, mapW, mapH, 12);
    card.fillStyle(this.palette.paper, 0.98);
    card.fillRoundedRect(0, 0, mapW, mapH, 12);
    card.lineStyle(2.5, this.palette.ink, 1);
    card.strokeRoundedRect(0, 0, mapW, mapH, 12);
    this.mapModal.add(card);

    // Header Title & Close Hint
    const title = this.add.text(18, 14, 'SECTOR RECON MAP // MARS QUADRANT 04', {
      fontFamily: 'Space Grotesk, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#1e2530'
    });

    const closeBtn = this.add.text(mapW - 18, 15, '[ ✕ CLOSE ]', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#e05a36'
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.toggleWorldMap());

    this.mapModal.add([title, closeBtn]);

    // Inner Terrain Canvas (Pale Watercolor Martian Sector)
    const innerX = 18;
    const innerY = 44;
    const innerW = mapW - 36;
    const innerH = mapH - 96;

    const mapCanvas = this.add.graphics();
    mapCanvas.fillStyle(0xe8a590, 0.45); // Pale Martian watercolor surface
    mapCanvas.fillRoundedRect(innerX, innerY, innerW, innerH, 8);

    // Topographic contour circles & grid lines
    mapCanvas.lineStyle(1, this.palette.ink, 0.14);
    for (let gx = innerX + 45; gx < innerX + innerW; gx += 45) {
      mapCanvas.lineBetween(gx, innerY, gx, innerY + innerH);
    }
    for (let gy = innerY + 45; gy < innerY + innerH; gy += 45) {
      mapCanvas.lineBetween(innerX, gy, innerX + innerW, gy);
    }

    // Sketched crater rings
    mapCanvas.lineStyle(1.5, this.palette.ink, 0.25);
    mapCanvas.strokeCircle(innerX + 140, innerY + 95, 42);
    mapCanvas.strokeCircle(innerX + 360, innerY + 190, 58);
    mapCanvas.strokeCircle(innerX + 260, innerY + 70, 24);

    // Dashed route path from Crash Site to Extraction Beacon
    mapCanvas.lineStyle(2, this.palette.cyan, 0.85);
    mapCanvas.beginPath();
    mapCanvas.moveTo(innerX + 110, innerY + 210);
    mapCanvas.lineTo(innerX + 240, innerY + 150);
    mapCanvas.lineTo(innerX + 410, innerY + 75);
    mapCanvas.strokePath();

    // Inner map border
    mapCanvas.lineStyle(2, this.palette.ink, 1);
    mapCanvas.strokeRoundedRect(innerX, innerY, innerW, innerH, 8);
    this.mapModal.add(mapCanvas);

    // Map Markers (Crash Site, Commander, Extraction Beacon, Anomaly)
    this.addMapPin(innerX + 110, innerY + 210, this.palette.orange, 'CRASH SITE');
    this.addMapPin(innerX + 240, innerY + 150, this.palette.cyan, 'YOU (COMMANDER)');
    this.addMapPin(innerX + 410, innerY + 75, this.palette.green, 'EXTRACTION');
    this.addMapPin(innerX + 355, innerY + 195, this.palette.amber, '? RELIC SIGNAL');

    // Bottom Legend Bar
    const legend = this.add.text(
      18,
      mapH - 36,
      '● CRASHLANDING   ● COMMANDER   ● EXTRACTION POINT   ● ANOMALY',
      {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#4a5568'
      }
    );
    this.mapModal.add(legend);
  }

  addMapPin(x, y, color, label) {
    const pin = this.add.circle(x, y, 6, color, 1)
      .setStrokeStyle(2, this.palette.ink);

    const tag = this.add.text(x, y - 14, label, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '9px',
      fontStyle: 'bold',
      color: '#1e2530',
      backgroundColor: '#f6f3ec',
      padding: { x: 4, y: 1 }
    }).setOrigin(0.5);

    this.mapModal.add([pin, tag]);
  }

  toggleWorldMap() {
    this.isMapOpen = !this.isMapOpen;
    this.mapModal.setVisible(this.isMapOpen);
    this.mapBtnLabel.setText(this.isMapOpen ? '✕ CLOSE [M]' : '🗺️ MAP [M]');
  }
}