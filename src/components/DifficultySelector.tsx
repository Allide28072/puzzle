import React from 'react';
import { Play, Grid3X3, Trophy, Sparkles } from 'lucide-react';
import {
  DifficultyKey,
  DIFFICULTIES,
  PictureItem,
  getBestScore,
  formatTime,
} from '../lib/puzzleUtils';
import { soundManager } from '../lib/sounds';

interface DifficultySelectorProps {
  picture: PictureItem;
  selectedDifficulty: DifficultyKey;
  onSelectDifficulty: (key: DifficultyKey) => void;
  onStartGame: () => void;
}

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  picture,
  selectedDifficulty,
  onSelectDifficulty,
  onStartGame,
}) => {
  const difficultyKeys: DifficultyKey[] = ['easy', 'medium', 'hard'];

  const handleDifficultyClick = (key: DifficultyKey) => {
    soundManager.playClick();
    onSelectDifficulty(key);
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      {/* Selected Image Preview */}
      <div className="w-full flex flex-col items-center mb-6">
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-xl shadow-emerald-950/40">
          <img
            src={picture.src}
            alt={picture.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
          <div className="absolute bottom-2.5 left-3 right-3 text-center">
            <span className="text-xs font-semibold text-white drop-shadow truncate block">
              {picture.name}
            </span>
          </div>
        </div>
      </div>

      {/* Difficulty Heading */}
      <div className="text-center mb-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Choose Difficulty</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md">
          Solve each picture to unlock the next level. After all images, difficulty increases.
        </p>
      </div>

      {/* 3 Difficulty Buttons */}
      <div className="w-full space-y-3 mb-6">
        {difficultyKeys.map((key) => {
          const config = DIFFICULTIES[key];
          const isSelected = selectedDifficulty === key;
          const best = getBestScore(picture.id, config.gridSize);

          return (
            <div
              key={key}
              role="button"
              tabIndex={0}
              onClick={() => handleDifficultyClick(key)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleDifficultyClick(key);
                }
              }}
              className={`
                w-full p-4 rounded-xl border text-left cursor-pointer
                transition-all duration-150 flex items-center justify-between gap-4
                ${
                  isSelected
                    ? 'bg-slate-900 border-emerald-400 ring-2 ring-emerald-400/50 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                }
              `}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-base">{config.label}</span>
                    <span className="text-xs text-slate-400">({config.totalPieces} pieces)</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{config.description}</p>
                </div>
              </div>

              {/* Best record indicator if available */}
              {best ? (
                <div className="text-right shrink-0">
                  <div className="flex items-center justify-end gap-1 text-xs text-amber-400 font-semibold">
                    <Trophy className="w-3.5 h-3.5" />
                    <span className="font-mono tabular-nums">{formatTime(best.time)}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    {best.moves} {best.moves === 1 ? 'move' : 'moves'}
                  </span>
                </div>
              ) : (
                <div className="shrink-0 text-right">
                  <span className="text-xs text-slate-500">No record yet</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Start Level CTA */}
      <div className="w-full max-w-xs">
        <button
          onClick={() => {
            soundManager.playClick();
            onStartGame();
          }}
          className="w-full py-3.5 px-6 rounded-xl font-bold text-base bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Start Level 1</span>
        </button>
      </div>
    </div>
  );
};
