import { HistoryRecord, OverallStats, GameSettings } from '@/types/game';

const HISTORY_KEY = 'dots_boxes_history_v1';
const STATS_KEY = 'dots_boxes_stats_v1';
const SETTINGS_KEY = 'dots_boxes_settings_v1';

export const DEFAULT_STATS: OverallStats = {
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  ties: 0,
  totalBoxesCaptured: 0,
  totalOpponentBoxes: 0,
  currentStreak: 0,
  bestStreak: 0,
  stars: {
    1: 0,
  },
};

export const DEFAULT_SETTINGS: GameSettings = {
  rows: 3,
  cols: 3,
  difficulty: 'medium',
  mode: 'campaign',
  levelId: 1,
  soundEnabled: true,
  firstTurn: 'player1',
  theme: 'dark',
};

export function loadHistory(): HistoryRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load history from localStorage', e);
    return [];
  }
}

export function saveHistoryRecord(record: HistoryRecord): HistoryRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const history = loadHistory();
    const updated = [record, ...history].slice(0, 100); // keep last 100 matches
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save history to localStorage', e);
    return [];
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    console.error('Failed to clear history', e);
  }
}

export function loadStats(): OverallStats {
  if (typeof window === 'undefined') return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATS,
      ...parsed,
      stars: { ...DEFAULT_STATS.stars, ...(parsed.stars || {}) },
    };
  } catch (e) {
    console.error('Failed to load stats', e);
    return DEFAULT_STATS;
  }
}

export function recordGameResult(
  record: HistoryRecord,
  starsEarned: number = 0
): OverallStats {
  if (typeof window === 'undefined') return DEFAULT_STATS;
  try {
    const stats = loadStats();
    const isWin = record.winner === 'player1';
    const isLoss = record.winner === 'player2';
    const isTie = record.winner === 'tie';

    const newCurrentStreak = isWin ? stats.currentStreak + 1 : isLoss ? 0 : stats.currentStreak;
    const newBestStreak = Math.max(stats.bestStreak, newCurrentStreak);

    const updatedStars = { ...stats.stars };
    if (record.levelId !== undefined && starsEarned > 0) {
      const currentStars = updatedStars[record.levelId] || 0;
      updatedStars[record.levelId] = Math.max(currentStars, starsEarned);
    }

    const updatedStats: OverallStats = {
      gamesPlayed: stats.gamesPlayed + 1,
      wins: stats.wins + (isWin ? 1 : 0),
      losses: stats.losses + (isLoss ? 1 : 0),
      ties: stats.ties + (isTie ? 1 : 0),
      totalBoxesCaptured: stats.totalBoxesCaptured + record.player1Score,
      totalOpponentBoxes: stats.totalOpponentBoxes + record.player2Score,
      currentStreak: newCurrentStreak,
      bestStreak: newBestStreak,
      stars: updatedStars,
    };

    localStorage.setItem(STATS_KEY, JSON.stringify(updatedStats));
    saveHistoryRecord(record);
    return updatedStats;
  } catch (e) {
    console.error('Failed to update stats', e);
    return DEFAULT_STATS;
  }
}

export function loadSettings(): GameSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load settings', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Partial<GameSettings>): GameSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const current = loadSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save settings', e);
    return DEFAULT_SETTINGS;
  }
}
