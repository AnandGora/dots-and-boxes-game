'use client';

import React from 'react';
import { CAMPAIGN_LEVELS, isLevelUnlocked, getTotalEarnedStars } from '@/lib/levels';
import { CampaignLevel } from '@/types/game';
import { Lock, Star, Play, Trophy, ArrowLeft, Swords } from 'lucide-react';

interface LevelSelectProps {
  userStars: Record<number, number>;
  currentLevelId?: number;
  onSelectLevel: (level: CampaignLevel) => void;
  onBackToGame: () => void;
  onOpenCustomGame: () => void;
}

export const LevelSelect: React.FC<LevelSelectProps> = ({
  userStars,
  currentLevelId,
  onSelectLevel,
  onBackToGame,
  onOpenCustomGame,
}) => {
  const totalStars = getTotalEarnedStars(userStars);
  const maxPossibleStars = CAMPAIGN_LEVELS.length * 3;

  const difficultyColors = {
    easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    medium: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    hard: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    master: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <button
          onClick={onBackToGame}
          className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer px-3 py-1.5 rounded-lg hover:bg-gray-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Board
        </button>

        {/* Total Stars Counter */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-bold text-sm shadow-[0_0_15px_rgba(234,179,8,0.15)]">
          <Star className="w-4 h-4 fill-yellow-400" />
          <span>
            {totalStars} / {maxPossibleStars} Stars
          </span>
        </div>
      </div>

      {/* Title & Banner */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
          <Trophy className="w-7 h-7 text-yellow-400" />
          Campaign Challenge
        </h1>
        <p className="text-sm text-gray-400 max-w-md mx-auto">
          Conquer the artificial intelligence across increasingly challenging grids. Earn up to 3 stars per level to unlock master arenas!
        </p>
      </div>

      {/* Levels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CAMPAIGN_LEVELS.map((level) => {
          const unlocked = isLevelUnlocked(level, totalStars);
          const stars = userStars[level.id] || 0;
          const isCurrent = currentLevelId === level.id;

          return (
            <div
              key={level.id}
              className={`relative rounded-2xl border p-4 transition-all duration-300 flex flex-col justify-between ${
                unlocked
                  ? isCurrent
                    ? 'bg-gradient-to-br from-cyan-950/60 via-gray-900 to-gray-900 border-cyan-500/80 shadow-[0_0_20px_rgba(6,182,212,0.2)] ring-1 ring-cyan-400'
                    : 'bg-gray-900/90 border-gray-800 hover:border-gray-700 hover:bg-gray-850 hover:shadow-lg'
                  : 'bg-gray-950/60 border-gray-850 opacity-60'
              }`}
            >
              <div>
                {/* Level Top Row: Number, Badge, Difficulty */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-gray-800 text-cyan-400 font-black text-xs flex items-center justify-center border border-gray-700">
                      {level.id}
                    </span>
                    <span className="font-bold text-gray-100 text-base">
                      {level.name}
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                      difficultyColors[level.difficulty]
                    }`}
                  >
                    {level.badge || level.difficulty}
                  </span>
                </div>

                <p className="text-xs text-gray-400 mb-3">{level.subtitle}</p>

                {/* Grid details & Stars */}
                <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-gray-800/60 border border-gray-700/50 mb-4">
                  <div className="text-gray-300 font-medium">
                    <span className="text-cyan-400 font-bold">{level.rows}×{level.cols}</span> Boxes ({level.rows + 1}×{level.cols + 1} Dots)
                  </div>
                  {/* Stars Display */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((starNum) => (
                      <Star
                        key={starNum}
                        className={`w-4 h-4 ${
                          starNum <= stars
                            ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_6px_rgba(234,179,8,0.5)]'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {unlocked ? (
                <button
                  onClick={() => onSelectLevel(level)}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-gray-950 shadow-md shadow-cyan-500/20'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  {isCurrent ? 'Continue Match' : 'Play Level'}
                </button>
              ) : (
                <div className="w-full py-2.5 px-4 rounded-xl bg-gray-900 border border-gray-800 text-gray-500 text-xs font-semibold flex items-center justify-center gap-2">
                  <Lock className="w-3.5 h-3.5" />
                  Requires {level.unlockStars} Stars to Unlock
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Custom Game Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/30 via-purple-900/30 to-rose-900/30 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Swords className="w-4 h-4 text-purple-400" />
            Want a Custom Match or Local 2-Player?
          </h3>
          <p className="text-xs text-gray-400">
            Pick custom board sizes (up to 7×7), bot difficulty, or play against a friend locally!
          </p>
        </div>
        <button
          onClick={onOpenCustomGame}
          className="whitespace-nowrap px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer shadow-md shadow-purple-600/30 transition-colors"
        >
          Custom Setup
        </button>
      </div>
    </div>
  );
};
