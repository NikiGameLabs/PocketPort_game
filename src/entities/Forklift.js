import { THEME, CRATE_TYPES } from '../config/gameConfig.js';

export class Forklift {
  constructor(scene, x, y, isHelper = false) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.isHelper = isHelper;

    this.vx = 0;
    this.vy = 0;
    this.angle = 0;

    this.baseSpeed = 220;
    this.speedMultiplier = 1;
    this.maxCapacity = 2;

    this.carried = []; // array of crate objects: [{ id, color, hex }]
  }

  setSpeedLevel(level) {
    this.speedMultiplier = 1 + (level - 1) * 0.22;
  }

  setCapacityLevel(level) {
    this.maxCapacity = 1 + level;
  }

  canPickUp() {
    return this.carried.length < this.maxCapacity;
  }

  addCrate(crate) {
    if (!this.canPickUp()) return false;
    this.carried.push(crate);
    return true;
  }

  removeCrate(color) {
    const idx = this.carried.findIndex(c => c.color === color);
    if (idx !== -1) {
      return this.carried.splice(idx, 1)[0];
    }
    return null;
  }

  update(dt, dirX, dirY, speedBoost = 1) {
    const speed = this.baseSpeed * this.speedMultiplier * speedBoost;

    if (dirX !== 0 || dirY !== 0) {
      const len = Math.hypot(dirX, dirY);
      this.vx = (dirX / len) * speed;
      this.vy = (dirY / len) * speed;
      this.angle = Math.atan2(dirY, dirX);
    } else {
      this.vx = 0;
      this.vy = 0;
    }

    // Dock boundary constraints
    this.x = Math.max(250, Math.min(840, this.x + this.vx * dt));
    this.y = Math.max(70, Math.min(650, this.y + this.vy * dt));
  }

  draw(graphics) {
    graphics.save();
    graphics.translateCanvas(this.x, this.y);
    graphics.rotateCanvas(this.angle);

    const bodyColor = this.isHelper ? THEME.forkliftHelper : THEME.forkliftYellow;

    // 4 Heavy-duty Rubber Wheels
    graphics.fillStyle(0x0f172a, 1);
    graphics.fillRoundedRect(-22, -18, 10, 7, 2);
    graphics.fillRoundedRect(12, -18, 10, 7, 2);
    graphics.fillRoundedRect(-22, 11, 10, 7, 2);
    graphics.fillRoundedRect(12, 11, 10, 7, 2);

    // Main Forklift Chassis
    graphics.fillStyle(bodyColor, 1);
    graphics.fillRoundedRect(-22, -13, 44, 26, 5);

    graphics.lineStyle(1.5, 0x000000, 0.35);
    graphics.strokeRoundedRect(-22, -13, 44, 26, 5);

    // Operator Cabin & Protective Roll Cage
    graphics.fillStyle(THEME.forkliftCabin, 1);
    graphics.fillRoundedRect(-14, -9, 22, 18, 3);

    // Windshield tint
    graphics.fillStyle(0x38bdf8, 0.85);
    graphics.fillRect(-11, -7, 16, 5);

    // Front Lifting Mast & Steel Forks
    graphics.fillStyle(0x94a3b8, 1);
    graphics.fillRect(22, -10, 16, 4);
    graphics.fillRect(22, 6, 16, 4);

    // Mast crossbar
    graphics.fillStyle(0x475569, 1);
    graphics.fillRect(20, -12, 4, 24);

    // Headlight Beams
    graphics.fillStyle(0xfef08a, 0.45);
    graphics.fillTriangle(26, -6, 75, -20, 75, 20);

    // Draw Stacked Crates Behind the Forklift
    this.carried.forEach((crate, idx) => {
      const offX = -38 - (idx * 22);
      const cData = CRATE_TYPES[crate.color] || CRATE_TYPES.red;

      graphics.fillStyle(cData.color, 1);
      graphics.fillRect(offX, -10, 20, 20);

      graphics.lineStyle(1.5, 0x000000, 0.45);
      graphics.strokeRect(offX, -10, 20, 20);

      // Crate bracing
      graphics.lineBetween(offX + 2, -8, offX + 18, 8);
      graphics.lineBetween(offX + 18, -8, offX + 2, 8);
    });

    graphics.restore();
  }
}
