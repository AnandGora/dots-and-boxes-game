'use client';

import React, { useState } from 'react';
import { Difficulty, GameMode, GameSettings } from '@/types/game';
import { X, Sliders, Bot, Users, Sparkles, Check } from 'lucide-react';

interface CustomGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: GameSettings;
  onStartCustomGame: (settings: {
    rows: number;
    cols: number;
    difficulty: Difficulty;
    mode: GameMode;
    firstTurn: 'player1' | 'player2' | 'random';
  }) => void;
}

export const CustomGameModal: React.FC<CustomGameModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onStartCustomGame,
}) => {
  const [rows, setRows] = useState(currentSettings.rows || 3);
  const [cols, setCols] = useState(currentSettings.cols || 3);
  const [difficulty, setDifficulty] = useState<Difficulty>(currentSettings.difficulty || 'medium');
  const [mode, setMode] = useState<GameMode>(currentSettings.mode === 'pvp' ? 'pvp' : 'custom');
  const [firstTurn, setFirstTurn] = useState<'player1' | 'player2' | 'random'>(currentSettings.firstTurn || 'player1');

  if (!isOpen) return null;

  const totalBoxes = rows * cols;
  const totalDots = (rows + 1) * (cols + 1);

  const difficulties: { id: Difficulty; title: string; desc: string; color: string }[] = [
    { id: 'easy', title: 'Easy (Novice)', desc: 'Relaxed bot, occasionally misses open squares', color: 'border-emerald-500/50 text-emerald-400' },
    { id: 'medium', title: 'Medium (Casual)', desc: 'Captures open squares, avoids giving away boxes', color: 'border-sky-500/50 text-sky-400' },
    { id: 'hard', title: 'Hard (Challenger)', desc: 'Calculates chain sacrifices and safe edge moves', color: 'border-amber-500/50 text-amber-400' },
    { id: 'master', title: 'Master (Grandmaster)', desc: 'Endgame solver, double-dealing control tactics', color: 'border-purple-500/50 text-purple-400' },
  ];

  const handleStart = () => {
    onStartCustomGame({
      rows,
      cols,
      difficulty,
      mode,
      firstTurn,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-pop-in">
      <div className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Custom Match Setup</h2>
              <p className="text-xs text-gray-400">Configure your grid, bot intelligence, and rules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* 1. Game Mode (Vs AI or Local 2-Player) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Opponent
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setMode('custom')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  mode !== 'pvp'
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300 ring-1 ring-cyan-500'
                    : 'bg-gray-800/60 border-gray-700/60 text-gray-400 hover:text-white'
                }`}
              >
                <Bot className="w-5 h-5 text-cyan-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold">vs Computer AI</div>
                  <div className="text-[10px] text-gray-400">Solo play against bot</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('pvp')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  mode === 'pvp'
                    ? 'bg-purple-500/10 border-purple-500 text-purple-300 ring-1 ring-purple-500'
                    : 'bg-gray-800/60 border-gray-700/60 text-gray-400 hover:text-white'
                }`}
              >
                <Users className="w-5 h-5 text-purple-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold">Pass & Play</div>
                  <div className="text-[10px] text-gray-400">Local 2 players</div>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Grid Dimensions */}
          <div className="space-y-3 p-4 rounded-2xl bg-gray-800/40 border border-gray-750">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                Grid Dimensions
              </span>
              <span className="text-xs font-bold text-cyan-400 font-mono">
                {rows}×{cols} Boxes ({totalBoxes} Total) • {totalDots} Dots
              </span>
            </div>

            {/* Rows Slider / Controls */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Height (Rows): {rows}</span>
              </div>
              <input
                type="range"
                min="2"
                max="7"
                value={rows}
                onChange={(e) => setRows(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Cols Slider / Controls */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Width (Columns): {cols}</span>
              </div>
              <input
                type="range"
                min="2"
                max="7"
                value={cols}
                onChange={(e) => setCols(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>

          {/* 3. AI Difficulty (Only if vs AI) */}
          {mode !== 'pvp' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Computer Difficulty
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {difficulties.map((diff) => (
                  <button
                    key={diff.id}
                    type="button"
                    onClick={() => setDifficulty(diff.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      difficulty === diff.id
                        ? `bg-gray-800 ${diff.color} ring-1`
                        : 'bg-gray-800/40 border-gray-750 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">{diff.title}</span>
                      {difficulty === diff.id && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-[10px] text-gray-400 leading-tight">
                      {diff.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. Who Goes First */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              First Turn
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {(['player1', 'random', 'player2'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setFirstTurn(opt)}
                  className={`py-2 px-3 rounded-xl border font-bold capitalize transition-all cursor-pointer ${
                    firstTurn === opt
                      ? 'bg-cyan-500 text-gray-950 border-cyan-400'
                      : 'bg-gray-800/60 border-gray-700 text-gray-400 hover:text-white'
                  }`}
                >
                  {opt === 'player1' ? 'You' : opt === 'player2' ? (mode === 'pvp' ? 'Player 2' : 'Computer') : 'Coin Flip'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-900/80 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleStart}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold text-sm cursor-pointer shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            Start Match
          </button>
        </div>
      </div>
    </div>
  );
};
