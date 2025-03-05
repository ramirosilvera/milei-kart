// CircuitScene.js - Escena del Circuito Mejorada
export default class CircuitScene extends Phaser.Scene {
    constructor() {
        super("CircuitScene");
    }

    preload() {
        this.load.image("trackBackground", "assets/images/track_background.png");
    }

    create() {
        const worldWidth = 2000;
        const worldHeight = 2000;

        // Fondo del circuito
        this.add.image(0, 0, "trackBackground")
            .setOrigin(0, 0)
            .setDisplaySize(worldWidth, worldHeight);

        // Configuración física y de cámara
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

        // Línea de meta mejorada
        this.createFinishLine();
        
        // Señalización direccional
        this.createDirectionSigns();
        
        // Checkpoints
        this.createCheckpoints();
    }

    createFinishLine() {
        const finishLineX = 950;
        const finishLineY = 1800;
        const finishLineWidth = 100;
        const finishLineHeight = 10;

        // Zona de detección
        this.finishLine = this.add.zone(finishLineX, finishLineY, finishLineWidth, finishLineHeight)
            .setOrigin(0)
            .setRectangleDropZone(finishLineWidth, finishLineHeight);

        // Gráficos de la línea de meta
        const flagPole = this.add.line(
            finishLineX + finishLineWidth/2 - 15,
            finishLineY - 50,
            0, 0, 0, 50,
            0xffffff
        ).setLineWidth(4);

        const flag = this.add.graphics()
            .fillStyle(0xff0000, 1)
            .fillRect(finishLineX + finishLineWidth/2 - 10, finishLineY - 50, 30, 20)
            .lineStyle(2, 0x000000)
            .strokeRect(finishLineX + finishLineWidth/2 - 10, finishLineY - 50, 30, 20);

        // Texto de meta
        this.add.text(
            finishLineX + finishLineWidth/2,
            finishLineY - 80,
            "META",
            {
                fontSize: "28px",
                fill: "#FFFFFF",
                fontStyle: "bold",
                stroke: "#000000",
                strokeThickness: 4
            }
        ).setOrigin(0.5);

        // Efecto de partículas
        this.finishParticles = this.add.particles("flares")
            .createEmitter({
                frame: "white",
                x: finishLineX + finishLineWidth/2,
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
        const signs = [
            { x: 1000, y: 1700, text: "CURVA\nCERRADA", angle: 0, color: 0xFFA500 },
            { x: 1200, y: 1300, text: "GIRO\nIZQ", angle: -45, color: 0x00FF00 },
            { x: 800, y: 1100, text: "DESVÍO\n→", angle: 25, color: 0xFFFF00 }
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

            // Animación de flotación
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

    createCheckpoints() {
        const checkpoints = [
            { x: 500, y: 1500 },
            { x: 1500, y: 800 },
            { x: 1800, y: 1700 }
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
            
            // Zona de detección
            const zone = this.add.zone(cp.x, cp.y, 60, 60)
                .setRectangleDropZone(60, 60)
                .setData("activated", false);
        });
    }
}
