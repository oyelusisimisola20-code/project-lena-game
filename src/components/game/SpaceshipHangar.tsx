"use client";

import React, { useEffect } from "react";
import { useSpaceGameStore } from "@/store/useSpaceGameStore";
import { PLAYABLE_SPACESHIPS } from "@/lib/constants/spaceships";
import {
  Rocket,
  Shield,
  Zap,
  Gauge,
  Heart,
  Lock,
  Play,
  Volume2,
  VolumeX,
  Trophy,
  Flame,
  Award,
} from "lucide-react";

export default function SpaceshipHangar() {
  const {
    currentShip,
    unlockedShipIds,
    highScore,
    highestLevel,
    soundEnabled,
    musicEnabled,
    selectShip,
    startMission,
    loadSavedData,
    toggleSound,
    toggleMusic,
  } = useSpaceGameStore();

  useEffect(() => {
    loadSavedData();
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#05070B] bg-cyber-grid text-slate-100 flex flex-col justify-between p-4 sm:p-8 relative overflow-x-hidden select-none">
      {/* Background Ambient Glows */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-lena-blue/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-lena-red/20 rounded-full blur-[100px] pointer-events-none" />

      {/* HEADER */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-lena-dark-800 border border-lena-blue/50 flex items-center justify-center font-mono font-black text-cyan-400 shadow-lena-blue">
            <Rocket className="w-5 h-5 text-lena-blue" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black font-mono tracking-widest text-white uppercase">
              PROJECT <span className="text-lena-blue">LE</span><span className="text-lena-red">NA</span>
            </h1>
            <p className="text-[10px] sm:text-xs font-mono tracking-widest text-gray-400">
              SPACE COMBAT // ARENA SHOOTER
            </p>
          </div>
        </div>

        {/* High Score & Controls */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-2xl bg-lena-dark-800/90 border border-white/10 text-xs font-mono font-bold text-yellow-400 shadow-lg">
            <Trophy className="w-4 h-4" />
            <span>HIGH: {highScore.toLocaleString()}</span>
          </div>

          <button
            onClick={toggleMusic}
            className={`p-2.5 rounded-2xl border transition-all ${
              musicEnabled
                ? "bg-cyan-950/60 border-lena-blue text-lena-blue shadow-lena-blue"
                : "bg-lena-dark-800 border-white/10 text-gray-400 hover:text-white"
            }`}
            title="Toggle Music"
          >
            {musicEnabled ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* MAIN HANGAR SPACESHIP SELECTION */}
      <main className="max-w-6xl w-full mx-auto my-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center z-10">
        {/* Left: Spaceship Grid */}
        <div className="lg:col-span-6 flex flex-col space-y-3">
          <h2 className="text-sm font-mono font-black text-cyan-400 tracking-wider uppercase">
            SELECT COMBAT SPACESHIP
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PLAYABLE_SPACESHIPS.map((ship) => {
              const isUnlocked = unlockedShipIds.includes(ship.id);
              const isSelected = currentShip.id === ship.id;

              return (
                <button
                  key={ship.id}
                  disabled={!isUnlocked}
                  onClick={() => selectShip(ship.id)}
                  className={`p-4 rounded-3xl border text-left transition-all relative overflow-hidden ${
                    isSelected
                      ? "bg-lena-dark-700/90 border-lena-blue shadow-lena-blue scale-[1.02]"
                      : isUnlocked
                      ? "bg-lena-dark-800/70 border-white/10 hover:border-white/30 hover:bg-lena-dark-700/60"
                      : "bg-lena-dark-900/50 border-white/5 opacity-60 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono tracking-wider uppercase text-gray-400">
                      {ship.classType}
                    </span>
                    {!isUnlocked ? (
                      <Lock className="w-4 h-4 text-gray-500" />
                    ) : (
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: ship.color }}
                      />
                    )}
                  </div>

                  <h3 className="text-base font-black text-white">{ship.name}</h3>

                  {!isUnlocked ? (
                    <span className="text-[10px] font-mono text-yellow-500 mt-2 block">
                      Unlock at {ship.unlockScoreRequired.toLocaleString()} pts
                    </span>
                  ) : (
                    <div className="flex items-center space-x-3 mt-3 text-[10px] font-mono text-gray-300">
                      <span>HP: {ship.health}</span>
                      <span>SH: {ship.shield}</span>
                      <span>SPD: {ship.speed}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Ship Profile & Launch Button */}
        <div className="lg:col-span-6 bg-lena-dark-800/90 backdrop-blur-md rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl flex flex-col space-y-6">
          <div className="flex items-start justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
                {currentShip.classType}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wider">
                {currentShip.name}
              </h2>
            </div>
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-black text-lg border"
              style={{
                borderColor: currentShip.color,
                boxShadow: `0 0 15px ${currentShip.color}`,
                backgroundColor: "rgba(10,15,25,0.8)",
              }}
            >
              ▲
            </div>
          </div>

          {/* Stats Breakdown */}
          <div className="space-y-3 font-mono text-xs">
            <div>
              <div className="flex justify-between text-gray-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-red-500" /> HULL HEALTH
                </span>
                <span className="font-bold text-white">{currentShip.health} / 200</span>
              </div>
              <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 transition-all duration-300"
                  style={{ width: `${(currentShip.health / 200) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-gray-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" /> ENERGY SHIELD
                </span>
                <span className="font-bold text-white">{currentShip.shield} / 200</span>
              </div>
              <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 transition-all duration-300"
                  style={{ width: `${(currentShip.shield / 200) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-gray-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-yellow-400" /> ENGINE VELOCITY
                </span>
                <span className="font-bold text-white">{currentShip.speed} / 550</span>
              </div>
              <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 transition-all duration-300"
                  style={{ width: `${(currentShip.speed / 550) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Special Ability Card */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
            <span className="text-[10px] font-mono font-bold text-lena-blue uppercase flex items-center gap-1">
              <Zap className="w-3 h-3" /> SPECIAL: {currentShip.specialAbilityName}
            </span>
            <p className="text-xs text-gray-300 italic">{currentShip.specialAbilityDesc}</p>
          </div>

          {/* Launch Mission */}
          <button
            onClick={() => startMission(1)}
            className="w-full py-4 rounded-2xl font-black text-lg tracking-widest text-white uppercase bg-gradient-to-r from-lena-blue via-indigo-600 to-lena-red hover:brightness-110 shadow-lena-dual transition-all flex items-center justify-center space-x-3 active:scale-95"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>LAUNCH SPACE MISSION</span>
          </button>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="max-w-6xl w-full mx-auto text-center text-xs font-mono text-gray-500 z-10">
        PROJECT LENA // MOBILE & DESKTOP COMBAT ENGINE // AUTO SHOOTING ACTIVE
      </footer>
    </div>
  );
}
