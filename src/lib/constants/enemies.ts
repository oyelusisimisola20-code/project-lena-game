export type EnemyType =
  | "scout"
  | "raider"
  | "cruiser"
  | "kamikaze"
  | "sentinel"
  | "elite"
  | "asteroid"
  | "boss_dreadnought"
  | "boss_apex";

export interface EnemyConfig {
  type: EnemyType;
  name: string;
  maxHealth: number;
  maxShield: number;
  speed: number;
  scoreValue: number;
  collisionDamage: number;
  color: string;
  glowColor: string;
  size: { width: number; height: number };
  bulletSpeed: number;
  fireCooldown: number; // in ms
  bulletDamage: number;
  isBoss: boolean;
}

export const ENEMY_CONFIGS: Record<EnemyType, EnemyConfig> = {
  scout: {
    type: "scout",
    name: "Scout Drone",
    maxHealth: 35,
    maxShield: 0,
    speed: 180,
    scoreValue: 100,
    collisionDamage: 20,
    color: "#00E5FF",
    glowColor: "rgba(0, 229, 255, 0.7)",
    size: { width: 32, height: 32 },
    bulletSpeed: 280,
    fireCooldown: 1800,
    bulletDamage: 10,
    isBoss: false,
  },
  raider: {
    type: "raider",
    name: "Assault Raider",
    maxHealth: 65,
    maxShield: 0,
    speed: 140,
    scoreValue: 200,
    collisionDamage: 30,
    color: "#FF0055",
    glowColor: "rgba(255, 0, 85, 0.8)",
    size: { width: 42, height: 42 },
    bulletSpeed: 320,
    fireCooldown: 1400,
    bulletDamage: 15,
    isBoss: false,
  },
  cruiser: {
    type: "cruiser",
    name: "Heavy Cruiser",
    maxHealth: 200,
    maxShield: 50,
    speed: 75,
    scoreValue: 450,
    collisionDamage: 50,
    color: "#A855F7",
    glowColor: "rgba(168, 85, 247, 0.8)",
    size: { width: 64, height: 60 },
    bulletSpeed: 260,
    fireCooldown: 1600,
    bulletDamage: 22,
    isBoss: false,
  },
  kamikaze: {
    type: "kamikaze",
    name: "Kamikaze Interceptor",
    maxHealth: 45,
    maxShield: 0,
    speed: 260,
    scoreValue: 250,
    collisionDamage: 60,
    color: "#F97316",
    glowColor: "rgba(249, 115, 22, 0.9)",
    size: { width: 28, height: 36 },
    bulletSpeed: 0,
    fireCooldown: 999999,
    bulletDamage: 0,
    isBoss: false,
  },
  sentinel: {
    type: "sentinel",
    name: "Shielded Sentinel",
    maxHealth: 110,
    maxShield: 90,
    speed: 110,
    scoreValue: 350,
    collisionDamage: 35,
    color: "#38BDF8",
    glowColor: "rgba(56, 189, 248, 0.9)",
    size: { width: 48, height: 48 },
    bulletSpeed: 300,
    fireCooldown: 1500,
    bulletDamage: 18,
    isBoss: false,
  },
  elite: {
    type: "elite",
    name: "Elite Commander",
    maxHealth: 280,
    maxShield: 80,
    speed: 130,
    scoreValue: 600,
    collisionDamage: 45,
    color: "#EF4444",
    glowColor: "rgba(239, 68, 68, 0.95)",
    size: { width: 56, height: 56 },
    bulletSpeed: 350,
    fireCooldown: 1100,
    bulletDamage: 24,
    isBoss: false,
  },
  asteroid: {
    type: "asteroid",
    name: "Space Mineral Asteroid",
    maxHealth: 90,
    maxShield: 0,
    speed: 90,
    scoreValue: 80,
    collisionDamage: 40,
    color: "#64748B",
    glowColor: "rgba(100, 116, 139, 0.6)",
    size: { width: 46, height: 46 },
    bulletSpeed: 0,
    fireCooldown: 999999,
    bulletDamage: 0,
    isBoss: false,
  },
  boss_dreadnought: {
    type: "boss_dreadnought",
    name: "LENA Cyber Dreadnought [BOSS]",
    maxHealth: 1800,
    maxShield: 400,
    speed: 55,
    scoreValue: 5000,
    collisionDamage: 100,
    color: "#FF0055",
    glowColor: "rgba(255, 0, 85, 1.0)",
    size: { width: 140, height: 110 },
    bulletSpeed: 360,
    fireCooldown: 700,
    bulletDamage: 25,
    isBoss: true,
  },
  boss_apex: {
    type: "boss_apex",
    name: "Void Apex Destroyer [SUPREME BOSS]",
    maxHealth: 3800,
    maxShield: 800,
    speed: 45,
    scoreValue: 15000,
    collisionDamage: 120,
    color: "#8B5CF6",
    glowColor: "rgba(139, 92, 246, 1.0)",
    size: { width: 180, height: 140 },
    bulletSpeed: 390,
    fireCooldown: 500,
    bulletDamage: 30,
    isBoss: true,
  },
};
