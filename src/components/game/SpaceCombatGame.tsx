"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSpaceGameStore } from "@/store/useSpaceGameStore";
import { SpaceCombatEngine } from "@/lib/game/spaceCombatEngine";
import { BONUS_CONFIGS } from "@/lib/constants/bonuses";
import {
  Shield,
  Heart,
  Zap,
  Bomb,
  Pause,
  Play,
  RotateCcw,
  Home,
  Flame,
  Trophy,
  ChevronRight,
  Volume2,
  VolumeX,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function SpaceCombatGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<SpaceCombatEngine | null>(null);

  const {
    gameState,
    currentShip,
    level,
    score,
    highScore,
    combo,
    comboTimer,
    health,
    maxHealth,
    shield,
    maxShield,
    weaponLevel,
    bombs,
    powerShotCooldown,
    maxPowerShotCooldown,
    activeBonuses,
    isInvincible,
    enemiesDestroyed,
    soundEnabled,
    musicEnabled,
    startMission,
    pauseMission,
    resumeMission,
    takeDamage,
    addScore,
    collectBonus,
    useBomb,
    usePowerShot,
    tickCooldowns,
    advanceLevel,
    endGame,
    resetToHangar,
    toggleSound,
    toggleMusic,
  } = useSpaceGameStore();

  const [touchActive, setTouchActive] = useState(false);

  // Check if rapid fire active
  const isRapidFire = activeBonuses.some((b) => b.type === "rapid_fire");

  // Initialize Canvas Engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new SpaceCombatEngine(
      canvasRef.current,
      currentShip,
      level,
      weaponLevel,
      {
        onScore: (pts) => addScore(pts),
        onDamage: (amt) => takeDamage(amt),
        onCollectBonus: (type) => collectBonus(type),
        onLevelClear: () => advanceLevel(),
      }
    );
    engineRef.current = engine;

    const handleResize = () => engine.resize();
    window.addEventListener("resize", handleResize);

    // Keyboard Listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      engine.keys[e.code] = true;
      if (e.code === "Space") {
        if (usePowerShot()) {
          engine.triggerPowerShot();
        }
      }
      if (e.code === "KeyB" || e.code === "ShiftLeft") {
        if (useBomb()) {
          engine.triggerBomb();
        }
      }
      if (e.code === "Escape") {
        if (gameState === "playing") pauseMission();
        else if (gameState === "paused") resumeMission();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      engine.keys[e.code] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Animation Game Loop
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      animId = requestAnimationFrame(loop);
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (useSpaceGameStore.getState().gameState === "playing") {
        tickCooldowns(delta);
        engine.setShip(useSpaceGameStore.getState().currentShip);
        engine.setWeaponLevel(useSpaceGameStore.getState().weaponLevel);
        engine.update(delta, isRapidFire, isInvincible);
      }
      engine.render(isInvincible);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [level]);

  // Touch Drag Events
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!engineRef.current) return;
    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      engineRef.current.touchTarget = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
        active: true,
      };
      setTouchActive(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!engineRef.current) return;
    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      engineRef.current.touchTarget = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
        active: true,
      };
    }
  };

  const handleTouchEnd = () => {
    if (!engineRef.current) return;
    engineRef.current.touchTarget.active = false;
    setTouchActive(false);
  };

  const handleTriggerPowerShot = () => {
    if (usePowerShot() && engineRef.current) {
      engineRef.current.triggerPowerShot();
    }
  };

  const handleTriggerBomb = () => {
    if (useBomb() && engineRef.current) {
      engineRef.current.triggerBomb();
    }
  };

  useEffect(() => {
    if (gameState === "level_cleared") {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#00E5FF", "#FF0055", "#FFFFFF"],
      });
    }
  }, [gameState]);

  const powerShotPercent = Math.max(0, 1 - powerShotCooldown / maxPowerShotCooldown) * 100;
  const hpPercent = Math.max(0, Math.min(100, (health / maxHealth) * 100));
  const shieldPercent = Math.max(0, Math.min(100, (shield / maxShield) * 100));

  return (
    <div className="relative w-full h-full min-h-screen bg-[#05070B] overflow-hidden select-none touch-none">
      {/* 2D HTML5 Space Combat Canvas */}
      <canvas
        ref={canvasRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="absolute inset-0 w-full h-full block cursor-crosshair"
      />

      {/* TOP COMBAT HUD */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 p-3 sm:p-5 flex items-start justify-between z-20">
        {/* Left: Health & Shields */}
        <div className="flex flex-col space-y-1.5 w-44 sm:w-56 bg-lena-dark-800/85 backdrop-blur-md p-2.5 sm:p-3.5 rounded-2xl border border-white/10 shadow-lena-blue">
          {/* Shield */}
          <div>
            <div className="flex justify-between text-[10px] sm:text-xs font-mono font-bold text-cyan-400 mb-0.5">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3" /> SHIELD
              </span>
              <span>{Math.round(shield)}/{maxShield}</span>
            </div>
            <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden border border-cyan-500/30">
              <div
                className="h-full bg-gradient-to-r from-cyan-600 to-lena-blue shadow-[0_0_8px_#00E5FF] transition-all duration-150"
                style={{ width: `${shieldPercent}%` }}
              />
            </div>
          </div>

          {/* Health */}
          <div>
            <div className="flex justify-between text-[10px] sm:text-xs font-mono font-bold text-red-400 mb-0.5">
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" /> HULL
              </span>
              <span>{Math.round(health)}/{maxHealth}</span>
            </div>
            <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden border border-red-500/30">
              <div
                className="h-full bg-gradient-to-r from-red-700 to-lena-red shadow-[0_0_8px_#FF0055] transition-all duration-150"
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center: Level & Score & Combo */}
        <div className="flex flex-col items-center">
          <div className="px-3 sm:px-5 py-1.5 bg-lena-dark-800/90 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl flex items-center space-x-2 sm:space-x-3">
            <span className="text-[10px] sm:text-xs font-mono font-black text-cyan-400">LEVEL {level}</span>
            <span className="text-white font-mono font-black text-sm sm:text-lg tracking-wider">{score.toLocaleString()}</span>
          </div>

          {combo > 1 && (
            <div className="mt-1 flex items-center space-x-1 px-2.5 py-0.5 bg-gradient-to-r from-lena-red to-orange-500 rounded-full text-white font-mono font-black text-[10px] sm:text-xs tracking-wider shadow-lena-red animate-pulse">
              <Flame className="w-3 h-3" />
              <span>{combo.toFixed(1)}x COMBO</span>
            </div>
          )}
        </div>

        {/* Right: Active Bonuses & Controls */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          <button
            onClick={pauseMission}
            className="p-2 sm:p-2.5 rounded-xl bg-lena-dark-800/90 border border-white/10 text-gray-300 hover:text-white transition-all shadow-lg"
            title="Pause"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ACTIVE BONUSES BAR */}
      {activeBonuses.length > 0 && (
        <div className="pointer-events-none absolute top-20 left-4 flex flex-col space-y-1.5 z-20">
          {activeBonuses.map((b, idx) => {
            const cfg = BONUS_CONFIGS[b.type];
            return (
              <div
                key={idx}
                className="flex items-center space-x-2 px-2.5 py-1 rounded-xl bg-lena-dark-800/90 border border-white/10 text-[10px] font-mono font-bold text-white shadow-lg backdrop-blur-md"
              >
                <span>{cfg.symbol}</span>
                <span className="text-cyan-300">{cfg.name}</span>
                <span className="text-yellow-400">{Math.ceil(b.timeLeft)}s</span>
              </div>
            );
          })}
        </div>
      )}

      {/* BOTTOM ACTION BUTTONS (MOBILE & LAPTOP FRIENDLY) */}
      <div className="absolute bottom-6 right-6 flex items-center space-x-4 z-20">
        {/* Power Shot Button */}
        <button
          onClick={handleTriggerPowerShot}
          disabled={powerShotCooldown > 0}
          className={`relative flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 transition-all shadow-2xl ${
            powerShotCooldown === 0
              ? "bg-gradient-to-br from-cyan-500 to-blue-700 border-cyan-300 text-white shadow-lena-blue scale-105 active:scale-95"
              : "bg-lena-dark-800/90 border-gray-700 text-gray-500 cursor-not-allowed"
          }`}
          title="Power Shot (Spacebar)"
        >
          <Zap className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
          <span className="text-[9px] sm:text-[10px] font-mono font-black mt-0.5">
            {powerShotCooldown === 0 ? "POWER" : `${Math.ceil(powerShotCooldown)}s`}
          </span>
          {powerShotCooldown > 0 && (
            <div
              className="absolute inset-0 rounded-full border-2 border-cyan-400 opacity-40 animate-spin"
              style={{ clipPath: `inset(0 0 ${100 - powerShotPercent}% 0)` }}
            />
          )}
        </button>

        {/* Tactical Bomb Button */}
        <button
          onClick={handleTriggerBomb}
          disabled={bombs <= 0}
          className={`relative flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 transition-all shadow-2xl ${
            bombs > 0
              ? "bg-gradient-to-br from-red-600 to-rose-800 border-red-400 text-white shadow-lena-red scale-105 active:scale-95"
              : "bg-lena-dark-800/90 border-gray-700 text-gray-500 cursor-not-allowed"
          }`}
          title="EMP Bomb (B key / Shift)"
        >
          <Bomb className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
          <span className="text-[9px] sm:text-[10px] font-mono font-black mt-0.5">
            BOMB ({bombs})
          </span>
        </button>
      </div>

      {/* MOBILE TOUCH HINT */}
      <div className="pointer-events-none absolute bottom-6 left-6 text-xs font-mono text-gray-500 hidden sm:block">
        <strong>CONTROLS:</strong> WASD / Touch Drag to Move • Auto Shooting • Space: Power Shot • B: Bomb
      </div>

      {/* PAUSE MODAL */}
      {gameState === "paused" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-sm bg-lena-dark-800 border border-lena-blue/40 rounded-3xl p-6 shadow-lena-dual text-center flex flex-col space-y-4">
            <h3 className="text-xl font-black text-white font-mono uppercase">MISSION PAUSED</h3>
            <div className="flex flex-col space-y-2">
              <button
                onClick={resumeMission}
                className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-lena-blue to-blue-600 hover:brightness-110 shadow-lena-blue flex items-center justify-center space-x-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>RESUME</span>
              </button>
              <button
                onClick={() => startMission(level)}
                className="w-full py-2.5 rounded-xl font-bold text-gray-300 bg-lena-dark-700 hover:bg-lena-dark-600 border border-white/10 flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>RESTART LEVEL</span>
              </button>
              <button
                onClick={resetToHangar}
                className="w-full py-2.5 rounded-xl font-bold text-red-400 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 flex items-center justify-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>HANGAR</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEVEL CLEARED MODAL */}
      {gameState === "level_cleared" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-lena-dark-800 border border-lena-blue rounded-3xl p-8 shadow-lena-dual text-center flex flex-col space-y-5">
            <div className="space-y-1">
              <Trophy className="w-12 h-12 text-yellow-400 mx-auto animate-bounce" />
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-lena-red uppercase">
                SECTOR {level - 1} CLEARED!
              </h2>
              <p className="text-xs font-mono text-gray-400">WARPING TO NEXT COMBAT SECTOR</p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">CURRENT SCORE:</span>
                <span className="text-cyan-400 font-bold">{score.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">ENEMIES DESTROYED:</span>
                <span className="text-white font-bold">{enemiesDestroyed}</span>
              </div>
            </div>

            <button
              onClick={() => startMission(level)}
              className="w-full py-4 rounded-2xl font-black text-lg text-white bg-gradient-to-r from-lena-blue via-indigo-600 to-lena-red hover:brightness-110 shadow-lena-dual flex items-center justify-center space-x-2"
            >
              <span>ENTER SECTOR {level}</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* GAME OVER MODAL */}
      {gameState === "game_over" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg p-4">
          <div className="w-full max-w-md bg-lena-dark-800 border border-lena-red rounded-3xl p-8 shadow-lena-red text-center flex flex-col space-y-5">
            <h2 className="text-4xl font-black text-lena-red uppercase drop-shadow-[0_0_20px_#FF0055]">
              SPACESHIP DESTROYED
            </h2>
            <p className="text-xs font-mono text-gray-400">MISSION TERMINATED IN SECTOR {level}</p>

            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-black/40 border border-white/5 font-mono text-xs">
              <div className="flex flex-col items-center">
                <span className="text-gray-400">FINAL SCORE</span>
                <span className="text-xl font-black text-cyan-400 mt-1">{score.toLocaleString()}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-gray-400">HIGH SCORE</span>
                <span className="text-xl font-black text-yellow-400 mt-1">{highScore.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => startMission(1)}
                className="flex-1 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-lena-blue to-lena-red hover:brightness-110 shadow-lena-dual flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>PLAY AGAIN</span>
              </button>
              <button
                onClick={resetToHangar}
                className="py-3.5 px-5 rounded-2xl font-bold text-gray-300 bg-lena-dark-700 hover:bg-lena-dark-600 border border-white/10 flex items-center justify-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>HANGAR</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
