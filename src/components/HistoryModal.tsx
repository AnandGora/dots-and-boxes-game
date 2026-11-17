'use client';

import React, { useState } from 'react';
import { HistoryRecord } from '@/types/game';
import { X, History, Trash2, Trophy, Frown, Minus, Calendar, Clock, Layers, Star } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryRecord[];
  onClearHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
}) => {
  const [filter, setFilter] = useState<'all' | 'player1' | 'player2'>('all');

  if (!isOpen) return null;

  const filteredHistory = history.filter((rec) => {
    if (filter === 'player1') return rec.winner === 'player1';
    if (filter === 'player2') return rec.winner === 'player2';
    return true;
  });

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}m ${s}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-pop-in">
      <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Match History</h2>
              <p className="text-xs text-gray-400">Review your past battles and victories</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter and Clear Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800/60 bg-gray-900/60 text-xs">
          <div className="flex items-center gap-1.5 bg-gray-800/80 p-1 rounded-xl border border-gray-750">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-cyan-500 text-gray-950 font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              All ({history.length})
            </button>
            <button
              onClick={() => setFilter('player1')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                filter === 'player1'
                  ? 'bg-emerald-500 text-gray-950 font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Victories
            </button>
            <button
              onClick={() => setFilter('player2')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                filter === 'player2'
                  ? 'bg-rose-500 text-gray-950 font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Defeats
            </button>
          </div>

          {history.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear your match history?')) {
                  onClearHistory();
                }
              }}
              className="flex items-center gap-1.5 text-gray-400 hover:text-rose-400 py-1.5 px-3 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-500 space-y-2">
              <History className="w-10 h-10 mx-auto opacity-30" />
              <p className="text-sm font-medium">No matches recorded yet</p>
              <p className="text-xs">Complete a match to start building your record!</p>
            </div>
          ) : (
            filteredHistory.map((rec) => {
              const isWin = rec.winner === 'player1';
              const isLoss = rec.winner === 'player2';

              return (
                <div
                  key={rec.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isWin
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : isLoss
                      ? 'bg-rose-950/20 border-rose-500/30'
                      : 'bg-gray-800/40 border-gray-700/50'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                          isWin
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : isLoss
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                            : 'bg-gray-700 text-gray-300 border-gray-600'
                        }`}
                      >
                        {isWin ? (
                          <>
                            <Trophy className="w-3 h-3" /> Victory
                          </>
                        ) : isLoss ? (
                          <>
                            <Frown className="w-3 h-3" /> Defeat
                          </>
                        ) : (
                          <>
                            <Minus className="w-3 h-3" /> Draw
                          </>
                        )}
                      </span>

                      <span className="text-sm font-bold text-gray-200">
                        {rec.levelName || (rec.mode === 'pvp' ? 'Local 2-Player' : 'Custom Game')}
                      </span>

                      {rec.starsEarned !== undefined && rec.starsEarned > 0 && (
                        <div className="flex items-center gap-0.5 ml-1">
                          {Array.from({ length: rec.starsEarned }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-gray-500" />
                        {rec.rows}×{rec.cols} Grid
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                        {formatDuration(rec.durationSeconds || 0)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                        {new Date(rec.date).toLocaleDateString()} {new Date(rec.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Score badge */}
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <div className="text-xs text-gray-400 font-medium">Final Score</div>
                      <div className="text-base font-black font-mono">
                        <span className="text-cyan-400">{rec.player1Score}</span>
                        <span className="text-gray-600 mx-1.5">-</span>
                        <span className="text-rose-400">{rec.player2Score}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
