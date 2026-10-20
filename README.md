# Pocket Port: Cargo Tycoon ⚓🚢

An original 2D arcade-idle / harbor simulation game built with **Phaser** and **Vite**, designed for lightweight, high-retention play on **YouTube Playables**, **CrazyGames**, and **Poki**.

---

## 🎮 Core Gameplay Loop

1. **Unload the Ship**: Freight containers arrive continuously at the dock from cargo ships via gantry cranes.
2. **Sort & Transport**: Drive your industrial forklift to pick up color-coded cargo (Standard Red, Electronics Blue, Perishable Green, and VIP Gold).
3. **Deliver to Matching Trucks**: Park at the corresponding delivery bay to earn instant cash payouts.
4. **Expand & Automate**:
   - Upgrade your **Engine Speed** to zip across the docks.
   - Upgrade your **Stack Capacity** to haul up to 4 crates at once.
   - Hire **Autonomous AI Helpers** to automate deliveries while you manage high-value freight.
5. **Unlock New Harbors**: Reach 100% port capacity to sail your fleet to new worldwide shipping hubs!

---

## 💰 Monetization Architecture

Built from the ground up for maximum ad yield across casual gaming platforms:

- **Rewarded Video Ads**:
  - *"⚡ 2x Golden Crane Speed Boost"* (15s double-speed & double-cash multiplier).
  - *"🚢 Mega-Freighter Event"* (Instant VIP cargo rush).
- **Interstitial Ads**:
  - Displayed smoothly between Port transitions (e.g. traveling from Port 1 to Port 2) to avoid interrupting active gameplay.
- **YouTube Playables SDK**:
  - Full lifecycle integration: `firstFrameReady()`, `gameReady()`, audio mute/pause handlers, and cloud saves.

---

## 🛠️ Tech Stack & Architecture

- **Game Engine**: [Phaser](https://phaser.io/)
- **Bundler**: [Vite](https://vitejs.dev/)
- **Audio**: Procedural Web Audio API sound synthesizer (zero external audio files or copyright concerns)
- **Visuals**: Procedural geometric vector canvas art
- **CI/CD**: GitHub Actions workflow deploying automatically to GitHub Pages

---

## 📁 Repository Structure

```
PocketPort_game/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages automated CI/CD
├── .gitignore
├── README.md
├── index.html                  # Responsive game mount
├── package.json
├── vite.config.js              # Vite build configuration
└── src/
    ├── main.js                 # Phaser initialization
    ├── style.css               # Modern layout styling
    ├── config/
    │   └── gameConfig.js       # Ports, crate definitions & economy
    ├── audio/
    │   └── SoundManager.js     # Web Audio API sound synthesizer
    ├── sdk/
    │   └── PlayablesSDK.js     # YouTube Playables SDK wrapper
    ├── entities/
    │   ├── Forklift.js         # Player vehicle physics & crate stack
    │   ├── HelperForklift.js   # Autonomous AI worker behavior
    │   ├── CargoShip.js        # Moored ship & swinging gantry crane
    │   └── TruckBay.js         # Delivery bay & truck graphics
    └── scenes/
        ├── BootScene.js        # Asset generation & firstFrameReady
        ├── MenuScene.js        # Main menu, port selector & audio toggle
        └── GameScene.js        # Main tycoon loop, upgrades & HUD
```

---

## 🚀 Local Development

```bash
npm install
npm run dev
```

The game will be available at `http://localhost:5174/`.

### Build for Production (or YouTube Playables .zip upload)
```bash
npm run build
```
Compiled static assets are placed in `dist/`.
