export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  preload() {
    // Cargamos imágenes desde assets/images
    this.load.image("mileiKart", "assets/images/mileiKart.png");
    this.load.image("opponentKart", "assets/images/opponentKart.png");
    this.load.image("bullet", "assets/images/bullet.png");
    this.load.image("powerUpDesinformation", "assets/images/powerUpDesinformation.png");
    this.load.image("powerUpRetuits", "assets/images/powerUpRetuits.png");
    this.load.image("powerUpShield", "assets/images/powerUpShield.png");
    this.load.image("powerUpHostigamiento", "assets/images/powerUpHostigamiento.png");

    // Cargamos sonidos desde assets/sounds
    this.load.audio("bgMusic", "assets/sounds/bgMusic.mp3");
    this.load.audio("attackSound", "assets/sounds/attackSound.mp3");
    this.load.audio("motorSound", "assets/sounds/motor.mp3"); // Sonido del motor
  }

  create() {
    const worldWidth = 2000;
    const worldHeight = 9000; // Mundo extendido para una carrera de 30s a full speed
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    // Estado del juego
    this.gameState = {
      playerHealth: 100,
      opponentHealth: 100,
      joystickVector: new Phaser.Math.Vector2(0, 0),
      playerInvulnerable: false,
      opponentInvulnerable: false,
      boostActive: false,  // Para gestionar el efecto boost
      lapCount: 0,
      requiredLaps: 1  // Ahora se juega una única "vuelta" hasta la meta
    };
    this.gameOver = false;
    this.crossedFinishLine = false;

    // Cronómetro de carrera
    this.raceStartTime = this.time.now;

    // Texto de vueltas (opcional, aunque el objetivo es llegar a la meta)
    this.lapText = this.add.text(20, 20, `Vueltas: 0/${this.gameState.requiredLaps}`, {
      fontSize: "24px",
      fill: "#ffffff",
      fontStyle: "bold",
      stroke: "#000",
      strokeThickness: 4,
    }).setScrollFactor(0);

    // Música de fondo
    this.bgMusic = this.sound.add("bgMusic", { loop: true, volume: 0.5 });
    this.bgMusic.play();

    // Sonido del motor (volumen bajo para no saturar)
    this.playerMotorSound = this.sound.add("motorSound", { loop: true, volume: 0.2 });

    // Configuramos los karts y la física
    this.setupPhysics();
    this.setupControls();
    this.setupTimers();
    this.createObstacles();

    // Recuperamos la zona de la línea de meta (definida en CircuitScene)
    this.finishLine = this.registry.get("finishLine");

    // Configuramos el grupo de power ups
    this.powerUps = this.physics.add.group();

    // Definimos la ruta del oponente (waypoints en línea recta)
    this.opponentWaypoints = [
      { x: 1000, y: 7500 },
      { x: 1000, y: 6000 },
      { x: 1000, y: 4500 },
      { x: 1000, y: 3000 },
      { x: 1000, y: 1500 },
      { x: 1000, y: 50 }  // Meta
    ];

    // Comprobación periódica de power ups
    this.time.addEvent({
      delay: 500,
      callback: this.checkPowerUpCollections,
      callbackScope: this,
      loop: true,
    });

    // La cámara sigue al jugador
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    // Envía al fondo la escena del circuito si se está ejecutando en paralelo
    if (this.scene.isActive("CircuitScene")) {
      this.scene.sendToBack("CircuitScene");
    }
  }

  setupPhysics() {
    // Posicionamos los karts en la línea de salida (parte inferior del mundo)
    this.playerStartY = 8500;  // Se usará para calcular el progreso
    this.player = this.physics.add.sprite(950, this.playerStartY, "mileiKart")
      .setScale(0.1)
      .setCollideWorldBounds(true)
      .setDrag(600, 600)
      .setMaxVelocity(300);

    this.opponent = this.physics.add.sprite(1050, this.playerStartY, "opponentKart")
      .setScale(0.1)
      .setCollideWorldBounds(true);

    // Zona de colisión más amplia
    this.player.body.setCircle(this.player.displayWidth * 0.6);
    this.opponent.body.setCircle(this.opponent.displayWidth * 0.6);
  }

  setupControls() {
    this.setupJoystick();
    this.setupAttackButton();
  }

  setupJoystick() {
    const baseX = 100;
    const baseY = this.cameras.main.height - 100;
    const baseRadius = 80;

    // Base del joystick (fijo en pantalla)
    this.joystickBase = this.add.circle(baseX, baseY, baseRadius, 0x444444, 0.8)
      .setDepth(1)
      .setStrokeStyle(4, 0xffffff)
      .setScrollFactor(0);

    this.joystickBaseRadius = baseRadius;

    // Knob del joystick
    const knobRadius = 40;
    this.joystickKnob = this.add.circle(baseX, baseY, knobRadius, 0xee1111, 0.9)
      .setDepth(2)
      .setStrokeStyle(2, 0xffffff)
      .setScrollFactor(0);

    this.joystickActive = false;

    // Eventos para actualizar el joystick
    this.input.on("pointerdown", (pointer) => {
      const dist = Phaser.Math.Distance.Between(pointer.x, pointer.y, baseX, baseY);
      if (dist <= baseRadius) {
        this.joystickActive = true;
        this.updateJoystick(pointer);
      }
    });

    this.input.on("pointermove", (pointer) => {
      if (this.joystickActive) {
        this.updateJoystick(pointer);
      }
    });

    this.input.on("pointerup", () => {
      this.joystickActive = false;
      this.gameState.joystickVector.set(0, 0);
      this.joystickKnob.setPosition(baseX, baseY);
    });
  }

  updateJoystick(pointer) {
    const baseX = this.joystickBase.x;
    const baseY = this.joystickBase.y;
    const maxDistance = this.joystickBaseRadius;

    const dx = pointer.x - baseX;
    const dy = pointer.y - baseY;
    const distance = Phaser.Math.Distance.Between(pointer.x, pointer.y, baseX, baseY);
    const clampedDistance = Math.min(distance, maxDistance);
    const angle = Math.atan2(dy, dx);

    const knobX = baseX + clampedDistance * Math.cos(angle);
    const knobY = baseY + clampedDistance * Math.sin(angle);
    this.joystickKnob.setPosition(knobX, knobY);

    // Vector normalizado para el movimiento
    const normX = (knobX - baseX) / maxDistance;
    const normY = (knobY - baseY) / maxDistance;
    this.gameState.joystickVector.set(normX, normY);
  }

  setupAttackButton() {
    const btnX = this.cameras.main.width - 100;
    const btnY = this.cameras.main.height - 100;
    const radius = 60;

    // Botón de ataque (aunque el objetivo principal es llegar a la meta)
    this.attackButton = this.add.circle(btnX, btnY, radius, 0xff4444, 0.8)
      .setScrollFactor(0)
      .setDepth(2)
      .setInteractive();

    const buttonText = this.add.text(btnX, btnY, "ATACAR", {
      fontSize: "20px",
      fill: "#fff",
      fontStyle: "bold"
    })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(3);

    this.attackButton.on("pointerdown", () => {
      this.tweens.add({
        targets: [this.attackButton, buttonText],
        scale: 0.9,
        duration: 100,
        ease: "Power1",
        onComplete: () => {
          this.handleAttack();
        }
      });
    });
    this.attackButton.on("pointerup", () => {
      this.tweens.add({
        targets: [this.attackButton, buttonText],
        scale: 1,
        duration: 100,
        ease: "Power1"
      });
    });
  }

  setupTimers() {
    // Genera un power up (boost) cada 5 segundos
    this.time.addEvent({
      delay: 5000,
      callback: this.spawnPowerUp,
      callbackScope: this,
      loop: true
    });
  }

  createObstacles() {
    // Obstáculos estáticos para aumentar el reto en el recorrido
    this.obstacles = [];
    const obstaclesData = [
      { x: 1000, y: 8000, width: 100, height: 30 },
      { x: 800, y: 6500, width: 80, height: 80 },
      { x: 1200, y: 5000, width: 50, height: 150 }
    ];

    obstaclesData.forEach(data => {
      const obstacle = this.add.rectangle(data.x, data.y, data.width, data.height, 0x666666);
      this.physics.add.existing(obstacle, true);
      this.obstacles.push(obstacle);
      this.physics.add.collider(this.player, obstacle);
      this.physics.add.collider(this.opponent, obstacle);
    });
  }

  update() {
    if (this.gameOver) return;

    // Actualizar cronómetro y emitir evento para UI
    const elapsedTime = (this.time.now - this.raceStartTime) / 1000;
    this.registry.events.emit("updateTimer", elapsedTime);

    // Calcular progreso basado en la posición vertical del jugador
    const progress = Phaser.Math.Clamp(
      ((this.playerStartY - this.player.y) / (this.playerStartY - 50)) * 100,
      0,
      100
    );
    this.registry.events.emit("updateProgress", progress);

    // Control del sonido del motor según el movimiento del jugador
    if (this.gameState.joystickVector.length() > 0.1) {
      if (!this.playerMotorSound.isPlaying) {
        this.playerMotorSound.play();
      }
    } else {
      if (this.playerMotorSound.isPlaying) {
        this.playerMotorSound.stop();
      }
    }

    // Aplicar boost si está activo
    const acceleration = this.gameState.boostActive ? 800 : 600;
    const vec = this.gameState.joystickVector;
    this.player.setAccelerationX(vec.x * acceleration);
    this.player.setAccelerationY(vec.y * acceleration);

    // Comportamiento del oponente (seguir waypoints predefinidos)
    this.opponentRacingBehavior();

    // Verificar si el jugador cruza la meta
    if (this.finishLine) {
      const playerCenter = this.player.getCenter();
      if (Phaser.Geom.Rectangle.ContainsPoint(this.finishLine.getBounds(), playerCenter)) {
        if (!this.crossedFinishLine) {
          this.gameState.lapCount++;
          this.lapText.setText(`Vueltas: ${this.gameState.lapCount}/${this.gameState.requiredLaps}`);
          this.showPowerUpMessage("¡Meta alcanzada!", this.player.x, this.player.y - 50);
          this.crossedFinishLine = true;
          this.endGame("player");
        }
      } else {
        this.crossedFinishLine = false;
      }
    }
  }

  // --- Comportamiento del oponente: sigue waypoints para alcanzar la meta ---
  opponentRacingBehavior() {
    if (!this.opponentWaypoints || this.opponentWaypoints.length === 0) return;

    const currentWaypoint = this.opponentWaypoints[0];
    const threshold = 20;
    if (Phaser.Math.Distance.Between(this.opponent.x, this.opponent.y, currentWaypoint.x, currentWaypoint.y) < threshold) {
      // Avanzamos al siguiente waypoint
      this.opponentWaypoints.shift();
    } else {
      this.physics.moveToObject(this.opponent, currentWaypoint, 150);
    }
  }

  // --- Power ups como boosts ---
  checkPowerUpCollections() {
    const collectThreshold = 40;
    this.powerUps.getChildren().forEach((powerUp) => {
      if (!powerUp.active) return;
      const dPlayer = Phaser.Math.Distance.Between(powerUp.x, powerUp.y, this.player.x, this.player.y);
      if (dPlayer < collectThreshold && !this.gameState.boostActive) {
        this.collectPowerUp(this.player, powerUp);
      }
    });
  }

  collectPowerUp(sprite, powerUp) {
    // Al recoger un power up se activa un boost temporal
    powerUp.destroy();
    this.applyBoost();
    this.showPowerUpMessage("¡Boost activado!", sprite.x, sprite.y - 50);
  }

  applyBoost() {
    this.gameState.boostActive = true;
    // Duración del boost: 3 segundos
    this.time.delayedCall(3000, () => {
      this.gameState.boostActive = false;
    });
  }

  // --- Disparo y manejo de daño (se mantiene para compatibilidad, aunque el foco es la carrera) ---
  fireBullet(user, target, options) {
    const source = user === "player" ? this.player : this.opponent;
    const bulletSpeed = options.speed;
    const startX = source.x;
    const startY = source.y;
    const targetX = target.x;
    const targetY = target.y;
    const distance = Phaser.Math.Distance.Between(startX, startY, targetX, targetY);
    const timeToHit = (distance / bulletSpeed) * 1000;

    const bullet = this.add.sprite(startX, startY, options.texture || "bullet");
    bullet.setScale(0.4);

    this.tweens.add({
      targets: bullet,
      x: targetX,
      y: targetY,
      duration: timeToHit,
      ease: "Linear",
      onComplete: () => {
        bullet.destroy();
        const currentDistance = Phaser.Math.Distance.Between(
          targetX,
          targetY,
          target.x,
          target.y
        );
        const HITBOX_RADIUS = 40;
        if (currentDistance <= HITBOX_RADIUS) {
          this.applyDamage(target, options.damage);
        }
      }
    });
  }

  applyDamage(target, damage) {
    if (target === this.player && this.gameState.playerInvulnerable) return;
    if (target === this.opponent && this.gameState.opponentInvulnerable) return;

    if (target === this.player) {
      this.gameState.playerHealth = Phaser.Math.Clamp(
        this.gameState.playerHealth - damage,
        0,
        100
      );
    } else {
      this.gameState.opponentHealth = Phaser.Math.Clamp(
        this.gameState.opponentHealth - damage,
        0,
        100
      );
    }

    this.registry.events.emit("updateHealth", {
      player: this.gameState.playerHealth,
      opponent: this.gameState.opponentHealth
    });

    target.setTint(0xff0000);
    this.time.delayedCall(300, () => {
      target.clearTint();
    });
  }

  handleAttack() {
    // Lógica de ataque (se mantiene, aunque la carrera se centra en alcanzar la meta)
    this.sound.play("attackSound");
    // Ejemplo: disparar hacia el oponente
    this.fireBullet("player", this.opponent, { damage: 15, speed: 500, texture: "bullet" });
  }

  spawnPowerUp() {
    const types = [
      "powerUpDesinformation",
      "powerUpRetuits",
      "powerUpShield",
      "powerUpHostigamiento"
    ];
    // Se usa un tipo aleatorio, pero el efecto será activar el boost
    const randomType = Phaser.Utils.Array.GetRandom(types);
    const powerUp = this.powerUps.create(
      Phaser.Math.Between(100, 1900),
      Phaser.Math.Between(100, 8900),
      randomType
    )
      .setScale(0.2)
      .setAlpha(1);

    this.tweens.add({
      targets: powerUp,
      y: powerUp.y - 30,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
  }

  showPowerUpMessage(message, x, y) {
    const msg = this.add.text(x, y, message, {
      fontSize: "24px",
      fill: "#ffcc00",
      fontStyle: "bold",
      stroke: "#000",
      strokeThickness: 4,
    }).setOrigin(0.5);
    this.tweens.add({
      targets: msg,
      y: y - 50,
      alpha: 0,
      duration: 1500,
      ease: "Power1",
      onComplete: () => msg.destroy()
    });
  }

  endGame(winner) {
    if (this.gameOver) return;
    this.gameOver = true;
    this.bgMusic.stop();
    // Se transita a la escena final (asegúrate de tener definida la escena "EndScene")
    this.scene.start("EndScene", { winner });
  }
}

export class UIScene extends Phaser.Scene {
  constructor() {
    super("UIScene");
  }

  create() {
    this.uiContainer = this.add.container(0, 0);

    // Barra de salud del jugador (esquina superior izquierda)
    const playerHealthBg = this.add.rectangle(50, 20, 300, 50, 0x000000, 0.7).setOrigin(0);
    this.playerHealthBar = this.add.rectangle(50, 20, 300, 50, 0x00ff00).setOrigin(0);
    const playerHealthText = this.add.text(60, 30, "Jugador: 100", {
      fontSize: "28px",
      fill: "#ffffff",
      fontStyle: "bold",
    });

    // Barra de salud del oponente (esquina superior derecha)
    const opponentHealthBg = this.add.rectangle(this.cameras.main.width - 350, 20, 300, 50, 0x000000, 0.7).setOrigin(0);
    this.opponentHealthBar = this.add.rectangle(this.cameras.main.width - 350, 20, 300, 50, 0xff0000).setOrigin(0);
    const opponentHealthText = this.add.text(this.cameras.main.width - 340, 30, "Oponente: 100", {
      fontSize: "28px",
      fill: "#ffffff",
      fontStyle: "bold",
    });

    // Cronómetro (central superior)
    this.timerText = this.add.text(this.cameras.main.width / 2, 20, "Tiempo: 0.0s", {
      fontSize: "28px",
      fill: "#ffffff",
      fontStyle: "bold",
      stroke: "#000",
      strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0);

    // Indicador de progreso (en la parte inferior)
    const progressBarBg = this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height - 50, 400, 30, 0x000000, 0.7).setScrollFactor(0);
    this.progressBar = this.add.rectangle(this.cameras.main.width / 2 - 200, this.cameras.main.height - 50, 0, 30, 0x00ff00).setOrigin(0, 0.5).setScrollFactor(0);
    this.progressText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 50, "Progreso: 0%", {
      fontSize: "20px",
      fill: "#ffffff",
      fontStyle: "bold",
      stroke: "#000",
      strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0);

    this.uiContainer.add([
      playerHealthBg,
      this.playerHealthBar,
      playerHealthText,
      opponentHealthBg,
      this.opponentHealthBar,
      opponentHealthText,
      this.timerText,
      progressBarBg,
      this.progressBar,
      this.progressText
    ]);

    // Actualización de la salud
    this.registry.events.on("updateHealth", (data) => {
      const playerWidth = (data.player / 100) * 300;
      this.playerHealthBar.width = playerWidth;
      playerHealthText.setText("Jugador: " + data.player);

      const opponentWidth = (data.opponent / 100) * 300;
      this.opponentHealthBar.width = opponentWidth;
      opponentHealthText.setText("Oponente: " + data.opponent);
    });

    // Actualización del cronómetro
    this.registry.events.on("updateTimer", (timeElapsed) => {
      this.timerText.setText("Tiempo: " + timeElapsed.toFixed(1) + "s");
    });

    // Actualización del indicador de progreso
    this.registry.events.on("updateProgress", (progress) => {
      // La barra se extiende de 0 a 400 píxeles
      this.progressBar.width = (progress / 100) * 400;
      this.progressText.setText("Progreso: " + progress.toFixed(0) + "%");
    });
  }
}
