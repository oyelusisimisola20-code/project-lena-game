export type BonusType =
  | "shield"
  | "rapid_fire"
  | "health"
  | "invincibility"
  | "bomb"
  | "weapon_upgrade";

export interface BonusItemConfig {
  type: BonusType;
  name: string;
  symbol: string;
  color: string;
  glowColor: string;
  duration: number; // in seconds (0 for instant)
  description: string;
  dropWeight: number; // probability weight
}

export const BONUS_CONFIGS: Record<BonusType, BonusItemConfig> = {
  weapon_upgrade: {
    type: "weapon_upgrade",
    name: "Weapon Upgrade",
    symbol: "▲",
    color: "#00E5FF",
    glowColor: "rgba(0, 229, 255, 0.9)",
    duration: 0,
    description: "Adds additional gun barrels and spread cannons.",
    dropWeight: 28,
  },
  shield: {
    type: "shield",
    name: "Armour & Shield",
    symbol: "🛡️",
    color: "#38BDF8",
    glowColor: "rgba(56, 189, 248, 0.9)",
    duration: 10,
    description: "Restores and overcharges spaceship energy shield.",
    dropWeight: 22,
  },
  rapid_fire: {
    type: "rapid_fire",
    name: "Overclock Rapid Fire",
    symbol: "⚡",
    color: "#FBBF24",
    glowColor: "rgba(251, 191, 36, 0.9)",
    duration: 12,
    description: "Doubles automatic weapon fire rate for 12 seconds.",
    dropWeight: 18,
  },
  health: {
    type: "health",
    name: "Hull Repair Nanites",
    symbol: "💚",
    color: "#22C55E",
    glowColor: "rgba(34, 197, 94, 0.9)",
    duration: 0,
    description: "Restores +40 HP to spaceship hull.",
    dropWeight: 20,
  },
  bomb: {
    type: "bomb",
    name: "Tactical Bomb Charge",
    symbol: "💣",
    color: "#FF0055",
    glowColor: "rgba(255, 0, 85, 0.9)",
    duration: 0,
    description: "Restocks +1 Screen-Clearing EMP Bomb.",
    dropWeight: 8,
  },
  invincibility: {
    type: "invincibility",
    name: "Invincibility Star",
    symbol: "⭐",
    color: "#E11D48",
    glowColor: "rgba(225, 29, 72, 1.0)",
    duration: 6,
    description: "Complete damage immunity and collision ramming for 6s.",
    dropWeight: 4,
  },
};

export function getRandomBonusType(): BonusType {
  const types = Object.keys(BONUS_CONFIGS) as BonusType[];
  const totalWeight = types.reduce((acc, t) => acc + BONUS_CONFIGS[t].dropWeight, 0);
  let random = Math.random() * totalWeight;

  for (const t of types) {
    if (random < BONUS_CONFIGS[t].dropWeight) {
      return t;
    }
    random -= BONUS_CONFIGS[t].dropWeight;
  }
  return "weapon_upgrade";
}
