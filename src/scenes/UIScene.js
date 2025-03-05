export default class UIScene extends Phaser.Scene {
  constructor() {
    super("UIScene");
  }

  create() {
    this.uiContainer = this.add.container(0, 0);

    // Barra de salud del jugador (esquina superior izquierda)
    const playerHealthBg = this.add.rectangle(50, 20, 300, 50, 0x000000, 0.7).setOrigin(0);
    this.playerHealthBar = this.add.rectangle(50, 20, 300, 50, 0x00ff00).setOrigin(0);
    const playerHealthText = this.add.text(60, 30, "Jugador: 100", {
      fontSize: "28px",
      fill: "#ffffff",
      fontStyle: "bold",
    });

    // Barra de salud del oponente (esquina superior derecha)
    const opponentHealthBg = this.add.rectangle(
      this.cameras.main.width - 350,
      20,
      300,
      50,
      0x000000,
      0.7
    ).setOrigin(0);
    this.opponentHealthBar = this.add.rectangle(
      this.cameras.main.width - 350,
      20,
      300,
      50,
      0xff0000
    ).setOrigin(0);
    const opponentHealthText = this.add.text(
      this.cameras.main.width - 340,
      30,
      "Oponente: 100",
      {
        fontSize: "28px",
        fill: "#ffffff",
        fontStyle: "bold",
      }
    );

    // Cronómetro (central superior)
    this.timerText = this.add.text(
      this.cameras.main.width / 2,
      20,
      "Tiempo: 0.0s",
      {
        fontSize: "28px",
        fill: "#ffffff",
        fontStyle: "bold",
        stroke: "#000",
        strokeThickness: 4,
      }
    )
      .setOrigin(0.5)
      .setScrollFactor(0);

    // Indicador de progreso (en la parte inferior)
    const progressBarBg = this.add
      .rectangle(
        this.cameras.main.width / 2,
        this.cameras.main.height - 50,
        400,
        30,
        0x000000,
        0.7
      )
      .setScrollFactor(0);
    this.progressBar = this.add
      .rectangle(
        this.cameras.main.width / 2 - 200,
        this.cameras.main.height - 50,
        0,
        30,
        0x00ff00
      )
      .setOrigin(0, 0.5)
      .setScrollFactor(0);
    this.progressText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height - 50,
      "Progreso: 0%",
      {
        fontSize: "20px",
        fill: "#ffffff",
        fontStyle: "bold",
        stroke: "#000",
        strokeThickness: 3,
      }
    )
      .setOrigin(0.5)
      .setScrollFactor(0);

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
      this.progressText,
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
      // La barra se extiende de 0 a 400 píxeles
      this.progressBar.width = (progress / 100) * 400;
      this.progressText.setText("Progreso: " + progress.toFixed(0) + "%");
    });
  }
}
