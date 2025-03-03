export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        // FONDO: Usar el logo como fondo a pantalla completa y atenuado para no opacar los textos
        if (this.textures.exists('logo')) {
            const bgLogo = this.add.image(
                this.cameras.main.centerX,
                this.cameras.main.centerY,
                'logo'
            ).setDisplaySize(this.cameras.main.width, this.cameras.main.height)
             .setAlpha(0); // Iniciamos transparente para efecto de fade-in

            this.tweens.add({
                targets: bgLogo,
                alpha: 0.3,  // Atenuado para dar un toque moderno sin saturar la escena
                duration: 1000,
                ease: 'Power2'
            });
        } else {
            this.cameras.main.setBackgroundColor(0x000000);
            console.error("Falta el asset 'logo'");
        }

        // (Opcional) Overlay sutil para mejorar la legibilidad de los textos
        const overlay = this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.2
        );

        // TÍTULO: Diseño moderno con tipografía limpia
        const titleText = this.add.text(0, 0, "Milei Kart: La Carrera de la Distracción", {
            fontFamily: 'Roboto, sans-serif',
            fontSize: '42px',
            fill: '#32CD32',
            align: 'center'
        }).setOrigin(0.5).setShadow(2, 2, "#000", 2, true, true);
        const titleBg = this.add.rectangle(
            0,
            0,
            titleText.width + 60,
            titleText.height + 30,
            0x000000,
            0.6
        ).setOrigin(0.5);
        // Ubicamos el título en Y = 150 para separarlo del resto
        const titleContainer = this.add.container(this.cameras.main.centerX, 150, [titleBg, titleText]);
        titleContainer.alpha = 0;
        this.tweens.add({
            targets: titleContainer,
            alpha: 1,
            duration: 1500,
            ease: 'Power2'
        });

        // NARRATIVA: Más separación para evitar solapamientos
        const narrative = "En un mundo de crisis económica y escándalos cripto, Milei recurre a su arma favorita: la distracción mediática. Ataca al kirchnerismo con tweets incendiarios y promesas vacías, mientras su gobierno se hunde en el caos. ¡Recoge power-ups como Desinformación, Tweets Falsos y Escudo de Privilegios para desviar la atención y mantenerte en la carrera del poder! ¿Podrás sobrevivir a las trampas de la oposición y a tus propias falencias?";
        const narrativeText = this.add.text(0, 0, narrative, {
            fontFamily: 'Roboto, sans-serif',
            fontSize: '28px',
            fill: '#FFFFFF',
            align: 'center',
            wordWrap: { width: this.cameras.main.width * 0.8 }
        }).setOrigin(0.5).setShadow(2, 2, "#000", 2, true, true);
        const narrativeBg = this.add.rectangle(
            0,
            0,
            narrativeText.width + 40,
            narrativeText.height + 20,
            0x000000,
            0.6
        ).setOrigin(0.5);
        // Ubicamos la narrativa en Y = 350 para mayor separación
        const narrativeContainer = this.add.container(this.cameras.main.centerX, 350, [narrativeBg, narrativeText]);
        narrativeContainer.alpha = 0;
        this.tweens.add({
            targets: narrativeContainer,
            alpha: 1,
            duration: 1500,
            delay: 500,
            ease: 'Power2'
        });

        // BOTÓN "JUGAR": Diseño limpio y moderno con efectos sutiles
        const buttonText = this.add.text(0, 0, "JUGAR", {
            fontFamily: 'Roboto, sans-serif',
            fontSize: '32px',
            fill: '#FFFFFF',
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
        // Ubicamos el botón en Y = 550
        const buttonContainer = this.add.container(this.cameras.main.centerX, 550, [buttonBg, buttonText]);
        buttonContainer.alpha = 0;
        this.tweens.add({
            targets: buttonContainer,
            alpha: 1,
            duration: 1500,
            delay: 1500,
            ease: 'Power2'
        });

        // Interactividad del botón "JUGAR" con animación sutil
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