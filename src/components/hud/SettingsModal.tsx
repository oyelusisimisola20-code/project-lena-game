"use client";

import React from "react";
import { useGameStore } from "@/store/useGameStore";
import { X, Volume2, Eye, MousePointer } from "lucide-react";

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { settings, updateSettings } = useGameStore();

  return (
    <div className="w-full max-w-lg bg-lena-dark-800 border border-lena-blue/40 rounded-3xl p-8 shadow-lena-dual text-left flex flex-col space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <h2 className="text-xl font-black tracking-widest text-white uppercase">
          COMBAT <span className="text-lena-blue">SETTINGS</span>
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-5">
        {/* Mouse Sensitivity */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono font-bold text-gray-300">
            <span className="flex items-center gap-2">
              <MousePointer className="w-4 h-4 text-lena-blue" /> MOUSE SENSITIVITY
            </span>
            <span className="text-cyan-400">{settings.sensitivity.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="4.0"
            step="0.1"
            value={settings.sensitivity}
            onChange={(e) => updateSettings({ sensitivity: parseFloat(e.target.value) })}
            className="w-full accent-lena-blue cursor-pointer h-2 bg-gray-900 rounded-lg"
          />
        </div>

        {/* Field of View (FOV) */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono font-bold text-gray-300">
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-lena-red" /> FIELD OF VIEW (FOV)
            </span>
            <span className="text-red-400">{settings.fov}°</span>
          </div>
          <input
            type="range"
            min="60"
            max="105"
            step="1"
            value={settings.fov}
            onChange={(e) => updateSettings({ fov: parseInt(e.target.value) })}
            className="w-full accent-lena-red cursor-pointer h-2 bg-gray-900 rounded-lg"
          />
        </div>

        {/* SFX Volume */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono font-bold text-gray-300">
            <span className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-lena-blue" /> SOUND FX VOLUME
            </span>
            <span className="text-cyan-400">{Math.round(settings.sfxVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.sfxVolume}
            onChange={(e) => updateSettings({ sfxVolume: parseFloat(e.target.value) })}
            className="w-full accent-lena-blue cursor-pointer h-2 bg-gray-900 rounded-lg"
          />
        </div>

        {/* Music Volume */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono font-bold text-gray-300">
            <span className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-lena-red" /> AMBIENT MUSIC VOLUME
            </span>
            <span className="text-red-400">{Math.round(settings.musicVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.musicVolume}
            onChange={(e) => updateSettings({ musicVolume: parseFloat(e.target.value) })}
            className="w-full accent-lena-red cursor-pointer h-2 bg-gray-900 rounded-lg"
          />
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full py-3.5 px-6 rounded-2xl font-bold tracking-wider text-white bg-gradient-to-r from-lena-blue to-blue-600 hover:brightness-110 shadow-lena-blue transition-all text-center"
      >
        SAVE & CLOSE
      </button>
    </div>
  );
}
