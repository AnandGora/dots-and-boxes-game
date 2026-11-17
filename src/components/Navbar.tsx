'use client';

import React from 'react';
import { Volume2, VolumeX, BarChart3, History, HelpCircle, Grid, Palette } from 'lucide-react';

interface NavbarProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  currentTheme: 'dark' | 'light' | 'blueprint' | 'neon';
  onChangeTheme: (theme: 'dark' | 'light' | 'blueprint' | 'neon') => void;
  onOpenHowToPlay: () => void;
  onOpenStats: () => void;
  onOpenHistory: () => void;
  onOpenLevels: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  soundEnabled,
  onToggleSound,
  currentTheme,
  onChangeTheme,
  onOpenHowToPlay,
  onOpenStats,
  onOpenHistory,
  onOpenLevels,
}) => {
  const nextThemeMap: Record<'dark' | 'light' | 'blueprint' | 'neon', 'dark' | 'light' | 'blueprint' | 'neon'> = {
    dark: 'blueprint',
    blueprint: 'neon',
    neon: 'light',
    light: 'dark',
  };

  const cycleTheme = () => {
    onChangeTheme(nextThemeMap[currentTheme] || 'dark');
  };

  return (
    <header className="w-full border-b border-gray-800/80 bg-gray-950/70 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-black text-sm ring-1 ring-cyan-400/40">
            ::
          </div>
          <div>
            <div className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
              Dots & Boxes
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                PRO
              </span>
            </div>
            <div className="text-[10px] text-gray-400 font-medium">Single Player AI & Campaign</div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Level Map Button */}
          <button
            onClick={onOpenLevels}
            title="Campaign Levels"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800/80 hover:bg-gray-750 text-gray-200 border border-gray-700/80 text-xs font-bold cursor-pointer transition-colors shadow-sm"
          >
            <Grid className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Levels</span>
          </button>

          {/* Stats Button */}
          <button
            onClick={onOpenStats}
            title="Player Stats"
            className="p-2 rounded-xl bg-gray-800/80 hover:bg-gray-750 text-gray-300 hover:text-white border border-gray-700/80 cursor-pointer transition-colors"
          >
            <BarChart3 className="w-4 h-4 text-purple-400" />
          </button>

          {/* History Button */}
          <button
            onClick={onOpenHistory}
            title="Match History"
            className="p-2 rounded-xl bg-gray-800/80 hover:bg-gray-750 text-gray-300 hover:text-white border border-gray-700/80 cursor-pointer transition-colors"
          >
            <History className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
            className="p-2 rounded-xl bg-gray-800/80 hover:bg-gray-750 text-gray-300 hover:text-white border border-gray-700/80 cursor-pointer transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-yellow-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {/* Theme Cycler */}
          <button
            onClick={cycleTheme}
            title={`Theme: ${currentTheme}. Click to change`}
            className="p-2 rounded-xl bg-gray-800/80 hover:bg-gray-750 text-gray-300 hover:text-white border border-gray-700/80 cursor-pointer transition-colors capitalize text-xs"
          >
            <Palette className="w-4 h-4 text-rose-400" />
          </button>

          {/* Rules / Tutorial */}
          <button
            onClick={onOpenHowToPlay}
            title="How to Play"
            className="p-2 rounded-xl bg-gray-800/80 hover:bg-gray-750 text-gray-300 hover:text-white border border-gray-700/80 cursor-pointer transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
