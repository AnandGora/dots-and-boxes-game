'use client';

import React from 'react';
import { X, HelpCircle, AlertTriangle, Sparkles, Trophy } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-pop-in">
      <div className="w-full max-w-xl bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">How to Play Dots & Boxes</h2>
              <p className="text-xs text-gray-400">Master the classic strategy game</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm text-gray-300">
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-gray-800/60 border border-gray-750 flex gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-black flex items-center justify-center shrink-0">
              1
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-white text-sm">Draw One Line Per Turn</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Players take turns connecting two adjacent dots with a horizontal or vertical line. You cannot draw diagonal lines.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-gray-800/60 border border-gray-750 flex gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400 font-black flex items-center justify-center shrink-0">
              2
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-white text-sm">Complete the 4th Side to Capture</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                When a player draws a line that closes the 4th side of any 1×1 square, they claim that box! The box is permanently marked in their color.
              </p>
            </div>
          </div>

          {/* Step 3: Crucial Rule */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-black flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 fill-amber-400" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                Bonus Turn Rule (Key Strategy!)
              </h3>
              <p className="text-xs text-amber-200/80 leading-relaxed">
                <strong>Whenever you capture a box, you get another turn immediately!</strong> If that next line also closes a box, you get yet another turn! You can chain multiple captures in a single turn.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-2xl bg-gray-800/60 border border-gray-750 flex gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black flex items-center justify-center shrink-0">
              <Trophy className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-white text-sm">Winning the Game</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                The game ends when all boxes on the grid have been claimed. The player with the highest total of captured boxes wins!
              </p>
            </div>
          </div>

          {/* Strategy Tip Box */}
          <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 space-y-2">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-cyan-400" />
              Grandmaster Pro Tip
            </h4>
            <p className="text-xs text-cyan-200/80 leading-relaxed">
              Be careful not to draw the <strong>3rd side</strong> of a box unless you have to! Drawing the 3rd side hands the box to your opponent on their very next turn. Aim to play safe lines that leave boxes with 0, 1, or 2 sides filled.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-900/80 text-right">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold text-sm cursor-pointer transition-colors shadow-lg shadow-cyan-500/20"
          >
            Got it, Let&apos;s Play!
          </button>
        </div>
      </div>
    </div>
  );
};
