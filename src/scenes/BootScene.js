class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Carga de imágenes
    this.load.image('menuBg', 'assets/images/menu_background.png');
    this.load.image('logo', 'assets/images/logo.png');
    this.load.image('trackBg', 'assets/images/track_background.png');
    this.load.image('playerKart', 'assets/images/milei_kart.png');
    this.load.image('opponentKart', 'assets/images/opponent_kart.png');
    this.load.image('powerDesinfo', 'assets/images/power_up_desinformation.png');
    this.load.image('powerRetuits', 'assets/images/power_up_retuits.png');
    this.load.image('powerShield', 'assets/images/power_up_shield.png');
    this.load.image('powerHostigamiento', 'assets/images/power_up_hostigamiento.png');

    // Carga de sonidos
    this.load.audio('bgMusic', 'assets/sounds/background_music.mp3');
    this.load.audio('itemPickup', 'assets/sounds/item_pickup.wav');
    this.load.audio('attackSound', 'assets/sounds/attack_sound.wav');
    this.load.audio('collisionSound', 'assets/sounds/collision_sound.wav');
    this.load.audio('menuSelect', 'assets/sounds/menu_select.wav');
  }

  create() {
    // Al terminar la precarga, vamos a la IntroScene
    this.scene.start('IntroScene');
  }
}
