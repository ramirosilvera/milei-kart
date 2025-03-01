export default class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
    }

    create() {
        // Barra de salud del jugador (esquina superior izquierda)
        this.playerHealthBg = this.add.rectangle(20, 20, 200, 30, 0x555555).setOrigin(0);
        this.playerHealthBar = this.add.rectangle(20, 20, 200, 30, 0x32CD32).setOrigin(0);
        this.playerHealthText = this.add.text(30, 25, "Jugador: 100", { fontSize: '20px', fill: '#fff' });

        // Barra de salud del oponente (esquina superior derecha)
        this.opponentHealthBg = this.add.rectangle(this.cameras.main.width - 220, 20, 200, 30, 0x555555).setOrigin(0);
        this.opponentHealthBar = this.add.rectangle(this.cameras.main.width - 220, 20, 200, 30, 0xFF2222).setOrigin(0);
        this.opponentHealthText = this.add.text(this.cameras.main.width - 210, 25, "Oponente: 100", { fontSize: '20px', fill: '#fff' });

        this.registry.events.on("updateHealth", (data) => {
            // Actualizar la anchura de la barra proporcional a la salud (valor máximo 100)
            const playerWidth = (data.player / 100) * 200;
            this.playerHealthBar.width = playerWidth;
            this.playerHealthText.setText("Jugador: " + data.player);

            const opponentWidth = (data.opponent / 100) * 200;
            this.opponentHealthBar.width = opponentWidth;
            this.opponentHealthText.setText("Oponente: " + data.opponent);
        });
    }
}
