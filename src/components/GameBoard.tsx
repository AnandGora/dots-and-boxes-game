'use client';

import React, { useState } from 'react';
import { GameBoardState } from '@/lib/gameEngine';

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
  const DOT_RADIUS = maxDim <= 4 ? 7 : 6;

  const width = cols * SPACING + PADDING * 2;
  const height = rows * SPACING + PADDING * 2;

  const handleLineClick = (lineId: string) => {
    if (disabled) return;
    if (lines[lineId]?.owner) return;
    onLineClick(lineId);
  };

  // Ultra-bright solid colors - no SVG filter tags that cause zero-bounding-box vanishing bugs
  const P1_COLOR = '#00f0ff'; // Ultra-bright Electric Cyan for You (Player 1)
  const P2_COLOR = '#ff2a5f'; // Ultra-bright Neon Rose for AI (Player 2)
  const UNCLAIMED_COLOR = '#475569'; // Slate 600 for visible grid tracks

  return (
    <div className="relative flex items-center justify-center p-2 sm:p-4 select-none touch-manipulation">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-[560px] h-auto drop-shadow-2xl transition-all duration-300"
        style={{ filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.5))' }}
      >
        {/* Board Background Frame */}
        <rect
          x={PADDING - 18}
          y={PADDING - 18}
          width={cols * SPACING + 36}
          height={rows * SPACING + 36}
          rx={20}
          fill="#0f172a"
          fillOpacity="0.85"
          stroke="#334155"
          strokeWidth="2"
          strokeDasharray="6 6"
        />

        {/* 1. RENDER BOXES (Background) */}
        {Object.values(boxes).map((box) => {
          const x = PADDING + box.col * SPACING + 4;
          const y = PADDING + box.row * SPACING + 4;
          const boxSize = SPACING - 8;
          const isRecentlyClaimed = lastMove?.boxesClaimed?.includes(box.id);
          const isP1 = box.owner === 'player1';

          if (!box.owner) {
            return (
              <rect
                key={box.id}
                x={x}
                y={y}
                width={boxSize}
                height={boxSize}
                rx={12}
                fill="#1e293b"
                fillOpacity="0.3"
                className="transition-colors duration-200"
              />
            );
          }

          return (
            <g key={box.id} className="animate-pop-in origin-center">
              {/* Box Background Fill */}
              <rect
                x={x}
                y={y}
                width={boxSize}
                height={boxSize}
                rx={12}
                fill={isP1 ? 'rgba(0, 240, 255, 0.25)' : 'rgba(255, 42, 95, 0.25)'}
                stroke={isP1 ? P1_COLOR : P2_COLOR}
                strokeWidth={isRecentlyClaimed ? 3 : 2}
                className="transition-all duration-300"
              />

              {/* Box Center Badge */}
              <rect
                x={x + boxSize / 2 - (boxSize > 65 ? 26 : 20)}
                y={y + boxSize / 2 - 12}
                width={boxSize > 65 ? 52 : 40}
                height={24}
                rx={6}
                fill={isP1 ? P1_COLOR : P2_COLOR}
              />
              <text
                x={x + boxSize / 2}
                y={y + boxSize / 2 + 5}
                textAnchor="middle"
                fill={isP1 ? '#090d16' : '#ffffff'}
                fontSize={boxSize > 65 ? '13' : '11'}
                fontWeight="900"
                letterSpacing="1px"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {isP1 ? 'YOU' : 'AI'}
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
            const isP1 = line.owner === 'player1';
            const isP2 = line.owner === 'player2';
            const isHovered = hoveredLineId === line.id && !isOwned && !disabled;
            const isLastMove = lastMove?.lineId === line.id;

            const strokeColor = isP1
              ? P1_COLOR
              : isP2
              ? P2_COLOR
              : isHovered
              ? currentPlayer === 'player1'
                ? P1_COLOR
                : P2_COLOR
              : UNCLAIMED_COLOR;

            // When owned: bold solid 7px stroke, NO SVG filter tag
            const strokeWidth = isOwned ? (isLastMove ? 8 : 7) : isHovered ? 5 : 3;

            return (
              <g key={line.id}>
                {/* Visible Line */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={!isOwned ? (isHovered ? '6 4' : '4 5') : undefined}
                  opacity={isOwned ? 1 : isHovered ? 1 : 0.65}
                  className="transition-all duration-200"
                />

                {/* Generous Click/Touch Hitbox */}
                {!isOwned && (
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="transparent"
                    strokeWidth={28}
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
            const isP1 = line.owner === 'player1';
            const isP2 = line.owner === 'player2';
            const isHovered = hoveredLineId === line.id && !isOwned && !disabled;
            const isLastMove = lastMove?.lineId === line.id;

            const strokeColor = isP1
              ? P1_COLOR
              : isP2
              ? P2_COLOR
              : isHovered
              ? currentPlayer === 'player1'
                ? P1_COLOR
                : P2_COLOR
              : UNCLAIMED_COLOR;

            // When owned: bold solid 7px stroke, NO SVG filter tag
            const strokeWidth = isOwned ? (isLastMove ? 8 : 7) : isHovered ? 5 : 3;

            return (
              <g key={line.id}>
                {/* Visible Line */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={!isOwned ? (isHovered ? '6 4' : '4 5') : undefined}
                  opacity={isOwned ? 1 : isHovered ? 1 : 0.65}
                  className="transition-all duration-200"
                />

                {/* Generous Click/Touch Hitbox */}
                {!isOwned && (
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="transparent"
                    strokeWidth={28}
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

        {/* 4. RENDER DOTS (Top layer) */}
        {Array.from({ length: rows + 1 }).map((_, r) =>
          Array.from({ length: cols + 1 }).map((__, c) => {
            const cx = PADDING + c * SPACING;
            const cy = PADDING + r * SPACING;
            return (
              <g key={`dot-${r}-${c}`}>
                {/* Dot outer shadow ring */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={DOT_RADIUS + 3}
                  fill="#020617"
                  fillOpacity="0.7"
                />
                {/* Main crisp white dot */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={DOT_RADIUS}
                  fill="#ffffff"
                  className="transition-transform duration-200"
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))',
                  }}
                />
                {/* Center pin specular highlight */}
                <circle
                  cx={cx - 1.5}
                  cy={cy - 1.5}
                  r={DOT_RADIUS * 0.35}
                  fill="#e0f2fe"
                />
              </g>
            );
          })
        )}
      </svg>
    </div>
  );
};
