export default class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
    }

    create() {
        // Crear un contenedor para la UI
        this.uiContainer = this.add.container(0, 0);

        // Barra de salud del jugador (esquina superior izquierda)
        const playerHealthBg = this.add.rectangle(50, 20, 250, 40, 0x000000, 0.7)
            .setOrigin(0);
        this.playerHealthBar = this.add.rectangle(50, 20, 250, 40, 0x00FF00)
            .setOrigin(0);
        const playerHealthText = this.add.text(60, 25, "Jugador: 100", {
            fontSize: '24px',
            fill: '#FFFFFF',
            fontStyle: 'bold'
        });
        // Barra de salud del oponente (esquina superior derecha)
        const opponentHealthBg = this.add.rectangle(this.cameras.main.width - 300, 20, 250, 40, 0x000000, 0.7)
            .setOrigin(0);
        this.opponentHealthBar = this.add.rectangle(this.cameras.main.width - 300, 20, 250, 40, 0xFF0000)
            .setOrigin(0);
        const opponentHealthText = this.add.text(this.cameras.main.width - 290, 25, "Oponente: 100", {
            fontSize: '24px',
            fill: '#FFFFFF',
            fontStyle: 'bold'
        });

        // Agregar elementos al contenedor
        this.uiContainer.add([playerHealthBg, this.playerHealthBar, playerHealthText,
                                opponentHealthBg, this.opponentHealthBar, opponentHealthText]);

        // Guardar referencias para actualizar la UI
        this.playerHealthText = playerHealthText;
        this.opponentHealthText = opponentHealthText;

        // Escuchar evento de actualización de salud
        this.registry.events.on("updateHealth", (data) => {
            const playerWidth = (data.player / 100) * 250;
            this.playerHealthBar.width = playerWidth;
            this.playerHealthText.setText("Jugador: " + data.player);
            
            const opponentWidth = (data.opponent / 100) * 250;
            this.opponentHealthBar.width = opponentWidth;
            this.opponentHealthText.setText("Oponente: " + data.opponent);
        });
    }
}