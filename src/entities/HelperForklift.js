import { Forklift } from './Forklift.js';

export class HelperForklift extends Forklift {
  constructor(scene, x, y) {
    super(scene, x, y, true);
    this.baseSpeed = 175;
    this.maxCapacity = 1;
    this.state = 'idle'; // 'to_pad' | 'to_truck'
    this.target = null;
  }

  updateAI(dt, dockZone, truckBays, onDeliver) {
    if (this.carried.length === 0) {
      // Navigate to center of Crate Pad
      const targetX = dockZone.x + dockZone.width / 2;
      const targetY = dockZone.y + dockZone.height / 2;

      const dx = targetX - this.x;
      const dy = targetY - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 20) {
        this.update(dt, dx, dy);
      } else {
        this.vx = 0;
        this.vy = 0;
        if (dockZone.crates.length > 0) {
          const crate = dockZone.crates.pop();
          this.addCrate({ color: crate });
        }
      }
    } else {
      // Navigate to matching truck bay
      const myCrate = this.carried[0];
      const bay = truckBays.find(b => b.color === myCrate.color) || truckBays[0];

      const targetX = bay.x - 70;
      const targetY = bay.y + 40;

      const dx = targetX - this.x;
      const dy = targetY - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 25) {
        this.update(dt, dx, dy);
      } else {
        this.vx = 0;
        this.vy = 0;
        const delivered = this.removeCrate(myCrate.color);
        if (delivered && onDeliver) {
          onDeliver(bay, delivered);
        }
      }
    }
  }
}
