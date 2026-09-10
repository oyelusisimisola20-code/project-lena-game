import { Spaceship } from "@/lib/constants/spaceships";
import { ENEMY_CONFIGS, EnemyType } from "@/lib/constants/enemies";
import { BONUS_CONFIGS, BonusType, getRandomBonusType } from "@/lib/constants/bonuses";
import { lenaAudio } from "@/lib/audio/soundEngine";

export interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  isPlayer: boolean;
  color: string;
  isPowerShot?: boolean;
  isMissile?: boolean;
  target?: Enemy;
}

export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  color: string;
  glowColor: string;
  scoreValue: number;
  collisionDamage: number;
  lastShootTime: number;
  shootInterval: number;
  bulletSpeed: number;
  bulletDamage: number;
  phase?: number;
  isBoss: boolean;
}

export interface BonusDrop {
  id: string;
  type: BonusType;
  x: number;
  y: number;
  vy: number;
  radius: number;
  color: string;
  symbol: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

export interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  color: string;
}

export class SpaceCombatEngine {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public width: number = 800;
  public height: number = 600;

  // Player State
  public playerX: number = 400;
  public playerY: number = 500;
  public playerVx: number = 0;
  public playerVy: number = 0;
  public playerRadius: number = 24;
  public ship: Spaceship;
  public weaponLevel: number = 1;

  // Game Objects
  public bullets: Bullet[] = [];
  public enemies: Enemy[] = [];
  public bonuses: BonusDrop[] = [];
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];
  public stars: Star[] = [];

  // Wave & Level Timing
  public level: number = 1;
  public lastSpawnTime: number = 0;
  public spawnInterval: number = 1500;
  public enemiesSpawnedInLevel: number = 0;
  public maxEnemiesInLevel: number = 20;
  public bossSpawned: boolean = false;
  public levelCleared: boolean = false;

  // Auto Shooting Timing
  public lastAutoShootTime: number = 0;

  // Touch / Keyboard Inputs
  public keys: Record<string, boolean> = {};
  public touchTarget: { x: number; y: number; active: boolean } = { x: 0, y: 0, active: false };

  // Callbacks to React/Zustand store
  public onScore: (points: number) => void;
  public onDamage: (amount: number) => void;
  public onCollectBonus: (type: BonusType) => void;
  public onLevelClear: () => void;

  constructor(
    canvas: HTMLCanvasElement,
    ship: Spaceship,
    level: number,
    weaponLevel: number,
    callbacks: {
      onScore: (pts: number) => void;
      onDamage: (amt: number) => void;
      onCollectBonus: (type: BonusType) => void;
      onLevelClear: () => void;
    }
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.ship = ship;
    this.level = level;
    this.weaponLevel = weaponLevel;
    this.onScore = callbacks.onScore;
    this.onDamage = callbacks.onDamage;
    this.onCollectBonus = callbacks.onCollectBonus;
    this.onLevelClear = callbacks.onLevelClear;

    this.resize();
    this.initStars();
    this.setupLevel();
  }

  public resize() {
    const parent = this.canvas.parentElement;
    if (parent) {
      this.width = parent.clientWidth;
      this.height = parent.clientHeight;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
    }
    this.playerX = this.width / 2;
    this.playerY = this.height - 100;
  }

  private initStars() {
    this.stars = [];
    for (let i = 0; i < 120; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 1.5 + 0.5,
        color: Math.random() > 0.6 ? "#00E5FF" : Math.random() > 0.3 ? "#FFFFFF" : "#FF0055",
      });
    }
  }

  public setupLevel() {
    this.enemiesSpawnedInLevel = 0;
    this.maxEnemiesInLevel = 15 + this.level * 8;
    this.spawnInterval = Math.max(700, 1800 - this.level * 100);
    this.bossSpawned = false;
    this.levelCleared = false;
    this.enemies = [];
    this.bullets = [];
    this.bonuses = [];
  }

  public setShip(ship: Spaceship) {
    this.ship = ship;
  }

  public setWeaponLevel(lvl: number) {
    this.weaponLevel = lvl;
  }

  // --- AUTO SHOOTING SYSTEM ---
  public updateAutoShooting(now: number, isRapidFire: boolean) {
    const baseFireRate = this.ship.fireRate;
    const effectiveFireRate = isRapidFire ? baseFireRate * 0.5 : baseFireRate;

    if (now - this.lastAutoShootTime >= effectiveFireRate) {
      this.lastAutoShootTime = now;
      this.firePlayerWeapon();
    }
  }

  private firePlayerWeapon() {
    const bulletSpeed = -650;
    const dmg = this.ship.damage * (1 + (this.weaponLevel - 1) * 0.3);
    const color = this.ship.color;

    lenaAudio.playPistol();

    if (this.weaponLevel === 1) {
      // Level 1: Single Center Gun
      this.bullets.push({
        x: this.playerX,
        y: this.playerY - 24,
        vx: 0,
        vy: bulletSpeed,
        radius: 4,
        damage: dmg,
        isPlayer: true,
        color,
      });
    } else if (this.weaponLevel === 2) {
      // Level 2: Twin Dual Lasers
      [-14, 14].forEach((offset) => {
        this.bullets.push({
          x: this.playerX + offset,
          y: this.playerY - 20,
          vx: 0,
          vy: bulletSpeed,
          radius: 4,
          damage: dmg * 0.85,
          isPlayer: true,
          color,
        });
      });
    } else if (this.weaponLevel === 3) {
      // Level 3: Triple Spread Cannons
      [-16, 0, 16].forEach((offset, idx) => {
        const spreadVx = (idx - 1) * 110;
        this.bullets.push({
          x: this.playerX + offset,
          y: this.playerY - 22,
          vx: spreadVx,
          vy: bulletSpeed,
          radius: 4.5,
          damage: dmg * 0.8,
          isPlayer: true,
          color,
        });
      });
    } else if (this.weaponLevel === 4) {
      // Level 4: Quad Plasma Blasters
      [-22, -8, 8, 22].forEach((offset, idx) => {
        const spreadVx = (idx - 1.5) * 80;
        this.bullets.push({
          x: this.playerX + offset,
          y: this.playerY - 20,
          vx: spreadVx,
          vy: bulletSpeed,
          radius: 5,
          damage: dmg * 0.75,
          isPlayer: true,
          color: idx % 2 === 0 ? "#00E5FF" : "#FF0055",
        });
      });
    } else {
      // Level 5+: Heavy Rail Penetrator + Twin Homing Missiles
      this.bullets.push({
        x: this.playerX,
        y: this.playerY - 28,
        vx: 0,
        vy: bulletSpeed * 1.3,
        radius: 7,
        damage: dmg * 2.2,
        isPlayer: true,
        color: "#00E5FF",
        isPowerShot: true,
      });

      // Flanking missiles
      [-24, 24].forEach((offset, idx) => {
        const target = this.enemies[idx % this.enemies.length];
        this.bullets.push({
          x: this.playerX + offset,
          y: this.playerY - 16,
          vx: (idx === 0 ? -1 : 1) * 120,
          vy: bulletSpeed * 0.8,
          radius: 5,
          damage: dmg * 1.2,
          isPlayer: true,
          color: "#FF0055",
          isMissile: true,
          target,
        });
      });
    }
  }

  // --- SPECIAL ABILITIES ---
  public triggerPowerShot() {
    lenaAudio.playSniper();
    this.createShockwave(this.playerX, this.playerY, "#00E5FF", 25);

    // Giant Nova Laser Beam
    for (let i = -3; i <= 3; i++) {
      this.bullets.push({
        x: this.playerX + i * 12,
        y: this.playerY - 30,
        vx: i * 35,
        vy: -900,
        radius: 9,
        damage: this.ship.damage * 4.5,
        isPlayer: true,
        color: "#00E5FF",
        isPowerShot: true,
      });
    }

    this.addFloatingText(this.playerX, this.playerY - 40, "⚡ POWER SHOT!", "#00E5FF");
  }

  public triggerBomb() {
    lenaAudio.playRocket();
    this.createShockwave(this.width / 2, this.height / 2, "#FF0055", 60);

    // Clear all enemy bullets
    this.bullets = this.bullets.filter((b) => b.isPlayer);

    // Massive AoE damage to all enemies on screen
    for (const enemy of this.enemies) {
      const dmg = enemy.isBoss ? 450 : 300;
      enemy.health -= dmg;
      this.createSparks(enemy.x, enemy.y, "#FF0055", 20);
      this.addFloatingText(enemy.x, enemy.y, `-${dmg}`, "#FF0055");
    }

    this.addFloatingText(this.width / 2, this.height / 2, "💣 TACTICAL EMP BOMB!", "#FF0055");
  }

  // --- ENEMY SPAWNING & PATTERNS ---
  private spawnEnemy(now: number) {
    if (this.enemiesSpawnedInLevel >= this.maxEnemiesInLevel) {
      // Check if boss should spawn
      if ((this.level % 5 === 0) && !this.bossSpawned) {
        this.spawnBoss();
      }
      return;
    }

    if (now - this.lastSpawnTime < this.spawnInterval) return;
    this.lastSpawnTime = now;
    this.enemiesSpawnedInLevel++;

    // Pick enemy type based on level
    const availableTypes: EnemyType[] = ["scout", "raider"];
    if (this.level >= 2) availableTypes.push("kamikaze", "asteroid");
    if (this.level >= 3) availableTypes.push("cruiser", "sentinel");
    if (this.level >= 4) availableTypes.push("elite");

    const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    const config = ENEMY_CONFIGS[type];

    const x = Math.random() * (this.width - config.size.width - 40) + 20;
    const enemy: Enemy = {
      id: Math.random().toString(),
      type,
      x,
      y: -config.size.height,
      vx: (Math.random() - 0.5) * 60,
      vy: config.speed * (0.8 + Math.random() * 0.4),
      width: config.size.width,
      height: config.size.height,
      health: config.maxHealth * (1 + (this.level - 1) * 0.15),
      maxHealth: config.maxHealth * (1 + (this.level - 1) * 0.15),
      shield: config.maxShield,
      maxShield: config.maxShield,
      color: config.color,
      glowColor: config.glowColor,
      scoreValue: config.scoreValue,
      collisionDamage: config.collisionDamage,
      lastShootTime: now + Math.random() * 1000,
      shootInterval: Math.max(600, config.fireCooldown - this.level * 40),
      bulletSpeed: config.bulletSpeed,
      bulletDamage: config.bulletDamage * (1 + this.level * 0.1),
      isBoss: false,
    };

    this.enemies.push(enemy);
  }

  private spawnBoss() {
    this.bossSpawned = true;
    const bossType: EnemyType = this.level >= 10 ? "boss_apex" : "boss_dreadnought";
    const config = ENEMY_CONFIGS[bossType];

    const boss: Enemy = {
      id: "boss_" + this.level,
      type: bossType,
      x: this.width / 2 - config.size.width / 2,
      y: -config.size.height - 20,
      vx: 60,
      vy: config.speed,
      width: config.size.width,
      height: config.size.height,
      health: config.maxHealth * (1 + (this.level - 5) * 0.25),
      maxHealth: config.maxHealth * (1 + (this.level - 5) * 0.25),
      shield: config.maxShield,
      maxShield: config.maxShield,
      color: config.color,
      glowColor: config.glowColor,
      scoreValue: config.scoreValue,
      collisionDamage: config.collisionDamage,
      lastShootTime: Date.now() + 1000,
      shootInterval: config.fireCooldown,
      bulletSpeed: config.bulletSpeed,
      bulletDamage: config.bulletDamage,
      phase: 1,
      isBoss: true,
    };

    this.enemies.push(boss);
    this.addFloatingText(this.width / 2, 120, "⚠️ WARNING: BOSS APPROACHING! ⚠️", "#FF0055");
    lenaAudio.playDemote();
  }

  // --- GAME UPDATE & COLLISION LOOP ---
  public update(delta: number, isRapidFire: boolean, isInvincible: boolean) {
    const now = Date.now();

    // 1. Move Player
    this.updatePlayerMovement(delta);

    // 2. Auto Shoot
    this.updateAutoShooting(now, isRapidFire);

    // 3. Update Stars
    for (const s of this.stars) {
      s.y += s.speed * (1 + delta * 20);
      if (s.y > this.height) {
        s.y = 0;
        s.x = Math.random() * this.width;
      }
    }

    // 4. Spawn Enemies
    this.spawnEnemy(now);

    // 5. Update Enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];

      // Boss Behavior
      if (e.isBoss) {
        if (e.y < 80) {
          e.y += e.vy * delta;
        } else {
          e.x += e.vx * delta;
          if (e.x <= 20 || e.x + e.width >= this.width - 20) {
            e.vx = -e.vx;
          }
        }

        // Boss Shooting
        if (now - e.lastShootTime >= e.shootInterval) {
          e.lastShootTime = now;
          // Multi-directional bullet hell pattern
          const bulletCount = e.health < e.maxHealth * 0.5 ? 8 : 5;
          for (let b = 0; b < bulletCount; b++) {
            const angle = (b / (bulletCount - 1) - 0.5) * Math.PI * 0.6 + Math.PI / 2;
            this.bullets.push({
              x: e.x + e.width / 2,
              y: e.y + e.height - 10,
              vx: Math.cos(angle) * e.bulletSpeed,
              vy: Math.sin(angle) * e.bulletSpeed,
              radius: 5,
              damage: e.bulletDamage,
              isPlayer: false,
              color: "#FF0055",
            });
          }
          lenaAudio.playBurst();
        }
      } else {
        // Standard Enemy Movement
        if (e.type === "kamikaze") {
          // Home towards player
          const dx = this.playerX - e.x;
          e.vx += Math.sign(dx) * 120 * delta;
          e.vx = Math.max(-180, Math.min(180, e.vx));
        }

        e.x += e.vx * delta;
        e.y += e.vy * delta;

        // Bounce walls
        if (e.x <= 10 || e.x + e.width >= this.width - 10) {
          e.vx = -e.vx;
        }

        // Enemy Shooting
        if (e.bulletSpeed > 0 && now - e.lastShootTime >= e.shootInterval && e.y > 0 && e.y < this.height - 100) {
          e.lastShootTime = now;
          this.bullets.push({
            x: e.x + e.width / 2,
            y: e.y + e.height,
            vx: e.type === "elite" ? (Math.random() - 0.5) * 80 : 0,
            vy: e.bulletSpeed,
            radius: e.type === "cruiser" ? 6 : 4,
            damage: e.bulletDamage,
            isPlayer: false,
            color: e.color,
          });
        }
      }

      // Check collision with Player
      const distToPlayer = Math.hypot(this.playerX - (e.x + e.width / 2), this.playerY - (e.y + e.height / 2));
      if (distToPlayer < this.playerRadius + e.width / 2) {
        if (!isInvincible) {
          this.onDamage(e.collisionDamage);
        }
        this.createSparks(this.playerX, this.playerY, "#FF0055", 15);
        if (!e.isBoss) {
          e.health -= 150;
        }
      }

      // Remove if died
      if (e.health <= 0) {
        this.createShockwave(e.x + e.width / 2, e.y + e.height / 2, e.color, e.isBoss ? 45 : 20);
        lenaAudio.playRocket();
        this.onScore(e.scoreValue);
        this.addFloatingText(e.x + e.width / 2, e.y, `+${e.scoreValue}`, "#00E5FF");

        // Roll for Bonus Drop
        if (Math.random() < (e.isBoss ? 1.0 : 0.28)) {
          this.spawnBonusDrop(e.x + e.width / 2, e.y + e.height / 2);
        }

        this.enemies.splice(i, 1);
        continue;
      }

      // Off screen check
      if (e.y > this.height + 60) {
        this.enemies.splice(i, 1);
      }
    }

    // 6. Update Bullets & Collisions
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];

      // Homing missile logic
      if (b.isMissile && b.target && b.target.health > 0) {
        const dx = b.target.x + b.target.width / 2 - b.x;
        const dy = b.target.y + b.target.height / 2 - b.y;
        const angle = Math.atan2(dy, dx);
        b.vx += Math.cos(angle) * 350 * delta;
        b.vy += Math.sin(angle) * 350 * delta;
      }

      b.x += b.vx * delta;
      b.y += b.vy * delta;

      // Player bullet hitting enemies
      if (b.isPlayer) {
        for (const enemy of this.enemies) {
          if (
            b.x >= enemy.x &&
            b.x <= enemy.x + enemy.width &&
            b.y >= enemy.y &&
            b.y <= enemy.y + enemy.height
          ) {
            enemy.health -= b.damage;
            this.createSparks(b.x, b.y, b.color, 6);
            lenaAudio.playHitmarker(b.isPowerShot || false);

            if (!b.isPowerShot) {
              this.bullets.splice(i, 1);
              break;
            }
          }
        }
      } else {
        // Enemy bullet hitting player
        const dist = Math.hypot(b.x - this.playerX, b.y - this.playerY);
        if (dist < this.playerRadius + b.radius) {
          if (!isInvincible) {
            this.onDamage(b.damage);
          }
          this.createSparks(b.x, b.y, "#FF0055", 8);
          this.bullets.splice(i, 1);
          continue;
        }
      }

      // Remove off-screen bullets
      if (b.y < -30 || b.y > this.height + 30 || b.x < -30 || b.x > this.width + 30) {
        this.bullets.splice(i, 1);
      }
    }

    // 7. Update Bonus Drops
    for (let i = this.bonuses.length - 1; i >= 0; i--) {
      const drop = this.bonuses[i];
      drop.y += drop.vy * delta;

      // Check collision with Player
      const dist = Math.hypot(drop.x - this.playerX, drop.y - this.playerY);
      if (dist < this.playerRadius + drop.radius) {
        this.onCollectBonus(drop.type);
        const cfg = BONUS_CONFIGS[drop.type];
        this.addFloatingText(this.playerX, this.playerY - 30, `+ ${cfg.name.toUpperCase()}`, cfg.color);
        this.createShockwave(drop.x, drop.y, cfg.color, 15);
        this.bonuses.splice(i, 1);
        continue;
      }

      if (drop.y > this.height + 40) {
        this.bonuses.splice(i, 1);
      }
    }

    // 8. Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += delta;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * delta;
      p.y += p.vy * delta;
    }

    // 9. Update Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.life += delta;
      t.y -= 30 * delta;
      if (t.life >= t.maxLife) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // 10. Check Level Clear Condition
    if (
      this.enemiesSpawnedInLevel >= this.maxEnemiesInLevel &&
      this.enemies.length === 0 &&
      !this.levelCleared
    ) {
      this.levelCleared = true;
      this.onLevelClear();
    }
  }

  private updatePlayerMovement(delta: number) {
    const speed = this.ship.speed;
    let targetVx = 0;
    let targetVy = 0;

    // Keyboard Input
    if (this.keys["ArrowLeft"] || this.keys["KeyA"]) targetVx -= speed;
    if (this.keys["ArrowRight"] || this.keys["KeyD"]) targetVx += speed;
    if (this.keys["ArrowUp"] || this.keys["KeyW"]) targetVy -= speed;
    if (this.keys["ArrowDown"] || this.keys["KeyS"]) targetVy += speed;

    // Touch / Drag Target Follow
    if (this.touchTarget.active) {
      const dx = this.touchTarget.x - this.playerX;
      const dy = this.touchTarget.y - this.playerY;
      const dist = Math.hypot(dx, dy);
      if (dist > 8) {
        targetVx = (dx / dist) * speed;
        targetVy = (dy / dist) * speed;
      }
    }

    // Smooth lerp
    this.playerVx = targetVx;
    this.playerVy = targetVy;

    this.playerX += this.playerVx * delta;
    this.playerY += this.playerVy * delta;

    // Bounds clamp
    this.playerX = Math.max(this.playerRadius + 8, Math.min(this.width - this.playerRadius - 8, this.playerX));
    this.playerY = Math.max(this.playerRadius + 40, Math.min(this.height - this.playerRadius - 20, this.playerY));
  }

  private spawnBonusDrop(x: number, y: number) {
    const type = getRandomBonusType();
    const cfg = BONUS_CONFIGS[type];
    this.bonuses.push({
      id: Math.random().toString(),
      type,
      x,
      y,
      vy: 110,
      radius: 14,
      color: cfg.color,
      symbol: cfg.symbol,
    });
  }

  public createSparks(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 180 + 40;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 2.5 + 1,
        color,
        life: 0,
        maxLife: Math.random() * 0.4 + 0.2,
      });
    }
  }

  public createShockwave(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = Math.random() * 260 + 120;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 3 + 2,
        color,
        life: 0,
        maxLife: 0.5,
      });
    }
  }

  public addFloatingText(x: number, y: number, text: string, color: string) {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      life: 0,
      maxLife: 1.2,
    });
  }

  // --- RENDER PASS ---
  public render(isInvincible: boolean) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Starfield
    for (const s of this.stars) {
      ctx.fillStyle = s.color;
      ctx.fillRect(s.x, s.y, s.size, s.size);
    }

    // 2. Draw Bonuses
    for (const b of this.bonuses) {
      ctx.save();
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 12;

      ctx.fillStyle = "rgba(10, 15, 25, 0.85)";
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(b.symbol, b.x, b.y);
      ctx.restore();
    }

    // 3. Draw Bullets
    for (const b of this.bullets) {
      ctx.save();
      ctx.shadowColor = b.color;
      ctx.shadowBlur = b.isPowerShot ? 20 : 8;

      ctx.fillStyle = b.color;
      ctx.beginPath();
      if (b.isPowerShot) {
        ctx.ellipse(b.x, b.y, b.radius * 1.5, b.radius * 3.5, 0, 0, Math.PI * 2);
      } else {
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.restore();
    }

    // 4. Draw Enemies & Bosses
    for (const e of this.enemies) {
      ctx.save();
      ctx.shadowColor = e.glowColor;
      ctx.shadowBlur = e.isBoss ? 25 : 10;

      // Enemy Hull
      ctx.fillStyle = e.color;
      ctx.beginPath();
      if (e.isBoss) {
        // Boss Shape
        ctx.roundRect(e.x, e.y, e.width, e.height, 16);
      } else if (e.type === "kamikaze") {
        ctx.moveTo(e.x + e.width / 2, e.y + e.height);
        ctx.lineTo(e.x + e.width, e.y);
        ctx.lineTo(e.x, e.y);
        ctx.closePath();
      } else {
        ctx.roundRect(e.x, e.y, e.width, e.height, 8);
      }
      ctx.fill();

      // Enemy Health Bar
      const hpPct = Math.max(0, e.health / e.maxHealth);
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(e.x, e.y - 8, e.width, 4);
      ctx.fillStyle = e.color;
      ctx.fillRect(e.x, e.y - 8, e.width * hpPct, 4);

      ctx.restore();
    }

    // 5. Draw Player Spaceship
    ctx.save();
    if (isInvincible) {
      ctx.shadowColor = "#FF0055";
      ctx.shadowBlur = 30;
      // Rainbow aura pulse
      ctx.strokeStyle = `hsl(${(Date.now() / 8) % 360}, 100%, 65%)`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(this.playerX, this.playerY, this.playerRadius + 8, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.shadowColor = this.ship.color;
      ctx.shadowBlur = 18;
    }

    // Spaceship Hull Wings & Thrusters
    ctx.fillStyle = this.ship.color;
    ctx.beginPath();
    ctx.moveTo(this.playerX, this.playerY - this.playerRadius);
    ctx.lineTo(this.playerX + this.playerRadius, this.playerY + this.playerRadius);
    ctx.lineTo(this.playerX, this.playerY + this.playerRadius * 0.5);
    ctx.lineTo(this.playerX - this.playerRadius, this.playerY + this.playerRadius);
    ctx.closePath();
    ctx.fill();

    // Jet Engine Flame
    ctx.fillStyle = Math.random() > 0.5 ? "#00E5FF" : "#FF0055";
    ctx.beginPath();
    ctx.moveTo(this.playerX - 6, this.playerY + this.playerRadius * 0.6);
    ctx.lineTo(this.playerX + 6, this.playerY + this.playerRadius * 0.6);
    ctx.lineTo(this.playerX, this.playerY + this.playerRadius * 1.3 + Math.random() * 8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 6. Draw Particles
    for (const p of this.particles) {
      const alpha = 1 - p.life / p.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 7. Draw Floating Combat Texts
    for (const t of this.floatingTexts) {
      const alpha = 1 - t.life / t.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = t.color;
      ctx.font = "bold 13px 'Rajdhani', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    }
  }
}
