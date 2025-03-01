export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }
    preload() {
        // Contenedor de carga centrado
        const loadingContainer = this.add.container(this.cameras.main.centerX, this.cameras.main.centerY);
        const loadingBg = this.add.rectangle(0, 0, 300, 100, 0x000000, 0.7);
        const loadingText = this.add.text(0, 0, 'Cargando...', {
            fontSize: '24px',
            fill: '#fff'
        }).setOrigin(0.5);
        loadingContainer.add([loadingBg, loadingText]);

        // Imágenes del juego
        this.load.image('menuBackground', 'assets/images/menu_background.png');
        this.load.image('track', 'assets/images/track_background.png');
        this.load.image('mileiKart', 'assets/images/milei_kart.png');
        this.load.image('opponentKart', 'assets/images/opponent_kart.png');
        // Power-ups
        this.load.image('powerUpDesinformation', 'assets/images/power_up_desinformation.png');
        this.load.image('powerUpRetuits', 'assets/images/power_up_retuits.png');
        this.load.image('powerUpShield', 'assets/images/power_up_shield.png');
        this.load.image('powerUpHostigamiento', 'assets/images/power_up_hostigamiento.png');

        // Sonidos
        this.load.audio('bgMusic', 'assets/sounds/background_music.mp3');
        this.load.audio('itemPickup', 'assets/sounds/item_pickup.wav');
        this.load.audio('attackSound', 'assets/sounds/attack_sound.wav');
        this.load.audio('collisionSound', 'assets/sounds/collision_sound.wav');
        this.load.audio('menuSelect', 'assets/sounds/menu_select.wav');

        this.load.on('complete', () => {
            this.scene.start('MenuScene');
        });
    }
}