export interface Weapon {
  id: string;
  tier: number;
  name: string;
  category: "pistol" | "dual" | "smg" | "shotgun" | "rifle" | "heavy" | "sniper" | "plasma" | "launcher" | "melee";
  damage: number;
  headshotMultiplier: number;
  fireRate: number; // in ms between shots
  magazineSize: number;
  reloadTime: number; // in seconds
  spread: number;
  pellets: number;
  isAutomatic: boolean;
  isHitscan: boolean;
  bulletSpeed: number; // units/sec for projectiles
  splashRadius: number; // 0 for non-explosive
  recoil: { pitch: number; yaw: number; kickBack: number };
  color: string; // hex
  secondaryColor: string;
  glowColor: string;
  description: string;
  soundType: "pistol" | "dual" | "smg" | "shotgun" | "burst" | "heavy_rifle" | "sniper" | "plasma" | "rocket" | "slash";
}

export const LENA_WEAPONS: Weapon[] = [
  {
    id: "tier_1_pulse9",
    tier: 1,
    name: "LENA Pulse-9",
    category: "pistol",
    damage: 34,
    headshotMultiplier: 1.75,
    fireRate: 200,
    magazineSize: 12,
    reloadTime: 1.2,
    spread: 0.015,
    pellets: 1,
    isAutomatic: false,
    isHitscan: true,
    bulletSpeed: 0,
    splashRadius: 0,
    recoil: { pitch: 0.04, yaw: 0.01, kickBack: 0.05 },
    color: "#00E5FF",
    secondaryColor: "#0284C7",
    glowColor: "rgba(0, 229, 255, 0.7)",
    description: "Compact semi-automatic sidearm equipped with calibrated pulse capacitors.",
    soundType: "pistol"
  },
  {
    id: "tier_2_dual_strikers",
    tier: 2,
    name: "LENA Dual Strikers",
    category: "dual",
    damage: 24,
    headshotMultiplier: 1.5,
    fireRate: 110,
    magazineSize: 24,
    reloadTime: 1.5,
    spread: 0.035,
    pellets: 1,
    isAutomatic: true,
    isHitscan: true,
    bulletSpeed: 0,
    splashRadius: 0,
    recoil: { pitch: 0.03, yaw: 0.02, kickBack: 0.04 },
    color: "#38BDF8",
    secondaryColor: "#FF0055",
    glowColor: "rgba(56, 189, 248, 0.7)",
    description: "Twin synchronized micro-blasters for overwhelming close-quarters velocity.",
    soundType: "dual"
  },
  {
    id: "tier_3_viper_smg",
    tier: 3,
    name: "LENA Viper-SMG",
    category: "smg",
    damage: 20,
    headshotMultiplier: 1.6,
    fireRate: 75,
    magazineSize: 32,
    reloadTime: 1.4,
    spread: 0.045,
    pellets: 1,
    isAutomatic: true,
    isHitscan: true,
    bulletSpeed: 0,
    splashRadius: 0,
    recoil: { pitch: 0.025, yaw: 0.015, kickBack: 0.03 },
    color: "#00E5FF",
    secondaryColor: "#1E293B",
    glowColor: "rgba(0, 229, 255, 0.8)",
    description: "Ultra high-cycle submachine gun that shreds medium-range targets.",
    soundType: "smg"
  },
  {
    id: "tier_4_cyber_shotgun",
    tier: 4,
    name: "LENA Cyber-Shotgun",
    category: "shotgun",
    damage: 13, // 8 pellets * 13 = 104 dmg point blank
    headshotMultiplier: 1.5,
    fireRate: 750,
    magazineSize: 6,
    reloadTime: 2.0,
    spread: 0.09,
    pellets: 8,
    isAutomatic: false,
    isHitscan: true,
    bulletSpeed: 0,
    splashRadius: 0,
    recoil: { pitch: 0.12, yaw: 0.03, kickBack: 0.15 },
    color: "#FF0055",
    secondaryColor: "#E11D48",
    glowColor: "rgba(255, 0, 85, 0.8)",
    description: "Heavy kinetic scatter cannon loaded with thermal tungsten buckshot.",
    soundType: "shotgun"
  },
  {
    id: "tier_5_ar_cobalt",
    tier: 5,
    name: "LENA AR-Cobalt",
    category: "rifle",
    damage: 32,
    headshotMultiplier: 1.8,
    fireRate: 140,
    magazineSize: 30,
    reloadTime: 1.6,
    spread: 0.02,
    pellets: 1,
    isAutomatic: true,
    isHitscan: true,
    bulletSpeed: 0,
    splashRadius: 0,
    recoil: { pitch: 0.035, yaw: 0.01, kickBack: 0.05 },
    color: "#0284C7",
    secondaryColor: "#00E5FF",
    glowColor: "rgba(2, 132, 199, 0.8)",
    description: "Standard issue tactical assault rifle with balanced range and lethal precision.",
    soundType: "burst"
  },
  {
    id: "tier_6_crimson_fury",
    tier: 6,
    name: "LENA Crimson Fury",
    category: "heavy",
    damage: 40,
    headshotMultiplier: 1.75,
    fireRate: 115,
    magazineSize: 28,
    reloadTime: 1.8,
    spread: 0.028,
    pellets: 1,
    isAutomatic: true,
    isHitscan: true,
    bulletSpeed: 0,
    splashRadius: 0,
    recoil: { pitch: 0.055, yaw: 0.02, kickBack: 0.07 },
    color: "#FF0055",
    secondaryColor: "#990033",
    glowColor: "rgba(255, 0, 85, 0.9)",
    description: "High-caliber automatic rifle with devastating impact and armor penetration.",
    soundType: "heavy_rifle"
  },
  {
    id: "tier_7_rail_sniper",
    tier: 7,
    name: "LENA Rail-Sniper",
    category: "sniper",
    damage: 110,
    headshotMultiplier: 2.2, // One shot kill headshot
    fireRate: 1200,
    magazineSize: 5,
    reloadTime: 2.2,
    spread: 0.002,
    pellets: 1,
    isAutomatic: false,
    isHitscan: true,
    bulletSpeed: 0,
    splashRadius: 0,
    recoil: { pitch: 0.16, yaw: 0.02, kickBack: 0.2 },
    color: "#00E5FF",
    secondaryColor: "#021A2E",
    glowColor: "rgba(0, 229, 255, 1.0)",
    description: "Electromagnetic rail accelerator that deletes enemies across the arena.",
    soundType: "sniper"
  },
  {
    id: "tier_8_plasma_blaster",
    tier: 8,
    name: "LENA Plasma Blaster",
    category: "plasma",
    damage: 75,
    headshotMultiplier: 1.25,
    fireRate: 450,
    magazineSize: 8,
    reloadTime: 1.9,
    spread: 0.02,
    pellets: 1,
    isAutomatic: false,
    isHitscan: false,
    bulletSpeed: 65,
    splashRadius: 4.5,
    recoil: { pitch: 0.07, yaw: 0.02, kickBack: 0.08 },
    color: "#38BDF8",
    secondaryColor: "#00E5FF",
    glowColor: "rgba(0, 229, 255, 0.9)",
    description: "Launches superheated plasma orbs with localized area-of-effect detonations.",
    soundType: "plasma"
  },
  {
    id: "tier_9_micro_launcher",
    tier: 9,
    name: "LENA Micro-Launcher",
    category: "launcher",
    damage: 120,
    headshotMultiplier: 1.2,
    fireRate: 900,
    magazineSize: 3,
    reloadTime: 2.5,
    spread: 0.015,
    pellets: 1,
    isAutomatic: false,
    isHitscan: false,
    bulletSpeed: 55,
    splashRadius: 7.0,
    recoil: { pitch: 0.15, yaw: 0.04, kickBack: 0.22 },
    color: "#FF0055",
    secondaryColor: "#FF3366",
    glowColor: "rgba(255, 0, 85, 1.0)",
    description: "Arm-mounted micro-missile battery designed for maximum splash destruction.",
    soundType: "rocket"
  },
  {
    id: "tier_10_neon_blade",
    tier: 10,
    name: "LENA Neon Katana",
    category: "melee",
    damage: 130, // Instant kill
    headshotMultiplier: 1.0,
    fireRate: 600,
    magazineSize: 999,
    reloadTime: 0,
    spread: 0,
    pellets: 1,
    isAutomatic: false,
    isHitscan: true, // short range raycast
    bulletSpeed: 0,
    splashRadius: 0,
    recoil: { pitch: -0.1, yaw: 0.15, kickBack: -0.05 },
    color: "#00E5FF",
    secondaryColor: "#FF0055",
    glowColor: "rgba(0, 229, 255, 1.0)",
    description: "Dual-energy plasma blade. The final tier test: eliminate a target to claim VICTORY!",
    soundType: "slash"
  }
];

export const TOTAL_TIERS = LENA_WEAPONS.length;
