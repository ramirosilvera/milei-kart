export default class CircuitScene extends Phaser.Scene {
  constructor() {
    super("CircuitScene");
  }

  preload() {
    // Carga la imagen del fondo del circuito desde assets/images
    this.load.image("trackBackground", "assets/images/track_background.png");
  }

  create() {
    const worldWidth = 2000;
    const worldHeight = 2000;

    // Agregamos el fondo; se estira para llenar el mundo
    this.add.image(0, 0, "trackBackground")
      .setOrigin(0, 0)
      .setDisplaySize(worldWidth, worldHeight);

    // Configuramos límites para el mundo y la cámara
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    // Dibujamos la línea de meta
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

    // Guardamos la zona de la línea de meta para el conteo de vueltas
    const finishLineRect = new Phaser.Geom.Rectangle(
      finishLineX,
      finishLineY,
      finishLineWidth,
      finishLineHeight
    );
    this.registry.set("finishLine", finishLineRect);

    // Agregamos flechas indicadoras para guiar al jugador
    this.createDirectionArrows();
  }

  createDirectionArrows() {
    // Datos de las flechas: posición (x,y) y ángulo (en grados)
    const arrowsData = [
      { x: 1000, y: 1700, angle: 0 },
      { x: 1100, y: 1500, angle: -30 },
      { x: 1200, y: 1300, angle: 20 }
    ];
    arrowsData.forEach(data => {
      // Creamos la flecha con forma de triángulo; el tamaño se puede ajustar
      let arrow = this.add.triangle(data.x, data.y, 0, 0, 40, 20, 0, 40, 0xffff00, 1);
      arrow.setAngle(data.angle);
      // Animación de pulsación para llamar la atención
      this.tweens.add({
        targets: arrow,
        scale: 1.1,
        duration: 1000,
        yoyo: true,
        repeat: -1
      });
    });
  }
}