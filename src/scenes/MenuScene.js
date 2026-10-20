import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, THEME, PORTS } from '../config/gameConfig.js';
import { sounds } from '../audio/SoundManager.js';
import { sdk } from '../sdk/PlayablesSDK.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    this.progress = sdk.loadGameProgress();

    this.bgGraphics = this.add.graphics();
    this.drawBackground();

    // Sound toggle in top right
    this.createSoundButton();

    // Title
    const title = this.add.text(GAME_WIDTH / 2, 160, 'POCKET PORT', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '64px',
      fontWeight: '900',
      color: '#fbbf24',
      letterSpacing: 4
    }).setOrigin(0.5);
    title.setShadow(0, 4, '#b45309', 15, true, true);

    this.add.text(GAME_WIDTH / 2, 225, 'HARBOR & CARGO TYCOON', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '20px',
      fontWeight: '700',
      color: '#38bdf8',
      letterSpacing: 3
    }).setOrigin(0.5);

    // Animated Forklift & Cargo Ship graphic in center
    this.createCenterAnimation();

    // Start / Continue Button
    const activePort = Math.min(this.progress.unlockedPort || 1, PORTS.length);
    this.createButton(GAME_WIDTH / 2, 490, `ENTER PORT ${activePort}`, '#fbbf24', '#78350f', () => {
      sounds.playClick();
      this.scene.start('GameScene', { portId: activePort });
    });

    // Port Select Section
    this.createPortSelector();

    // Signal game ready to SDK
    sdk.gameReady();
  }

  drawBackground() {
    this.bgGraphics.clear();
    // Deep water
    this.bgGraphics.fillStyle(THEME.waterDeep, 1);
    this.bgGraphics.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Harbor pier platform
    this.bgGraphics.fillStyle(THEME.dock, 1);
    this.bgGraphics.fillRect(100, 290, GAME_WIDTH - 200, 390);

    // Hazard border stripes
    this.bgGraphics.fillStyle(THEME.dockEdge, 1);
    for (let x = 100; x < GAME_WIDTH - 100; x += 30) {
      this.bgGraphics.fillRect(x, 284, 15, 6);
    }
  }

  createCenterAnimation() {
    const animGfx = this.add.graphics();
    let time = 0;

    this.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        time += 0.03;
        animGfx.clear();

        // Bobbing cargo crates
        const bob = Math.sin(time * 3) * 6;
        animGfx.fillStyle(0xef4444, 1);
        animGfx.fillRoundedRect(GAME_WIDTH / 2 - 80, 335 + bob, 45, 45, 6);
        animGfx.fillStyle(0x3b82f6, 1);
        animGfx.fillRoundedRect(GAME_WIDTH / 2 - 25, 335 - bob, 45, 45, 6);
        animGfx.fillStyle(0x10b981, 1);
        animGfx.fillRoundedRect(GAME_WIDTH / 2 + 30, 335 + bob * 0.7, 45, 45, 6);

        // Forklift driving back and forth
        const fx = GAME_WIDTH / 2 + Math.sin(time) * 110;
        animGfx.fillStyle(THEME.forkliftYellow, 1);
        animGfx.fillRoundedRect(fx - 24, 400, 48, 26, 5);
        animGfx.fillStyle(0x0f172a, 1);
        animGfx.fillRect(fx - 14, 395, 20, 16);
      }
    });
  }

  createPortSelector() {
    const startX = GAME_WIDTH / 2;
    const y = 590;

    const container = this.add.container(startX, y);

    this.add.text(GAME_WIDTH / 2, y - 35, '— PORTS AVAILABLE —', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      fontWeight: '700',
      color: '#94a3b8',
      letterSpacing: 2
    }).setOrigin(0.5);

    const btnWidth = 200;
    const spacing = 20;
    const totalW = PORTS.length * btnWidth + (PORTS.length - 1) * spacing;
    const originX = -totalW / 2 + btnWidth / 2;

    PORTS.forEach((p, idx) => {
      const bx = originX + idx * (btnWidth + spacing);
      const isUnlocked = p.id <= (this.progress.unlockedPort || 1);

      const pBtn = this.add.container(bx, 0);
      const bg = this.add.graphics();
      bg.fillStyle(isUnlocked ? 0x1e293b : 0x0f172a, 0.9);
      bg.lineStyle(2, isUnlocked ? 0x38bdf8 : 0x334155, 0.9);
      bg.fillRoundedRect(-btnWidth / 2, -26, btnWidth, 52, 10);
      bg.strokeRoundedRect(-btnWidth / 2, -26, btnWidth, 52, 10);
      pBtn.add(bg);

      const label = this.add.text(0, 0, isUnlocked ? `Port ${p.id}: ${p.name.split(' ')[0]}` : `🔒 Port ${p.id}`, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '15px',
        fontWeight: '700',
        color: isUnlocked ? '#f8fafc' : '#64748b'
      }).setOrigin(0.5);
      pBtn.add(label);

      if (isUnlocked) {
        pBtn.setSize(btnWidth, 52);
        pBtn.setInteractive({ useHandCursor: true });
        pBtn.on('pointerdown', () => {
          sounds.playClick();
          this.scene.start('GameScene', { portId: p.id });
        });
        pBtn.on('pointerover', () => pBtn.setScale(1.04));
        pBtn.on('pointerout', () => pBtn.setScale(1.0));
      }

      container.add(pBtn);
    });
  }

  createButton(x, y, text, borderColor, fillColor, callback) {
    const width = 340;
    const height = 66;
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(Phaser.Display.Color.HexStringToColor(fillColor).color, 0.95);
    bg.lineStyle(3, Phaser.Display.Color.HexStringToColor(borderColor).color, 1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 16);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 16);
    container.add(bg);

    const btnText = this.add.text(0, 0, text, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '24px',
      fontWeight: '900',
      color: borderColor,
      letterSpacing: 2
    }).setOrigin(0.5);
    container.add(btnText);

    container.setSize(width, height);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerdown', callback);
    container.on('pointerover', () => container.setScale(1.04));
    container.on('pointerout', () => container.setScale(1.0));

    return container;
  }

  createSoundButton() {
    const btn = this.add.container(GAME_WIDTH - 60, 50);
    const bg = this.add.graphics();
    bg.fillStyle(0x1e293b, 0.85);
    bg.lineStyle(1.5, 0x38bdf8, 0.7);
    bg.fillCircle(0, 0, 24);
    bg.strokeCircle(0, 0, 24);
    btn.add(bg);

    const icon = this.add.text(0, 0, sounds.isMuted() ? '🔇' : '🔊', {
      fontSize: '20px'
    }).setOrigin(0.5);
    btn.add(icon);

    btn.setSize(48, 48);
    btn.setInteractive({ useHandCursor: true });
    btn.on('pointerdown', () => {
      const isMuted = sounds.toggleMute();
      icon.setText(isMuted ? '🔇' : '🔊');
      sounds.playClick();
    });
  }
}
