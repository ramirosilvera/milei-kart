export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }
    create() {
        // Fondo del menú adaptado a toda la pantalla
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'menuBackground')
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

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
        const narrative = "En un mundo asolado por la desinformación, escándalos cripto y ataques implacables a la oposición, Milei toma el volante. La misión: destruir al kart rival. ¡Demuestra tu capacidad manipuladora en una carrera explosiva!";
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
        buttonContainer.setSize(200, 60);
        buttonContainer.setInteractive(new Phaser.Geom.Rectangle(-100, -30, 200, 60), Phaser.Geom.Rectangle.Contains);

        buttonContainer.on('pointerdown', () => {
            this.sound.play('menuSelect');
            this.scene.start('GameScene');
        });
        buttonContainer.on('pointerover', () => {
            buttonBg.setFillStyle(0xFF5555);
        });
        buttonContainer.on('pointerout', () => {
            buttonBg.setFillStyle(0xFF2222);
        });
    }
}