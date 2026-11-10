/**
 * Core Puzzle Play game utilities, difficulty levels, and storage
 * Developed by Allide'
 */

export type DifficultyKey = 'easy' | 'medium' | 'hard';

export interface DifficultyConfig {
  key: DifficultyKey;
  label: string;
  gridSize: number;
  totalPieces: number;
  description: string;
}

export const DIFFICULTIES: Record<DifficultyKey, DifficultyConfig> = {
  easy: {
    key: 'easy',
    label: 'Easy 3×3',
    gridSize: 3,
    totalPieces: 9,
    description: '9 pieces · Great for beginners',
  },
  medium: {
    key: 'medium',
    label: 'Medium 4×4',
    gridSize: 4,
    totalPieces: 16,
    description: '16 pieces · Balanced challenge',
  },
  hard: {
    key: 'hard',
    label: 'Hard 5×5',
    gridSize: 5,
    totalPieces: 25,
    description: '25 pieces · Expert master mode',
  },
};

export interface PictureItem {
  id: string;
  name: string;
  src: string;
  isCustom?: boolean;
}

export const DEFAULT_PICTURES: PictureItem[] = [
  {
    id: 'mountain',
    name: 'Mountain',
    src: '/src/assets/images/puzzle_mountain_1793792860927.jpg',
  },
  {
    id: 'beach',
    name: 'Beach',
    src: '/src/assets/images/puzzle_beach_1793792861613.jpg',
  },
  {
    id: 'forest',
    name: 'Forest',
    src: '/src/assets/images/puzzle_forest_1793792862347.jpg',
  },
];

export interface PuzzlePieceData {
  id: number; // The original correct index (0 to gridSize^2 - 1)
  originalRow: number;
  originalCol: number;
}

/**
 * Creates pieces array in solved order (index = piece.id)
 */
export function createPieces(gridSize: number): PuzzlePieceData[] {
  const total = gridSize * gridSize;
  const pieces: PuzzlePieceData[] = [];
  for (let i = 0; i < total; i++) {
    pieces.push({
      id: i,
      originalRow: Math.floor(i / gridSize),
      originalCol: i % gridSize,
    });
  }
  return pieces;
}

/**
 * Shuffles pieces with Fisher-Yates, ensuring puzzle is not solved upon start.
 */
export function shufflePieces(pieces: PuzzlePieceData[]): PuzzlePieceData[] {
  const total = pieces.length;
  let shuffled = [...pieces];

  let attempts = 0;
  let isSolved = true;

  while (isSolved && attempts < 100) {
    attempts++;
    for (let i = total - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }

    // Check if fully solved or if almost all are correct
    const correctCount = shuffled.filter((p, index) => p.id === index).length;
    // We want at least some pieces jumbled
    if (correctCount < total - 1) {
      isSolved = false;
    }
  }

  // Fallback if somehow still solved: swap first two
  if (isSolved && total > 1) {
    const temp = shuffled[0];
    shuffled[0] = shuffled[1];
    shuffled[1] = temp;
  }

  return shuffled;
}

/**
 * Swaps two pieces at current board indices
 */
export function swapPieces(
  pieces: PuzzlePieceData[],
  fromIndex: number,
  toIndex: number
): PuzzlePieceData[] {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= pieces.length || toIndex >= pieces.length) {
    return pieces;
  }
  const next = [...pieces];
  const temp = next[fromIndex];
  next[fromIndex] = next[toIndex];
  next[toIndex] = temp;
  return next;
}

/**
 * Returns true if all pieces are at their matching index
 */
export function isPuzzleSolved(pieces: PuzzlePieceData[]): boolean {
  if (pieces.length === 0) return false;
  return pieces.every((p, index) => p.id === index);
}

/**
 * Counts how many pieces are in their correct spot
 */
export function getCorrectCount(pieces: PuzzlePieceData[]): number {
  return pieces.reduce((count, p, index) => (p.id === index ? count + 1 : count), 0);
}

/**
 * Formats seconds into mm:ss
 */
export function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export interface BestScore {
  time: number;
  moves: number;
  date: string;
}

const BEST_SCORES_KEY = 'puzzle_play_best_scores';

function getScoresStorage(): Record<string, BestScore> {
  try {
    const raw = localStorage.getItem(BEST_SCORES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Get the best score for a picture and difficulty grid size
 */
export function getBestScore(pictureId: string, gridSize: number): BestScore | null {
  const key = `${pictureId}_${gridSize}`;
  const scores = getScoresStorage();
  return scores[key] || null;
}

/**
 * Saves score if it is a new record (faster time, or same time with fewer moves).
 * Returns true if a new record was set.
 */
export function saveBestScore(
  pictureId: string,
  gridSize: number,
  time: number,
  moves: number
): boolean {
  const key = `${pictureId}_${gridSize}`;
  const scores = getScoresStorage();
  const current = scores[key];

  let isNewBest = false;
  if (!current) {
    isNewBest = true;
  } else if (time < current.time) {
    isNewBest = true;
  } else if (time === current.time && moves < current.moves) {
    isNewBest = true;
  }

  if (isNewBest) {
    scores[key] = {
      time,
      moves,
      date: new Date().toISOString(),
    };
    try {
      localStorage.setItem(BEST_SCORES_KEY, JSON.stringify(scores));
    } catch {
      // storage full or disabled
    }
  }

  return isNewBest;
}

/**
 * Calculates level calculation helpers:
 * Each picture has 3 difficulties (Easy -> Medium -> Hard).
 * Given a starting picture index and starting difficulty,
 * compute the total sequence of levels.
 */
export interface LevelStep {
  levelNumber: number;
  picture: PictureItem;
  difficulty: DifficultyKey;
  gridSize: number;
}

export function generateLevelSequence(
  pictureList: PictureItem[],
  startPictureId: string,
  startDifficulty: DifficultyKey
): LevelStep[] {
  const diffOrder: DifficultyKey[] = ['easy', 'medium', 'hard'];
  const startDiffIdx = diffOrder.indexOf(startDifficulty);
  const remainingDiffs = diffOrder.slice(startDiffIdx >= 0 ? startDiffIdx : 0);

  // Reorder pictureList starting from chosen picture
  const chosenIndex = pictureList.findIndex((p) => p.id === startPictureId);
  const orderedPictures =
    chosenIndex >= 0
      ? [...pictureList.slice(chosenIndex), ...pictureList.slice(0, chosenIndex)]
      : [...pictureList];

  const levels: LevelStep[] = [];
  let levelNum = 1;

  for (const diff of remainingDiffs) {
    const config = DIFFICULTIES[diff];
    for (const pic of orderedPictures) {
      levels.push({
        levelNumber: levelNum++,
        picture: pic,
        difficulty: diff,
        gridSize: config.gridSize,
      });
    }
  }

  return levels;
}
