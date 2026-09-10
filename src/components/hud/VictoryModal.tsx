"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { useGameStore } from "@/store/useGameStore";
import { Trophy, Flame, Target, Crosshair, Award, RotateCcw, Home } from "lucide-react";

export default function VictoryModal() {
  const { matchStatus, stats, winnerName, startMatch, resetToMenu, botCount, difficulty } = useGameStore();
  const isVictory = matchStatus === "victory";

  useEffect(() => {
    if (isVictory) {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ["#00E5FF", "#FF0055", "#FFFFFF"],
      });
    }
  }, [isVictory]);

  const accuracy =
    stats.shotsFired > 0 ? Math.round((stats.shotsHit / stats.shotsFired) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-lg p-4 select-none">
      <div
        className={`w-full max-w-xl bg-lena-dark-800 border rounded-3xl p-8 shadow-2xl text-center flex flex-col space-y-6 ${
          isVictory
            ? "border-lena-blue/60 shadow-lena-dual"
            : "border-lena-red/60 shadow-lena-red"
        }`}
      >
        {/* Title */}
        <div className="space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-white/5 border border-white/10 mb-1">
            {isVictory ? (
              <Trophy className="w-10 h-10 text-yellow-400 animate-bounce" />
            ) : (
              <Award className="w-10 h-10 text-red-500" />
            )}
          </div>
          <h1
            className={`text-4xl font-black tracking-widest uppercase ${
              isVictory
                ? "text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-lena-red drop-shadow-[0_0_20px_#00E5FF]"
                : "text-red-500 drop-shadow-[0_0_20px_#FF0055]"
            }`}
          >
            {isVictory ? "MATCH VICTORY!" : "DEFEAT"}
          </h1>
          <p className="text-sm font-mono text-gray-400">
            {isVictory
              ? "YOU COMPLETED THE 10-TIER WEAPON LADDER FIRST!"
              : `WINNER: ${winnerName || "ENEMY BOT"}`}
          </p>
        </div>

        {/* Match Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-lena-dark-700/60 p-4 rounded-2xl border border-white/5">
          <div className="flex flex-col items-center p-3 rounded-xl bg-black/40">
            <span className="text-xs font-mono text-gray-400 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-lena-blue" /> KILLS
            </span>
            <span className="text-2xl font-black font-mono text-white mt-1">{stats.kills}</span>
          </div>

          <div className="flex flex-col items-center p-3 rounded-xl bg-black/40">
            <span className="text-xs font-mono text-gray-400 flex items-center gap-1">
              <Crosshair className="w-3.5 h-3.5 text-yellow-400" /> HEADSHOTS
            </span>
            <span className="text-2xl font-black font-mono text-yellow-400 mt-1">{stats.headshots}</span>
          </div>

          <div className="flex flex-col items-center p-3 rounded-xl bg-black/40">
            <span className="text-xs font-mono text-gray-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-lena-red" /> MAX STREAK
            </span>
            <span className="text-2xl font-black font-mono text-lena-red mt-1">{stats.maxStreak}</span>
          </div>

          <div className="flex flex-col items-center p-3 rounded-xl bg-black/40">
            <span className="text-xs font-mono text-gray-400">ACCURACY</span>
            <span className="text-2xl font-black font-mono text-cyan-400 mt-1">{accuracy}%</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4 pt-2">
          <button
            onClick={() => startMatch(botCount, difficulty)}
            className="flex-1 py-4 px-6 rounded-2xl font-bold tracking-wider text-white bg-gradient-to-r from-lena-blue via-indigo-600 to-lena-red hover:brightness-110 shadow-lena-dual transition-all flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-5 h-5" />
            <span>PLAY AGAIN</span>
          </button>

          <button
            onClick={resetToMenu}
            className="py-4 px-6 rounded-2xl font-bold tracking-wider text-gray-300 bg-lena-dark-700 hover:bg-lena-dark-600 border border-white/10 transition-all flex items-center justify-center space-x-2"
          >
            <Home className="w-5 h-5" />
            <span>MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
}
