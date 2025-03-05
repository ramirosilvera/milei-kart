export default class CircuitScene extends Phaser.Scene {
  constructor() {
    super("CircuitScene");
  }

  preload() {
    // Cargamos el fondo del circuito
    this.load.image("circuit", "assets/circuit.png");
  }

  create() {
    // Definimos el tamaño del mundo (por ejemplo, 2000x2000)
    const worldWidth = 2000;
    const worldHeight = 2000;

    // Agregamos la imagen del circuito como fondo, ajustándola al tamaño del mundo
    this.add.image(0, 0, "circuit")
      .setOrigin(0, 0)
      .setDisplaySize(worldWidth, worldHeight);

    // Configuramos los límites del mundo para la física y la cámara
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    // Dibujamos la línea de meta (finish line)
    // Por ejemplo, ubicamos la línea en la parte inferior del circuito
    const finishLineX = 950;
    const finishLineY = 1800;
    const finishLineWidth = 100;
    const finishLineHeight = 10;

    let graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(finishLineX, finishLineY, finishLineWidth, finishLineHeight);

    // Agregamos un texto indicativo
    this.add.text(finishLineX + finishLineWidth / 2, finishLineY - 20, "FINISH", {
      fontSize: "20px",
      fill: "#fff",
      fontStyle: "bold",
    }).setOrigin(0.5);

    // Guardamos la zona de la línea de meta en el registry para que GameScene la use
    const finishLineRect = new Phaser.Geom.Rectangle(finishLineX, finishLineY, finishLineWidth, finishLineHeight);
    this.registry.set("finishLine", finishLineRect);
  }
}
