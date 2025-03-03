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

        // Logo: se reduce la escala y se coloca con un margen superior para evitar que sobresalga
        if (this.textures.exists('logo')) {
            const logo = this.add.image(this.cameras.main.centerX, 50, 'logo')
                .setScale(0.3)
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

        // Título: sin borde en el fondo, con mayor tamaño y sombra
        const titleText = this.add.text(0, 0, "Milei Kart: La Carrera de la Distracción", {
            fontFamily: '"Arcade Classic", sans-serif',
            fontSize: '42px',
            fill: '#32CD32',
            stroke: '#000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5).setShadow(2, 2, "#000", 2, true, true);
        const titleBg = this.add.rectangle(
            0,
            0,
            titleText.width + 60,
            titleText.height + 30,
            0x000000,
            0.7
        ).setOrigin(0.5);
        const titleContainer = this.add.container(this.cameras.main.centerX, 110, [titleBg, titleText]);
        titleContainer.alpha = 0;
        this.tweens.add({
            targets: titleContainer,
            alpha: 1,
            duration: 1500,
            ease: 'Power2'
        });

        // Narrativa ampliada: se reposiciona para dar mayor espacio
        const narrative = " En un mundo de crisis económica y escándalos cripto, Milei recurre a su arma favorita: la distracción mediática. Ataca al kirchnerismo con tweets incendiarios y promesas vacías, mientras su gobierno se hunde en el caos. ¡Recoge power-ups como Desinformación, Tweets Falsos y Escudo de Privilegios para desviar la atención y mantenerte en la carrera del poder! ¿Podrás sobrevivir a las trampas de la oposición y a tus propias falencias?";
        const narrativeText = this.add.text(0, 0, narrative, {
            fontFamily: 'Arial',
            fontSize: '24px',
            fill: '#fff',
            align: 'center',
            wordWrap: { width: this.cameras.main.width * 0.8 }
        }).setOrigin(0.5).setShadow(2, 2, "#000", 2, true, true);
        const narrativeBg = this.add.rectangle(
            0,
            0,
            narrativeText.width + 40,
            narrativeText.height + 20,
            0x000000,
            0.7
        ).setOrigin(0.5);
        const narrativeContainer = this.add.container(this.cameras.main.centerX, 250, [narrativeBg, narrativeText]);
        narrativeContainer.alpha = 0;
        this.tweens.add({
            targets: narrativeContainer,
            alpha: 1,
            duration: 1500,
            delay: 500,
            ease: 'Power2'
        });

        // Mini Tutorial: instrucciones del juego, sin borde en el fondo
        const tutorial = "Mini Tutorial:\n\n- Recoge powerups: Desinformación, Tweets, Hostigamiento y Escudo de Privilegios.\n- Úsalos para atacar al enemigo y defenderte.\n- Gana la carrera reduciendo la barra de salud del oponente a cero.";
        const tutorialText = this.add.text(0, 0, tutorial, {
            fontFamily: 'Arial',
            fontSize: '24px',
            fill: '#FFD700',
            align: 'left',
            wordWrap: { width: this.cameras.main.width * 0.8 }
        }).setOrigin(0.5).setShadow(2, 2, "#000", 2, true, true);
        const tutorialBg = this.add.rectangle(
            0,
            0,
            tutorialText.width + 40,
            tutorialText.height + 20,
            0x000000,
            0.7
        ).setOrigin(0.5);
        const tutorialContainer = this.add.container(this.cameras.main.centerX, 400, [tutorialBg, tutorialText]);
        tutorialContainer.alpha = 0;
        this.tweens.add({
            targets: tutorialContainer,
            alpha: 1,
            duration: 1500,
            delay: 1000,
            ease: 'Power2'
        });

        // Botón "JUGAR": sin borde en el fondo, con mayor tamaño de texto y efectos de interacción
        const buttonText = this.add.text(0, 0, "JUGAR", {
            fontFamily: '"Arcade Classic", sans-serif',
            fontSize: '32px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5).setShadow(2, 2, "#000", 2, true, true);
        const buttonBg = this.add.rectangle(
            0,
            0,
            buttonText.width + 40,
            buttonText.height + 20,
            0xFF2222,
            1
        ).setOrigin(0.5)
         .setInteractive({ useHandCursor: true });
        const buttonContainer = this.add.container(this.cameras.main.centerX, 550, [buttonBg, buttonText]);
        buttonContainer.alpha = 0;
        this.tweens.add({
            targets: buttonContainer,
            alpha: 1,
            duration: 1500,
            delay: 1500,
            ease: 'Power2'
        });

        // Interactividad del botón "JUGAR" con animación y transición
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