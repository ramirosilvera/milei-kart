export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }
    create() {
        // Fondo del menú a pantalla completa
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'menuBackground')
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // Mostrar el logo en la parte superior central
        this.add.image(this.cameras.main.centerX, 80, 'logo').setScale(0.5);

        // Contenedor del título
        const titleContainer = this.add.container(this.cameras.main.centerX, 150);
        const titleBg = this.add.rectangle(0, 0, 600, 80, 0x000000, 0.5);
        const titleText = this.add.text(0, 0, "Milei Kart: Carrera Manipuladora", {
            fontSize: '32px',
            fill: '#32CD32',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        titleContainer.add([titleBg, titleText]);

        // Narrativa satírica
        const narrative = "En un mundo asolado por la desinformación, escándalos cripto y ataques implacables, Milei se enfrenta a su rival en una carrera explosiva. ¡La misión: destruir el kart opositor con astucia y poder!";
        const narrativeContainer = this.add.container(this.cameras.main.centerX, 300);
        const narrativeBg = this.add.rectangle(0, 0, 700, 150, 0x000000, 0.5);
        const narrativeText = this.add.text(0, 0, narrative, {
            fontSize: '20px',
            fill: '#fff',
            wordWrap: { width: 680 }
        }).setOrigin(0.5);
        narrativeContainer.add([narrativeBg, narrativeText]);

        // Botón para iniciar la partida
        const buttonContainer = this.add.container(this.cameras.main.centerX, 500);
        const buttonBg = this.add.rectangle(0, 0, 200, 60, 0xFF2222, 1).setStrokeStyle(2, 0xffffff);
        const buttonText = this.add.text(0, 0, "JUGAR", {
            fontSize: '28px',
            fill: '#fff'
        }).setOrigin(0.5);
        buttonContainer.add([buttonBg, buttonText]);

        // Interactividad sobre el rectángulo del botón
        buttonBg.setInteractive({ useHandCursor: true });
        buttonBg.on('pointerdown', () => {
            this.sound.play('menuSelect');
            this.scene.start('GameScene');
        });
        buttonBg.on('pointerover', () => {
            buttonBg.setFillStyle(0xFF5555);
        });
        buttonBg.on('pointerout', () => {
            buttonBg.setFillStyle(0xFF2222);
        });
    }
}