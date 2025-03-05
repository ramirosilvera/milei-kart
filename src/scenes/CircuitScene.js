export default class CircuitScene extends Phaser.Scene {
  constructor() {
    super("CircuitScene");
  }

  preload() {
    // Cargamos el fondo de la pista y la imagen de la meta
    this.load.image("trackBackground", "assets/images/track_background.png");
    this.load.image("meta", "assets/images/meta.png");
    // Atlas de partículas (asegúrate de que existan los archivos)
    this.load.atlas("flares", "assets/images/flares.png", "assets/images/flares.json");
  }

  create() {
    // Definimos una pista más angosta: ancho = 1000, alto = 9000 (carrera de ~30 s a máxima velocidad)
    const worldWidth = 1000;
    const worldHeight = 9000;

    // Fondo de la pista (la imagen se adapta al tamaño definido)
    this.add.image(0, 0, "trackBackground")
      .setOrigin(0, 0)
      .setDisplaySize(worldWidth, worldHeight);

    // Configuración de límites del mundo y de la cámara
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    // Paredes laterales para delimitar la pista
    let leftWall = this.add.rectangle(0, worldHeight / 2, 20, worldHeight, 0x333333);
    this.physics.add.existing(leftWall, true);
    let rightWall = this.add.rectangle(worldWidth, worldHeight / 2, 20, worldHeight, 0x333333);
    this.physics.add.existing(rightWall, true);

    // Creamos la meta usando la imagen "meta" que se extiende a lo ancho de la pista
    this.createFinishLine(worldWidth);

    // Señales de avance para feedback al jugador
    this.createDirectionSigns(worldWidth);

    // Marcadores de carril (lane markers)
    this.createLaneMarkers(worldWidth, worldHeight);

    // Checkpoints repartidos a lo largo de la carrera (centrados)
    this.createCheckpoints(worldWidth);
  }

  createFinishLine(worldWidth) {
    // La meta se dibuja como una imagen que recorre todo el ancho
    // Se posiciona en la parte superior (y = 0)
    const metaImage = this.add.image(0, 0, "meta")
      .setOrigin(0, 0)
      .setDisplaySize(worldWidth, 100);
    // Creamos también una zona de detección (más amplia) para considerar el cruce de meta
    this.finishLine = this.add.zone(0, 0, worldWidth, 100)
      .setOrigin(0, 0)
      .setRectangleDropZone(worldWidth, 100);
    // Guardamos la zona de meta en el registry para que GameScene la pueda usar
    this.registry.set("finishLine", this.finishLine);
  }

  createDirectionSigns(worldWidth) {
    // Mensajes de feedback a lo largo de la pista
    const signs = [
      { x: worldWidth / 2, y: 8000, text: "¡Buen ritmo!", angle: 0, color: 0x00BFFF },
      { x: worldWidth / 2, y: 4000, text: "¡Acelera!", angle: 0, color: 0x32CD32 }
    ];

    signs.forEach(signData => {
      const sign = this.add.container(signData.x, signData.y);

      const post = this.add.line(0, 0, 0, 0, 0, 40, 0x8B4513)
        .setLineWidth(8)
        .setOrigin(0.5, 1);

      const body = this.add.graphics()
        .fillStyle(signData.color, 1)
        .fillRoundedRect(-40, -50, 80, 60, 10)
        .lineStyle(3, 0x000000)
        .strokeRoundedRect(-40, -50, 80, 60, 10);

      const text = this.add.text(0, -40, signData.text, {
        fontSize: "20px",
        fill: "#FFFFFF",
        align: "center",
        stroke: "#000000",
        strokeThickness: 3
      }).setOrigin(0.5);

      const arrow = this.add.triangle(0, -10, 0, 0, 30, 15, 0, 30, signData.color)
        .setAngle(signData.angle);

      sign.add([post, body, text, arrow]);
      sign.setDepth(1);

      this.tweens.add({
        targets: sign,
        y: signData.y - 5,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });
    });
  }

  createLaneMarkers(worldWidth, worldHeight) {
    const centerX = worldWidth / 2;
    const markerLength = 30;
    const gap = 20;

    const graphics = this.add.graphics();
    graphics.lineStyle(4, 0xffffff, 0.5);

    for (let y = 0; y < worldHeight; y += markerLength + gap) {
      graphics.strokeLineShape(new Phaser.Geom.Line(centerX, y, centerX, y + markerLength));
    }
  }

  createCheckpoints(worldWidth) {
    // Colocamos checkpoints centrados en la pista
    const checkpoints = [
      { x: worldWidth / 2, y: 7000 },
      { x: worldWidth / 2, y: 5000 },
      { x: worldWidth / 2, y: 3000 }
    ];

    checkpoints.forEach((cp, index) => {
      const checkpoint = this.add.container(cp.x, cp.y);

      const pole = this.add.line(0, 0, 0, 0, 0, 60, 0xFFFFFF)
        .setLineWidth(6)
        .setOrigin(0.5, 1);

      const flag = this.add.graphics()
        .fillStyle(0xFFD700, 1)
        .fillTriangle(-20, -60, 20, -60, 0, -20)
        .lineStyle(2, 0x000000)
        .strokeTriangle(-20, -60, 20, -60, 0, -20);

      const number = this.add.text(0, -40, `${index + 1}`, {
        fontSize: "28px",
        fill: "#000000",
        fontStyle: "bold",
        stroke: "#FFFFFF",
        strokeThickness: 3
      }).setOrigin(0.5);

      checkpoint.add([pole, flag, number]);

      // Zona de detección para feedback (sin funcionalidad crítica)
      this.add.zone(cp.x, cp.y, 60, 60)
        .setRectangleDropZone(60, 60)
        .setData("activated", false);
    });
  }
}
