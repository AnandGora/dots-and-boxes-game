import { CampaignLevel } from '@/types/game';
export type { CampaignLevel };

export const CAMPAIGN_LEVELS: CampaignLevel[] = [
  {
    id: 1,
    name: 'Training Ground',
    subtitle: 'Learn the fundamentals',
    rows: 2,
    cols: 2,
    difficulty: 'easy',
    unlockStars: 0,
    description: 'A cozy 2x2 grid. Perfect for getting the hang of capturing squares and chaining turns.',
    badge: 'Beginner',
  },
  {
    id: 2,
    name: 'First Skirmish',
    subtitle: 'Expand your vision',
    rows: 2,
    cols: 3,
    difficulty: 'easy',
    unlockStars: 1,
    description: 'A wider rectangle. Watch how lines on adjacent boxes interact.',
    badge: 'Novice',
  },
  {
    id: 3,
    name: 'Tactical Corner',
    subtitle: 'Think one move ahead',
    rows: 3,
    cols: 3,
    difficulty: 'medium',
    unlockStars: 3,
    description: 'The classic 3x3 grid. The computer is smarter now and will grab any open box!',
    badge: 'Casual',
  },
  {
    id: 4,
    name: 'The Crossway',
    subtitle: 'Bait and trap',
    rows: 3,
    cols: 4,
    difficulty: 'medium',
    unlockStars: 6,
    description: '12 boxes with multiple corridors. Look out for chain reactions.',
    badge: 'Adept',
  },
  {
    id: 5,
    name: 'Iron Stronghold',
    subtitle: 'Strategic patience',
    rows: 4,
    cols: 4,
    difficulty: 'hard',
    unlockStars: 9,
    description: '16 boxes. The AI calculates sacrifice trades and avoids opening chains.',
    badge: 'Challenger',
  },
  {
    id: 6,
    name: 'The Labyrinth',
    subtitle: 'Deep corridor navigation',
    rows: 4,
    cols: 5,
    difficulty: 'hard',
    unlockStars: 12,
    description: '20 boxes. Every line choice counts. Control the corridors to secure victory.',
    badge: 'Veteran',
  },
  {
    id: 7,
    name: 'Neural Matrix',
    subtitle: 'Facing the machine',
    rows: 5,
    cols: 5,
    difficulty: 'master',
    unlockStars: 15,
    description: '25 boxes. The Master AI analyzes double-dealing strategies and loop sacrifices.',
    badge: 'Master',
  },
  {
    id: 8,
    name: 'The Grandmaster',
    subtitle: 'The ultimate challenge',
    rows: 6,
    cols: 6,
    difficulty: 'master',
    unlockStars: 18,
    description: '36 boxes. A massive battlefield where one mistake can swing 10+ boxes in a single turn!',
    badge: 'Grandmaster',
  },
];

/**
 * Calculate stars earned based on player score and total boxes:
 * - 0 stars if player didn't win
 * - 1 star for victory
 * - 2 stars for winning with >= 60% of total boxes
 * - 3 stars for winning with >= 75% of total boxes (clean dominance)
 */
export function calculateStarsEarned(playerScore: number, opponentScore: number, totalBoxes: number): number {
  if (playerScore <= opponentScore) {
    return 0; // Did not win
  }

  const ratio = playerScore / totalBoxes;
  if (ratio >= 0.75) {
    return 3;
  }
  if (ratio >= 0.60) {
    return 2;
  }
  return 1;
}

export function getTotalEarnedStars(starsMap: Record<number, number>): number {
  return Object.values(starsMap).reduce((acc, curr) => acc + (curr || 0), 0);
}

export function isLevelUnlocked(level: CampaignLevel, totalStars: number): boolean {
  return totalStars >= level.unlockStars;
}
