import {
  PlayerType,
  LineState,
  BoxState,
  MoveRecord,
} from '@/types/game';

export interface GameBoardState {
  rows: number;
  cols: number;
  lines: Record<string, LineState>;
  boxes: Record<string, BoxState>;
  currentPlayer: PlayerType;
  scores: Record<PlayerType, number>;
  moveHistory: MoveRecord[];
  isGameOver: boolean;
  winner: PlayerType | 'tie' | null;
  lastMove: {
    lineId: string;
    player: PlayerType;
    boxesClaimed: string[];
    isExtraTurn: boolean;
  } | null;
}

export function generateLineId(type: 'h' | 'v', row: number, col: number): string {
  return `${type}-${row}-${col}`;
}

export function parseLineId(id: string): { type: 'h' | 'v'; row: number; col: number } {
  const parts = id.split('-');
  return {
    type: parts[0] as 'h' | 'v',
    row: parseInt(parts[1], 10),
    col: parseInt(parts[2], 10),
  };
}

export function generateBoxId(row: number, col: number): string {
  return `box-${row}-${col}`;
}

export function parseBoxId(id: string): { row: number; col: number } {
  const parts = id.split('-');
  return {
    row: parseInt(parts[1], 10),
    col: parseInt(parts[2], 10),
  };
}

/**
 * Returns the box IDs that share this line (0, 1, or 2 boxes)
 */
export function getAdjacentBoxIds(lineId: string, rows: number, cols: number): string[] {
  const { type, row, col } = parseLineId(lineId);
  const adjacent: string[] = [];

  if (type === 'h') {
    // Horizontal line: row can be between 0 and rows
    // It is bottom edge of box (row - 1, col) if row > 0
    if (row > 0 && col < cols) {
      adjacent.push(generateBoxId(row - 1, col));
    }
    // It is top edge of box (row, col) if row < rows
    if (row < rows && col < cols) {
      adjacent.push(generateBoxId(row, col));
    }
  } else {
    // Vertical line: col can be between 0 and cols
    // It is right edge of box (row, col - 1) if col > 0
    if (col > 0 && row < rows) {
      adjacent.push(generateBoxId(row, col - 1));
    }
    // It is left edge of box (row, col) if col < cols
    if (col < cols && row < rows) {
      adjacent.push(generateBoxId(row, col));
    }
  }

  return adjacent;
}

export function createInitialGameBoard(
  rows: number,
  cols: number,
  firstTurn: PlayerType = 'player1'
): GameBoardState {
  const lines: Record<string, LineState> = {};
  const boxes: Record<string, BoxState> = {};

  // Horizontal lines: (rows + 1) rows, each with cols segments
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = generateLineId('h', r, c);
      lines[id] = { id, type: 'h', row: r, col: c };
    }
  }

  // Vertical lines: rows rows, each with (cols + 1) segments
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c <= cols; c++) {
      const id = generateLineId('v', r, c);
      lines[id] = { id, type: 'v', row: r, col: c };
    }
  }

  // Boxes: rows * cols
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = generateBoxId(r, c);
      boxes[id] = {
        id,
        row: r,
        col: c,
        topLineId: generateLineId('h', r, c),
        bottomLineId: generateLineId('h', r + 1, c),
        leftLineId: generateLineId('v', r, c),
        rightLineId: generateLineId('v', r, c + 1),
      };
    }
  }

  return {
    rows,
    cols,
    lines,
    boxes,
    currentPlayer: firstTurn,
    scores: {
      player1: 0,
      player2: 0,
    },
    moveHistory: [],
    isGameOver: false,
    winner: null,
    lastMove: null,
  };
}

/**
 * Returns how many sides of a box are currently claimed
 */
export function countFilledSides(box: BoxState, lines: Record<string, LineState>): number {
  let count = 0;
  if (lines[box.topLineId]?.owner) count++;
  if (lines[box.bottomLineId]?.owner) count++;
  if (lines[box.leftLineId]?.owner) count++;
  if (lines[box.rightLineId]?.owner) count++;
  return count;
}

/**
 * Returns available line IDs for the box that have not yet been drawn
 */
export function getOpenSidesForBox(box: BoxState, lines: Record<string, LineState>): string[] {
  const open: string[] = [];
  if (!lines[box.topLineId]?.owner) open.push(box.topLineId);
  if (!lines[box.bottomLineId]?.owner) open.push(box.bottomLineId);
  if (!lines[box.leftLineId]?.owner) open.push(box.leftLineId);
  if (!lines[box.rightLineId]?.owner) open.push(box.rightLineId);
  return open;
}

/**
 * Executes a move by claiming a line.
 * Returns a new GameBoardState without mutating the original.
 */
export function makeMove(
  state: GameBoardState,
  lineId: string,
  playerOverride?: PlayerType
): GameBoardState {
  const line = state.lines[lineId];
  if (!line || line.owner || state.isGameOver) {
    return state; // invalid move
  }

  const activePlayer = playerOverride || state.currentPlayer;
  const nextPlayer = activePlayer === 'player1' ? 'player2' : 'player1';

  // Clone lines and boxes
  const updatedLines = {
    ...state.lines,
    [lineId]: {
      ...line,
      owner: activePlayer,
      timestamp: Date.now(),
    },
  };

  const updatedBoxes = { ...state.boxes };
  const adjacentBoxIds = getAdjacentBoxIds(lineId, state.rows, state.cols);
  const completedBoxIds: string[] = [];

  // Check if any adjacent boxes are now completed (all 4 sides filled)
  adjacentBoxIds.forEach((boxId) => {
    const box = updatedBoxes[boxId];
    if (box && !box.owner) {
      const filled = countFilledSides(box, updatedLines);
      if (filled === 4) {
        updatedBoxes[boxId] = {
          ...box,
          owner: activePlayer,
        };
        completedBoxIds.push(boxId);
      }
    }
  });

  const boxesEarned = completedBoxIds.length;
  const updatedScores = {
    ...state.scores,
    [activePlayer]: state.scores[activePlayer] + boxesEarned,
  };

  // Rule: If at least 1 box completed, player keeps turn (extra turn)!
  const isExtraTurn = boxesEarned > 0;
  const nextCurrentPlayer = isExtraTurn ? activePlayer : nextPlayer;

  // Check if game is over (all boxes claimed)
  const totalBoxes = state.rows * state.cols;
  const totalClaimed = updatedScores.player1 + updatedScores.player2;
  const isGameOver = totalClaimed >= totalBoxes;

  let winner: PlayerType | 'tie' | null = null;
  if (isGameOver) {
    if (updatedScores.player1 > updatedScores.player2) {
      winner = 'player1';
    } else if (updatedScores.player2 > updatedScores.player1) {
      winner = 'player2';
    } else {
      winner = 'tie';
    }
  }

  const { type, row, col } = parseLineId(lineId);
  const moveRecord: MoveRecord = {
    moveNumber: state.moveHistory.length + 1,
    player: activePlayer,
    lineId,
    lineType: type,
    row,
    col,
    completedBoxIds,
    timestamp: Date.now(),
  };

  return {
    rows: state.rows,
    cols: state.cols,
    lines: updatedLines,
    boxes: updatedBoxes,
    currentPlayer: isGameOver ? activePlayer : nextCurrentPlayer,
    scores: updatedScores,
    moveHistory: [...state.moveHistory, moveRecord],
    isGameOver,
    winner,
    lastMove: {
      lineId,
      player: activePlayer,
      boxesClaimed: completedBoxIds,
      isExtraTurn,
    },
  };
}

/**
 * Returns all unowned line IDs
 */
export function getAvailableLines(lines: Record<string, LineState>): string[] {
  return Object.values(lines)
    .filter((l) => !l.owner)
    .map((l) => l.id);
}
