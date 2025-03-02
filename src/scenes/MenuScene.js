export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        // Fondo: se muestra la imagen o, en su defecto, un color sólido
        if (this.textures.exists('menuBackground')) {
            this.add.image(
                this.cameras.main.centerX,
                this.cameras.main.centerY,
                'menuBackground'
            ).setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        } else {
            this.cameras.main.setBackgroundColor(0x000000);
            console.error("Falta el asset 'menuBackground'");
        }

        // Logo con fade-in sutil y reposicionado (centrado en la parte superior con margen)
        if (this.textures.exists('logo')) {
            const logo = this.add.image(this.cameras.main.centerX, 60, 'logo')
                .setScale(0.7)
                .setAlpha(0);
            // Efecto de aparición suave
            this.tweens.add({
                targets: logo,
                alpha: 1,
                duration: 1000,
                ease: 'Power2'
            });
        } else {
            console.error("Falta el asset 'logo'");
        }

        // Título con contenedor redondeado, sombra y escalado según el contenido
        const titleText = this.add.text(0, 0, "Milei Kart: La Carrera de la Distracción", {
            fontFamily: '"Arcade Classic", sans-serif',
            fontSize: '36px',
            fill: '#32CD32',
            stroke: '#000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5)
          .setShadow(2, 2, "#000", 2, true, true);
        // Fondo ajustado al tamaño del texto, con bordes suaves
        const titleBg = this.add.rectangle(
            0,
            0,
            titleText.width + 40,
            titleText.height + 20,
            0x000000,
            0.7
        ).setStrokeStyle(2, 0xffffff)
         .setOrigin(0.5);
        const titleContainer = this.add.container(this.cameras.main.centerX, 130, [titleBg, titleText]);
        titleContainer.alpha = 0;
        this.tweens.add({
            targets: titleContainer,
            alpha: 1,
            duration: 1500,
            ease: 'Power2'
        });

        // Narrativa satírica con contenedor ajustado, wordWrap dinámico y sombra en el texto
        const narrative = "En un país sumido en el caos del escándalo cripto y los errores del gobierno, Milei lanza su desafío definitivo. Con su kart revolucionario, se enfrenta a Kiciloff y a la oposición, desviando las críticas y demostrando maniobras audaces en cada curva.";
        const narrativeText = this.add.text(0, 0, narrative, {
            fontFamily: 'Arial',
            fontSize: '20px',
            fill: '#fff',
            align: 'center',
            wordWrap: { width: this.cameras.main.width * 0.8 }
        }).setOrigin(0.5)
          .setShadow(2, 2, "#000", 2, true, true);
        const narrativeBg = this.add.rectangle(
            0,
            0,
            narrativeText.width + 40,
            narrativeText.height + 20,
            0x000000,
            0.7
        ).setStrokeStyle(2, 0xffffff)
         .setOrigin(0.5);
        const narrativeContainer = this.add.container(this.cameras.main.centerX, 250, [narrativeBg, narrativeText]);
        narrativeContainer.alpha = 0;
        this.tweens.add({
            targets: narrativeContainer,
            alpha: 1,
            duration: 1500,
            delay: 500,
            ease: 'Power2'
        });

        // Botón "JUGAR" con contenedor redimensionable, interactividad y efectos de escalado
        const buttonText = this.add.text(0, 0, "JUGAR", {
            fontFamily: '"Arcade Classic", sans-serif',
            fontSize: '28px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5)
          .setShadow(2, 2, "#000", 2, true, true);
        const buttonBg = this.add.rectangle(
            0,
            0,
            buttonText.width + 40,
            buttonText.height + 20,
            0xFF2222,
            1
        ).setStrokeStyle(4, 0xffffff)
         .setOrigin(0.5)
         .setInteractive({ useHandCursor: true });
        const buttonContainer = this.add.container(this.cameras.main.centerX, 400, [buttonBg, buttonText]);
        buttonContainer.alpha = 0;
        this.tweens.add({
            targets: buttonContainer,
            alpha: 1,
            duration: 1500,
            delay: 1000,
            ease: 'Power2'
        });

        // Interactividad del botón: escalado, rebote y transición a la escena de juego
        buttonBg.on('pointerdown', () => {
            this.sound.play('menuSelect');
            this.tweens.add({
                targets: buttonContainer,
                scale: 0.9,
                duration: 100,
                yoyo: true,
                ease: 'Power2',
                onComplete: () => {
                    this.scene.start('GameScene');
                }
            });
        });
        buttonBg.on('pointerover', () => {
            this.tweens.add({
                targets: buttonContainer,
                scale: 1.05,
                duration: 200,
                ease: 'Power2'
            });
        });
        buttonBg.on('pointerout', () => {
            this.tweens.add({
                targets: buttonContainer,
                scale: 1,
                duration: 200,
                ease: 'Power2'
            });
        });
    }
}