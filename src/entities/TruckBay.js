import { CRATE_TYPES } from '../config/gameConfig.js';

export class TruckBay {
  constructor(config) {
    this.id = config.id;
    this.color = config.color;
    this.x = config.x;
    this.y = config.y;
    this.label = config.label || `${this.color.toUpperCase()} DOCK`;
    this.count = 0;

    this.width = 115;
    this.height = 80;

    this.flashTime = 0;
  }

  deliver() {
    this.count++;
    this.flashTime = 0.25;
  }

  update(dt) {
    if (this.flashTime > 0) {
      this.flashTime -= dt;
    }
  }

  draw(graphics) {
    const cData = CRATE_TYPES[this.color] || CRATE_TYPES.red;

    // Delivery Dock Loading Bay Area
    graphics.fillStyle(0x0f172a, 0.7);
    graphics.fillRoundedRect(this.x - 65, this.y - 10, this.width, this.height, 8);

    const outlineColor = this.flashTime > 0 ? 0xffffff : cData.color;
    graphics.lineStyle(2.5, outlineColor, 0.9);
    graphics.strokeRoundedRect(this.x - 65, this.y - 10, this.width, this.height, 8);

    // Delivery Semi-Truck Cab (facing right)
    graphics.fillStyle(0x475569, 1);
    graphics.fillRoundedRect(this.x - 10, this.y + 10, 48, 40, 6);

    // Truck Windshield
    graphics.fillStyle(0x38bdf8, 1);
    graphics.fillRect(this.x + 18, this.y + 16, 14, 28);

    // Truck Wheels
    graphics.fillStyle(0x0f172a, 1);
    graphics.fillRect(this.x - 4, this.y + 4, 10, 6);
    graphics.fillRect(this.x + 22, this.y + 4, 10, 6);
    graphics.fillRect(this.x - 4, this.y + 50, 10, 6);
    graphics.fillRect(this.x + 22, this.y + 50, 10, 6);

    // Flatbed cargo indicator dots
    const shownCrates = Math.min(this.count, 6);
    for (let i = 0; i < shownCrates; i++) {
      const cx = this.x - 52 + (i % 3) * 14;
      const cy = this.y + 14 + Math.floor(i / 3) * 18;
      graphics.fillStyle(cData.color, 1);
      graphics.fillRect(cx, cy, 11, 14);
    }
  }
}
