'use client';

import React from 'react';
import { OverallStats } from '@/types/game';
import { getTotalEarnedStars, CAMPAIGN_LEVELS } from '@/lib/levels';
import { X, BarChart3, Trophy, Flame, Target, Star, Award, Zap } from 'lucide-react';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: OverallStats;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats,
}) => {
  if (!isOpen) return null;

  const totalEarnedStars = getTotalEarnedStars(stats.stars);
  const maxStars = CAMPAIGN_LEVELS.length * 3;
  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0;

  const achievements = [
    {
      id: 'first_win',
      title: 'First Blood',
      desc: 'Win your first Dots & Boxes match',
      unlocked: stats.wins >= 1,
      icon: Trophy,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    },
    {
      id: 'streak_3',
      title: 'On Fire',
      desc: 'Achieve a 3-game win streak',
      unlocked: stats.bestStreak >= 3,
      icon: Flame,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    },
    {
      id: 'boxes_25',
      title: 'Territory Master',
      desc: 'Capture 25+ total boxes',
      unlocked: stats.totalBoxesCaptured >= 25,
      icon: Target,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    },
    {
      id: 'campaign_star',
      title: 'Star Collector',
      desc: 'Collect 10+ stars in campaign mode',
      unlocked: totalEarnedStars >= 10,
      icon: Star,
      color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-pop-in">
      <div className="w-full max-w-xl bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Player Statistics</h2>
              <p className="text-xs text-gray-400">Track your performance and achievements</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Main 4 KPI Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-gray-800/60 border border-gray-700/60 text-center">
              <div className="text-2xl font-black text-white">{stats.gamesPlayed}</div>
              <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">
                Matches
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-center">
              <div className="text-2xl font-black text-cyan-400">{winRate}%</div>
              <div className="text-[11px] text-cyan-300 font-semibold uppercase tracking-wider mt-0.5">
                Win Rate
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-center">
              <div className="text-2xl font-black text-rose-400 flex items-center justify-center gap-1">
                <Flame className="w-5 h-5 text-rose-500 fill-rose-500" />
                {stats.bestStreak}
              </div>
              <div className="text-[11px] text-rose-300 font-semibold uppercase tracking-wider mt-0.5">
                Best Streak
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-yellow-950/30 border border-yellow-500/30 text-center">
              <div className="text-2xl font-black text-yellow-400 flex items-center justify-center gap-1">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                {totalEarnedStars}
              </div>
              <div className="text-[11px] text-yellow-300 font-semibold uppercase tracking-wider mt-0.5">
                Stars ({totalEarnedStars}/{maxStars})
              </div>
            </div>
          </div>

          {/* Breakdown Card */}
          <div className="p-4 rounded-2xl bg-gray-800/40 border border-gray-700/50 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-400" />
              Detailed Record
            </h3>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-lg font-black text-emerald-400">{stats.wins}</div>
                <div className="text-[11px] text-gray-400">Wins</div>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <div className="text-lg font-black text-rose-400">{stats.losses}</div>
                <div className="text-[11px] text-gray-400">Losses</div>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-700/40 border border-gray-600/40">
                <div className="text-lg font-black text-gray-300">{stats.ties}</div>
                <div className="text-[11px] text-gray-400">Ties</div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-700/50 flex justify-between text-xs text-gray-300 px-1">
              <span>Total Boxes Captured: <strong className="text-cyan-400">{stats.totalBoxesCaptured}</strong></span>
              <span>Opponent Boxes: <strong className="text-rose-400">{stats.totalOpponentBoxes}</strong></span>
            </div>
          </div>

          {/* Achievements */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-yellow-400" />
              Milestones & Achievements
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {achievements.map((ach) => {
                const Icon = ach.icon;
                return (
                  <div
                    key={ach.id}
                    className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                      ach.unlocked
                        ? 'bg-gray-800/80 border-gray-700'
                        : 'bg-gray-900/50 border-gray-800/60 opacity-40'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl border ${ach.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-100 flex items-center gap-1.5">
                        {ach.title}
                        {ach.unlocked && (
                          <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.2 rounded">
                            Unlocked
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-400">{ach.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
