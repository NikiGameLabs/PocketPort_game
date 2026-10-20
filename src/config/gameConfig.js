export const GAME_WIDTH = 1080;
export const GAME_HEIGHT = 720;

export const THEME = {
  water: 0x1d4ed8,
  waterDeep: 0x1e3a8a,
  dock: 0x334155,
  dockEdge: 0xeab308,
  forkliftYellow: 0xfbbf24,
  forkliftHelper: 0x10b981,
  forkliftCabin: 0x0f172a,
  shipHull: 0xb91c1c,
  shipDeck: 0xe2e8f0,
  crane: 0xf97316,
  text: '#ffffff',
  textMuted: '#94a3b8',
  gold: '#fbbf24',
  green: '#10b981',
};

export const CRATE_TYPES = {
  red: { id: 'red', name: 'Standard Red', color: 0xef4444, hex: '#ef4444', value: 50 },
  blue: { id: 'blue', name: 'Electronics Blue', color: 0x3b82f6, hex: '#3b82f6', value: 65 },
  green: { id: 'green', name: 'Perishable Green', color: 0x10b981, hex: '#10b981', value: 80 },
  gold: { id: 'gold', name: 'VIP Gold', color: 0xf59e0b, hex: '#f59e0b', value: 150 },
};

export const PORTS = [
  {
    id: 1,
    name: "Fisher's Bay Pier",
    subtitle: 'Learn the ropes: manual forklift, basic freight, & local deliveries',
    targetRevenue: 1200,
    allowedCrates: ['red', 'blue'],
    trucks: [
      { id: 'red', color: 'red', x: 920, y: 190, label: 'RED DOCK' },
      { id: 'blue', color: 'blue', x: 920, y: 390, label: 'BLUE DOCK' },
    ],
    dockZone: { x: 300, y: 220, width: 140, height: 140 },
    spawnRate: 2.2,
  },
  {
    id: 2,
    name: 'Metro Container Hub',
    subtitle: 'High volume freight: multi-color logistics & AI workforce',
    targetRevenue: 3000,
    allowedCrates: ['red', 'blue', 'green'],
    trucks: [
      { id: 'red', color: 'red', x: 920, y: 140, label: 'RED DOCK' },
      { id: 'blue', color: 'blue', x: 920, y: 320, label: 'BLUE DOCK' },
      { id: 'green', color: 'green', x: 920, y: 500, label: 'GREEN DOCK' },
    ],
    dockZone: { x: 300, y: 200, width: 150, height: 160 },
    spawnRate: 1.6,
  },
  {
    id: 3,
    name: 'Pacific Mega-Harbor',
    subtitle: 'Commercial shipping empire: VIP containers & high-speed operations',
    targetRevenue: 6000,
    allowedCrates: ['red', 'blue', 'green', 'gold'],
    trucks: [
      { id: 'red', color: 'red', x: 920, y: 110, label: 'RED DOCK' },
      { id: 'blue', color: 'blue', x: 920, y: 260, label: 'BLUE DOCK' },
      { id: 'green', color: 'green', x: 920, y: 410, label: 'GREEN DOCK' },
      { id: 'gold', color: 'gold', x: 920, y: 560, label: 'VIP GOLD DOCK' },
    ],
    dockZone: { x: 300, y: 180, width: 160, height: 180 },
    spawnRate: 1.2,
  }
];
