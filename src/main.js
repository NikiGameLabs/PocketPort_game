import Phaser from 'phaser';
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
  render: {
    failIfMajorPerformanceCaveat: false,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, MenuScene, GameScene]
};

const startGame = () => {
  if (window.__pocketPortStarted) return;
  window.__pocketPortStarted = true;
  new Phaser.Game(config);
};

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  startGame();
} else {
  window.addEventListener('load', startGame);
  document.addEventListener('DOMContentLoaded', startGame);
}
