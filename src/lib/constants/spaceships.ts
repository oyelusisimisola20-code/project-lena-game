export interface Spaceship {
  id: string;
  name: string;
  classType: "Light Fighter" | "Heavy Dreadnought" | "Assault Cruiser" | "Advanced Energy";
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  speed: number;
  fireRate: number; // in ms
  damage: number;
  specialAbilityName: string;
  specialAbilityDesc: string;
  color: string;
  secondaryColor: string;
  glowColor: string;
  wingColor: string;
  unlockedByDefault: boolean;
  unlockScoreRequired: number;
}

export const PLAYABLE_SPACESHIPS: Spaceship[] = [
  {
    id: "striker_x",
    name: "LENA Striker-X",
    classType: "Light Fighter",
    health: 80,
    maxHealth: 80,
    shield: 60,
    maxShield: 60,
    speed: 520,
    fireRate: 110,
    damage: 18,
    specialAbilityName: "Hyper Laser Wave",
    specialAbilityDesc: "Emits a concentrated stream of twin laser beams with extreme penetration.",
    color: "#00E5FF",
    secondaryColor: "#38BDF8",
    glowColor: "rgba(0, 229, 255, 0.8)",
    wingColor: "#0284C7",
    unlockedByDefault: true,
    unlockScoreRequired: 0,
  },
  {
    id: "vanguard_alpha",
    name: "LENA Vanguard Alpha",
    classType: "Assault Cruiser",
    health: 120,
    maxHealth: 120,
    shield: 100,
    maxShield: 100,
    speed: 430,
    fireRate: 140,
    damage: 25,
    specialAbilityName: "Plasma Nova Burst",
    specialAbilityDesc: "Launches 8 radial high-explosive plasma bolts in all forward directions.",
    color: "#FF0055",
    secondaryColor: "#FB7185",
    glowColor: "rgba(255, 0, 85, 0.8)",
    wingColor: "#E11D48",
    unlockedByDefault: true,
    unlockScoreRequired: 0,
  },
  {
    id: "aegis_titan",
    name: "LENA Aegis Titan",
    classType: "Heavy Dreadnought",
    health: 200,
    maxHealth: 200,
    shield: 160,
    maxShield: 160,
    speed: 340,
    fireRate: 175,
    damage: 38,
    specialAbilityName: "Fortress Overcharge",
    specialAbilityDesc: "Deploys a kinetic shock barrier while unleashing heavy scatter cannons.",
    color: "#3B82F6",
    secondaryColor: "#1D4ED8",
    glowColor: "rgba(59, 130, 246, 0.8)",
    wingColor: "#1E3A8A",
    unlockedByDefault: false,
    unlockScoreRequired: 5000,
  },
  {
    id: "chrono_nexus",
    name: "LENA Chrono Nexus",
    classType: "Advanced Energy",
    health: 100,
    maxHealth: 100,
    shield: 180,
    maxShield: 180,
    speed: 460,
    fireRate: 120,
    damage: 28,
    specialAbilityName: "Temporal EMP Wave",
    specialAbilityDesc: "Distorts time, disintegrating all incoming enemy bullets and freezing foes.",
    color: "#A855F7",
    secondaryColor: "#C084FC",
    glowColor: "rgba(168, 85, 247, 0.85)",
    wingColor: "#7E22CE",
    unlockedByDefault: false,
    unlockScoreRequired: 15000,
  },
];
