export default class CircuitScene extends Phaser.Scene {
  constructor() {
    super("CircuitScene");
  }

  preload() {
    // Se carga el fondo de la ruta. Verifica que el archivo se llame exactamente "track_background.png"
    this.load.image("trackBackground", "assets/images/track_background.png");
    // Se carga el atlas de partículas (asegúrate de que existan estos archivos)
    this.load.atlas('flares', 'assets/images/flares.png', 'assets/images/flares.json');
  }

  create() {
    // Definimos una pista más estrecha: ancho = 1200, alto = 9000
    const worldWidth = 1200;
    const worldHeight = 9000;

    // Agregamos el fondo de la pista
    this.add.image(0, 0, "trackBackground")
      .setOrigin(0, 0)
      .setDisplaySize(worldWidth, worldHeight);

    // Configuración de límites del mundo y de la cámara
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    // Creamos paredes laterales para definir la pista
    let leftWall = this.add.rectangle(0, worldHeight / 2, 20, worldHeight, 0x333333);
    this.physics.add.existing(leftWall, true);
    let rightWall = this.add.rectangle(worldWidth, worldHeight / 2, 20, worldHeight, 0x333333);
    this.physics.add.existing(rightWall, true);

    // Creamos la línea de meta en la parte superior (y = 50)
    this.createFinishLine();

    // Señales de avance (para dar feedback al jugador)
    this.createDirectionSigns();

    // Marcadores de carril (lane markers) para simular el movimiento y delimitar la pista
    this.createLaneMarkers();

    // Checkpoints repartidos a lo largo de la carrera
    this.createCheckpoints();
  }

  createFinishLine() {
    // La meta se ubica en la parte superior central; usamos x=550 para centrarla en un mundo de 1200 de ancho
    const finishLineX = 550;
    const finishLineY = 50;
    const finishLineWidth = 100;
    const finishLineHeight = 10;

    // Zona de detección para la meta
    this.finishLine = this.add.zone(finishLineX, finishLineY, finishLineWidth, finishLineHeight)
      .setOrigin(0, 0)
      .setRectangleDropZone(finishLineWidth, finishLineHeight);

    // Se guarda en el registry para que GameScene pueda acceder a ella
    this.registry.set("finishLine", this.finishLine);

    // Gráficos de la línea de meta: poste, bandera y texto
    const flagPole = this.add.line(
      finishLineX + finishLineWidth / 2 - 15,
      finishLineY + 50,
      0, 0, 0, -50,
      0xffffff
    ).setLineWidth(4);

    const flag = this.add.graphics()
      .fillStyle(0xff0000, 1)
      .fillRect(finishLineX + finishLineWidth / 2 - 10, finishLineY + 30, 30, 20)
      .lineStyle(2, 0x000000)
      .strokeRect(finishLineX + finishLineWidth / 2 - 10, finishLineY + 30, 30, 20);

    this.add.text(
      finishLineX + finishLineWidth / 2,
      finishLineY + 10,
      "META",
      {
        fontSize: "28px",
        fill: "#FFFFFF",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4
      }
    ).setOrigin(0.5);

    // Efecto de partículas opcional
    this.finishParticles = this.add.particles("flares")
      .createEmitter({
        frame: "white",
        x: finishLineX + finishLineWidth / 2,
        y: finishLineY,
        speed: { min: -50, max: 50 },
        angle: { min: -85, max: -95 },
        scale: { start: 0.3, end: 0 },
        blendMode: "ADD",
        active: false,
        frequency: 100
      });
  }

  createDirectionSigns() {
    // Se muestran mensajes que animan al jugador
    const signs = [
      { x: 600, y: 8000, text: "¡Buen ritmo!", angle: 0, color: 0x00BFFF },
      { x: 600, y: 4000, text: "¡Acelera!", angle: 0, color: 0x32CD32 }
    ];

    signs.forEach(signData => {
      const sign = this.add.container(signData.x, signData.y);

      // Poste del letrero
      const post = this.add.line(0, 0, 0, 0, 0, 40, 0x8B4513)
        .setLineWidth(8)
        .setOrigin(0.5, 1);

      // Cuerpo y fondo del letrero
      const body = this.add.graphics()
        .fillStyle(signData.color, 1)
        .fillRoundedRect(-40, -50, 80, 60, 10)
        .lineStyle(3, 0x000000)
        .strokeRoundedRect(-40, -50, 80, 60, 10);

      // Texto del letrero
      const text = this.add.text(0, -40, signData.text, {
        fontSize: "20px",
        fill: "#FFFFFF",
        align: "center",
        stroke: "#000000",
        strokeThickness: 3
      }).setOrigin(0.5);

      // Flecha indicadora
      const arrow = this.add.triangle(0, -10, 0, 0, 30, 15, 0, 30, signData.color)
        .setAngle(signData.angle);

      sign.add([post, body, text, arrow]);
      sign.setDepth(1);

      // Animación de flotación para dar dinamismo
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

  createLaneMarkers() {
    const worldWidth = 1200;
    const worldHeight = 9000;
    const centerX = worldWidth / 2;
    const markerLength = 30;
    const gap = 20;

    const graphics = this.add.graphics();
    graphics.lineStyle(4, 0xffffff, 0.5);

    for (let y = 0; y < worldHeight; y += markerLength + gap) {
      graphics.strokeLineShape(new Phaser.Geom.Line(centerX, y, centerX, y + markerLength));
    }
  }

  createCheckpoints() {
    // Checkpoints centrados en la pista para feedback visual
    const checkpoints = [
      { x: 600, y: 7000 },
      { x: 600, y: 5000 },
      { x: 600, y: 3000 }
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

      // Zona de detección (para efectos visuales, sin funcionalidad crítica)
      this.add.zone(cp.x, cp.y, 60, 60)
        .setRectangleDropZone(60, 60)
        .setData("activated", false);
    });
  }
}
