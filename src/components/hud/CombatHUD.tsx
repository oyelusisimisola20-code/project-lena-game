"use client";

import React, { useEffect, useState } from "react";
import { useGameStore } from "@/store/useGameStore";
import { TOTAL_TIERS, LENA_WEAPONS } from "@/lib/constants/weapons";
import { Shield, Heart, Zap, Crosshair as CrosshairIcon, Trophy, Flame } from "lucide-react";

export default function CombatHUD() {
  const {
    health,
    maxHealth,
    shield,
    maxShield,
    currentTier,
    currentWeapon,
    ammo,
    isReloading,
    stats,
    hitmarker,
    damageIndicator,
    tierUpAnnouncement,
    killfeed,
    gameTime,
  } = useGameStore();

  const [showHitmarker, setShowHitmarker] = useState(false);

  useEffect(() => {
    if (hitmarker.active) {
      setShowHitmarker(true);
      const t = setTimeout(() => setShowHitmarker(false), 120);
      return () => clearTimeout(t);
    }
  }, [hitmarker.id]);

  const minutes = Math.floor(gameTime / 60);
  const seconds = Math.floor(gameTime % 60);
  const timeFormatted = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  const hpPercent = Math.max(0, Math.min(100, (health / maxHealth) * 100));
  const shieldPercent = Math.max(0, Math.min(100, (shield / maxShield) * 100));

  return (
    <div className="pointer-events-none absolute inset-0 select-none overflow-hidden z-20 flex flex-col justify-between p-6">
      {/* Red Damage Flash Vignette */}
      {damageIndicator.active && health > 0 && (
        <div className="pointer-events-none absolute inset-0 bg-red-600/20 shadow-[inset_0_0_80px_rgba(255,0,85,0.6)] animate-pulse transition-opacity duration-300" />
      )}

      {/* TOP BAR: Minimap, Match Timer, Streak, Killfeed */}
      <div className="flex items-start justify-between w-full">
        {/* Left: Brand & Radar */}
        <div className="flex items-center space-x-4">
          <div className="relative p-3 bg-lena-dark-800/80 backdrop-blur-md border border-lena-blue/40 rounded-xl shadow-lena-blue flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-lena-blue animate-ping" />
            <div>
              <div className="text-xs font-mono tracking-widest text-cyan-300 uppercase">PROJECT LENA</div>
              <div className="text-sm font-bold tracking-wider text-white">CYBER ARENA // GUN GAME</div>
            </div>
          </div>

          <div className="px-4 py-2 bg-lena-dark-800/80 backdrop-blur-md border border-white/10 rounded-xl font-mono text-cyan-400 font-bold tracking-widest text-base shadow-lg">
            ⏱ {timeFormatted}
          </div>

          {stats.streak > 1 && (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-lena-red to-orange-600 rounded-lg text-white font-bold text-xs tracking-wider uppercase animate-bounce shadow-lena-red">
              <Flame className="w-4 h-4" />
              <span>{stats.streak} KILL STREAK!</span>
            </div>
          )}
        </div>

        {/* Right: Live Killfeed */}
        <div className="flex flex-col space-y-2 items-end max-w-sm">
          {killfeed.map((kf) => (
            <div
              key={kf.id}
              className={`flex items-center space-x-2 px-3 py-1 rounded-md text-xs font-mono backdrop-blur-md transition-all border ${
                kf.killerIsPlayer
                  ? "bg-cyan-950/80 border-lena-blue text-cyan-200 shadow-lena-blue"
                  : kf.victimIsPlayer
                  ? "bg-red-950/80 border-lena-red text-red-200 shadow-lena-red"
                  : "bg-slate-900/80 border-slate-700 text-slate-300"
              }`}
            >
              <span className="font-bold">{kf.killer}</span>
              <span className="text-gray-400">[{kf.weaponName}]</span>
              {kf.isHeadshot && <span className="text-yellow-400 font-bold text-[10px]">🎯 HS</span>}
              <span className="font-bold text-red-400">{kf.victim}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CENTER: Dynamic Crosshair & Hitmarker */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Dynamic Crosshair */}
        <div className="relative w-8 h-8 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00E5FF]" />
          <div className="absolute top-0 w-0.5 h-2 bg-cyan-400/80" />
          <div className="absolute bottom-0 w-0.5 h-2 bg-cyan-400/80" />
          <div className="absolute left-0 h-0.5 w-2 bg-cyan-400/80" />
          <div className="absolute right-0 h-0.5 w-2 bg-cyan-400/80" />

          {/* Hitmarker X */}
          {showHitmarker && (
            <div
              className={`absolute w-7 h-7 flex items-center justify-center ${
                hitmarker.isHeadshot ? "text-red-500 scale-125" : "text-cyan-300"
              }`}
            >
              <div className="absolute w-4 h-0.5 bg-current rotate-45" />
              <div className="absolute w-4 h-0.5 bg-current -rotate-45" />
            </div>
          )}
        </div>

        {/* Tier Up Banner Announcement */}
        {tierUpAnnouncement && (
          <div className="absolute top-1/3 flex flex-col items-center animate-bounce">
            <div className="px-6 py-2 bg-gradient-to-r from-lena-blue via-indigo-600 to-lena-red rounded-xl text-white font-black text-xl tracking-widest shadow-lena-dual uppercase border border-white/30">
              ⚡ TIER {tierUpAnnouncement.tier} UNLOCKED: {tierUpAnnouncement.weaponName} ⚡
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM BAR: Health/Shield on Left, Weapon Ladder in Middle, Ammo on Right */}
      <div className="flex items-end justify-between w-full space-x-6">
        {/* Health & Shield */}
        <div className="flex flex-col space-y-2 w-72 bg-lena-dark-800/85 backdrop-blur-lg p-4 rounded-2xl border border-white/10 shadow-2xl">
          {/* Shield Bar (Cyan Blue) */}
          <div>
            <div className="flex justify-between text-xs font-mono font-bold text-cyan-400 mb-1">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> SHIELD
              </span>
              <span>{Math.round(shield)} / {maxShield}</span>
            </div>
            <div className="w-full h-3 bg-gray-900 rounded-full overflow-hidden border border-cyan-500/30">
              <div
                className="h-full bg-gradient-to-r from-cyan-600 to-lena-blue shadow-[0_0_12px_#00E5FF] transition-all duration-200"
                style={{ width: `${shieldPercent}%` }}
              />
            </div>
          </div>

          {/* Health Bar (Crimson Red) */}
          <div>
            <div className="flex justify-between text-xs font-mono font-bold text-red-400 mb-1">
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" /> HEALTH
              </span>
              <span>{Math.round(health)} / {maxHealth}</span>
            </div>
            <div className="w-full h-3 bg-gray-900 rounded-full overflow-hidden border border-red-500/30">
              <div
                className="h-full bg-gradient-to-r from-red-700 to-lena-red shadow-[0_0_12px_#FF0055] transition-all duration-200"
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* 10-Tier Weapon Progression Ladder Bar */}
        <div className="flex-1 max-w-xl bg-lena-dark-800/85 backdrop-blur-lg p-4 rounded-2xl border border-white/10 shadow-2xl flex flex-col items-center">
          <div className="flex justify-between w-full text-xs font-mono font-bold text-gray-400 mb-2">
            <span className="text-cyan-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-lena-blue" /> TIER {currentTier} / {TOTAL_TIERS}
            </span>
            <span className="text-white uppercase tracking-wider">{currentWeapon.name}</span>
            <span className="text-red-400 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-lena-red" /> GOAL: TIER 10 KATANA
            </span>
          </div>

          {/* 10 Tier Step Indicators */}
          <div className="grid grid-cols-10 gap-1.5 w-full">
            {LENA_WEAPONS.map((wp, idx) => {
              const isPast = idx + 1 < currentTier;
              const isCurrent = idx + 1 === currentTier;
              return (
                <div
                  key={wp.id}
                  className={`h-2.5 rounded-sm transition-all duration-300 ${
                    isCurrent
                      ? "bg-gradient-to-r from-lena-blue to-lena-red shadow-lena-dual scale-y-125"
                      : isPast
                      ? "bg-lena-blue/80 shadow-[0_0_8px_#00E5FF]"
                      : "bg-gray-800/80 border border-white/5"
                  }`}
                  title={`Tier ${wp.tier}: ${wp.name}`}
                />
              );
            })}
          </div>
        </div>

        {/* Ammo Counter & Weapon Card */}
        <div className="flex items-center space-x-4 bg-lena-dark-800/85 backdrop-blur-lg p-4 rounded-2xl border border-white/10 shadow-2xl min-w-[200px] justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase">WEAPON</span>
            <span className="text-sm font-bold text-white tracking-wider truncate max-w-[130px]">
              {currentWeapon.name}
            </span>
            <span className="text-xs text-cyan-400 uppercase">{currentWeapon.category}</span>
          </div>

          <div className="text-right">
            {currentWeapon.category === "melee" ? (
              <span className="text-2xl font-black text-lena-red tracking-widest">MELEE</span>
            ) : isReloading ? (
              <span className="text-xs font-mono font-bold text-yellow-400 animate-pulse">RELOADING...</span>
            ) : (
              <div className="flex items-baseline space-x-1">
                <span className="text-3xl font-black font-mono text-white tracking-tight">{ammo}</span>
                <span className="text-xs font-mono text-gray-500">/{currentWeapon.magazineSize}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
