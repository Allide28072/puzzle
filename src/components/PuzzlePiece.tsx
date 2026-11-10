import React from 'react';
import { Check } from 'lucide-react';
import { PuzzlePieceData } from '../lib/puzzleUtils';

interface PuzzlePieceProps {
  piece: PuzzlePieceData;
  currentSlot: number;
  gridSize: number;
  imageSrc: string;
  isDragging: boolean;
  isDragOver: boolean;
  isSelected: boolean;
  isSolved: boolean;
  onDragStart: (slotIndex: number, e: React.DragEvent) => void;
  onDragOver: (slotIndex: number, e: React.DragEvent) => void;
  onDragLeave: (slotIndex: number) => void;
  onDrop: (slotIndex: number) => void;
  onSelect: (slotIndex: number) => void;
}

export const PuzzlePiece: React.FC<PuzzlePieceProps> = ({
  piece,
  currentSlot,
  gridSize,
  imageSrc,
  isDragging,
  isDragOver,
  isSelected,
  isSolved,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onSelect,
}) => {
  const isCorrect = piece.id === currentSlot;

  // Background positioning math
  // gridSize - 1 avoids division by zero since gridSize is at least 3
  const colPercent = (piece.originalCol / (gridSize - 1)) * 100;
  const rowPercent = (piece.originalRow / (gridSize - 1)) * 100;

  const bgSize = `${gridSize * 100}% ${gridSize * 100}%`;
  const bgPosition = `${colPercent}% ${rowPercent}%`;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Puzzle piece in slot ${currentSlot + 1}, ${isCorrect ? 'correct position' : 'misplaced'}`}
      draggable={!isSolved}
      onDragStart={(e) => onDragStart(currentSlot, e)}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(currentSlot, e);
      }}
      onDragLeave={() => onDragLeave(currentSlot)}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(currentSlot);
      }}
      onClick={() => onSelect(currentSlot)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(currentSlot);
        }
      }}
      style={{
        backgroundImage: `url(${imageSrc})`,
        backgroundSize: bgSize,
        backgroundPosition: bgPosition,
        backgroundRepeat: 'no-repeat',
      }}
      className={`
        relative aspect-square cursor-grab active:cursor-grabbing select-none
        transition-all duration-150 ease-out rounded-lg overflow-hidden
        ${isDragging ? 'opacity-30 scale-95' : 'opacity-100'}
        ${isDragOver ? 'ring-4 ring-amber-400 scale-105 z-20 shadow-2xl' : ''}
        ${isSelected ? 'ring-4 ring-cyan-400 scale-102 z-10 shadow-lg shadow-cyan-500/20 animate-pulse' : ''}
        ${
          !isSelected && !isDragOver && isCorrect
            ? 'ring-2 ring-emerald-400 ring-inset shadow-[inset_0_0_12px_rgba(52,211,153,0.35)]'
            : !isSelected && !isDragOver
            ? 'ring-1 ring-white/10 hover:ring-white/30 hover:scale-[1.01]'
            : ''
        }
      `}
    >
      {/* Visual hint for correct piece: subtle mint badge in corner */}
      {isCorrect && !isSolved && (
        <div
          title="Correct position"
          className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500/90 text-slate-950 flex items-center justify-center shadow-sm pointer-events-none"
        >
          <Check className="w-2.5 h-2.5 stroke-[3]" />
        </div>
      )}

      {/* Subtle selection ring indicator */}
      {isSelected && (
        <div className="absolute inset-0 bg-cyan-400/10 pointer-events-none flex items-center justify-center">
          <span className="text-[10px] font-bold tracking-wider uppercase text-cyan-200 bg-slate-900/80 px-1.5 py-0.5 rounded shadow">
            Selected
          </span>
        </div>
      )}
    </div>
  );
};
