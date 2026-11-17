'use client';

import React, { useState } from 'react';
import { GameBoardState } from '@/lib/gameEngine';
import { PlayerType } from '@/types/game';

interface GameBoardProps {
  boardState: GameBoardState;
  onLineClick: (lineId: string) => void;
  disabled?: boolean;
  theme?: string;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  boardState,
  onLineClick,
  disabled = false,
}) => {
  const [hoveredLineId, setHoveredLineId] = useState<string | null>(null);

  const { rows, cols, lines, boxes, currentPlayer, lastMove } = boardState;

  // Adaptive spacing based on grid dimension
  const maxDim = Math.max(rows, cols);
  const SPACING = maxDim <= 3 ? 95 : maxDim <= 4 ? 82 : maxDim <= 5 ? 70 : 60;
  const PADDING = 38;
  const DOT_RADIUS = maxDim <= 4 ? 6.5 : 5.5;

  const width = cols * SPACING + PADDING * 2;
  const height = rows * SPACING + PADDING * 2;

  const handleLineClick = (lineId: string) => {
    if (disabled) return;
    if (lines[lineId]?.owner) return;
    onLineClick(lineId);
  };

  const getPlayerColors = (player?: PlayerType) => {
    if (player === 'player1') {
      return {
        fill: 'url(#p1-box-grad)',
        stroke: '#06b6d4',
        text: '#ecfeff',
        label: 'YOU',
      };
    }
    if (player === 'player2') {
      return {
        fill: 'url(#p2-box-grad)',
        stroke: '#f43f5e',
        text: '#fff1f2',
        label: 'AI',
      };
    }
    return null;
  };

  return (
    <div className="relative flex items-center justify-center p-2 sm:p-4 select-none touch-manipulation">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-[560px] h-auto drop-shadow-2xl transition-all duration-300"
        style={{ filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.35))' }}
      >
        <defs>
          {/* Gradients for Player 1 (Blue / Cyan) */}
          <linearGradient id="p1-box-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.85" />
          </linearGradient>

          {/* Gradients for Player 2 (Rose / Amber / Red) */}
          <linearGradient id="p2-box-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#ea580c" stopOpacity="0.85" />
          </linearGradient>

          {/* Line Gradients */}
          <linearGradient id="p1-line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>

          <linearGradient id="p2-line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>

          {/* Glow Filters */}
          <filter id="p1-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="p2-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Board Background Frame */}
        <rect
          x={PADDING - 18}
          y={PADDING - 18}
          width={cols * SPACING + 36}
          height={rows * SPACING + 36}
          rx={20}
          fill="#111827"
          fillOpacity="0.65"
          stroke="#374151"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* 1. RENDER BOXES */}
        {Object.values(boxes).map((box) => {
          const colors = getPlayerColors(box.owner);
          const x = PADDING + box.col * SPACING + 4;
          const y = PADDING + box.row * SPACING + 4;
          const boxSize = SPACING - 8;
          const isRecentlyClaimed = lastMove?.boxesClaimed?.includes(box.id);

          if (!box.owner) {
            return (
              <rect
                key={box.id}
                x={x}
                y={y}
                width={boxSize}
                height={boxSize}
                rx={10}
                fill="#1f2937"
                fillOpacity="0.2"
                className="transition-colors duration-200"
              />
            );
          }

          return (
            <g key={box.id} className="animate-pop-in origin-center">
              <rect
                x={x}
                y={y}
                width={boxSize}
                height={boxSize}
                rx={10}
                fill={colors?.fill}
                stroke={colors?.stroke}
                strokeWidth={isRecentlyClaimed ? 2.5 : 1}
                className="transition-all duration-300"
                style={{
                  filter: isRecentlyClaimed
                    ? box.owner === 'player1'
                      ? 'url(#p1-glow)'
                      : 'url(#p2-glow)'
                    : undefined,
                }}
              />
              <text
                x={x + boxSize / 2}
                y={y + boxSize / 2 + 5}
                textAnchor="middle"
                fill={colors?.text}
                fontSize={boxSize > 60 ? '16' : '13'}
                fontWeight="800"
                letterSpacing="1px"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {colors?.label}
              </text>
            </g>
          );
        })}

        {/* 2. RENDER HORIZONTAL LINES */}
        {Object.values(lines)
          .filter((l) => l.type === 'h')
          .map((line) => {
            const x1 = PADDING + line.col * SPACING;
            const y1 = PADDING + line.row * SPACING;
            const x2 = PADDING + (line.col + 1) * SPACING;
            const y2 = y1;

            const isOwned = !!line.owner;
            const isHovered = hoveredLineId === line.id && !isOwned && !disabled;
            const isLastMove = lastMove?.lineId === line.id;

            const strokeColor = line.owner === 'player1'
              ? 'url(#p1-line-grad)'
              : line.owner === 'player2'
              ? 'url(#p2-line-grad)'
              : isHovered
              ? currentPlayer === 'player1'
                ? '#06b6d4'
                : '#f43f5e'
              : '#374151';

            return (
              <g key={line.id}>
                {/* Visible Line */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={strokeColor}
                  strokeWidth={isOwned ? (isLastMove ? 6 : 5) : isHovered ? 4 : 2}
                  strokeLinecap="round"
                  strokeDasharray={!isOwned && isHovered ? '6 4' : undefined}
                  opacity={isOwned ? 1 : isHovered ? 0.9 : 0.45}
                  className="transition-all duration-200"
                  style={{
                    filter: isLastMove
                      ? line.owner === 'player1'
                        ? 'url(#p1-glow)'
                        : 'url(#p2-glow)'
                      : undefined,
                  }}
                />

                {/* Generous Click/Touch Hitbox */}
                {!isOwned && (
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="transparent"
                    strokeWidth={26}
                    strokeLinecap="round"
                    className={disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                    onMouseEnter={() => setHoveredLineId(line.id)}
                    onMouseLeave={() => setHoveredLineId(null)}
                    onClick={() => handleLineClick(line.id)}
                  />
                )}
              </g>
            );
          })}

        {/* 3. RENDER VERTICAL LINES */}
        {Object.values(lines)
          .filter((l) => l.type === 'v')
          .map((line) => {
            const x1 = PADDING + line.col * SPACING;
            const y1 = PADDING + line.row * SPACING;
            const x2 = x1;
            const y2 = PADDING + (line.row + 1) * SPACING;

            const isOwned = !!line.owner;
            const isHovered = hoveredLineId === line.id && !isOwned && !disabled;
            const isLastMove = lastMove?.lineId === line.id;

            const strokeColor = line.owner === 'player1'
              ? 'url(#p1-line-grad)'
              : line.owner === 'player2'
              ? 'url(#p2-line-grad)'
              : isHovered
              ? currentPlayer === 'player1'
                ? '#06b6d4'
                : '#f43f5e'
              : '#374151';

            return (
              <g key={line.id}>
                {/* Visible Line */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={strokeColor}
                  strokeWidth={isOwned ? (isLastMove ? 6 : 5) : isHovered ? 4 : 2}
                  strokeLinecap="round"
                  strokeDasharray={!isOwned && isHovered ? '6 4' : undefined}
                  opacity={isOwned ? 1 : isHovered ? 0.9 : 0.45}
                  className="transition-all duration-200"
                  style={{
                    filter: isLastMove
                      ? line.owner === 'player1'
                        ? 'url(#p1-glow)'
                        : 'url(#p2-glow)'
                      : undefined,
                  }}
                />

                {/* Generous Click/Touch Hitbox */}
                {!isOwned && (
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="transparent"
                    strokeWidth={26}
                    strokeLinecap="round"
                    className={disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                    onMouseEnter={() => setHoveredLineId(line.id)}
                    onMouseLeave={() => setHoveredLineId(null)}
                    onClick={() => handleLineClick(line.id)}
                  />
                )}
              </g>
            );
          })}

        {/* 4. RENDER DOTS */}
        {Array.from({ length: rows + 1 }).map((_, r) =>
          Array.from({ length: cols + 1 }).map((__, c) => {
            const cx = PADDING + c * SPACING;
            const cy = PADDING + r * SPACING;
            return (
              <g key={`dot-${r}-${c}`}>
                {/* Dot outer subtle ring */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={DOT_RADIUS + 2.5}
                  fill="#030712"
                  fillOpacity="0.4"
                />
                {/* Main dot */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={DOT_RADIUS}
                  fill="#f3f4f6"
                  className="transition-transform duration-200"
                  style={{
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))',
                  }}
                />
                {/* Dot center specular pin */}
                <circle
                  cx={cx - 1}
                  cy={cy - 1}
                  r={DOT_RADIUS * 0.35}
                  fill="#ffffff"
                  fillOpacity="0.9"
                />
              </g>
            );
          })
        )}
      </svg>
    </div>
  );
};
