import { create } from "zustand";
import { LENA_WEAPONS, TOTAL_TIERS, Weapon } from "@/lib/constants/weapons";
import { lenaAudio } from "@/lib/audio/soundEngine";

export interface KillFeedItem {
  id: string;
  killer: string;
  victim: string;
  killerIsPlayer: boolean;
  victimIsPlayer: boolean;
  weaponName: string;
  isHeadshot: boolean;
  time: number;
}

export interface MatchStats {
  kills: number;
  deaths: number;
  score: number;
  streak: number;
  maxStreak: number;
  shotsFired: number;
  shotsHit: number;
  headshots: number;
  tier: number;
}

export type MatchStatus = "menu" | "playing" | "paused" | "victory" | "gameover";
export type BotDifficulty = "easy" | "normal" | "hard" | "extreme";

interface GameStoreState {
  // Match Status
  matchStatus: MatchStatus;
  gameTime: number;
  winnerName: string | null;
  botCount: number;
  difficulty: BotDifficulty;

  // Player Stats
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  currentTier: number; // 1 to 10
  currentWeapon: Weapon;
  ammo: number;
  isReloading: boolean;
  stats: MatchStats;

  // Visual/Audio Feedback
  hitmarker: { active: boolean; isHeadshot: boolean; id: number };
  damageIndicator: { active: boolean; intensity: number };
  tierUpAnnouncement: { active: boolean; tier: number; weaponName: string } | null;

  // Combat Feeds & Leaderboard
  killfeed: KillFeedItem[];

  // Settings
  settings: {
    sensitivity: number;
    fov: number;
    sfxVolume: number;
    musicVolume: number;
    crosshairColor: string;
    showMinimap: boolean;
  };

  // Actions
  startMatch: (bots?: number, diff?: BotDifficulty) => void;
  pauseMatch: () => void;
  resumeMatch: () => void;
  endMatch: (victory: boolean, winner?: string) => void;
  takeDamage: (amount: number) => void;
  heal: (hpAmount: number, shieldAmount: number) => void;
  fireShot: () => boolean;
  reloadWeapon: () => void;
  completeReload: () => void;
  registerHit: (isHeadshot: boolean) => void;
  recordKill: (victimName: string, isHeadshot: boolean) => void;
  recordBotKill: (killerName: string, victimName: string, weaponName: string, isHeadshot: boolean) => void;
  demotePlayer: () => void;
  updateSettings: (partial: Partial<GameStoreState["settings"]>) => void;
  resetToMenu: () => void;
  tickGameTime: (delta: number) => void;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  matchStatus: "menu",
  gameTime: 0,
  winnerName: null,
  botCount: 4,
  difficulty: "normal",

  health: 100,
  maxHealth: 100,
  shield: 100,
  maxShield: 100,
  currentTier: 1,
  currentWeapon: LENA_WEAPONS[0],
  ammo: LENA_WEAPONS[0].magazineSize,
  isReloading: false,

  stats: {
    kills: 0,
    deaths: 0,
    score: 0,
    streak: 0,
    maxStreak: 0,
    shotsFired: 0,
    shotsHit: 0,
    headshots: 0,
    tier: 1,
  },

  hitmarker: { active: false, isHeadshot: false, id: 0 },
  damageIndicator: { active: false, intensity: 0 },
  tierUpAnnouncement: null,
  killfeed: [],

  settings: {
    sensitivity: 1.5,
    fov: 75,
    sfxVolume: 0.8,
    musicVolume: 0.3,
    crosshairColor: "#00E5FF",
    showMinimap: true,
  },

  startMatch: (bots = 4, diff = "normal") => {
    const initialWeapon = LENA_WEAPONS[0];
    set({
      matchStatus: "playing",
      gameTime: 0,
      winnerName: null,
      botCount: bots,
      difficulty: diff,
      health: 100,
      shield: 100,
      currentTier: 1,
      currentWeapon: initialWeapon,
      ammo: initialWeapon.magazineSize,
      isReloading: false,
      tierUpAnnouncement: null,
      killfeed: [],
      stats: {
        kills: 0,
        deaths: 0,
        score: 0,
        streak: 0,
        maxStreak: 0,
        shotsFired: 0,
        shotsHit: 0,
        headshots: 0,
        tier: 1,
      },
    });
    lenaAudio.playTierUp();
  },

  pauseMatch: () => {
    if (get().matchStatus === "playing") {
      set({ matchStatus: "paused" });
    }
  },

  resumeMatch: () => {
    if (get().matchStatus === "paused") {
      set({ matchStatus: "playing" });
    }
  },

  endMatch: (victory, winner = "LENA_PLAYER") => {
    set({
      matchStatus: victory ? "victory" : "gameover",
      winnerName: victory ? "LENA_PLAYER (YOU)" : winner,
    });
    if (victory) {
      lenaAudio.playVictory();
    } else {
      lenaAudio.playDemote();
    }
  },

  takeDamage: (amount) => {
    const { shield, health, matchStatus } = get();
    if (matchStatus !== "playing") return;

    let remainingDmg = amount;
    let newShield = shield;
    let newHealth = health;

    if (newShield > 0) {
      if (newShield >= remainingDmg) {
        newShield -= remainingDmg;
        remainingDmg = 0;
      } else {
        remainingDmg -= newShield;
        newShield = 0;
      }
    }

    if (remainingDmg > 0) {
      newHealth = Math.max(0, newHealth - remainingDmg);
    }

    set({
      shield: newShield,
      health: newHealth,
      damageIndicator: { active: true, intensity: Math.min(1, amount / 50) }
    });

    if (newHealth <= 0) {
      // Player died
      const stats = get().stats;
      set({
        stats: {
          ...stats,
          deaths: stats.deaths + 1,
          streak: 0,
        }
      });
      // Respawn after short delay
      setTimeout(() => {
        if (get().matchStatus === "playing") {
          set({
            health: 100,
            shield: 100,
            ammo: get().currentWeapon.magazineSize,
            isReloading: false
          });
        }
      }, 1500);
    }
  },

  heal: (hpAmount, shieldAmount) => {
    set((state) => ({
      health: Math.min(state.maxHealth, state.health + hpAmount),
      shield: Math.min(state.maxShield, state.shield + shieldAmount),
    }));
  },

  fireShot: () => {
    const { ammo, isReloading, currentWeapon, stats } = get();
    if (isReloading || ammo <= 0) return false;

    // Trigger audio based on weapon sound type
    switch (currentWeapon.soundType) {
      case "pistol": lenaAudio.playPistol(); break;
      case "dual": lenaAudio.playDual(); break;
      case "smg": lenaAudio.playSMG(); break;
      case "shotgun": lenaAudio.playShotgun(); break;
      case "burst": lenaAudio.playBurst(); break;
      case "heavy_rifle": lenaAudio.playHeavyRifle(); break;
      case "sniper": lenaAudio.playSniper(); break;
      case "plasma": lenaAudio.playPlasma(); break;
      case "rocket": lenaAudio.playRocket(); break;
      case "slash": lenaAudio.playSlash(); break;
      default: lenaAudio.playPistol(); break;
    }

    const newAmmo = currentWeapon.category === "melee" ? 999 : ammo - 1;
    set({
      ammo: newAmmo,
      stats: {
        ...stats,
        shotsFired: stats.shotsFired + (currentWeapon.pellets || 1),
      }
    });

    if (newAmmo === 0 && currentWeapon.category !== "melee") {
      get().reloadWeapon();
    }

    return true;
  },

  reloadWeapon: () => {
    const { isReloading, ammo, currentWeapon } = get();
    if (isReloading || ammo === currentWeapon.magazineSize || currentWeapon.category === "melee") return;

    set({ isReloading: true });
    lenaAudio.playReload();

    setTimeout(() => {
      get().completeReload();
    }, currentWeapon.reloadTime * 1000);
  },

  completeReload: () => {
    const { currentWeapon, isReloading } = get();
    if (!isReloading) return;
    set({
      ammo: currentWeapon.magazineSize,
      isReloading: false,
    });
  },

  registerHit: (isHeadshot) => {
    const { stats } = get();
    set({
      hitmarker: { active: true, isHeadshot, id: Date.now() },
      stats: {
        ...stats,
        shotsHit: stats.shotsHit + 1,
        headshots: isHeadshot ? stats.headshots + 1 : stats.headshots,
      }
    });
    lenaAudio.playHitmarker(isHeadshot);
  },

  recordKill: (victimName, isHeadshot) => {
    const { currentTier, stats, killfeed } = get();
    const newTier = currentTier + 1;
    const newStreak = stats.streak + 1;
    const addedScore = isHeadshot ? 150 : 100;

    const newKillfeedItem: KillFeedItem = {
      id: Math.random().toString(),
      killer: "LENA_PLAYER",
      victim: victimName,
      killerIsPlayer: true,
      victimIsPlayer: false,
      weaponName: get().currentWeapon.name,
      isHeadshot,
      time: Date.now(),
    };

    if (currentTier >= TOTAL_TIERS) {
      // VICTORY REACHED (Final kill with Neon Katana)!
      set({
        stats: {
          ...stats,
          kills: stats.kills + 1,
          score: stats.score + addedScore + 500,
          streak: newStreak,
          maxStreak: Math.max(stats.maxStreak, newStreak),
        },
        killfeed: [newKillfeedItem, ...killfeed.slice(0, 5)],
      });
      get().endMatch(true, "LENA_PLAYER");
      return;
    }

    const nextWeapon = LENA_WEAPONS[newTier - 1];

    set({
      currentTier: newTier,
      currentWeapon: nextWeapon,
      ammo: nextWeapon.magazineSize,
      isReloading: false,
      tierUpAnnouncement: { active: true, tier: newTier, weaponName: nextWeapon.name },
      killfeed: [newKillfeedItem, ...killfeed.slice(0, 5)],
      stats: {
        ...stats,
        kills: stats.kills + 1,
        score: stats.score + addedScore,
        streak: newStreak,
        maxStreak: Math.max(stats.maxStreak, newStreak),
        tier: newTier,
      }
    });

    lenaAudio.playTierUp();

    // Clear tier up announcement after 2.5s
    setTimeout(() => {
      set({ tierUpAnnouncement: null });
    }, 2500);
  },

  recordBotKill: (killerName, victimName, weaponName, isHeadshot) => {
    const { killfeed } = get();
    const isVictimPlayer = victimName === "LENA_PLAYER";
    const newKillfeedItem: KillFeedItem = {
      id: Math.random().toString(),
      killer: killerName,
      victim: victimName,
      killerIsPlayer: false,
      victimIsPlayer: isVictimPlayer,
      weaponName,
      isHeadshot,
      time: Date.now(),
    };

    set({
      killfeed: [newKillfeedItem, ...killfeed.slice(0, 5)],
    });
  },

  demotePlayer: () => {
    const { currentTier, stats } = get();
    if (currentTier <= 1) return;

    const newTier = currentTier - 1;
    const prevWeapon = LENA_WEAPONS[newTier - 1];

    set({
      currentTier: newTier,
      currentWeapon: prevWeapon,
      ammo: prevWeapon.magazineSize,
      isReloading: false,
      stats: {
        ...stats,
        tier: newTier,
      }
    });
    lenaAudio.playDemote();
  },

  updateSettings: (partial) => {
    set((state) => {
      const updated = { ...state.settings, ...partial };
      lenaAudio.setVolumes(updated.sfxVolume, updated.musicVolume);
      return { settings: updated };
    });
  },

  resetToMenu: () => {
    set({
      matchStatus: "menu",
      gameTime: 0,
      winnerName: null,
    });
  },

  tickGameTime: (delta) => {
    set((state) => ({ gameTime: state.gameTime + delta }));
  }
}));
