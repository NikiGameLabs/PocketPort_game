import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, THEME, PORTS, CRATE_TYPES } from '../config/gameConfig.js';
import { Forklift } from '../entities/Forklift.js';
import { HelperForklift } from '../entities/HelperForklift.js';
import { CargoShip } from '../entities/CargoShip.js';
import { TruckBay } from '../entities/TruckBay.js';
import { sounds } from '../audio/SoundManager.js';
import { sdk } from '../sdk/PlayablesSDK.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.portId = data.portId || 1;
    this.portIndex = Math.max(0, Math.min(this.portId - 1, PORTS.length - 1));
    this.portConfig = PORTS[this.portIndex];

    this.pointerTarget = null;
    this.boostActive = false;
    this.boostTimer = 0;
    this.isPortCompleted = false;

    // Load progress
    this.progress = sdk.loadGameProgress();
    this.cash = this.progress.cash || 100;
    this.speedLevel = this.progress.speedLevel || 1;
    this.capacityLevel = this.progress.capacityLevel || 1;
    this.hasHelper = this.progress.hasHelper || false;
    this.revenueEarnedThisPort = 0;
  }

  create() {
    // Setup Graphics layers
    this.bgGraphics = this.add.graphics();
    this.worldGraphics = this.add.graphics();

    // Setup Entities
    this.ship = new CargoShip(this, this.portConfig);
    this.player = new Forklift(this, 480, 360);
    this.player.setSpeedLevel(this.speedLevel);
    this.player.setCapacityLevel(this.capacityLevel);

    if (this.hasHelper) {
      this.helper = new HelperForklift(this, 520, 420);
    }

    // Setup Truck Bays
    this.truckBays = this.portConfig.trucks.map(t => new TruckBay(t));

    // Crate Pad State
    this.dockZone = {
      ...this.portConfig.dockZone,
      crates: [...this.portConfig.allowedCrates, ...this.portConfig.allowedCrates],
      spawnTimer: 0
    };

    // Keyboard controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // Touch / Mouse controls
    this.input.on('pointerdown', (pointer) => {
      if (pointer.y < 620 && pointer.y > 70) {
        this.pointerTarget = { x: pointer.x, y: pointer.y };
      }
    });
    this.input.on('pointermove', (pointer) => {
      if (this.pointerTarget && pointer.isDown) {
        this.pointerTarget = { x: pointer.x, y: pointer.y };
      }
    });
    this.input.on('pointerup', () => {
      this.pointerTarget = null;
    });

    // Build HUD & Upgrade Drawer
    this.createHUD();
    this.createUpgradeBar();

    // Setup lifecycle handlers
    sdk.setupLifecycleHandlers(
      () => { this.scene.pause(); },
      () => { this.scene.resume(); }
    );
  }

  createHUD() {
    // Top Bar Background
    const topBar = this.add.graphics();
    topBar.fillStyle(0x0f172a, 0.92);
    topBar.fillRect(0, 0, GAME_WIDTH, 68);
    topBar.lineStyle(2, 0x334155, 1);
    topBar.lineBetween(0, 68, GAME_WIDTH, 68);

    // Port Title & Subtitle
    this.add.text(25, 14, `PORT ${this.portConfig.id}: ${this.portConfig.name.toUpperCase()}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '20px',
      fontWeight: '900',
      color: '#fbbf24',
      letterSpacing: 1.5
    });

    this.add.text(25, 40, this.portConfig.subtitle, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '13px',
      fontWeight: '500',
      color: '#94a3b8'
    });

    // Cash Display Widget
    const cashContainer = this.add.container(480, 34);
    const cashBg = this.add.graphics();
    cashBg.fillStyle(0x064e3b, 0.9);
    cashBg.lineStyle(1.5, 0x10b981, 0.8);
    cashBg.fillRoundedRect(-75, -20, 150, 40, 10);
    cashBg.strokeRoundedRect(-75, -20, 150, 40, 10);
    cashContainer.add(cashBg);

    this.cashText = this.add.text(0, 0, `$${this.cash}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '18px',
      fontWeight: '900',
      color: '#34d399'
    }).setOrigin(0.5);
    cashContainer.add(this.cashText);

    // Port Completion Progress Bar
    const progressX = 660;
    this.add.text(progressX, 16, 'PORT CAPACITY', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      fontWeight: '700',
      color: '#94a3b8'
    });

    this.progressBarBg = this.add.graphics();
    this.progressBarBg.fillStyle(0x1e293b, 1);
    this.progressBarBg.fillRoundedRect(progressX, 34, 150, 16, 6);

    this.progressBar = this.add.graphics();
    this.updateProgressBar();

    // 2x Boost Rewarded Ad Button
    this.boostBtn = this.add.container(890, 34);
    const boostBg = this.add.graphics();
    boostBg.fillStyle(0xb45309, 1);
    boostBg.lineStyle(1.5, 0xfbbf24, 0.9);
    boostBg.fillRoundedRect(-65, -18, 130, 36, 8);
    boostBg.strokeRoundedRect(-65, -18, 130, 36, 8);
    this.boostBtn.add(boostBg);

    this.boostLabel = this.add.text(0, 0, '⚡ 2X BOOST (AD)', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      fontWeight: '900',
      color: '#fef08a'
    }).setOrigin(0.5);
    this.boostBtn.add(this.boostLabel);

    this.boostBtn.setSize(130, 36);
    this.boostBtn.setInteractive({ useHandCursor: true });
    this.boostBtn.on('pointerdown', () => this.activateBoost());

    // Menu Button
    const menuBtn = this.add.container(GAME_WIDTH - 40, 34);
    const menuBg = this.add.graphics();
    menuBg.fillStyle(0x1e293b, 1);
    menuBg.lineStyle(1.5, 0x38bdf8, 0.7);
    menuBg.fillRoundedRect(-18, -18, 36, 36, 8);
    menuBg.strokeRoundedRect(-18, -18, 36, 36, 8);
    menuBtn.add(menuBg);
    menuBtn.add(this.add.text(0, 0, '✕', { fontSize: '18px', color: '#38bdf8' }).setOrigin(0.5));
    menuBtn.setSize(36, 36);
    menuBtn.setInteractive({ useHandCursor: true });
    menuBtn.on('pointerdown', () => {
      sounds.playClick();
      this.saveCurrentProgress();
      this.scene.start('MenuScene');
    });
  }

  createUpgradeBar() {
    const barY = GAME_HEIGHT - 65;

    // Bottom Bar Background
    const barBg = this.add.graphics();
    barBg.fillStyle(0x0f172a, 0.95);
    barBg.fillRect(0, barY - 10, GAME_WIDTH, 75);
    barBg.lineStyle(2, 0x334155, 1);
    barBg.lineBetween(0, barY - 10, GAME_WIDTH, barY - 10);

    // Upgrade 1: Speed
    const speedCost = this.speedLevel * 100;
    this.speedBtn = this.createUpgradeButton(
      180, barY + 22,
      '⚡ ENGINE SPEED',
      `Lvl ${this.speedLevel} (${220 + (this.speedLevel - 1) * 45} px/s)`,
      `$${speedCost}`,
      () => this.upgradeSpeed()
    );

    // Upgrade 2: Capacity
    const capCost = this.capacityLevel * 150;
    this.capBtn = this.createUpgradeButton(
      520, barY + 22,
      '📦 STACK CAPACITY',
      `Lvl ${this.capacityLevel} (Max ${1 + this.capacityLevel} crates)`,
      `$${capCost}`,
      () => this.upgradeCapacity()
    );

    // Upgrade 3: AI Helper
    const helperCost = 250;
    this.helperBtn = this.createUpgradeButton(
      860, barY + 22,
      '🤖 HIRE AI HELPER',
      this.hasHelper ? 'Active (Autonomous)' : 'Unemployed',
      this.hasHelper ? 'OWNED' : `$${helperCost}`,
      () => this.buyHelper()
    );
  }

  createUpgradeButton(x, y, title, sub, cost, callback) {
    const width = 290;
    const height = 52;
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x1e293b, 0.9);
    bg.lineStyle(1.5, 0x475569, 0.8);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);
    container.add(bg);

    const titleTxt = this.add.text(-width / 2 + 15, -14, title, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '13px',
      fontWeight: '800',
      color: '#f8fafc'
    });
    container.add(titleTxt);

    const subTxt = this.add.text(-width / 2 + 15, 4, sub, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      color: '#94a3b8'
    });
    container.add(subTxt);

    const costBadge = this.add.container(width / 2 - 45, 0);
    const badgeBg = this.add.graphics();
    badgeBg.fillStyle(0x78350f, 1);
    badgeBg.lineStyle(1, 0xfbbf24, 0.7);
    badgeBg.fillRoundedRect(-35, -14, 70, 28, 6);
    badgeBg.strokeRoundedRect(-35, -14, 70, 28, 6);
    costBadge.add(badgeBg);

    const costTxt = this.add.text(0, 0, cost, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      fontWeight: '900',
      color: '#fef08a'
    }).setOrigin(0.5);
    costBadge.add(costTxt);
    container.add(costBadge);

    container.setSize(width, height);
    container.setInteractive({ useHandCursor: true });
    container.on('pointerdown', callback);
    container.on('pointerover', () => container.setScale(1.02));
    container.on('pointerout', () => container.setScale(1.0));

    container.subTxt = subTxt;
    container.costTxt = costTxt;
    return container;
  }

  upgradeSpeed() {
    const cost = this.speedLevel * 100;
    if (this.cash >= cost) {
      this.cash -= cost;
      this.speedLevel++;
      this.player.setSpeedLevel(this.speedLevel);
      sounds.playUpgrade();
      this.showFloatingText(this.player.x, this.player.y, 'SPEED UPGRADED!');

      const nextCost = this.speedLevel * 100;
      this.speedBtn.subTxt.setText(`Lvl ${this.speedLevel} (${220 + (this.speedLevel - 1) * 45} px/s)`);
      this.speedBtn.costTxt.setText(`$${nextCost}`);
      this.updateHUDValues();
      this.saveCurrentProgress();
    }
  }

  upgradeCapacity() {
    const cost = this.capacityLevel * 150;
    if (this.cash >= cost) {
      this.cash -= cost;
      this.capacityLevel++;
      this.player.setCapacityLevel(this.capacityLevel);
      sounds.playUpgrade();
      this.showFloatingText(this.player.x, this.player.y, `CAPACITY +1 (MAX ${1 + this.capacityLevel})`);

      const nextCost = this.capacityLevel * 150;
      this.capBtn.subTxt.setText(`Lvl ${this.capacityLevel} (Max ${1 + this.capacityLevel} crates)`);
      this.capBtn.costTxt.setText(`$${nextCost}`);
      this.updateHUDValues();
      this.saveCurrentProgress();
    }
  }

  buyHelper() {
    if (!this.hasHelper && this.cash >= 250) {
      this.cash -= 250;
      this.hasHelper = true;
      this.helper = new HelperForklift(this, 520, 420);
      sounds.playUpgrade();
      this.showFloatingText(this.helper.x, this.helper.y, 'AI HELPER HIRED!');

      this.helperBtn.subTxt.setText('Active (Autonomous)');
      this.helperBtn.costTxt.setText('OWNED');
      this.updateHUDValues();
      this.saveCurrentProgress();
    }
  }

  activateBoost() {
    sdk.showRewardedAd(() => {
      this.boostActive = true;
      this.boostTimer = 15; // 15 seconds 2x boost
      sounds.playBoost();
      this.showFloatingText(this.player.x, this.player.y, '⚡ 2X GOLDEN CRANE BOOST ACTIVE!', '#fbbf24');
    });
  }

  updateHUDValues() {
    this.cashText.setText(`$${this.cash}`);
    this.updateProgressBar();
  }

  updateProgressBar() {
    const pct = Math.min(1.0, this.revenueEarnedThisPort / this.portConfig.targetRevenue);
    this.progressBar.clear();
    this.progressBar.fillStyle(pct >= 1.0 ? 0x10b981 : 0xfbbf24, 1);
    this.progressBar.fillRoundedRect(660, 34, 150 * pct, 16, 6);

    if (pct >= 1.0 && !this.isPortCompleted) {
      this.handlePortCompletion();
    }
  }

  handlePortCompletion() {
    this.isPortCompleted = true;
    sounds.playHorn();
    sdk.showInterstitialAd();

    // Save progress: unlock next port
    const nextPort = Math.max(this.progress.unlockedPort || 1, this.portConfig.id + 1);
    this.progress.unlockedPort = nextPort;
    this.saveCurrentProgress();

    // Celebration fireworks
    for (let i = 0; i < 40; i++) {
      const p = this.add.circle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 6, 0xfbbf24, 1);
      const angle = Math.random() * Math.PI * 2;
      const dist = 80 + Math.random() * 250;
      this.tweens.add({
        targets: p,
        x: GAME_WIDTH / 2 + Math.cos(angle) * dist,
        y: GAME_HEIGHT / 2 + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.2,
        duration: 900,
        onComplete: () => p.destroy()
      });
    }

    // Modal popup
    this.time.delayedCall(500, () => {
      this.showVictoryModal();
    });
  }

  showVictoryModal() {
    const modal = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.8);
    overlay.fillRect(-GAME_WIDTH / 2, -GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT);
    modal.add(overlay);

    const card = this.add.graphics();
    card.fillStyle(0x0f172a, 0.98);
    card.lineStyle(3, 0xfbbf24, 1);
    card.fillRoundedRect(-280, -180, 560, 360, 20);
    card.strokeRoundedRect(-280, -180, 560, 360, 20);
    modal.add(card);

    modal.add(this.add.text(0, -120, 'PORT COMPLETED! ⚓', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '32px',
      fontWeight: '900',
      color: '#fbbf24',
      letterSpacing: 2
    }).setOrigin(0.5));

    modal.add(this.add.text(0, -65, `${this.portConfig.name} is running at 100% capacity!`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '18px',
      color: '#e2e8f0'
    }).setOrigin(0.5));

    modal.add(this.add.text(0, -25, `Total Revenue Generated: $${this.revenueEarnedThisPort}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '16px',
      fontWeight: '700',
      color: '#34d399'
    }).setOrigin(0.5));

    const isLastPort = this.portIndex >= PORTS.length - 1;
    const btnLabel = isLastPort ? 'EMPIRE EXPANDED! MENU' : 'SAIL TO NEXT PORT 🚢';

    const nextBtn = this.createModalButton(0, 55, btnLabel, '#fbbf24', '#78350f', () => {
      sounds.playClick();
      if (isLastPort) {
        this.scene.start('MenuScene');
      } else {
        this.scene.start('GameScene', { portId: this.portConfig.id + 1 });
      }
    });
    modal.add(nextBtn);

    const stayBtn = this.createModalButton(0, 125, 'KEEP PLAYING THIS PORT', '#94a3b8', '#1e293b', () => {
      sounds.playClick();
      modal.destroy();
    }, 280, 42);
    modal.add(stayBtn);
  }

  createModalButton(x, y, text, borderColor, fillColor, callback, width = 360, height = 54) {
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(Phaser.Display.Color.HexStringToColor(fillColor).color, 0.95);
    bg.lineStyle(2, Phaser.Display.Color.HexStringToColor(borderColor).color, 1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 12);
    container.add(bg);

    const label = this.add.text(0, 0, text, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '17px',
      fontWeight: '800',
      color: borderColor,
      letterSpacing: 1.5
    }).setOrigin(0.5);
    container.add(label);

    container.setSize(width, height);
    container.setInteractive({ useHandCursor: true });
    container.on('pointerdown', callback);
    container.on('pointerover', () => container.setScale(1.03));
    container.on('pointerout', () => container.setScale(1.0));

    return container;
  }

  showFloatingText(x, y, text, color = '#34d399') {
    const f = this.add.text(x, y - 25, text, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '15px',
      fontWeight: '900',
      color: color
    }).setOrigin(0.5);

    this.tweens.add({
      targets: f,
      y: y - 75,
      alpha: 0,
      duration: 850,
      ease: 'Cubic.easeOut',
      onComplete: () => f.destroy()
    });
  }

  saveCurrentProgress() {
    sdk.saveGameProgress({
      cash: this.cash,
      unlockedPort: this.progress.unlockedPort || 1,
      speedLevel: this.speedLevel,
      capacityLevel: this.capacityLevel,
      hasHelper: this.hasHelper,
    });
  }

  update(time, delta) {
    const dt = delta / 1000;

    // Boost timer
    if (this.boostActive) {
      this.boostTimer -= dt;
      this.boostLabel.setText(`⚡ 2X BOOST (${Math.ceil(this.boostTimer)}s)`);
      if (this.boostTimer <= 0) {
        this.boostActive = false;
        this.boostLabel.setText('⚡ 2X BOOST (AD)');
      }
    }
    const speedBoost = this.boostActive ? 1.7 : 1.0;

    // Update Ship & Crane
    this.ship.update(dt);

    // Crate Spawning onto Pad
    this.dockZone.spawnTimer += dt * (this.boostActive ? 2.5 : 1.0);
    const maxPadCrates = 12;
    if (this.dockZone.spawnTimer >= this.portConfig.spawnRate && this.dockZone.crates.length < maxPadCrates) {
      this.dockZone.spawnTimer = 0;
      const allowed = this.portConfig.allowedCrates;
      const newColor = allowed[Math.floor(Math.random() * allowed.length)];
      this.dockZone.crates.push(newColor);
    }

    // Player Input
    let dirX = 0;
    let dirY = 0;

    if (this.cursors.left.isDown || this.wasd.left.isDown) dirX -= 1;
    if (this.cursors.right.isDown || this.wasd.right.isDown) dirX += 1;
    if (this.cursors.up.isDown || this.wasd.up.isDown) dirY -= 1;
    if (this.cursors.down.isDown || this.wasd.down.isDown) dirY += 1;

    if (this.pointerTarget) {
      const dx = this.pointerTarget.x - this.player.x;
      const dy = this.pointerTarget.y - this.player.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 20) {
        dirX = dx / dist;
        dirY = dy / dist;
      }
    }

    this.player.update(dt, dirX, dirY, speedBoost);

    // Player Crate Pickup Check
    const inPad = (
      this.player.x >= this.dockZone.x &&
      this.player.x <= this.dockZone.x + this.dockZone.width &&
      this.player.y >= this.dockZone.y &&
      this.player.y <= this.dockZone.y + this.dockZone.height
    );

    if (inPad && this.dockZone.crates.length > 0 && this.player.canPickUp()) {
      const cColor = this.dockZone.crates.pop();
      this.player.addCrate({ color: cColor });
      sounds.playPickup();
      this.showFloatingText(this.player.x, this.player.y - 15, `📦 +${cColor.toUpperCase()}`, '#fbbf24');
    }

    // Player Truck Delivery Check
    for (const bay of this.truckBays) {
      const inBay = (
        this.player.x >= bay.x - 90 &&
        this.player.x <= bay.x + 20 &&
        this.player.y >= bay.y - 15 &&
        this.player.y <= bay.y + bay.height + 15
      );

      if (inBay && this.player.carried.length > 0) {
        const delivered = this.player.removeCrate(bay.color);
        if (delivered) {
          bay.deliver();
          const cData = CRATE_TYPES[bay.color] || CRATE_TYPES.red;
          const payout = cData.value * (this.boostActive ? 2 : 1);
          this.cash += payout;
          this.revenueEarnedThisPort += payout;
          sounds.playDeliver();
          this.showFloatingText(bay.x - 70, bay.y + 20, `+$${payout}`, '#34d399');
          this.updateHUDValues();
        }
      }
    }

    // AI Helper Logic
    if (this.helper) {
      this.helper.updateAI(dt, this.dockZone, this.truckBays, (bay, delivered) => {
        bay.deliver();
        const cData = CRATE_TYPES[bay.color] || CRATE_TYPES.red;
        const payout = cData.value;
        this.cash += payout;
        this.revenueEarnedThisPort += payout;
        this.showFloatingText(bay.x - 70, bay.y + 20, `+$${payout} (AI)`, '#10b981');
        this.updateHUDValues();
      });
    }

    // Update Truck Bays flash timers
    for (const bay of this.truckBays) {
      bay.update(dt);
    }

    // Render Frame
    this.renderFrame();
  }

  renderFrame() {
    this.worldGraphics.clear();

    // 1. Deep Ocean (Left Side)
    this.worldGraphics.fillStyle(THEME.water, 1);
    this.worldGraphics.fillRect(0, 68, 240, GAME_HEIGHT - 68);

    // 2. Concrete Harbor Pier Platform
    this.worldGraphics.fillStyle(THEME.dock, 1);
    this.worldGraphics.fillRect(240, 68, GAME_WIDTH - 240, GAME_HEIGHT - 68);

    // Pier Hazard Stripes
    this.worldGraphics.fillStyle(THEME.dockEdge, 1);
    for (let y = 68; y < GAME_HEIGHT; y += 30) {
      this.worldGraphics.fillRect(234, y, 6, 15);
    }

    // Pier Floor Grid Tiles
    this.worldGraphics.lineStyle(1, 0x475569, 0.4);
    for (let x = 240; x < GAME_WIDTH; x += 80) {
      this.worldGraphics.lineBetween(x, 68, x, GAME_HEIGHT - 68);
    }
    for (let y = 68; y < GAME_HEIGHT - 68; y += 80) {
      this.worldGraphics.lineBetween(240, y, GAME_WIDTH, y);
    }

    // 3. Draw Cargo Ship & Gantry Crane
    this.ship.draw(this.worldGraphics);

    // 4. Draw Crate Pad Zone
    this.worldGraphics.fillStyle(0xfbbf24, 0.12);
    this.worldGraphics.fillRect(this.dockZone.x, this.dockZone.y, this.dockZone.width, this.dockZone.height);
    this.worldGraphics.lineStyle(2, 0xfbbf24, 0.8);
    this.worldGraphics.strokeRect(this.dockZone.x, this.dockZone.y, this.dockZone.width, this.dockZone.height);

    // Draw Crates on Pad
    this.dockZone.crates.forEach((colorKey, idx) => {
      const cData = CRATE_TYPES[colorKey] || CRATE_TYPES.red;
      const cx = this.dockZone.x + 14 + (idx % 4) * 32;
      const cy = this.dockZone.y + 14 + Math.floor(idx / 4) * 34;

      this.worldGraphics.fillStyle(cData.color, 1);
      this.worldGraphics.fillRect(cx, cy, 26, 26);
      this.worldGraphics.lineStyle(1.5, 0x000000, 0.45);
      this.worldGraphics.strokeRect(cx, cy, 26, 26);

      // Wood bracing
      this.worldGraphics.lineBetween(cx + 2, cy + 2, cx + 24, cy + 24);
      this.worldGraphics.lineBetween(cx + 24, cy + 2, cx + 2, cy + 24);
    });

    // 5. Draw Truck Bays
    for (const bay of this.truckBays) {
      bay.draw(this.worldGraphics);
    }

    // 6. Draw AI Helper Forklift
    if (this.helper) {
      this.helper.draw(this.worldGraphics);
    }

    // 7. Draw Player Forklift
    this.player.draw(this.worldGraphics);
  }
}
