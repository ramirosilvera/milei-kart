export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        // Fondo con degradado moderno
        this.createGradientBackground();

        // Logo con animación de entrada
        if (this.textures.exists('logo')) {
            const logo = this.add.image(this.cameras.main.centerX, 100, 'logo')
                .setScale(0.6)
                .setAlpha(0);
            this.tweens.add({
                targets: logo,
                alpha: 1,
                y: 150,
                duration: 1000,
                ease: 'Power2'
            });
        } else {
            console.error("Falta el asset 'logo'");
        }

        // Título con estilo moderno
        const titleText = this.add.text(this.cameras.main.centerX, 250, "Milei Kart: La Distracción del Caos", {
            fontFamily: '"Press Start 2P", cursive',
            fontSize: '36px',
            fill: '#FFD700',
            stroke: '#8B0000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5).setShadow(4, 4, "#000", 4, true, true);

        // Animación de entrada del título
        titleText.setAlpha(0);
        this.tweens.add({
            targets: titleText,
            alpha: 1,
            duration: 1500,
            ease: 'Power2'
        });

        // Narrativa actualizada con crítica política
        const narrative = `
En un mundo de crisis económica y escándalos cripto, Milei recurre a su arma favorita: la distracción mediática.
Ataca al kirchnerismo con tweets incendiarios y promesas vacías, mientras su gobierno se hunde en el caos.
¡Recoge power-ups como "Desinformación", "Tweets Falsos" y "Escudo de Privilegios" para desviar la atención
y mantenerte en la carrera del poder! ¿Podrás sobrevivir a las trampas de la oposición y a tus propias falencias?
        `;
        const narrativeText = this.add.text(this.cameras.main.centerX, 350, narrative, {
            fontFamily: 'Arial',
            fontSize: '20px',
            fill: '#FFFFFF',
            align: 'center',
            wordWrap: { width: this.cameras.main.width * 0.8 },
            lineSpacing: 10
        }).setOrigin(0.5).setShadow(2, 2, "#000", 2, true, true);

        // Fondo semitransparente para la narrativa
        const narrativeBg = this.add.rectangle(
            this.cameras.main.centerX,
            350,
            narrativeText.width + 40,
            narrativeText.height + 20,
            0x000000,
            0.6
        ).setOrigin(0.5);

        // Animación de entrada de la narrativa
        narrativeText.setAlpha(0);
        this.tweens.add({
            targets: [narrativeBg, narrativeText],
            alpha: 1,
            duration: 1500,
            delay: 500,
            ease: 'Power2'
        });

        // Botón "JUGAR" con estilo moderno
        const buttonText = this.add.text(this.cameras.main.centerX, 550, "INICIAR LA DISTRACCIÓN", {
            fontFamily: '"Press Start 2P", cursive',
            fontSize: '24px',
            fill: '#FFFFFF',
            stroke: '#8B0000',
            strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5).setShadow(2, 2, "#000", 2, true, true);

        const buttonBg = this.add.rectangle(
            this.cameras.main.centerX,
            550,
            buttonText.width + 60,
            buttonText.height + 30,
            0xFF4500,
            1
        ).setOrigin(0.5)
         .setInteractive({ useHandCursor: true });

        // Animación de entrada del botón
        buttonText.setAlpha(0);
        buttonBg.setAlpha(0);
        this.tweens.add({
            targets: [buttonBg, buttonText],
            alpha: 1,
            duration: 1500,
            delay: 1000,
            ease: 'Power2'
        });

        // Interactividad del botón con animación
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
                targets: [buttonBg, buttonText],
                scale: 1.1,
                duration: 200,
                ease: 'Power2'
            });
        });

        buttonBg.on('pointerout', () => {
            this.tweens.add({
                targets: [buttonBg, buttonText],
                scale: 1,
                duration: 200,
                ease: 'Power2'
            });
        });
    }

    createGradientBackground() {
        const canvasTexture = this.textures.createCanvas('gradientBackground', this.cameras.main.width, this.cameras.main.height);
        const ctx = canvasTexture.getContext('2d');

        // Crear un degradado radial
        const gradient = ctx.createRadialGradient(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            0,
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            Math.max(this.cameras.main.width, this.cameras.main.height) / 2
        );
        gradient.addColorStop(0, '#1E1E1E');
        gradient.addColorStop(1, '#000000');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
        canvasTexture.refresh();

        // Añadir el fondo al menú
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'gradientBackground');
    }
}