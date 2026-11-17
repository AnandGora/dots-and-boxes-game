export type PlayerType = 'player1' | 'player2';

export type GameMode = 'campaign' | 'custom' | 'pvp';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'master';

export interface LineCoord {
  type: 'h' | 'v';
  row: number;
  col: number;
}

export interface LineState {
  id: string; // e.g. "h-0-1" or "v-1-2"
  type: 'h' | 'v';
  row: number;
  col: number;
  owner?: PlayerType;
  timestamp?: number;
}

export interface BoxState {
  id: string; // "box-r-c"
  row: number;
  col: number;
  owner?: PlayerType;
  topLineId: string;
  bottomLineId: string;
  leftLineId: string;
  rightLineId: string;
}

export interface MoveRecord {
  moveNumber: number;
  player: PlayerType;
  lineId: string;
  lineType: 'h' | 'v';
  row: number;
  col: number;
  completedBoxIds: string[];
  timestamp: number;
}

export interface GameSettings {
  rows: number; // number of boxes vertically
  cols: number; // number of boxes horizontally
  difficulty: Difficulty;
  mode: GameMode;
  levelId?: number;
  soundEnabled: boolean;
  firstTurn: 'player1' | 'player2' | 'random';
  theme: 'dark' | 'light' | 'blueprint' | 'neon';
}

export interface CampaignLevel {
  id: number;
  name: string;
  subtitle: string;
  rows: number;
  cols: number;
  difficulty: Difficulty;
  unlockStars: number;
  description: string;
  badge?: string;
}

export interface HistoryRecord {
  id: string;
  date: string;
  mode: GameMode;
  levelId?: number;
  levelName?: string;
  rows: number;
  cols: number;
  difficulty: Difficulty;
  player1Score: number;
  player2Score: number;
  winner: 'player1' | 'player2' | 'tie';
  durationSeconds: number;
  movesCount: number;
  starsEarned?: number;
}

export interface OverallStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  ties: number;
  totalBoxesCaptured: number;
  totalOpponentBoxes: number;
  currentStreak: number;
  bestStreak: number;
  stars: Record<number, number>; // levelId -> stars (1-3)
}
