export default class UIScene extends Phaser.Scene {
  constructor() {
    super("UIScene");
  }

  create() {
    this.uiContainer = this.add.container(0, 0);

    // Barra de salud del jugador (esquina superior izquierda)
    const playerHealthBg = this.add.rectangle(20, 20, 300, 40, 0x000000, 0.8).setOrigin(0);
    this.playerHealthBar = this.add.rectangle(20, 20, 300, 40, 0x00ff00).setOrigin(0);
    const playerHealthText = this.add.text(30, 28, "Jugador: 100", {
      fontSize: "20px",
      fill: "#fff",
      fontStyle: "bold"
    });

    // Barra de salud del oponente (esquina superior derecha)
    const opponentHealthBg = this.add.rectangle(this.cameras.main.width - 320, 20, 300, 40, 0x000000, 0.8).setOrigin(0);
    this.opponentHealthBar = this.add.rectangle(this.cameras.main.width - 320, 20, 300, 40, 0xff0000).setOrigin(0);
    const opponentHealthText = this.add.text(this.cameras.main.width - 310, 28, "Oponente: 100", {
      fontSize: "20px",
      fill: "#fff",
      fontStyle: "bold"
    });

    // Cronómetro (central superior)
    this.timerText = this.add.text(this.cameras.main.width / 2, 20, "Tiempo: 0.0s", {
      fontSize: "24px",
      fill: "#ffcc00",
      fontStyle: "bold",
      stroke: "#000",
      strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0);

    // Indicador de progreso (en la parte inferior)
    const progressBarBg = this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height - 40, 400, 30, 0x000000, 0.8).setScrollFactor(0);
    this.progressBar = this.add.rectangle(this.cameras.main.width / 2 - 200, this.cameras.main.height - 40, 0, 30, 0x00ff00).setOrigin(0, 0.5).setScrollFactor(0);
    this.progressText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 40, "Progreso: 0%", {
      fontSize: "18px",
      fill: "#fff",
      fontStyle: "bold",
      stroke: "#000",
      strokeThickness: 2
    }).setOrigin(0.5).setScrollFactor(0);

    this.uiContainer.add([
      playerHealthBg,
      this.playerHealthBar,
      playerHealthText,
      opponentHealthBg,
      this.opponentHealthBar,
      opponentHealthText,
      this.timerText,
      progressBarBg,
      this.progressBar,
      this.progressText
    ]);

    // Actualización de la salud
    this.registry.events.on("updateHealth", (data) => {
      const playerWidth = (data.player / 100) * 300;
      this.playerHealthBar.width = playerWidth;
      playerHealthText.setText("Jugador: " + data.player);

      const opponentWidth = (data.opponent / 100) * 300;
      this.opponentHealthBar.width = opponentWidth;
      opponentHealthText.setText("Oponente: " + data.opponent);
    });

    // Actualización del cronómetro
    this.registry.events.on("updateTimer", (timeElapsed) => {
      this.timerText.setText("Tiempo: " + timeElapsed.toFixed(1) + "s");
    });

    // Actualización del indicador de progreso
    this.registry.events.on("updateProgress", (progress) => {
      this.progressBar.width = (progress / 100) * 400;
      this.progressText.setText("Progreso: " + progress.toFixed(0) + "%");
    });
  }
}
