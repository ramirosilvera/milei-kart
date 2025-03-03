export default class UIScene extends Phaser.Scene {
  constructor() {
    super("UIScene");
  }

  create() {
    // Contenedor para la UI
    this.uiContainer = this.add.container(0, 0);

    // Barra de salud del jugador (esquina superior izquierda)
    const playerHealthBg = this.add
      .rectangle(50, 20, 300, 50, 0x000000, 0.7)
      .setOrigin(0);
    this.playerHealthBar = this.add
      .rectangle(50, 20, 300, 50, 0x00ff00)
      .setOrigin(0);
    const playerHealthText = this.add.text(60, 30, "Jugador: 100", {
      fontSize: "28px",
      fill: "#ffffff",
      fontStyle: "bold",
    });

    // Barra de salud del oponente (esquina superior derecha)
    const opponentHealthBg = this.add
      .rectangle(this.cameras.main.width - 350, 20, 300, 50, 0x000000, 0.7)
      .setOrigin(0);
    this.opponentHealthBar = this.add
      .rectangle(this.cameras.main.width - 350, 20, 300, 50, 0xff0000)
      .setOrigin(0);
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

    // Agregar elementos al contenedor
    this.uiContainer.add([
      playerHealthBg,
      this.playerHealthBar,
      playerHealthText,
      opponentHealthBg,
      this.opponentHealthBar,
      opponentHealthText,
    ]);

    // Guardar referencias para actualizar la UI
    this.playerHealthText = playerHealthText;
    this.opponentHealthText = opponentHealthText;

    // Escuchar el evento para actualizar la salud
    this.registry.events.on("updateHealth", (data) => {
      const playerWidth = (data.player / 100) * 300;
      this.playerHealthBar.width = playerWidth;
      this.playerHealthText.setText("Jugador: " + data.player);

      const opponentWidth = (data.opponent / 100) * 300;
      this.opponentHealthBar.width = opponentWidth;
      this.opponentHealthText.setText("Oponente: " + data.opponent);
    });
  }
}