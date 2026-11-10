import React, { useRef } from 'react';
import { Upload, Check, Image as ImageIcon, ArrowRight, Trash2 } from 'lucide-react';
import { PictureItem } from '../lib/puzzleUtils';
import { soundManager } from '../lib/sounds';

interface ImageSelectorProps {
  pictures: PictureItem[];
  selectedPictureId: string;
  onSelectPicture: (id: string) => void;
  onUploadPicture: (item: PictureItem) => void;
  onDeletePicture?: (id: string) => void;
  onContinue: () => void;
}

export const ImageSelector: React.FC<ImageSelectorProps> = ({
  pictures,
  selectedPictureId,
  onSelectPicture,
  onUploadPicture,
  onDeletePicture,
  onContinue,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    soundManager.playClick();
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const customItem: PictureItem = {
          id: `custom_${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, '').slice(0, 16) || 'My Photo',
          src: dataUrl,
          isCustom: true,
        };
        onUploadPicture(customItem);
      }
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be selected if needed
    e.target.value = '';
  };

  const handleCardClick = (id: string) => {
    soundManager.playClick();
    onSelectPicture(id);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      {/* Title & Subtitle */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Image Puzzle
        </h1>
        <p className="mt-2 text-slate-400 text-sm sm:text-base">
          Solve a puzzle, advance to the next level
        </p>
      </div>

      {/* Picture Gallery Grid */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5 mb-8">
        {pictures.map((pic) => {
          const isSelected = pic.id === selectedPictureId;
          return (
            <div
              key={pic.id}
              role="button"
              tabIndex={0}
              onClick={() => handleCardClick(pic.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardClick(pic.id);
                }
              }}
              className={`
                group relative aspect-square rounded-2xl overflow-hidden cursor-pointer
                transition-all duration-200 ease-out border text-left
                ${
                  isSelected
                    ? 'ring-3 ring-emerald-400 border-emerald-400/80 shadow-lg shadow-emerald-500/20 scale-[1.02]'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:scale-[1.01]'
                }
              `}
            >
              {/* Image */}
              <img
                src={pic.src}
                alt={pic.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />

              {/* Title & Badge */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <span className="font-semibold text-white text-sm truncate drop-shadow-sm">
                  {pic.name}
                </span>
                {isSelected && (
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 shadow">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                )}
              </div>

              {/* Delete button for custom pictures */}
              {pic.isCustom && onDeletePicture && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    soundManager.playClick();
                    onDeletePicture(pic.id);
                  }}
                  title="Remove uploaded image"
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-slate-300 hover:text-red-400 hover:bg-black/80 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}

        {/* Upload Custom Picture Card */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            soundManager.playClick();
            fileInputRef.current?.click();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className="group relative aspect-square rounded-2xl border-2 border-dashed border-slate-700 hover:border-emerald-400/60 bg-slate-900/40 hover:bg-slate-900/80 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center p-4 text-center"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="w-12 h-12 rounded-xl bg-slate-800 group-hover:bg-emerald-500/20 text-slate-400 group-hover:text-emerald-400 flex items-center justify-center mb-2.5 transition-colors">
            <Upload className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-200 group-hover:text-white">
            Upload Photo
          </span>
          <span className="text-[11px] text-slate-500 mt-1">From your device</span>
        </div>
      </div>

      {/* Continue CTA */}
      <div className="w-full max-w-xs">
        <button
          onClick={() => {
            soundManager.playClick();
            onContinue();
          }}
          disabled={!selectedPictureId}
          className={`
            w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2
            transition-all duration-150 shadow-md cursor-pointer
            ${
              selectedPictureId
                ? 'bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
            }
          `}
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
