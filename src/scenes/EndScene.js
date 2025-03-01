export default class EndScene extends Phaser.Scene {
    constructor() {
        super('EndScene');
    }

    init(data) {
        this.winner = data.winner;
    }

    create() {
        // Fondo oscuro semi-transparente
        this.add.rectangle(this.cameras.main.centerX, this.cameras.main.centerY, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.7);

        // Contenedor de fin de juego
        const endContainer = this.add.container(this.cameras.main.centerX, this.cameras.main.centerY);
        const containerBg = this.add.rectangle(0, 0, 600, 300, 0x111111, 0.8);
        let endMessage = (this.winner === "player") ?
            "¡Felicidades! Has destruido el kart opositor." :
            "¡Tu kart ha sido destruido! La oposición triunfa.";
        const endText = this.add.text(0, -80, "Fin de la Carrera", {
            fontSize: '36px',
            fill: '#FFD700',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        const resultText = this.add.text(0, -20, endMessage, {
            fontSize: '28px',
            fill: '#fff',
            align: 'center',
            wordWrap: { width: 550 }
        }).setOrigin(0.5);
        const restartButtonBg = this.add.rectangle(0, 80, 200, 60, 0xFF2222).setStrokeStyle(2, 0xffffff);
        const restartButtonText = this.add.text(0, 80, "REINTENTAR", {
            fontSize: '26px',
            fill: '#fff'
        }).setOrigin(0.5);

        endContainer.add([containerBg, endText, resultText, restartButtonBg, restartButtonText]);

        restartButtonBg.setInteractive({ useHandCursor: true });
        restartButtonBg.on('pointerdown', () => {
            this.sound.play('menuSelect');
            this.scene.start('MenuScene');
        });
        restartButtonBg.on('pointerover', () => {
            restartButtonBg.setFillStyle(0xFF5555);
        });
        restartButtonBg.on('pointerout', () => {
            restartButtonBg.setFillStyle(0xFF2222);
        });
    }
}