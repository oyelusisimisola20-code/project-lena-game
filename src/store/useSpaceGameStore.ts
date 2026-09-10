import { create } from "zustand";
import { PLAYABLE_SPACESHIPS, Spaceship } from "@/lib/constants/spaceships";
import { BONUS_CONFIGS, BonusType } from "@/lib/constants/bonuses";
import { lenaAudio } from "@/lib/audio/soundEngine";

export interface ActiveBonus {
  type: BonusType;
  timeLeft: number;
  maxTime: number;
}

export type SpaceGameState = "hangar" | "playing" | "paused" | "level_cleared" | "game_over";

interface SpaceGameStore {
  gameState: SpaceGameState;
  currentShip: Spaceship;
  unlockedShipIds: string[];
  highScore: number;
  highestLevel: number;

  // Match State
  level: number;
  score: number;
  combo: number;
  comboTimer: number; // 0 to 1 (progress bar)
  enemiesDestroyed: number;
  bossesDefeated: number;

  // Player Status
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  weaponLevel: number; // 1 to 5
  bombs: number; // 0 to 3
  powerShotCooldown: number; // 0 (ready) to 10 (charging)
  maxPowerShotCooldown: number;
  activeBonuses: ActiveBonus[];
  isInvincible: boolean;

  // Settings
  soundEnabled: boolean;
  musicEnabled: boolean;
  touchControlsEnabled: boolean;

  // Actions
  selectShip: (shipId: string) => void;
  unlockShip: (shipId: string) => void;
  startMission: (targetLevel?: number) => void;
  pauseMission: () => void;
  resumeMission: () => void;
  takeDamage: (amount: number) => void;
  healPlayer: (hpAmount: number, shieldAmount: number) => void;
  addScore: (points: number) => void;
  upgradeWeapon: () => void;
  addBomb: () => void;
  useBomb: () => boolean;
  usePowerShot: () => boolean;
  collectBonus: (type: BonusType) => void;
  tickCooldowns: (delta: number) => void;
  advanceLevel: () => void;
  endGame: (victory?: boolean) => void;
  resetToHangar: () => void;
  loadSavedData: () => void;
  toggleSound: () => void;
  toggleMusic: () => void;
}

const DEFAULT_SHIP = PLAYABLE_SPACESHIPS[0];

export const useSpaceGameStore = create<SpaceGameStore>((set, get) => ({
  gameState: "hangar",
  currentShip: DEFAULT_SHIP,
  unlockedShipIds: ["striker_x", "vanguard_alpha"],
  highScore: 0,
  highestLevel: 1,

  level: 1,
  score: 0,
  combo: 1,
  comboTimer: 0,
  enemiesDestroyed: 0,
  bossesDefeated: 0,

  health: DEFAULT_SHIP.health,
  maxHealth: DEFAULT_SHIP.maxHealth,
  shield: DEFAULT_SHIP.shield,
  maxShield: DEFAULT_SHIP.maxShield,
  weaponLevel: 1,
  bombs: 3,
  powerShotCooldown: 0,
  maxPowerShotCooldown: 8,
  activeBonuses: [],
  isInvincible: false,

  soundEnabled: true,
  musicEnabled: false,
  touchControlsEnabled: true,

  loadSavedData: () => {
    if (typeof window === "undefined") return;
    try {
      const savedScore = localStorage.getItem("lena_space_highscore");
      const savedLevel = localStorage.getItem("lena_space_highest_level");
      const savedUnlocked = localStorage.getItem("lena_space_unlocked_ships");

      if (savedScore) set({ highScore: parseInt(savedScore, 10) || 0 });
      if (savedLevel) set({ highestLevel: parseInt(savedLevel, 10) || 1 });
      if (savedUnlocked) {
        const parsed = JSON.parse(savedUnlocked);
        if (Array.isArray(parsed)) {
          set({ unlockedShipIds: Array.from(new Set([...get().unlockedShipIds, ...parsed])) });
        }
      }
    } catch {
      // ignore
    }
  },

  selectShip: (shipId) => {
    const ship = PLAYABLE_SPACESHIPS.find((s) => s.id === shipId) || PLAYABLE_SPACESHIPS[0];
    set({
      currentShip: ship,
      health: ship.health,
      maxHealth: ship.maxHealth,
      shield: ship.shield,
      maxShield: ship.maxShield,
    });
  },

  unlockShip: (shipId) => {
    const current = get().unlockedShipIds;
    if (!current.includes(shipId)) {
      const next = [...current, shipId];
      set({ unlockedShipIds: next });
      if (typeof window !== "undefined") {
        localStorage.setItem("lena_space_unlocked_ships", JSON.stringify(next));
      }
    }
  },

  startMission: (targetLevel = 1) => {
    const ship = get().currentShip;
    set({
      gameState: "playing",
      level: targetLevel,
      score: targetLevel === 1 ? 0 : get().score,
      combo: 1,
      comboTimer: 0,
      enemiesDestroyed: targetLevel === 1 ? 0 : get().enemiesDestroyed,
      bossesDefeated: targetLevel === 1 ? 0 : get().bossesDefeated,
      health: ship.maxHealth,
      maxHealth: ship.maxHealth,
      shield: ship.maxShield,
      maxShield: ship.maxShield,
      weaponLevel: 1,
      bombs: 3,
      powerShotCooldown: 0,
      activeBonuses: [],
      isInvincible: false,
    });
    lenaAudio.playTierUp();
  },

  pauseMission: () => {
    if (get().gameState === "playing") {
      set({ gameState: "paused" });
    }
  },

  resumeMission: () => {
    if (get().gameState === "paused") {
      set({ gameState: "playing" });
    }
  },

  takeDamage: (amount) => {
    const { isInvincible, shield, health, gameState } = get();
    if (isInvincible || gameState !== "playing") return;

    let rem = amount;
    let newShield = shield;
    let newHealth = health;

    if (newShield > 0) {
      if (newShield >= rem) {
        newShield -= rem;
        rem = 0;
      } else {
        rem -= newShield;
        newShield = 0;
      }
    }

    if (rem > 0) {
      newHealth = Math.max(0, newHealth - rem);
    }

    // Reset combo on hit
    set({
      shield: newShield,
      health: newHealth,
      combo: 1,
      comboTimer: 0,
    });
    lenaAudio.playDemote();

    if (newHealth <= 0) {
      get().endGame(false);
    }
  },

  healPlayer: (hpAmount, shieldAmount) => {
    set((state) => ({
      health: Math.min(state.maxHealth, state.health + hpAmount),
      shield: Math.min(state.maxShield, state.shield + shieldAmount),
    }));
  },

  addScore: (points) => {
    const { score, combo, highScore } = get();
    const added = points * combo;
    const newScore = score + added;
    const newHighScore = Math.max(highScore, newScore);

    set({
      score: newScore,
      highScore: newHighScore,
      combo: Math.min(5, combo + 0.15),
      comboTimer: 4.0, // 4 seconds before combo drops
      enemiesDestroyed: get().enemiesDestroyed + 1,
    });

    if (typeof window !== "undefined") {
      localStorage.setItem("lena_space_highscore", newHighScore.toString());
    }

    // Auto-unlock ships if score threshold met
    PLAYABLE_SPACESHIPS.forEach((s) => {
      if (!s.unlockedByDefault && newScore >= s.unlockScoreRequired) {
        get().unlockShip(s.id);
      }
    });
  },

  upgradeWeapon: () => {
    set((state) => ({
      weaponLevel: Math.min(5, state.weaponLevel + 1),
    }));
    lenaAudio.playTierUp();
  },

  addBomb: () => {
    set((state) => ({
      bombs: Math.min(3, state.bombs + 1),
    }));
    lenaAudio.playTierUp();
  },

  useBomb: () => {
    const { bombs, gameState } = get();
    if (gameState !== "playing" || bombs <= 0) return false;

    set({ bombs: bombs - 1 });
    lenaAudio.playRocket();
    return true;
  },

  usePowerShot: () => {
    const { powerShotCooldown, maxPowerShotCooldown, gameState } = get();
    if (gameState !== "playing" || powerShotCooldown > 0) return false;

    set({ powerShotCooldown: maxPowerShotCooldown });
    lenaAudio.playSniper();
    return true;
  },

  collectBonus: (type) => {
    const config = BONUS_CONFIGS[type];
    if (!config) return;

    lenaAudio.playHitmarker(true);

    if (type === "weapon_upgrade") {
      get().upgradeWeapon();
    } else if (type === "health") {
      get().healPlayer(40, 0);
    } else if (type === "bomb") {
      get().addBomb();
    } else if (type === "shield") {
      get().healPlayer(0, 60);
      const existing = get().activeBonuses.filter((b) => b.type !== "shield");
      set({
        activeBonuses: [...existing, { type: "shield", timeLeft: config.duration, maxTime: config.duration }],
      });
    } else if (type === "rapid_fire") {
      const existing = get().activeBonuses.filter((b) => b.type !== "rapid_fire");
      set({
        activeBonuses: [...existing, { type: "rapid_fire", timeLeft: config.duration, maxTime: config.duration }],
      });
    } else if (type === "invincibility") {
      const existing = get().activeBonuses.filter((b) => b.type !== "invincibility");
      set({
        isInvincible: true,
        activeBonuses: [...existing, { type: "invincibility", timeLeft: config.duration, maxTime: config.duration }],
      });
    }
  },

  tickCooldowns: (delta) => {
    const { powerShotCooldown, comboTimer, combo, activeBonuses } = get();

    // Power Shot recharge
    let nextCooldown = Math.max(0, powerShotCooldown - delta);

    // Combo decay
    let nextComboTimer = comboTimer - delta;
    let nextCombo = combo;
    if (nextComboTimer <= 0) {
      nextCombo = 1;
      nextComboTimer = 0;
    }

    // Active Bonuses decay
    let nextInvincible = false;
    const updatedBonuses: ActiveBonus[] = [];

    for (const b of activeBonuses) {
      const remaining = b.timeLeft - delta;
      if (remaining > 0) {
        updatedBonuses.push({ ...b, timeLeft: remaining });
        if (b.type === "invincibility") nextInvincible = true;
      }
    }

    set({
      powerShotCooldown: nextCooldown,
      comboTimer: nextComboTimer,
      combo: nextCombo,
      activeBonuses: updatedBonuses,
      isInvincible: nextInvincible,
    });
  },

  advanceLevel: () => {
    const nextLevel = get().level + 1;
    const nextHighest = Math.max(get().highestLevel, nextLevel);
    set({
      level: nextLevel,
      highestLevel: nextHighest,
      gameState: "level_cleared",
    });
    if (typeof window !== "undefined") {
      localStorage.setItem("lena_space_highest_level", nextHighest.toString());
    }
    lenaAudio.playVictory();
  },

  endGame: (victory = false) => {
    set({
      gameState: "game_over",
    });
    if (victory) {
      lenaAudio.playVictory();
    } else {
      lenaAudio.playDemote();
    }
  },

  resetToHangar: () => {
    set({
      gameState: "hangar",
    });
  },

  toggleSound: () => {
    set((state) => ({ soundEnabled: !state.soundEnabled }));
  },

  toggleMusic: () => {
    const { musicEnabled } = get();
    if (musicEnabled) {
      lenaAudio.stopMusic();
      set({ musicEnabled: false });
    } else {
      lenaAudio.startCyberAmbientMusic();
      set({ musicEnabled: true });
    }
  },
}));
