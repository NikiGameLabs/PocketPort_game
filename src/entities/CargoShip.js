import { THEME, CRATE_TYPES } from '../config/gameConfig.js';

export class CargoShip {
  constructor(scene, portConfig) {
    this.scene = scene;
    this.portConfig = portConfig;
    this.x = 35;
    this.y = 80;
    this.width = 160;
    this.height = 560;

    this.bobTime = 0;
    this.craneAngle = 0;
  }

  update(dt) {
    this.bobTime += dt;
    this.craneAngle = Math.sin(this.bobTime * 1.5) * 0.28;
  }

  draw(graphics) {
    const bobOffset = Math.sin(this.bobTime * 2) * 3;
    const shipY = this.y + bobOffset;

    // 1. Cargo Ship Hull
    graphics.fillStyle(THEME.shipHull, 1);
    graphics.fillRoundedRect(this.x, shipY, this.width, this.height, 26);

    graphics.lineStyle(2, 0x000000, 0.4);
    graphics.strokeRoundedRect(this.x, shipY, this.width, this.height, 26);

    // 2. Ship Deck
    graphics.fillStyle(THEME.shipDeck, 1);
    graphics.fillRoundedRect(this.x + 14, shipY + 20, this.width - 28, this.height - 40, 14);

    // 3. Navigation Bridge & Radar Tower
    graphics.fillStyle(0x0f172a, 1);
    graphics.fillRoundedRect(this.x + 25, shipY + 30, this.width - 50, 65, 8);

    // Bridge Windows
    graphics.fillStyle(0x38bdf8, 1);
    graphics.fillRect(this.x + 35, shipY + 40, this.width - 70, 12);

    // Rotating Radar Dish
    const radarAngle = this.bobTime * 4;
    const radarX = this.x + this.width / 2;
    const radarY = shipY + 24;
    graphics.lineStyle(2, 0xf1f5f9, 0.9);
    graphics.lineBetween(radarX, radarY, radarX + Math.cos(radarAngle) * 12, radarY + Math.sin(radarAngle) * 12);

    // 4. Rows of Shipping Containers Stored on Deck
    const rows = 6;
    const cols = 2;
    const allowed = this.portConfig.allowedCrates || ['red', 'blue'];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const colorKey = allowed[(r + c) % allowed.length];
        const cData = CRATE_TYPES[colorKey] || CRATE_TYPES.red;

        const cx = this.x + 28 + c * 54;
        const cy = shipY + 120 + r * 68;

        graphics.fillStyle(cData.color, 1);
        graphics.fillRoundedRect(cx, cy, 48, 56, 4);

        graphics.lineStyle(1.5, 0x000000, 0.4);
        graphics.strokeRoundedRect(cx, cy, 48, 56, 4);

        // Container corrugated ridges
        graphics.lineStyle(1, 0xffffff, 0.25);
        graphics.lineBetween(cx + 12, cy + 4, cx + 12, cy + 52);
        graphics.lineBetween(cx + 24, cy + 4, cx + 24, cy + 52);
        graphics.lineBetween(cx + 36, cy + 4, cx + 36, cy + 52);
      }
    }

    // 5. Heavy-Duty Dock Gantry Crane Unloading Arm
    const craneBaseX = 220;
    const craneBaseY = 320;

    // Crane Tower Base
    graphics.fillStyle(THEME.crane, 1);
    graphics.fillRect(craneBaseX - 16, craneBaseY - 16, 32, 32);

    // Crane Boom Arm (Swinging from ship to dock)
    graphics.save();
    graphics.translateCanvas(craneBaseX, craneBaseY);
    graphics.rotateCanvas(this.craneAngle);

    graphics.fillStyle(0xfb923c, 1);
    graphics.fillRect(0, -8, 105, 16);

    // Steel Cable & Winch
    graphics.lineStyle(2, 0xf8fafc, 0.85);
    graphics.beginPath();
    graphics.moveTo(95, 0);
    graphics.lineTo(95, 45);
    graphics.strokePath();

    // Suspended Crate
    const suspendedColor = allowed[Math.floor(this.bobTime) % allowed.length];
    const sData = CRATE_TYPES[suspendedColor] || CRATE_TYPES.red;
    graphics.fillStyle(sData.color, 1);
    graphics.fillRect(83, 45, 24, 24);
    graphics.lineStyle(1.5, 0x000000, 0.5);
    graphics.strokeRect(83, 45, 24, 24);

    graphics.restore();
  }
}
