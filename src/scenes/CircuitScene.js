export default class CircuitScene extends Phaser.Scene {
    constructor() {
        super("CircuitScene");
    }

    preload() {
        // Se carga el fondo de la ruta (asegúrate de que la ruta del asset no se modifique)
        this.load.image("trackBackground", "assets/images/track_backgrund.png");
        // Se asume que el asset "flares" ya está cargado en otra parte o disponible
    }

    create() {
        const worldWidth = 2000;
        const worldHeight = 9000; // Mundo extendido para una carrera de 30 segundos a full speed

        // Fondo del circuito (ruta clara)
        this.add.image(0, 0, "trackBackground")
            .setOrigin(0, 0)
            .setDisplaySize(worldWidth, worldHeight);

        // Configuración física y de cámara
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

        // Línea de meta en la parte superior de la pista
        this.createFinishLine();

        // Señalización direccional y de avance
        this.createDirectionSigns();

        // Marcadores de carril (lane markers) para dar sensación de movimiento y guía visual
        this.createLaneMarkers();

        // Checkpoints distribuidos a lo largo de la carrera
        this.createCheckpoints();
    }

    createFinishLine() {
        // La meta se posiciona en la parte superior central (y = 50)
        const finishLineX = 950;
        const finishLineY = 50;
        const finishLineWidth = 100;
        const finishLineHeight = 10;

        // Zona de detección de meta
        this.finishLine = this.add.zone(finishLineX, finishLineY, finishLineWidth, finishLineHeight)
            .setOrigin(0)
            .setRectangleDropZone(finishLineWidth, finishLineHeight);

        // Se guarda en el registry para que GameScene pueda acceder a ella
        this.registry.set("finishLine", this.finishLine);

        // Gráficos de la línea de meta
        const flagPole = this.add.line(
            finishLineX + finishLineWidth / 2 - 15,
            finishLineY + 50, // Se dibuja hacia abajo para mayor visibilidad
            0, 0, 0, -50,
            0xffffff
        ).setLineWidth(4);

        const flag = this.add.graphics()
            .fillStyle(0xff0000, 1)
            .fillRect(finishLineX + finishLineWidth / 2 - 10, finishLineY + 30, 30, 20)
            .lineStyle(2, 0x000000)
            .strokeRect(finishLineX + finishLineWidth / 2 - 10, finishLineY + 30, 30, 20);

        // Texto de meta
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

        // Efecto de partículas (opcional)
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
        // Señales que indican avance y progreso (por ejemplo: "¡Vas bien!" y "¡Acelera!")
        const signs = [
            { x: 1000, y: 8000, text: "¡Vas bien!", angle: 0, color: 0x00BFFF },
            { x: 1100, y: 4000, text: "¡Acelera!", angle: 0, color: 0x32CD32 }
        ];

        signs.forEach(signData => {
            const sign = this.add.container(signData.x, signData.y);
            
            // Poste del letrero
            const post = this.add.line(0, 0, 0, 0, 0, 40, 0x8B4513)
                .setLineWidth(8)
                .setOrigin(0.5, 1);

            // Cuerpo del letrero
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

            // Flecha direccional
            const arrow = this.add.triangle(0, -10, 0, 0, 30, 15, 0, 30, signData.color)
                .setAngle(signData.angle);

            sign.add([post, body, text, arrow]);
            sign.setDepth(1);

            // Animación de flotación para mayor dinamismo
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
        const worldWidth = 2000;
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
        // Distribuidos en puntos estratégicos del recorrido
        const checkpoints = [
            { x: 1000, y: 7000 },
            { x: 1000, y: 5000 },
            { x: 1000, y: 3000 }
        ];

        checkpoints.forEach((cp, index) => {
            const checkpoint = this.add.container(cp.x, cp.y);
            
            // Poste del checkpoint
            const pole = this.add.line(0, 0, 0, 0, 0, 60, 0xFFFFFF)
                .setLineWidth(6)
                .setOrigin(0.5, 1);

            // Bandera
            const flag = this.add.graphics()
                .fillStyle(0xFFD700, 1)
                .fillTriangle(-20, -60, 20, -60, 0, -20)
                .lineStyle(2, 0x000000)
                .strokeTriangle(-20, -60, 20, -60, 0, -20);

            // Número del checkpoint
            const number = this.add.text(0, -40, `${index + 1}`, {
                fontSize: "28px",
                fill: "#000000",
                fontStyle: "bold",
                stroke: "#FFFFFF",
                strokeThickness: 3
            }).setOrigin(0.5);

            checkpoint.add([pole, flag, number]);
            
            // Zona de detección (para feedback visual si se pasa)
            this.add.zone(cp.x, cp.y, 60, 60)
                .setRectangleDropZone(60, 60)
                .setData("activated", false);
        });
    }
}
