'use client';

import React from 'react';
import { GameBoardState } from '@/lib/gameEngine';
import { GameMode, Difficulty } from '@/types/game';
import { Bot, User, Sparkles, Zap, Award } from 'lucide-react';

interface ScoreBoardProps {
  boardState: GameBoardState;
  mode: GameMode;
  difficulty: Difficulty;
  isAiThinking: boolean;
  levelName?: string;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  boardState,
  mode,
  difficulty,
  isAiThinking,
  levelName,
}) => {
  const { scores, currentPlayer, rows, cols, lastMove, isGameOver } = boardState;
  const totalBoxes = rows * cols;
  const p1Score = scores.player1;
  const p2Score = scores.player2;
  const remainingBoxes = totalBoxes - (p1Score + p2Score);

  const p1Percent = totalBoxes > 0 ? (p1Score / totalBoxes) * 100 : 0;
  const p2Percent = totalBoxes > 0 ? (p2Score / totalBoxes) * 100 : 0;

  const isP1Turn = currentPlayer === 'player1' && !isGameOver;
  const isP2Turn = currentPlayer === 'player2' && !isGameOver;
  const hasExtraTurn = lastMove?.isExtraTurn && !isGameOver;

  const difficultyLabels: Record<Difficulty, { label: string; color: string }> = {
    easy: { label: 'Novice Bot', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    medium: { label: 'Casual Bot', color: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
    hard: { label: 'Challenger Bot', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    master: { label: 'Master Bot', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  };

  return (
    <div className="w-full max-w-[560px] mx-auto space-y-3">
      {/* Top Match Info Pill */}
      <div className="flex items-center justify-between text-xs px-2 text-gray-400 font-medium">
        <div className="flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-gray-300 font-semibold">{levelName || (mode === 'pvp' ? 'Local 2-Player' : 'Custom Match')}</span>
          <span className="text-gray-500">•</span>
          <span>{rows}×{cols} Grid ({totalBoxes} Boxes)</span>
        </div>
        <div className="text-gray-400">
          <span className="text-cyan-400 font-semibold">{remainingBoxes}</span> boxes remaining
        </div>
      </div>

      {/* Main Score & Turn Cards */}
      <div className="grid grid-cols-2 gap-3 relative">
        {/* PLAYER 1 CARD */}
        <div
          className={`relative p-3.5 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
            isP1Turn
              ? 'bg-gradient-to-br from-cyan-950/70 via-gray-900 to-cyan-900/30 border-cyan-500/80 shadow-[0_0_20px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/50'
              : 'bg-gray-900/80 border-gray-800 opacity-85'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md transition-transform ${
                isP1Turn
                  ? 'bg-gradient-to-br from-cyan-400 to-blue-600 scale-105 shadow-cyan-500/30 ring-2 ring-cyan-300'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-100 flex items-center gap-1">
                You
                {isP1Turn && (
                  <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                )}
              </div>
              <div className="text-[11px] text-cyan-300/80 font-medium">
                {isP1Turn ? 'Your Turn' : 'Waiting...'}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-cyan-400 tracking-tight">
              {p1Score}
            </div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
              Boxes
            </div>
          </div>
        </div>

        {/* PLAYER 2 / COMPUTER CARD */}
        <div
          className={`relative p-3.5 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
            isP2Turn
              ? 'bg-gradient-to-br from-rose-950/70 via-gray-900 to-rose-900/30 border-rose-500/80 shadow-[0_0_20px_rgba(244,63,94,0.25)] ring-1 ring-rose-400/50'
              : 'bg-gray-900/80 border-gray-800 opacity-85'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md transition-transform ${
                isP2Turn
                  ? 'bg-gradient-to-br from-rose-500 to-orange-600 scale-105 shadow-rose-500/30 ring-2 ring-rose-300'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-100 flex items-center gap-1">
                {mode === 'pvp' ? 'Player 2' : 'Computer'}
                {isP2Turn && (
                  <span className="inline-block w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                )}
              </div>
              <div className="text-[11px] text-rose-300/80 font-medium">
                {isAiThinking
                  ? 'Thinking...'
                  : isP2Turn
                  ? 'Moving...'
                  : mode === 'pvp'
                  ? 'Waiting...'
                  : difficultyLabels[difficulty].label}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-rose-400 tracking-tight">
              {p2Score}
            </div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
              Boxes
            </div>
          </div>
        </div>
      </div>

      {/* Bonus Turn / Combo Alert Banner */}
      {hasExtraTurn && (
        <div className="animate-pop-in flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 border border-yellow-500/40 text-yellow-300 text-xs font-bold shadow-lg shadow-yellow-500/10">
          <Sparkles className="w-4 h-4 text-yellow-400 animate-spin" />
          <span>
            {lastMove?.player === 'player1' ? 'EXTRA TURN! You scored a box!' : 'Computer scored a box & gets an extra turn!'}
          </span>
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
        </div>
      )}

      {/* Territory Progress Bar */}
      <div className="space-y-1">
        <div className="h-2.5 w-full bg-gray-800/90 rounded-full overflow-hidden flex p-0.5 border border-gray-700/60">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-l-full transition-all duration-500"
            style={{ width: `${p1Percent}%` }}
          />
          <div
            className="h-full bg-transparent flex-1 transition-all duration-500"
          />
          <div
            className="h-full bg-gradient-to-l from-rose-500 to-orange-500 rounded-r-full transition-all duration-500"
            style={{ width: `${p2Percent}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-gray-500 font-mono px-1">
          <span>{Math.round(p1Percent)}%</span>
          <span>{Math.round(p2Percent)}%</span>
        </div>
      </div>
    </div>
  );
};
