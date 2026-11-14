import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { usePWAInstall, useOnlineStatus } from '../hooks/usePWAInstall';
import { Smartphone, Share, PlusSquare, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showMobileGuide, setShowMobileGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleAction = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowMobileGuide(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleAction}
        className="px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold text-zinc-200 bg-[#18181b] hover:bg-[#222226] border border-zinc-800 rounded-full transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
      >
        <Smartphone className="w-3.5 h-3.5 text-[#25e86a]" />
        <span>{isInstallable ? 'Install App' : isIOS ? 'Install on iOS' : 'Phone App'}</span>
      </button>

      {showMobileGuide &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-guide-title"
          >
            <div className="w-full max-w-sm rounded-3xl bg-[#121214] border border-zinc-800 p-6 shadow-2xl space-y-4 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-[#25e86a]">Use On The Go</span>
                  <h3 id="pwa-guide-title" className="text-lg font-bold text-white mt-0.5">
                    Open as a Phone App
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMobileGuide(false)}
                  aria-label="Close app install guide"
                  className="p-1.5 rounded-full bg-[#1c1c1f] text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                Save <strong className="text-white">The Sparkly Drow</strong> to your phone’s Home Screen so it opens full-screen like a native app (no browser bars!) and works anywhere at the gym:
              </p>

              <div className="space-y-2.5 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#18181b] border border-zinc-800/90 flex items-start gap-2.5">
                  <Share className="w-4 h-4 text-[#25e86a] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white">1. Tap Share or Browser Menu</p>
                    <p className="text-zinc-400 mt-0.5">
                      On iPhone (Safari), tap the <strong className="text-white">Share</strong> icon at the bottom. On Android (Chrome), tap the <strong className="text-white">3-dot menu</strong>.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#18181b] border border-zinc-800/90 flex items-start gap-2.5">
                  <PlusSquare className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white">2. Tap “Add to Home Screen”</p>
                    <p className="text-zinc-400 mt-0.5">
                      Tap <strong className="text-white">Add to Home Screen</strong> (or <strong className="text-white">Install App</strong>) and launch it anytime from your home screen!
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowMobileGuide(false)}
                className="w-full py-2.5 rounded-full bg-[#25e86a] hover:bg-[#1ed760] text-black text-xs font-bold transition-colors"
              >
                Got It!
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 z-50 flex items-center gap-2 rounded-full bg-[#18181b] border border-zinc-800 px-3.5 py-2 text-xs font-bold text-white shadow-lg">
      <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
      Offline Mode — Your workouts & logs are saved on this device.
    </div>
  );
};
