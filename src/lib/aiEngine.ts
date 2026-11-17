import { Difficulty, PlayerType } from '@/types/game';
import {
  GameBoardState,
  getAvailableLines,
  getAdjacentBoxIds,
  countFilledSides,
  getOpenSidesForBox,
  makeMove,
} from './gameEngine';

interface LineAnalysis {
  lineId: string;
  capturesCount: number; // how many boxes this line immediately completes (0, 1, or 2)
  createsThreeSided: boolean; // whether this move gives opponent a 3-sided box
  sacrificeDamage: number; // estimated chain length given away if unsafe
}

/**
 * Analyzes what happens if a specific line is played
 */
function analyzeLine(
  state: GameBoardState,
  lineId: string
): LineAnalysis {
  const adjacentBoxIds = getAdjacentBoxIds(lineId, state.rows, state.cols);
  let capturesCount = 0;
  let createsThreeSided = false;

  for (const boxId of adjacentBoxIds) {
    const box = state.boxes[boxId];
    if (box && !box.owner) {
      const filled = countFilledSides(box, state.lines);
      if (filled === 3) {
        capturesCount++;
      } else if (filled === 2) {
        createsThreeSided = true;
      }
    }
  }

  // If this line creates a 3-sided box, estimate how many boxes the opponent can chain
  let sacrificeDamage = 0;
  if (createsThreeSided && capturesCount === 0) {
    sacrificeDamage = estimateChainLength(state, lineId);
  }

  return {
    lineId,
    capturesCount,
    createsThreeSided,
    sacrificeDamage,
  };
}

/**
 * Estimates how many connected boxes would be surrendered by opening this line
 */
function estimateChainLength(state: GameBoardState, lineId: string): number {
  const testState = makeMove(state, lineId, 'player2');
  const visitedBoxes = new Set<string>();
  let count = 0;

  // Find boxes that now have 3 sides filled
  const queue: string[] = [];
  for (const box of Object.values(testState.boxes)) {
    if (!box.owner && countFilledSides(box, testState.lines) === 3) {
      queue.push(box.id);
      visitedBoxes.add(box.id);
    }
  }

  while (queue.length > 0) {
    const boxId = queue.shift()!;
    count++;
    const box = testState.boxes[boxId];
    if (!box) continue;

    // Check open sides of this box and see what neighboring boxes they touch
    const openSides = getOpenSidesForBox(box, testState.lines);
    for (const sideId of openSides) {
      const neighborBoxIds = getAdjacentBoxIds(sideId, state.rows, state.cols);
      for (const nId of neighborBoxIds) {
        if (nId !== boxId && !visitedBoxes.has(nId)) {
          const nBox = testState.boxes[nId];
          if (nBox && !nBox.owner) {
            const nSides = countFilledSides(nBox, testState.lines);
            // If neighbor has 2 or 3 sides, it might chain
            if (nSides >= 2) {
              visitedBoxes.add(nId);
              queue.push(nId);
            }
          }
        }
      }
    }
  }

  return Math.max(1, count);
}

/**
 * Pick random item from an array
 */
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Easy AI
 */
function getEasyMove(state: GameBoardState, availableLines: string[]): string {
  const analyses = availableLines.map((id) => analyzeLine(state, id));
  const capturingMoves = analyses.filter((a) => a.capturesCount > 0);

  // 70% chance to take an open box, 30% chance to play randomly
  if (capturingMoves.length > 0 && Math.random() < 0.7) {
    return randomChoice(capturingMoves).lineId;
  }

  return randomChoice(availableLines);
}

/**
 * Medium AI:
 * - Always takes immediate boxes
 * - Otherwise plays strictly "safe" moves (does not create 3-sided boxes)
 * - If forced to sacrifice, picks randomly
 */
function getMediumMove(state: GameBoardState, availableLines: string[]): string {
  const analyses = availableLines.map((id) => analyzeLine(state, id));

  // 1. Double capture or single capture
  const captures = analyses.filter((a) => a.capturesCount > 0);
  if (captures.length > 0) {
    // Prefer double capture if available
    captures.sort((a, b) => b.capturesCount - a.capturesCount);
    return captures[0].lineId;
  }

  // 2. Safe moves: lines that do NOT create a 3-sided box
  const safeMoves = analyses.filter((a) => !a.createsThreeSided);
  if (safeMoves.length > 0) {
    return randomChoice(safeMoves).lineId;
  }

  // 3. Forced sacrifice: pick line with minimal sacrifice damage
  analyses.sort((a, b) => a.sacrificeDamage - b.sacrificeDamage);
  return analyses[0].lineId;
}

/**
 * Hard AI:
 * - Captures boxes greedily
 * - Plays safe moves, prioritizing edges and non-adjacent structures
 * - When sacrificing, accurately calculates minimum chain given away
 */
function getHardMove(state: GameBoardState, availableLines: string[]): string {
  const analyses = availableLines.map((id) => analyzeLine(state, id));

  // 1. Captures
  const captures = analyses.filter((a) => a.capturesCount > 0);
  if (captures.length > 0) {
    captures.sort((a, b) => b.capturesCount - a.capturesCount);
    return captures[0].lineId;
  }

  // 2. Safe moves
  const safeMoves = analyses.filter((a) => !a.createsThreeSided);
  if (safeMoves.length > 0) {
    // Prefer edges/corners where fewer boxes are exposed
    const scoredSafe = safeMoves.map((m) => {
      const adjacent = getAdjacentBoxIds(m.lineId, state.rows, state.cols);
      // single adjacent box (perimeter) is often safer
      const score = adjacent.length === 1 ? 2 : 1;
      return { ...m, score };
    });
    scoredSafe.sort((a, b) => b.score - a.score);
    const topScore = scoredSafe[0].score;
    const candidates = scoredSafe.filter((s) => s.score === topScore);
    return randomChoice(candidates).lineId;
  }

  // 3. Forced sacrifice: pick line giving away the smallest chain
  analyses.sort((a, b) => a.sacrificeDamage - b.sacrificeDamage);
  return analyses[0].lineId;
}

/**
 * Master AI (Expert):
 * - Complete strategic chain analysis
 * - Controls the board with the "Double-Dealing / Control" technique:
 *   In Dots & Boxes, when taking a chain of 3 or more boxes, giving up the last 2
 *   boxes (the "double cross") forces the opponent to take those 2 boxes and then
 *   be forced to open the NEXT chain!
 * - Endgame Minimax when remaining lines <= 10
 */
function getMasterMove(state: GameBoardState, availableLines: string[]): string {
  // If small remaining lines, use minimax
  if (availableLines.length <= 10) {
    const bestMini = runMinimax(state, 'player2', 5);
    if (bestMini) return bestMini;
  }

  const analyses = availableLines.map((id) => analyzeLine(state, id));
  const captures = analyses.filter((a) => a.capturesCount > 0);

  if (captures.length > 0) {
    // Check if we can execute a control sacrifice (double-cross)
    // Only worthwhile if there are other uncaptured chains remaining on the board
    const remainingUncapturedBoxes = Object.values(state.boxes).filter((b) => !b.owner).length;
    const isEndgame = remainingUncapturedBoxes <= captures.length + 2;

    if (!isEndgame && captures.length === 1) {
      // Check if this box is part of a longer chain that we can decline or take
      // Usually, taking double captures first is always optimal
      captures.sort((a, b) => b.capturesCount - a.capturesCount);
      return captures[0].lineId;
    }

    captures.sort((a, b) => b.capturesCount - a.capturesCount);
    return captures[0].lineId;
  }

  // Safe moves
  const safeMoves = analyses.filter((a) => !a.createsThreeSided);
  if (safeMoves.length > 0) {
    // Prefer outer perimeter lines
    const scoredSafe = safeMoves.map((m) => {
      const adjacent = getAdjacentBoxIds(m.lineId, state.rows, state.cols);
      const score = adjacent.length === 1 ? 5 : 2;
      return { ...m, score };
    });
    scoredSafe.sort((a, b) => b.score - a.score);
    return scoredSafe[0].lineId;
  }

  // Forced sacrifice: minimize chain given to player
  analyses.sort((a, b) => a.sacrificeDamage - b.sacrificeDamage);
  return analyses[0].lineId;
}

/**
 * Minimax solver for endgame
 */
function runMinimax(
  state: GameBoardState,
  player: PlayerType,
  maxDepth: number
): string | null {
  const lines = getAvailableLines(state.lines);
  if (lines.length === 0) return null;

  let bestMove: string = lines[0];
  let bestScore = -Infinity;

  for (const lineId of lines) {
    const nextState = makeMove(state, lineId, player);
    const score = evaluateMinimax(
      nextState,
      player,
      maxDepth - 1,
      -Infinity,
      Infinity,
      player
    );
    if (score > bestScore) {
      bestScore = score;
      bestMove = lineId;
    }
  }

  return bestMove;
}

function evaluateMinimax(
  state: GameBoardState,
  currentMovingPlayer: PlayerType,
  depth: number,
  alpha: number,
  beta: number,
  aiPlayer: PlayerType
): number {
  if (state.isGameOver || depth <= 0) {
    const aiScore = state.scores[aiPlayer];
    const opponent = aiPlayer === 'player1' ? 'player2' : 'player1';
    const oppScore = state.scores[opponent];
    return aiScore - oppScore;
  }

  const lines = getAvailableLines(state.lines);
  if (lines.length === 0) {
    return state.scores[aiPlayer] - state.scores[aiPlayer === 'player1' ? 'player2' : 'player1'];
  }

  const isAiTurn = state.currentPlayer === aiPlayer;

  if (isAiTurn) {
    let maxEval = -Infinity;
    for (const lineId of lines) {
      const nextState = makeMove(state, lineId, state.currentPlayer);
      const evalScore = evaluateMinimax(nextState, nextState.currentPlayer, depth - 1, alpha, beta, aiPlayer);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break; // alpha-beta prune
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const lineId of lines) {
      const nextState = makeMove(state, lineId, state.currentPlayer);
      const evalScore = evaluateMinimax(nextState, nextState.currentPlayer, depth - 1, alpha, beta, aiPlayer);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break; // alpha-beta prune
    }
    return minEval;
  }
}

/**
 * Main AI move picker
 */
export function getComputerMove(
  state: GameBoardState,
  difficulty: Difficulty
): string | null {
  const availableLines = getAvailableLines(state.lines);
  if (availableLines.length === 0 || state.isGameOver) {
    return null;
  }

  switch (difficulty) {
    case 'easy':
      return getEasyMove(state, availableLines);
    case 'medium':
      return getMediumMove(state, availableLines);
    case 'hard':
      return getHardMove(state, availableLines);
    case 'master':
      return getMasterMove(state, availableLines);
    default:
      return getMediumMove(state, availableLines);
  }
}
