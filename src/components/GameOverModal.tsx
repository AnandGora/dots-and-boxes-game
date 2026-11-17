'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GameBoardState } from '@/lib/gameEngine';
import { GameMode } from '@/types/game';
import { Trophy, Frown, Minus, Star, RotateCcw, ArrowRight, Grid, Eye } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardState: GameBoardState;
  mode: GameMode;
  levelName?: string;
  starsEarned?: number;
  hasNextLevel: boolean;
  onPlayAgain: () => void;
  onNextLevel: () => void;
  onLevelSelect: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  onClose,
  boardState,
  mode,
  levelName,
  starsEarned = 0,
  hasNextLevel,
  onPlayAgain,
  onNextLevel,
  onLevelSelect,
}) => {
  const { winner, scores, rows, cols } = boardState;
  const isVictory = winner === 'player1';
  const isDefeat = winner === 'player2';
  const totalBoxes = rows * cols;

  useEffect(() => {
    if (isOpen && isVictory) {
      // Fire celebratory confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#3b82f6', '#f59e0b', '#10b981'],
        });
      } catch {
        // ignore
      }
    }
  }, [isOpen, isVictory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-pop-in">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden text-center p-6 sm:p-8 space-y-6">
        {/* Outcome Graphic */}
        <div className="space-y-3">
          <div
            className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center shadow-xl ${
              isVictory
                ? 'bg-gradient-to-tr from-yellow-500 to-amber-300 text-gray-950 shadow-yellow-500/25 ring-4 ring-yellow-400/30'
                : isDefeat
                ? 'bg-gradient-to-tr from-rose-600 to-orange-500 text-white shadow-rose-500/25 ring-4 ring-rose-500/30'
                : 'bg-gradient-to-tr from-gray-700 to-gray-600 text-gray-200'
            }`}
          >
            {isVictory ? (
              <Trophy className="w-10 h-10" />
            ) : isDefeat ? (
              <Frown className="w-10 h-10" />
            ) : (
              <Minus className="w-10 h-10" />
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {isVictory ? 'Victory!' : isDefeat ? 'Defeated!' : 'Draw Match!'}
          </h2>

          <p className="text-xs text-gray-400">
            {isVictory
              ? 'Outstanding tactics! You captured the majority of the grid.'
              : isDefeat
              ? 'The computer outmaneuvered you this time. Try another strategy!'
              : 'Both tacticians matched each other box for box.'}
          </p>

          {levelName && (
            <div className="text-xs font-semibold text-cyan-400">
              {levelName} • {totalBoxes} Boxes
            </div>
          )}
        </div>

        {/* Stars Earned (Campaign Mode) */}
        {mode === 'campaign' && (
          <div className="p-3 rounded-2xl bg-gray-800/60 border border-gray-700/60 inline-flex flex-col items-center gap-1.5 w-full">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              {starsEarned > 0 ? 'Stars Earned' : 'Win to Earn Stars'}
            </span>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((starNum) => (
                <Star
                  key={starNum}
                  className={`w-7 h-7 transition-all ${
                    starNum <= starsEarned
                      ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.7)] scale-110'
                      : 'text-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Final Score Pill */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-gray-800/80 border border-gray-750">
          <div className="space-y-0.5">
            <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
              You
            </div>
            <div className="text-3xl font-black text-white font-mono">
              {scores.player1}
            </div>
            <div className="text-[10px] text-gray-400">
              {Math.round((scores.player1 / totalBoxes) * 100)}% of grid
            </div>
          </div>

          <div className="space-y-0.5 border-l border-gray-700">
            <div className="text-xs text-rose-400 font-bold uppercase tracking-wider">
              {mode === 'pvp' ? 'Player 2' : 'Computer'}
            </div>
            <div className="text-3xl font-black text-white font-mono">
              {scores.player2}
            </div>
            <div className="text-[10px] text-gray-400">
              {Math.round((scores.player2 / totalBoxes) * 100)}% of grid
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          {isVictory && hasNextLevel && mode === 'campaign' && (
            <button
              onClick={onNextLevel}
              className="w-full py-3 px-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold text-sm cursor-pointer shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
            >
              <span>Next Level</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onPlayAgain}
              className="py-2.5 px-3 rounded-xl bg-gray-800 hover:bg-gray-750 text-gray-100 font-bold text-xs border border-gray-700 cursor-pointer transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Play Again</span>
            </button>

            <button
              onClick={onLevelSelect}
              className="py-2.5 px-3 rounded-xl bg-gray-800 hover:bg-gray-750 text-gray-100 font-bold text-xs border border-gray-700 cursor-pointer transition-colors flex items-center justify-center gap-1.5"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Level Map</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-white py-1 flex items-center justify-center gap-1 mx-auto cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Review Final Board</span>
          </button>
        </div>
      </div>
    </div>
  );
};
