import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Timer,
  Footprints,
  Star,
  Eye,
  Pause,
  Play,
  Shuffle,
  Volume2,
  VolumeX,
  RotateCcw,
  Trophy,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  PuzzlePieceData,
  PictureItem,
  DifficultyKey,
  createPieces,
  shufflePieces,
  swapPieces,
  isPuzzleSolved,
  getCorrectCount,
  formatTime,
  getBestScore,
  saveBestScore,
  BestScore,
} from '../lib/puzzleUtils';
import { soundManager } from '../lib/sounds';
import { fireConfetti } from './Confetti';
import { PuzzlePiece } from './PuzzlePiece';

interface PuzzleBoardProps {
  levelNumber: number;
  totalLevels: number;
  picture: PictureItem;
  gridSize: number;
  difficultyKey: DifficultyKey;
  onNextLevel: () => void;
  onBackToDifficulty: () => void;
}

export const PuzzleBoard: React.FC<PuzzleBoardProps> = ({
  levelNumber,
  totalLevels,
  picture,
  gridSize,
  difficultyKey,
  onNextLevel,
  onBackToDifficulty,
}) => {
  // Game pieces state
  const [pieces, setPieces] = useState<PuzzlePieceData[]>(() =>
    shufflePieces(createPieces(gridSize))
  );

  // Drag & selection state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Metrics
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [movesCount, setMovesCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [bestScore, setBestScore] = useState<BestScore | null>(null);
  const [muted, setMuted] = useState(soundManager.isMuted());

  const hintTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Total pieces count
  const totalPieces = gridSize * gridSize;
  const correctCount = getCorrectCount(pieces);
  const progressPercent = Math.round((correctCount / totalPieces) * 100);

  // Load existing best score on mount / level change
  useEffect(() => {
    const existing = getBestScore(picture.id, gridSize);
    setBestScore(existing);
  }, [picture.id, gridSize]);

  // Reset & re-deal when level or gridSize changes
  useEffect(() => {
    setPieces(shufflePieces(createPieces(gridSize)));
    setTimerSeconds(0);
    setMovesCount(0);
    setIsPaused(false);
    setShowHint(false);
    setIsSolved(false);
    setIsNewRecord(false);
    setSelectedIndex(null);
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [picture.id, gridSize, levelNumber]);

  // Timer tick
  useEffect(() => {
    if (isPaused || isSolved || showHint) return;

    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, isSolved, showHint]);

  // Clean up hint timer
  useEffect(() => {
    return () => {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    };
  }, []);

  // Handle piece swap
  const executeSwap = useCallback(
    (indexA: number, indexB: number) => {
      if (indexA === indexB) return;

      const updated = swapPieces(pieces, indexA, indexB);
      setPieces(updated);
      setMovesCount((prev) => prev + 1);

      // Sound feedback
      soundManager.playSwap();

      // Check if newly swapped pieces landed in correct spots
      const pieceAIsCorrect = updated[indexA].id === indexA;
      const pieceBIsCorrect = updated[indexB].id === indexB;
      if (pieceAIsCorrect || pieceBIsCorrect) {
        setTimeout(() => {
          soundManager.playCorrectPiece();
        }, 80);
      }

      // Check if puzzle is fully solved
      if (isPuzzleSolved(updated)) {
        setIsSolved(true);
        const finalTime = timerSeconds;
        const finalMoves = movesCount + 1;

        // Save best score
        const recordBroken = saveBestScore(picture.id, gridSize, finalTime, finalMoves);
        setIsNewRecord(recordBroken);
        if (recordBroken) {
          setBestScore({
            time: finalTime,
            moves: finalMoves,
            date: new Date().toISOString(),
          });
        }

        // Celebration
        setTimeout(() => {
          soundManager.playVictory();
          fireConfetti();
        }, 200);
      }
    },
    [pieces, timerSeconds, movesCount, picture.id, gridSize]
  );

  // Drag handlers
  const handleDragStart = (slotIndex: number, e: React.DragEvent) => {
    if (isSolved || isPaused) return;
    setDraggedIndex(slotIndex);
    e.dataTransfer.setData('text/plain', slotIndex.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (slotIndex: number) => {
    if (isSolved || isPaused) return;
    setDragOverIndex(slotIndex);
  };

  const handleDragLeave = (slotIndex: number) => {
    if (dragOverIndex === slotIndex) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (targetSlot: number) => {
    if (isSolved || isPaused) return;
    if (draggedIndex !== null && draggedIndex !== targetSlot) {
      executeSwap(draggedIndex, targetSlot);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Click / Tap to select and swap
  const handleSelectSlot = (slotIndex: number) => {
    if (isSolved || isPaused) return;

    if (selectedIndex === null) {
      // First piece selected
      soundManager.playClick();
      setSelectedIndex(slotIndex);
    } else if (selectedIndex === slotIndex) {
      // Unselect if tapped same piece again
      soundManager.playClick();
      setSelectedIndex(null);
    } else {
      // Swap selected piece with this new tapped piece
      const first = selectedIndex;
      setSelectedIndex(null);
      executeSwap(first, slotIndex);
    }
  };

  // Hint button: reveal full picture for 1.5 seconds
  const handleHint = () => {
    if (isSolved || isPaused || showHint) return;
    soundManager.playClick();
    setShowHint(true);

    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    hintTimerRef.current = setTimeout(() => {
      setShowHint(false);
    }, 1500);
  };

  // Shuffle button: re-mix pieces and reset timer/moves
  const handleShuffle = () => {
    soundManager.playShuffle();
    setPieces(shufflePieces(createPieces(gridSize)));
    setTimerSeconds(0);
    setMovesCount(0);
    setSelectedIndex(null);
    setIsSolved(false);
    setIsNewRecord(false);
  };

  // Pause / Resume
  const handleTogglePause = () => {
    soundManager.playClick();
    setIsPaused((prev) => !prev);
  };

  // Mute / Unmute
  const handleToggleMute = () => {
    const isNowMuted = soundManager.toggleMute();
    setMuted(isNowMuted);
  };

  // Reset to initial shuffle
  const handleReset = () => {
    handleShuffle();
  };

  // Grid style class according to gridSize
  const gridColsClass =
    gridSize === 3
      ? 'grid-cols-3'
      : gridSize === 4
      ? 'grid-cols-4'
      : 'grid-cols-5';

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center">
      {/* Top Stats Bar */}
      <div className="w-full grid grid-cols-3 gap-2 sm:gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm mb-3">
        {/* Timer */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <Timer className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
              Time
            </span>
            <span className="font-mono text-sm sm:text-base font-bold text-white tabular-nums">
              {formatTime(timerSeconds)}
            </span>
          </div>
        </div>

        {/* Moves Count */}
        <div className="flex items-center gap-2 justify-center">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
            <Footprints className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
              Moves
            </span>
            <span className="font-mono text-sm sm:text-base font-bold text-white tabular-nums">
              {movesCount}
            </span>
          </div>
        </div>

        {/* Best Score */}
        <div className="flex items-center gap-2 justify-end">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <Star className="w-4 h-4 fill-amber-400/30" />
          </div>
          <div className="text-right min-w-0">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
              Best
            </span>
            <span className="font-mono text-xs sm:text-sm font-bold text-amber-300 tabular-nums truncate block">
              {bestScore ? formatTime(bestScore.time) : '--:--'}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full mb-3 px-1">
        <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
          <span className="text-slate-400">Progress</span>
          <span className="font-mono text-emerald-400 font-bold tabular-nums">
            {correctCount}/{totalPieces} pieces ({progressPercent}%)
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Puzzle Board Container */}
      <div className="relative w-full aspect-square max-w-[400px] sm:max-w-[420px] rounded-2xl bg-slate-900 border border-slate-800 p-2 sm:p-2.5 shadow-2xl overflow-hidden select-none">
        {/* Pieces Grid */}
        <div className={`w-full h-full grid ${gridColsClass} gap-1 sm:gap-1.5`}>
          {pieces.map((piece, index) => (
            <PuzzlePiece
              key={`${piece.id}_${index}`}
              piece={piece}
              currentSlot={index}
              gridSize={gridSize}
              imageSrc={picture.src}
              isDragging={draggedIndex === index}
              isDragOver={dragOverIndex === index}
              isSelected={selectedIndex === index}
              isSolved={isSolved}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onSelect={handleSelectSlot}
            />
          ))}
        </div>

        {/* Hint Overlay (Full picture preview for 1.5s) */}
        {showHint && (
          <div className="absolute inset-0 z-30 p-2 sm:p-2.5 bg-slate-950/95 animate-fade-in flex flex-col items-center justify-center">
            <div className="relative w-full h-full rounded-xl overflow-hidden border-2 border-emerald-400 shadow-2xl">
              <img
                src={picture.src}
                alt="Hint"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-black/75 text-emerald-400 text-xs font-bold tracking-wide backdrop-blur-sm">
                Hint (1.5s)
              </div>
            </div>
          </div>
        )}

        {/* Pause Overlay */}
        {isPaused && (
          <div className="absolute inset-0 z-40 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
              <Pause className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Game Paused</h3>
            <p className="text-xs text-slate-400 mb-5">Timer is frozen. Ready to resume?</p>
            <button
              onClick={handleTogglePause}
              className="py-2.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Resume Game</span>
            </button>
          </div>
        )}

        {/* Win Card Overlay */}
        {isSolved && (
          <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-yellow-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 mb-3 shadow-lg shadow-amber-500/10">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Level {levelNumber} Complete</span>
            </div>

            <h3 className="text-2xl font-extrabold text-white mb-2">Puzzle Solved!</h3>

            {/* New Best Badge */}
            {isNewRecord && (
              <div className="mb-3 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-bold tracking-wide flex items-center gap-1.5 animate-pulse">
                <Star className="w-3.5 h-3.5 fill-amber-300" />
                <span>New Best Record!</span>
              </div>
            )}

            {/* Results Details */}
            <div className="w-full max-w-xs grid grid-cols-2 gap-2 my-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-left">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                  Final Time
                </span>
                <span className="font-mono text-base font-bold text-white tabular-nums">
                  {formatTime(timerSeconds)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                  Moves
                </span>
                <span className="font-mono text-base font-bold text-white tabular-nums">
                  {movesCount} swaps
                </span>
              </div>
            </div>

            {/* Next Level Button */}
            <div className="w-full max-w-xs mt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  soundManager.playClick();
                  onNextLevel();
                }}
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <span>{levelNumber >= totalLevels ? 'View All Cleared' : 'Next Level'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  soundManager.playClick();
                  handleShuffle();
                }}
                className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
              >
                Replay this Picture
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="w-full flex items-center justify-between gap-2 mt-4 px-1">
        {/* Hint button */}
        <button
          onClick={handleHint}
          disabled={isSolved || isPaused || showHint}
          title="Peek full picture for 1.5 seconds"
          className="flex-1 py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Eye className="w-4 h-4 text-emerald-400" />
          <span>Hint</span>
        </button>

        {/* Pause / Resume button */}
        <button
          onClick={handleTogglePause}
          disabled={isSolved}
          title={isPaused ? 'Resume' : 'Pause'}
          className="flex-1 py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isPaused ? (
            <>
              <Play className="w-4 h-4 text-emerald-400 fill-current" />
              <span>Resume</span>
            </>
          ) : (
            <>
              <Pause className="w-4 h-4 text-amber-400" />
              <span>Pause</span>
            </>
          )}
        </button>

        {/* Shuffle button */}
        <button
          onClick={handleShuffle}
          disabled={isSolved || isPaused}
          title="Re-mix pieces and restart timer"
          className="flex-1 py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Shuffle className="w-4 h-4 text-blue-400" />
          <span>Shuffle</span>
        </button>

        {/* Mute toggle button */}
        <button
          onClick={handleToggleMute}
          title={muted ? 'Unmute sounds' : 'Mute sounds'}
          className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer"
        >
          {muted ? (
            <VolumeX className="w-4 h-4 text-red-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          )}
        </button>

        {/* Reset / Re-deal */}
        <button
          onClick={handleReset}
          title="Reset puzzle"
          className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-slate-400 hover:text-white" />
        </button>
      </div>

      {/* Helpful Hint / Instructions for player */}
      <div className="mt-3 text-center text-xs text-slate-400">
        <span>Tip: Drag & swap pieces, or tap one piece then another. Mint outline = correct spot.</span>
      </div>
    </div>
  );
};
