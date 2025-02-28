/* -----------------------------------
   Configuración Global y Lanzamiento
------------------------------------ */

// Tamaños del juego
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scene: [
    BootScene,
    IntroScene,
    MenuScene,
    TutorialScene,
    GameScene,
    PauseScene,
    EndScene
  ],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

const game = new Phaser.Game(config);
