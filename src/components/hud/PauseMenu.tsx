"use client";

import React, { useState } from "react";
import { useGameStore } from "@/store/useGameStore";
import { Play, Settings as SettingsIcon, LogOut, RotateCcw } from "lucide-react";
import SettingsModal from "./SettingsModal";

export default function PauseMenu() {
  const { resumeMatch, startMatch, resetToMenu, botCount, difficulty } = useGameStore();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      {showSettings ? (
        <SettingsModal onClose={() => setShowSettings(false)} />
      ) : (
        <div className="w-full max-w-md bg-lena-dark-800 border border-lena-blue/40 rounded-3xl p-8 shadow-lena-dual text-center flex flex-col space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-widest text-white uppercase">
              PROJECT <span className="text-lena-blue">LE</span><span className="text-lena-red">NA</span>
            </h2>
            <p className="text-xs font-mono text-gray-400 tracking-wider">GAME PAUSED</p>
          </div>

          <div className="flex flex-col space-y-3">
            <button
              onClick={resumeMatch}
              className="w-full py-3.5 px-6 rounded-xl font-bold tracking-wider text-white bg-gradient-to-r from-lena-blue to-blue-600 hover:brightness-110 shadow-lena-blue transition-all flex items-center justify-center space-x-2"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>RESUME COMBAT</span>
            </button>

            <button
              onClick={() => startMatch(botCount, difficulty)}
              className="w-full py-3 px-6 rounded-xl font-bold tracking-wider text-white bg-lena-dark-700 hover:bg-lena-dark-600 border border-white/10 transition-all flex items-center justify-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>RESTART MATCH</span>
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="w-full py-3 px-6 rounded-xl font-bold tracking-wider text-white bg-lena-dark-700 hover:bg-lena-dark-600 border border-white/10 transition-all flex items-center justify-center space-x-2"
            >
              <SettingsIcon className="w-4 h-4" />
              <span>SETTINGS</span>
            </button>

            <button
              onClick={resetToMenu}
              className="w-full py-3 px-6 rounded-xl font-bold tracking-wider text-red-400 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 transition-all flex items-center justify-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>QUIT TO MAIN MENU</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
