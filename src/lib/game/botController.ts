import * as THREE from "three";
import { LENA_WEAPONS, TOTAL_TIERS, Weapon } from "@/lib/constants/weapons";
import { SPAWN_POINTS, checkObstacleCollision } from "./arenaMap";
import { BotDifficulty } from "@/store/useGameStore";

export interface BotState {
  id: string;
  name: string;
  team: "red" | "blue";
  position: THREE.Vector3;
  rotationY: number;
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  tier: number;
  currentWeapon: Weapon;
  state: "patrol" | "chase" | "attack" | "retreat";
  isDead: boolean;
  respawnTimer: number;
  meshGroup?: THREE.Group;
}

const BOT_NAMES = [
  "LENA_VIPER_X",
  "LENA_CYBER_NEXUS",
  "LENA_SPECTRE_09",
  "LENA_APEX_CORE",
  "LENA_CRIMSON_VALKYRIE",
  "LENA_PULSE_TITAN",
  "LENA_BLADE_RUNNER",
  "LENA_PHANTOM_77",
];

export class BotController {
  public bots: BotState[] = [];
  private lastShotTime: Map<string, number> = new Map();
  private patrolTargets: Map<string, THREE.Vector3> = new Map();

  constructor(botCount: number = 4) {
    this.initBots(botCount);
  }

  public initBots(botCount: number) {
    this.bots = [];
    this.lastShotTime.clear();
    this.patrolTargets.clear();

    for (let i = 0; i < botCount; i++) {
      const spawn = SPAWN_POINTS[(i + 1) % SPAWN_POINTS.length];
      const bot: BotState = {
        id: `bot_${i + 1}`,
        name: BOT_NAMES[i % BOT_NAMES.length],
        team: i % 2 === 0 ? "red" : "blue",
        position: new THREE.Vector3(spawn[0], spawn[1], spawn[2]),
        rotationY: Math.random() * Math.PI * 2,
        health: 100,
        maxHealth: 100,
        shield: 100,
        maxShield: 100,
        tier: 1,
        currentWeapon: LENA_WEAPONS[0],
        state: "patrol",
        isDead: false,
        respawnTimer: 0,
      };
      this.bots.push(bot);
      this.pickNewPatrolTarget(bot);
    }
  }

  private pickNewPatrolTarget(bot: BotState) {
    const randomSpawn = SPAWN_POINTS[Math.floor(Math.random() * SPAWN_POINTS.length)];
    this.patrolTargets.set(
      bot.id,
      new THREE.Vector3(
        randomSpawn[0] + (Math.random() * 8 - 4),
        1.5,
        randomSpawn[2] + (Math.random() * 8 - 4)
      )
    );
  }

  public update(
    delta: number,
    playerPos: THREE.Vector3,
    playerAlive: boolean,
    difficulty: BotDifficulty,
    onBotShoot: (bot: BotState, targetPos: THREE.Vector3, isPlayerTarget: boolean) => void,
    onBotKill: (killerName: string, victimName: string, weaponName: string, isHeadshot: boolean) => void
  ) {
    const diffMultipliers = {
      easy: { speed: 4.5, accuracy: 0.12, fireRateMod: 1.6, engageDist: 28 },
      normal: { speed: 6.5, accuracy: 0.06, fireRateMod: 1.1, engageDist: 35 },
      hard: { speed: 8.5, accuracy: 0.03, fireRateMod: 0.85, engageDist: 42 },
      extreme: { speed: 10.5, accuracy: 0.015, fireRateMod: 0.65, engageDist: 50 },
    }[difficulty];

    for (const bot of this.bots) {
      if (bot.isDead) {
        bot.respawnTimer -= delta;
        if (bot.respawnTimer <= 0) {
          this.respawnBot(bot);
        }
        continue;
      }

      // Check distance to player
      const distToPlayer = playerPos.distanceTo(bot.position);
      const canSeePlayer = playerAlive && distToPlayer < diffMultipliers.engageDist;

      let targetPos: THREE.Vector3 | null = null;
      let isTargetingPlayer = false;

      if (canSeePlayer) {
        targetPos = playerPos;
        isTargetingPlayer = true;
        bot.state = bot.health < 30 ? "retreat" : "attack";
      } else {
        // Find closest other bot
        let closestOtherBot: BotState | null = null;
        let minDist = diffMultipliers.engageDist;

        for (const other of this.bots) {
          if (other.id !== bot.id && !other.isDead) {
            const d = other.position.distanceTo(bot.position);
            if (d < minDist) {
              minDist = d;
              closestOtherBot = other;
            }
          }
        }

        if (closestOtherBot) {
          targetPos = closestOtherBot.position;
          isTargetingPlayer = false;
          bot.state = "attack";
        } else {
          bot.state = "patrol";
        }
      }

      // Navigation & Movement
      if (bot.state === "patrol" || !targetPos) {
        let patrol = this.patrolTargets.get(bot.id);
        if (!patrol || bot.position.distanceTo(patrol) < 2.5) {
          this.pickNewPatrolTarget(bot);
          patrol = this.patrolTargets.get(bot.id)!;
        }

        const moveDir = new THREE.Vector3().subVectors(patrol, bot.position);
        moveDir.y = 0;
        moveDir.normalize();

        const newPos = bot.position.clone().addScaledVector(moveDir, diffMultipliers.speed * 0.7 * delta);
        const col = checkObstacleCollision(newPos);
        if (!col.collided) {
          bot.position.copy(newPos);
          bot.rotationY = Math.atan2(moveDir.x, moveDir.z);
        } else {
          this.pickNewPatrolTarget(bot);
        }
      } else if (bot.state === "attack") {
        // Rotate towards target
        const lookDir = new THREE.Vector3().subVectors(targetPos, bot.position);
        lookDir.y = 0;
        lookDir.normalize();
        bot.rotationY = Math.atan2(lookDir.x, lookDir.z);

        // Strafe slightly while maintaining distance
        const strafeDir = new THREE.Vector3(-lookDir.z, 0, lookDir.x).multiplyScalar(Math.sin(Date.now() * 0.003) * 0.6);
        const desiredDist = bot.currentWeapon.category === "melee" ? 1.5 : (bot.currentWeapon.category === "shotgun" ? 8 : 18);
        const currentDist = bot.position.distanceTo(targetPos);

        const approachDir = lookDir.clone();
        if (currentDist < desiredDist - 2) approachDir.negate();
        else if (Math.abs(currentDist - desiredDist) <= 2) approachDir.set(0, 0, 0);

        const moveDir = approachDir.add(strafeDir).normalize();
        const newPos = bot.position.clone().addScaledVector(moveDir, diffMultipliers.speed * delta);
        const col = checkObstacleCollision(newPos);
        if (!col.collided) {
          bot.position.copy(newPos);
        }

        // Shooting logic
        const now = Date.now();
        const lastShot = this.lastShotTime.get(bot.id) || 0;
        const cooldown = bot.currentWeapon.fireRate * diffMultipliers.fireRateMod;

        if (now - lastShot > cooldown) {
          this.lastShotTime.set(bot.id, now);
          
          // Apply spread accuracy
          const spreadOffset = new THREE.Vector3(
            (Math.random() - 0.5) * diffMultipliers.accuracy * currentDist,
            (Math.random() - 0.5) * diffMultipliers.accuracy * currentDist,
            (Math.random() - 0.5) * diffMultipliers.accuracy * currentDist
          );
          const aimPos = targetPos.clone().add(spreadOffset);

          onBotShoot(bot, aimPos, isTargetingPlayer);
        }
      } else if (bot.state === "retreat") {
        // Back away from target
        const retreatDir = new THREE.Vector3().subVectors(bot.position, targetPos);
        retreatDir.y = 0;
        retreatDir.normalize();

        const newPos = bot.position.clone().addScaledVector(retreatDir, diffMultipliers.speed * 1.1 * delta);
        const col = checkObstacleCollision(newPos);
        if (!col.collided) {
          bot.position.copy(newPos);
          bot.rotationY = Math.atan2(-retreatDir.x, -retreatDir.z);
        }
      }
    }
  }

  public damageBot(
    botId: string,
    damage: number,
    isHeadshot: boolean,
    attackerIsPlayer: boolean,
    attackerName: string
  ): { died: boolean; bot: BotState | null } {
    const bot = this.bots.find((b) => b.id === botId);
    if (!bot || bot.isDead) return { died: false, bot: null };

    let remDmg = damage;
    if (bot.shield > 0) {
      if (bot.shield >= remDmg) {
        bot.shield -= remDmg;
        remDmg = 0;
      } else {
        remDmg -= bot.shield;
        bot.shield = 0;
      }
    }

    if (remDmg > 0) {
      bot.health = Math.max(0, bot.health - remDmg);
    }

    if (bot.health <= 0) {
      bot.isDead = true;
      bot.respawnTimer = 3.5;
      return { died: true, bot };
    }

    return { died: false, bot };
  }

  public upgradeBotTier(botId: string) {
    const bot = this.bots.find((b) => b.id === botId);
    if (!bot) return;

    if (bot.tier < TOTAL_TIERS) {
      bot.tier += 1;
      bot.currentWeapon = LENA_WEAPONS[bot.tier - 1];
    }
  }

  public respawnBot(bot: BotState) {
    const randomSpawn = SPAWN_POINTS[Math.floor(Math.random() * SPAWN_POINTS.length)];
    bot.position.set(randomSpawn[0], randomSpawn[1], randomSpawn[2]);
    bot.health = 100;
    bot.shield = 100;
    bot.isDead = false;
    bot.respawnTimer = 0;
  }
}
