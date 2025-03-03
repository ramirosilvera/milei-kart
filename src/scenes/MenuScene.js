export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        // Fondo: verificamos que la imagen exista y la colocamos de fondo
        if (this.textures.exists('menuBackground')) {
            this.add.image(
                this.cameras.main.centerX,
                this.cameras.main.centerY,
                'menuBackground'
            ).setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        } else {
            this.cameras.main.setBackgroundColor(0x222222); // Fondo gris oscuro si falta la imagen
            console.error("Falta el asset 'menuBackground'");
        }

        // Logo
        if (this.textures.exists('logo')) {
            const logo = this.add.image(this.cameras.main.centerX, 100, 'logo')
                .setScale(0.6)
                .setAlpha(0);
            this.tweens.add({
                targets: logo,
                alpha: 1,
                duration: 1000,
                ease: 'Power2'
            });
        } else {
            console.error("Falta el asset 'logo'");
        }

        // Título del juego
        const titleText = this.add.text(this.cameras.main.centerX, 180, "Milei Kart", {
            fontFamily: '"Arcade Classic", sans-serif',
            fontSize: '48px',
            fill: '#FFD700', // Dorado para resaltar
            stroke: '#000',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setShadow(3, 3, "#000", 3, true, true);

        // Texto de narrativa
        const narrative = "En un mundo de crisis económica y escándalos cripto, Milei recurre a su arma favorita: la distracción mediática. Ataca al kirchnerismo con tweets incendiarios y promesas vacías, mientras su gobierno se hunde en el caos. ¡Recoge power-ups como Desinformación, Tweets Falsos y Escudo de Privilegios para desviar la atención y mantenerte en la carrera del poder! ¿Podrás sobrevivir a las trampas de la oposición y a tus propias falencias?";
        const narrativeText = this.add.text(this.cameras.main.centerX, 250, narrative, {
            fontFamily: 'Arial',
            fontSize: '20px',
            fill: '#FFFFFF',
            align: 'center',
            wordWrap: { width: this.cameras.main.width * 0.8 }
        }).setOrigin(0.5);

        // Mini Tutorial
        const tutorial = "Instrucciones:\n- Recoge powerups para atacar y defenderte.\n- Usa tus habilidades para ganar la carrera.";
        const tutorialText = this.add.text(this.cameras.main.centerX, 320, tutorial, {
            fontFamily: 'Arial',
            fontSize: '18px',
            fill: '#DDDDDD',
            align: 'center',
            wordWrap: { width: this.cameras.main.width * 0.8 }
        }).setOrigin(0.5);

        // Botón de JUGAR
        const buttonBg = this.add.rectangle(
            this.cameras.main.centerX,
            400,
            200, 60,
            0xFF2222, // Rojo llamativo
            1
        ).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const buttonText = this.add.text(this.cameras.main.centerX, 400, "JUGAR", {
            fontFamily: '"Arcade Classic", sans-serif',
            fontSize: '28px',
            fill: '#FFF',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Animaciones del botón
        buttonBg.on('pointerdown', () => {
            this.sound.play('menuSelect');
            this.tweens.add({
                targets: [buttonBg, buttonText],
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
                targets: buttonBg,
                scale: 1.1,
                duration: 200,
                ease: 'Power2'
            });
        });

        buttonBg.on('pointerout', () => {
            this.tweens.add({
                targets: buttonBg,
                scale: 1,
                duration: 200,
                ease: 'Power2'
            });
        });

        // Ajuste del orden de los elementos
        this.children.bringToTop(buttonBg);
        this.children.bringToTop(buttonText);
    }
}