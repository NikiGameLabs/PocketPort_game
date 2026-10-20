import Phaser from 'phaser';
import bridge from '@playgama/bridge';
import { GAME_WIDTH, GAME_HEIGHT, THEME } from './config/gameConfig.js';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: THEME.waterDeep,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, MenuScene, GameScene]
};

// Ensure Playgama Bridge is initialized BEFORE Phaser starts
const startApp = async () => {
  try {
    const b = window.bridge || bridge;
    if (b && !b.isInitialized) {
      await b.initialize();
      console.log('[PlaygamaBridge] Initialized successfully. Platform:', b.platform?.id);
    }
    if (b && b.setGameLoadingProgress) {
      b.setGameLoadingProgress(100);
    }
  } catch (err) {
    console.warn('[PlaygamaBridge] Initialize fallback:', err);
  }

  // Launch the game
  new Phaser.Game(config);
};

window.addEventListener('load', startApp);
