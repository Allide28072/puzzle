import React, { useState } from 'react';
import { Download, Share2, X, Smartphone, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallPromptProps {
  compact?: boolean;
}

export const InstallPrompt: React.FC<InstallPromptProps> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (compact) {
    if (isInstallable) {
      return (
        <button
          onClick={install}
          title="Install app"
          aria-label="Install app on device"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all cursor-pointer whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install</span>
        </button>
      );
    }
    if (isIOS) {
      return (
        <>
          <button
            onClick={() => setShowIOSModal(true)}
            title="Install on iOS"
            aria-label="Install on iPhone or iPad"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all cursor-pointer whitespace-nowrap"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>

          {showIOSModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
              <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-semibold text-white">Install on iPhone / iPad</h3>
                  </div>
                  <button
                    onClick={() => setShowIOSModal(false)}
                    className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-4 space-y-3 text-sm text-slate-300">
                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-800">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold shrink-0">
                      1
                    </span>
                    <p>
                      Tap the <strong className="text-white">Share</strong> button in Safari toolbar (<Share2 className="w-3.5 h-3.5 inline mx-0.5 text-blue-400" />).
                    </p>
                  </div>
                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-800">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold shrink-0">
                      2
                    </span>
                    <p>
                      Scroll down and tap <strong className="text-white">Add to Home Screen</strong>.
                    </p>
                  </div>
                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-800">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold shrink-0">
                      3
                    </span>
                    <p>Launch Puzzle Play from your home screen anytime, offline!</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSModal(false)}
                  className="mt-5 w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-white transition-colors"
                >
                  Got it
                </button>
              </div>
            </div>
          )}
        </>
      );
    }
    return null;
  }

  // Full banner mode (e.g. at bottom or top of screen if installable and not dismissed)
  if (dismissed || (!isInstallable && !isIOS)) {
    return null;
  }

  return (
    <div className="w-full max-w-md mx-auto mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800/90 border border-emerald-500/30 shadow-lg text-slate-100 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
          <Download className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-white tracking-wide uppercase">Install Puzzle Play</p>
          <p className="text-xs text-slate-400 truncate">Play fullscreen anytime, even offline</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isInstallable ? (
          <button
            onClick={install}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 active:scale-95 transition-all shadow-sm"
          >
            Install
          </button>
        ) : (
          <button
            onClick={() => setShowIOSModal(true)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 active:scale-95 transition-all shadow-sm"
          >
            How to Install
          </button>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-md text-slate-500 hover:text-slate-300 transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold text-white">Install on iPhone / iPad</h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-800">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold shrink-0">
                  1
                </span>
                <p>
                  Tap the <strong className="text-white">Share</strong> icon in Safari toolbar (<Share2 className="w-3.5 h-3.5 inline mx-0.5 text-blue-400" />).
                </p>
              </div>
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-800">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold shrink-0">
                  2
                </span>
                <p>
                  Scroll down and tap <strong className="text-white">Add to Home Screen</strong>.
                </p>
              </div>
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-800">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold shrink-0">
                  3
                </span>
                <p>Enjoy offline play with zero distractions!</p>
              </div>
            </div>
            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-5 w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-sm font-semibold text-slate-950 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
