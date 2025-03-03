export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        // Fondo: si la imagen no existe, se usa un color sólido como fallback
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

        // Logo con fade-in sutil
        if (this.textures.exists('logo')) {
            const logo = this.add.image(this.cameras.main.centerX, 80, 'logo')
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

        // Título con animación y nuevo mensaje
        const titleContainer = this.add.container(this.cameras.main.centerX, 150);
        const titleBg = this.add.rectangle(0, 0, 600, 80, 0x000000, 0.7);
        const titleText = this.add.text(0, 0, "Milei Kart: La Carrera de la Distracción", {
            fontSize: '34px',
            fill: '#32CD32',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        titleContainer.add([titleBg, titleText]);
        titleContainer.alpha = 0;
        this.tweens.add({
            targets: titleContainer,
            alpha: 1,
            duration: 1500,
            ease: 'Power2'
        });

        // Narrativa satírica centrada en el enfrentamiento con Kiciloff y la oposición
        const narrative = "En un mundo de crisis económica y escándalos cripto, Milei recurre a su arma favorita: la distracción mediática.
Ataca al kirchnerismo con tweets incendiarios y promesas vacías, mientras su gobierno se hunde en el caos.
¡Recoge power-ups como "Desinformación", "Tweets Falsos" y "Escudo de Privilegios" para desviar la atención
y mantenerte en la carrera del poder! ¿Podrás sobrevivir a las trampas de la oposición y a tus propias falencias?";
        const narrativeContainer = this.add.container(this.cameras.main.centerX, 300);
        const narrativeBg = this.add.rectangle(0, 0, 700, 150, 0x000000, 0.7);
        const narrativeText = this.add.text(0, 0, narrative, {
            fontSize: '22px',
            fill: '#fff',
            align: 'center',
            wordWrap: { width: 680 }
        }).setOrigin(0.5);
        narrativeContainer.add([narrativeBg, narrativeText]);
        narrativeContainer.alpha = 0;
        this.tweens.add({
            targets: narrativeContainer,
            alpha: 1,
            duration: 1500,
            delay: 500,
            ease: 'Power2'
        });

        // Botón "JUGAR" con animaciones de interacción (hover, click)
        const buttonContainer = this.add.container(this.cameras.main.centerX, 500);
        const buttonBg = this.add.rectangle(0, 0, 220, 70, 0xFF2222, 1)
            .setStrokeStyle(3, 0xffffff);
        const buttonText = this.add.text(0, 0, "JUGAR", {
            fontSize: '28px',
            fill: '#fff'
        }).setOrigin(0.5);
        buttonContainer.add([buttonBg, buttonText]);
        buttonContainer.alpha = 0;
        this.tweens.add({
            targets: buttonContainer,
            alpha: 1,
            duration: 1500,
            delay: 1000,
            ease: 'Power2'
        });

        // Interactividad en el botón con efectos de escalado y sonido
        buttonBg.setInteractive({ useHandCursor: true });
        buttonBg.on('pointerdown', () => {
            this.sound.play('menuSelect');
            this.tweens.add({
                targets: buttonContainer,
                scale: 0.9,
                duration: 100,
                yoyo: true,
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