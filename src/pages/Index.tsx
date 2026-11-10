import React, { useState, useEffect } from 'react';
import {
  Trophy,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Puzzle,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  DEFAULT_PICTURES,
  PictureItem,
  DifficultyKey,
  DIFFICULTIES,
  LevelStep,
  generateLevelSequence,
} from '../lib/puzzleUtils';
import { soundManager } from '../lib/sounds';
import { fireGrandConfetti } from '../components/Confetti';
import { ImageSelector } from '../components/ImageSelector';
import { DifficultySelector } from '../components/DifficultySelector';
import { PuzzleBoard } from '../components/PuzzleBoard';
import { InstallPrompt } from '../components/InstallPrompt';

export type GameScreen = 'CHOOSE_PICTURE' | 'CHOOSE_DIFFICULTY' | 'PLAYING' | 'ALL_CLEARED';

export const IndexPage: React.FC = () => {
  // Game state
  const [screen, setScreen] = useState<GameScreen>('CHOOSE_PICTURE');
  const [pictures, setPictures] = useState<PictureItem[]>(DEFAULT_PICTURES);
  const [selectedPictureId, setSelectedPictureId] = useState<string>(DEFAULT_PICTURES[0].id);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyKey>('easy');

  // Level Progression state
  const [levels, setLevels] = useState<LevelStep[]>([]);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [muted, setMuted] = useState(soundManager.isMuted());

  // Current level details
  const currentLevel: LevelStep | undefined = levels[currentLevelIndex];
  const selectedPicture =
    pictures.find((p) => p.id === selectedPictureId) || pictures[0];

  // Upload handler
  const handleUploadPicture = (newPic: PictureItem) => {
    setPictures((prev) => [newPic, ...prev]);
    setSelectedPictureId(newPic.id);
  };

  // Delete custom photo
  const handleDeletePicture = (id: string) => {
    setPictures((prev) => prev.filter((p) => p.id !== id));
    if (selectedPictureId === id) {
      setSelectedPictureId(DEFAULT_PICTURES[0].id);
    }
  };

  // Start game flow
  const handleStartGame = () => {
    const sequence = generateLevelSequence(pictures, selectedPictureId, selectedDifficulty);
    setLevels(sequence);
    setCurrentLevelIndex(0);
    setScreen('PLAYING');
  };

  // Next level flow
  const handleNextLevel = () => {
    const nextIdx = currentLevelIndex + 1;
    if (nextIdx < levels.length) {
      setCurrentLevelIndex(nextIdx);
    } else {
      setScreen('ALL_CLEARED');
      fireGrandConfetti();
      soundManager.playVictory();
    }
  };

  // Header Back Button handler
  const handleBack = () => {
    soundManager.playClick();
    if (screen === 'CHOOSE_DIFFICULTY') {
      setScreen('CHOOSE_PICTURE');
    } else if (screen === 'PLAYING') {
      setScreen('CHOOSE_DIFFICULTY');
    } else if (screen === 'ALL_CLEARED') {
      setScreen('CHOOSE_PICTURE');
    }
  };

  const handleToggleMute = () => {
    const isNowMuted = soundManager.toggleMute();
    setMuted(isNowMuted);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-900 bg-slate-950/90 backdrop-blur-md px-4 sm:px-6 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          {/* Left Zone: Back Button (if not on screen 1) or App Brand */}
          <div className="flex items-center gap-3">
            {screen !== 'CHOOSE_PICTURE' && (
              <button
                onClick={handleBack}
                aria-label="Back"
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Puzzle className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg sm:text-xl text-white tracking-tight">
                Puzzle Play
              </span>
            </div>
          </div>

          {/* Center Zone: Level Badge while Playing */}
          {screen === 'PLAYING' && currentLevel && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
              <span className="text-emerald-400 font-bold">
                Level {currentLevel.levelNumber}
              </span>
              <span>·</span>
              <span className="text-slate-400">
                {currentLevel.gridSize}×{currentLevel.gridSize}
              </span>
            </div>
          )}

          {/* Right Zone: Controls (Mute, Install) */}
          <div className="flex items-center gap-2">
            <InstallPrompt compact={true} />
            <button
              onClick={handleToggleMute}
              title={muted ? 'Unmute sounds' : 'Mute sounds'}
              aria-label="Toggle audio mute"
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {muted ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        {/* Banner Install Prompt if applicable */}
        {screen === 'CHOOSE_PICTURE' && <InstallPrompt compact={false} />}

        {/* Screen 1: Choose Picture */}
        {screen === 'CHOOSE_PICTURE' && (
          <ImageSelector
            pictures={pictures}
            selectedPictureId={selectedPictureId}
            onSelectPicture={(id) => setSelectedPictureId(id)}
            onUploadPicture={handleUploadPicture}
            onDeletePicture={handleDeletePicture}
            onContinue={() => setScreen('CHOOSE_DIFFICULTY')}
          />
        )}

        {/* Screen 2: Choose Difficulty */}
        {screen === 'CHOOSE_DIFFICULTY' && (
          <DifficultySelector
            picture={selectedPicture}
            selectedDifficulty={selectedDifficulty}
            onSelectDifficulty={(key) => setSelectedDifficulty(key)}
            onStartGame={handleStartGame}
          />
        )}

        {/* Screen 3: Playing */}
        {screen === 'PLAYING' && currentLevel && (
          <PuzzleBoard
            levelNumber={currentLevel.levelNumber}
            totalLevels={levels.length}
            picture={currentLevel.picture}
            gridSize={currentLevel.gridSize}
            difficultyKey={currentLevel.difficulty}
            onNextLevel={handleNextLevel}
            onBackToDifficulty={() => setScreen('CHOOSE_DIFFICULTY')}
          />
        )}

        {/* Screen 4: All Levels Cleared */}
        {screen === 'ALL_CLEARED' && (
          <div className="w-full max-w-md mx-auto text-center py-8">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500/20 via-yellow-400/20 to-emerald-500/20 border-2 border-amber-400/50 flex items-center justify-center text-amber-300 mb-5 shadow-2xl shadow-amber-500/20">
              <Trophy className="w-10 h-10 animate-bounce" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Grand Champion</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
              All Levels Cleared!
            </h2>
            <p className="text-base text-slate-300 font-medium mb-1">
              You finished all {levels.length} levels.
            </p>
            <p className="text-xl font-extrabold text-amber-400 mb-8">
              Puzzle Master!
            </p>

            <div className="w-full max-w-xs mx-auto">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setScreen('CHOOSE_PICTURE');
                }}
                className="w-full py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition-all cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Play Again</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer Credit */}
      <footer className="w-full border-t border-slate-900/80 py-4 px-4 text-center">
        <p className="text-xs text-slate-400 font-medium">
          Developed by Allide'
        </p>
      </footer>
    </div>
  );
};
