export default class CircuitScene extends Phaser.Scene {
  constructor() {
    super("CircuitScene");
  }

  preload() {
    // Carga la imagen del circuito desde la carpeta assets/images
    this.load.image("trackBackground", "assets/images/track_background.png");
  }

  create() {
    // Dimensiones del mundo
    const worldWidth = 2000;
    const worldHeight = 2000;

    // Agregamos el fondo del circuito (track_background.png)
    this.add.image(0, 0, "trackBackground")
      .setOrigin(0, 0)
      .setDisplaySize(worldWidth, worldHeight);

    // Configuramos los límites del mundo
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    // Dibujamos la línea de meta (rectángulo blanco y texto de "FINISH")
    const finishLineX = 950;
    const finishLineY = 1800;
    const finishLineWidth = 100;
    const finishLineHeight = 10;

    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(finishLineX, finishLineY, finishLineWidth, finishLineHeight);

    this.add.text(
      finishLineX + finishLineWidth / 2,
      finishLineY - 20,
      "FINISH",
      {
        fontSize: "20px",
        fill: "#fff",
        fontStyle: "bold",
        stroke: "#000",
        strokeThickness: 3,
      }
    ).setOrigin(0.5);

    // Creamos un rectángulo geométrico para la línea de meta y lo guardamos en el registry
    const finishLineRect = new Phaser.Geom.Rectangle(
      finishLineX,
      finishLineY,
      finishLineWidth,
      finishLineHeight
    );
    this.registry.set("finishLine", finishLineRect);
  }
}