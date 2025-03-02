export default class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
    }

    create() {
        // Contenedor fijo para la UI
        this.uiContainer = this.add.container(0, 0);
        
        // Barra de salud del jugador (esquina superior izquierda)
        const playerHealthBg = this.add.rectangle(50, 20, 250, 40, 0x000000, 0.7)
            .setOrigin(0)
            .setScrollFactor(0);
        const playerHealthBar = this.add.rectangle(50, 20, 250, 40, 0x00FF00)
            .setOrigin(0)
            .setScrollFactor(0);
        const playerHealthText = this.add.text(60, 25, "Jugador: 100", {
            fontSize: '24px',
            fill: '#FFFFFF',
            fontStyle: 'bold'
        }).setScrollFactor(0);
        this.uiContainer.add([playerHealthBg, playerHealthBar, playerHealthText]);

        // Barra de salud del oponente (esquina superior derecha)
        const opponentHealthBg = this.add.rectangle(this.cameras.main.width - 300, 20, 250, 40, 0x000000, 0.7)
            .setOrigin(0)
            .setScrollFactor(0);
        const opponentHealthBar = this.add.rectangle(this.cameras.main.width - 300, 20, 250, 40, 0xFF0000)
            .setOrigin(0)
            .setScrollFactor(0);
        const opponentHealthText = this.add.text(this.cameras.main.width - 290, 25, "Oponente: 100", {
            fontSize: '24px',
            fill: '#FFFFFF',
            fontStyle: 'bold'
        }).setScrollFactor(0);
        this.uiContainer.add([opponentHealthBg, opponentHealthBar, opponentHealthText]);

        // Guardar referencias para actualizar la UI
        this.playerHealthBar = playerHealthBar;
        this.playerHealthText = playerHealthText;
        this.opponentHealthBar = opponentHealthBar;
        this.opponentHealthText = opponentHealthText;

        // Últimos valores para evitar actualizaciones innecesarias
        this.lastPlayerHealth = 100;
        this.lastOpponentHealth = 100;

        // Escuchar el evento para actualizar la salud
        this.registry.events.on("updateHealth", (data) => {
            if (data.player !== this.lastPlayerHealth) {
                const playerWidth = (data.player / 100) * 250;
                this.playerHealthBar.width = playerWidth;
                this.playerHealthText.setText("Jugador: " + data.player);
                this.lastPlayerHealth = data.player;
            }
            if (data.opponent !== this.lastOpponentHealth) {
                const opponentWidth = (data.opponent / 100) * 250;
                this.opponentHealthBar.width = opponentWidth;
                this.opponentHealthText.setText("Oponente: " + data.opponent);
                this.lastOpponentHealth = data.opponent;
            }
        });
    }
}