export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }
    preload() {
        // Cargamos el logo para branding (opcional)
        this.load.image('logo', 'assets/images/logo.png');
    }
    create() {
        this.scene.start('PreloadScene');
    }
}