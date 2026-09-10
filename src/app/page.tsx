"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useGameStore, BotDifficulty } from "@/store/useGameStore";
import { LENA_WEAPONS, TOTAL_TIERS } from "@/lib/constants/weapons";
import ArmoryInspector from "@/components/canvas/ArmoryInspector";
import CombatHUD from "@/components/hud/CombatHUD";
import PauseMenu from "@/components/hud/PauseMenu";
import VictoryModal from "@/components/hud/VictoryModal";
import SettingsModal from "@/components/hud/SettingsModal";
import {
  Play,
  Crosshair,
  Shield,
  Zap,
  Volume2,
  VolumeX,
  Settings as SettingsIcon,
  Trophy,
  BookOpen,
  Users,
  Flame,
  Award,
  ChevronRight,
} from "lucide-react";
import { lenaAudio } from "@/lib/audio/soundEngine";

// Dynamically import Three.js Game Viewport with SSR disabled
const GameViewport = dynamic(() => import("@/components/canvas/GameViewport"), {
  ssr: false,
});

export default function Home() {
  const { matchStatus, startMatch } = useGameStore();

  const [activeTab, setActiveTab] = useState<"play" | "armory" | "rules" | "leaderboard">("play");
  const [selectedWeaponIdx, setSelectedWeaponIdx] = useState(0);
  const [selectedBots, setSelectedBots] = useState(4);
  const [selectedDifficulty, setSelectedDifficulty] = useState<BotDifficulty>("normal");
  const [showSettings, setShowSettings] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);

  const selectedWeapon = LENA_WEAPONS[selectedWeaponIdx];

  const toggleMusic = () => {
    if (musicPlaying) {
      lenaAudio.stopMusic();
      setMusicPlaying(false);
    } else {
      lenaAudio.startCyberAmbientMusic();
      setMusicPlaying(true);
    }
  };

  const handleLaunchGame = () => {
    startMatch(selectedBots, selectedDifficulty);
  };

  // If in game, render Fullscreen Combat Viewport & Overlays
  if (matchStatus !== "menu") {
    return (
      <main className="relative w-screen h-screen overflow-hidden bg-[#05070B]">
        <GameViewport />
        <CombatHUD />
        {matchStatus === "paused" && <PauseMenu />}
        {(matchStatus === "victory" || matchStatus === "gameover") && <VictoryModal />}
      </main>
    );
  }

  // Otherwise, render LENA Launch Hub & Armory
  return (
    <main className="min-h-screen w-full bg-[#05070B] bg-cyber-grid text-slate-100 flex flex-col justify-between relative overflow-hidden select-none">
      {/* Background Neon Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-lena-blue/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-lena-red/15 rounded-full blur-[120px] pointer-events-none" />

      {/* HEADER / NAVIGATION BAR */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center space-x-4">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-lena-dark-800 border border-lena-blue/50 shadow-lena-blue">
            <span className="text-xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-lena-blue to-lena-red">
              L
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-widest text-white font-mono uppercase">
              PROJECT <span className="text-lena-blue">LE</span><span className="text-lena-red">NA</span>
            </h1>
            <p className="text-[11px] font-mono tracking-widest text-gray-400">
              NEXT-GEN CYBER GUN GAME // 10-TIER ARENA
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-2 bg-lena-dark-800/80 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveTab("play")}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider transition-all flex items-center space-x-2 ${
              activeTab === "play"
                ? "bg-gradient-to-r from-lena-blue to-blue-600 text-white shadow-lena-blue"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>PLAY ARENA</span>
          </button>

          <button
            onClick={() => setActiveTab("armory")}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider transition-all flex items-center space-x-2 ${
              activeTab === "armory"
                ? "bg-gradient-to-r from-lena-blue to-lena-red text-white shadow-lena-dual"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Crosshair className="w-4 h-4" />
            <span>ARMORY (3D)</span>
          </button>

          <button
            onClick={() => setActiveTab("rules")}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider transition-all flex items-center space-x-2 ${
              activeTab === "rules"
                ? "bg-lena-dark-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>RULES</span>
          </button>

          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider transition-all flex items-center space-x-2 ${
              activeTab === "leaderboard"
                ? "bg-gradient-to-r from-red-600 to-lena-red text-white shadow-lena-red"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>HALL OF FAME</span>
          </button>
        </nav>

        {/* Right Tools (Audio & Settings) */}
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleMusic}
            className={`p-3 rounded-2xl border transition-all ${
              musicPlaying
                ? "bg-cyan-950/60 border-lena-blue text-lena-blue shadow-lena-blue"
                : "bg-lena-dark-800 border-white/10 text-gray-400 hover:text-white"
            }`}
            title={musicPlaying ? "Pause Cyber Music" : "Play Cyber Ambient Music"}
          >
            {musicPlaying ? <Volume2 className="w-5 h-5 animate-pulse" /> : <VolumeX className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="p-3 rounded-2xl bg-lena-dark-800 border border-white/10 text-gray-400 hover:text-white hover:border-lena-blue/50 transition-all"
            title="Settings"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* BODY CONTENT AREA */}
      <section className="w-full max-w-7xl mx-auto px-6 py-4 flex-1 flex flex-col justify-center z-10">
        {/* TAB 1: PLAY ARENA LAUNCHER */}
        {activeTab === "play" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Launch Form & Game Config */}
            <div className="lg:col-span-7 flex flex-col space-y-6">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-lena-blue/40 text-cyan-300 text-xs font-mono font-bold tracking-wider w-fit shadow-lena-blue">
                <span className="w-2 h-2 rounded-full bg-lena-blue animate-ping" />
                <span>LENA BROWSER ARENA ENGINE v1.0</span>
              </div>

              <div className="space-y-3">
                <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase leading-none">
                  DOMINATE THE <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-lena-blue via-cyan-200 to-lena-red">
                    WEAPON LADDER
                  </span>
                </h2>
                <p className="text-sm sm:text-base text-gray-300 max-w-xl leading-relaxed">
                  Step into the neon-drenched arena. Score eliminations to instantly cycle through 10 high-tech firearms. Claim the final kill with the <strong>LENA Neon Katana</strong> to secure match victory.
                </p>
              </div>

              {/* Bot Match Options */}
              <div className="bg-lena-dark-800/90 backdrop-blur-md p-6 rounded-3xl border border-white/10 space-y-5 shadow-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-gray-400 flex items-center gap-2">
                    <Users className="w-4 h-4 text-lena-blue" /> ARENA BOT OPPONENTS
                  </span>
                  <span className="text-cyan-400 font-mono font-bold">{selectedBots} AI Combatants</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[2, 4, 6, 8].map((num) => (
                    <button
                      key={num}
                      onClick={() => setSelectedBots(num)}
                      className={`py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
                        selectedBots === num
                          ? "bg-lena-blue text-black font-black shadow-lena-blue"
                          : "bg-lena-dark-700 text-gray-400 hover:text-white"
                      }`}
                    >
                      {num} BOTS
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-mono font-bold text-gray-400 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-lena-red" /> COMBAT DIFFICULTY
                  </span>
                  <span className="text-lena-red font-mono font-bold uppercase">{selectedDifficulty}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(["easy", "normal", "hard", "extreme"] as BotDifficulty[]).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`py-2.5 rounded-xl font-mono text-xs font-bold uppercase transition-all ${
                        selectedDifficulty === diff
                          ? "bg-lena-red text-white font-black shadow-lena-red"
                          : "bg-lena-dark-700 text-gray-400 hover:text-white"
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Play Launch Button */}
              <button
                onClick={handleLaunchGame}
                className="group relative w-full py-5 px-8 rounded-3xl font-black text-lg sm:text-xl tracking-widest text-white uppercase bg-gradient-to-r from-lena-blue via-indigo-600 to-lena-red hover:brightness-110 shadow-lena-dual transition-all flex items-center justify-center space-x-3"
              >
                <Play className="w-6 h-6 fill-current transition-transform group-hover:scale-125" />
                <span>ENTER THE LENA ARENA</span>
                <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            {/* Right: Interactive 3D Showcase Card */}
            <div className="lg:col-span-5 bg-lena-dark-800/80 backdrop-blur-md rounded-3xl border border-lena-blue/30 p-6 shadow-lena-dual flex flex-col space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">
                    FEATURED WEAPON // TIER {selectedWeapon.tier}
                  </span>
                  <h3 className="text-xl font-black tracking-wider text-white">{selectedWeapon.name}</h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-cyan-950 border border-lena-blue/40 text-cyan-300 font-mono text-xs font-bold">
                  {selectedWeapon.category.toUpperCase()}
                </span>
              </div>

              <div className="relative w-full h-64 bg-black/40 rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center">
                <ArmoryInspector weapon={selectedWeapon} />
                <div className="absolute bottom-3 right-3 text-[10px] font-mono text-gray-500">
                  360° AUTO-INSPECT
                </div>
              </div>

              <p className="text-xs text-gray-400 italic">{selectedWeapon.description}</p>

              {/* Weapon Stats */}
              <div className="grid grid-cols-3 gap-2 text-center pt-2">
                <div className="p-2.5 rounded-xl bg-lena-dark-700/60 border border-white/5">
                  <span className="text-[10px] font-mono text-gray-400">DAMAGE</span>
                  <div className="text-base font-bold font-mono text-cyan-400 mt-0.5">
                    {selectedWeapon.damage}
                    {selectedWeapon.pellets > 1 ? `x${selectedWeapon.pellets}` : ""}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-lena-dark-700/60 border border-white/5">
                  <span className="text-[10px] font-mono text-gray-400">MAG SIZE</span>
                  <div className="text-base font-bold font-mono text-white mt-0.5">
                    {selectedWeapon.category === "melee" ? "∞" : selectedWeapon.magazineSize}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-lena-dark-700/60 border border-white/5">
                  <span className="text-[10px] font-mono text-gray-400">HEADSHOT</span>
                  <div className="text-base font-bold font-mono text-lena-red mt-0.5">
                    {selectedWeapon.headshotMultiplier}x
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FULL 10-TIER ARMORY */}
        {activeTab === "armory" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Weapon List (1-10) */}
            <div className="lg:col-span-5 flex flex-col space-y-2 max-h-[500px] overflow-y-auto pr-2">
              <h2 className="text-xl font-black tracking-widest text-white uppercase mb-2">
                LENA <span className="text-lena-blue">10-TIER</span> LADDER
              </h2>
              {LENA_WEAPONS.map((wp, idx) => {
                const isSelected = idx === selectedWeaponIdx;
                return (
                  <button
                    key={wp.id}
                    onClick={() => setSelectedWeaponIdx(idx)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left ${
                      isSelected
                        ? "bg-lena-dark-700 border-lena-blue text-white shadow-lena-blue"
                        : "bg-lena-dark-800/80 border-white/5 text-gray-400 hover:text-white hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-black text-xs ${
                          isSelected ? "bg-lena-blue text-black" : "bg-gray-900 text-gray-400"
                        }`}
                      >
                        T{wp.tier}
                      </span>
                      <div>
                        <div className="text-sm font-bold text-white">{wp.name}</div>
                        <div className="text-[10px] font-mono text-gray-400 uppercase">{wp.category}</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      {wp.damage} DMG
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 3D Inspector and Detailed Breakdown */}
            <div className="lg:col-span-7 bg-lena-dark-800/90 backdrop-blur-md rounded-3xl border border-white/10 p-8 shadow-2xl flex flex-col justify-between space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-xs font-mono tracking-widest text-lena-blue uppercase">
                    TIER {selectedWeapon.tier} OF {TOTAL_TIERS}
                  </span>
                  <h3 className="text-3xl font-black text-white tracking-wider">{selectedWeapon.name}</h3>
                </div>
                <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-lena-blue to-lena-red text-white font-mono text-xs font-black uppercase shadow-lena-dual">
                  {selectedWeapon.category}
                </span>
              </div>

              {/* 3D Viewport */}
              <div className="w-full h-64 bg-black/50 rounded-2xl overflow-hidden border border-white/5 relative">
                <ArmoryInspector weapon={selectedWeapon} />
              </div>

              <p className="text-sm text-gray-300 leading-relaxed">{selectedWeapon.description}</p>

              {/* Full Stat Bars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-lena-dark-700/60 p-3.5 rounded-2xl border border-white/5">
                  <span className="text-xs font-mono text-gray-400">BASE DAMAGE</span>
                  <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
                    {selectedWeapon.damage}
                  </div>
                </div>
                <div className="bg-lena-dark-700/60 p-3.5 rounded-2xl border border-white/5">
                  <span className="text-xs font-mono text-gray-400">FIRE INTERVAL</span>
                  <div className="text-xl font-bold font-mono text-white mt-1">
                    {selectedWeapon.fireRate}ms
                  </div>
                </div>
                <div className="bg-lena-dark-700/60 p-3.5 rounded-2xl border border-white/5">
                  <span className="text-xs font-mono text-gray-400">MAGAZINE</span>
                  <div className="text-xl font-bold font-mono text-yellow-400 mt-1">
                    {selectedWeapon.category === "melee" ? "∞" : selectedWeapon.magazineSize}
                  </div>
                </div>
                <div className="bg-lena-dark-700/60 p-3.5 rounded-2xl border border-white/5">
                  <span className="text-xs font-mono text-gray-400">HEADSHOT MULT</span>
                  <div className="text-xl font-bold font-mono text-lena-red mt-1">
                    {selectedWeapon.headshotMultiplier}x
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: HOW TO PLAY & RULES */}
        {activeTab === "rules" && (
          <div className="max-w-4xl mx-auto bg-lena-dark-800/90 backdrop-blur-md p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
            <h2 className="text-2xl font-black tracking-widest text-white uppercase border-b border-white/10 pb-4">
              GUN GAME RULES & COMBAT CONTROLS
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rules Card */}
              <div className="bg-lena-dark-700/60 p-6 rounded-2xl border border-lena-blue/30 space-y-3">
                <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
                  <Zap className="w-5 h-5" /> 10-Tier Weapon Progression
                </h3>
                <ul className="text-xs text-gray-300 space-y-2 list-disc list-inside leading-relaxed">
                  <li>Everyone starts at <strong>Tier 1 (LENA Pulse-9)</strong>.</li>
                  <li>Every confirmed kill instantly evolves you to the next weapon.</li>
                  <li><strong>Tier 10 (Neon Katana):</strong> Score 1 final melee elimination to trigger the <strong>VICTORY FANFARE</strong>.</li>
                  <li>Falling off or taking self-damage will demote you 1 Tier!</li>
                </ul>
              </div>

              {/* Controls Card */}
              <div className="bg-lena-dark-700/60 p-6 rounded-2xl border border-lena-red/30 space-y-3">
                <h3 className="text-lg font-bold text-red-400 flex items-center gap-2">
                  <Crosshair className="w-5 h-5" /> Keyboard & Mouse Controls
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-black/40 text-gray-300"><strong>WASD</strong> : Move</div>
                  <div className="p-2 rounded bg-black/40 text-gray-300"><strong>MOUSE</strong> : Aim & Look</div>
                  <div className="p-2 rounded bg-black/40 text-gray-300"><strong>LEFT CLICK</strong> : Shoot</div>
                  <div className="p-2 rounded bg-black/40 text-gray-300"><strong>SPACE</strong> : Jump</div>
                  <div className="p-2 rounded bg-black/40 text-gray-300"><strong>SHIFT</strong> : Sprint</div>
                  <div className="p-2 rounded bg-black/40 text-gray-300"><strong>R</strong> : Reload</div>
                  <div className="p-2 rounded bg-black/40 text-gray-300"><strong>ESC</strong> : Pause Menu</div>
                  <div className="p-2 rounded bg-black/40 text-gray-300"><strong>JUMP PADS</strong> : Air Boost</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LEADERBOARD & HALL OF FAME */}
        {activeTab === "leaderboard" && (
          <div className="max-w-4xl mx-auto bg-lena-dark-800/90 backdrop-blur-md p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-2xl font-black tracking-widest text-white uppercase">
                  LENA GLOBAL <span className="text-lena-red">HALL OF FAME</span>
                </h2>
                <p className="text-xs font-mono text-gray-400">TOP ARENA OPERATORS</p>
              </div>
              <Trophy className="w-8 h-8 text-yellow-400" />
            </div>

            <div className="space-y-2 font-mono text-xs">
              {[
                { rank: "#1", name: "LENA_CHAMPION", wins: 142, kd: "4.8", tier: "TIER 10 MASTER", color: "text-yellow-400" },
                { rank: "#2", name: "CYBER_VALKYRIE", wins: 119, kd: "4.2", tier: "TIER 10 MASTER", color: "text-slate-300" },
                { rank: "#3", name: "NEXUS_VIPER_99", wins: 98, kd: "3.9", tier: "TIER 10 MASTER", color: "text-amber-600" },
                { rank: "#4", name: "PULSE_STRIKER", wins: 84, kd: "3.4", tier: "TIER 9", color: "text-gray-400" },
                { rank: "#5", name: "NEON_SPECTRE", wins: 76, kd: "3.1", tier: "TIER 8", color: "text-gray-400" },
              ].map((row) => (
                <div
                  key={row.rank}
                  className="flex items-center justify-between p-4 rounded-2xl bg-lena-dark-700/60 border border-white/5 hover:border-lena-blue/40 transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <span className={`text-base font-black ${row.color}`}>{row.rank}</span>
                    <span className="font-bold text-white text-sm">{row.name}</span>
                  </div>
                  <div className="flex items-center space-x-6">
                    <span className="text-cyan-400 font-bold">{row.wins} WINS</span>
                    <span className="text-red-400 font-bold">{row.kd} K/D</span>
                    <span className="text-gray-400">{row.tier}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-gray-500 border-t border-white/5 z-10">
        <div>
          BRAND: <span className="text-lena-blue font-bold">LENA</span> // DUAL COLOR ACCENT:{" "}
          <span className="text-lena-blue">#00E5FF (BLUE)</span> &amp;{" "}
          <span className="text-lena-red">#FF0055 (RED)</span>
        </div>
        <div className="mt-2 sm:mt-0">© 2026 LENA ESPORTS ARENA. ALL RIGHTS RESERVED.</div>
      </footer>

      {/* Settings Modal (Global) */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <SettingsModal onClose={() => setShowSettings(false)} />
        </div>
      )}
    </main>
  );
}
