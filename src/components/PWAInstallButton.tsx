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
        className="px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-2xl transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
      >
        <Smartphone className="w-3.5 h-3.5 text-pink-500" />
        <span>{isInstallable ? 'Install App' : isIOS ? 'Install on iOS' : 'Phone App'}</span>
      </button>

      {showMobileGuide &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 backdrop-blur-xs p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-guide-title"
          >
            <div className="w-full max-w-sm rounded-3xl bg-white border border-pink-200 p-6 shadow-xl space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-pink-500">Use On The Go</span>
                  <h3 id="pwa-guide-title" className="text-lg font-bold text-slate-900 mt-0.5">
                    Open as a Phone App
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMobileGuide(false)}
                  aria-label="Close app install guide"
                  className="p-1.5 rounded-xl text-slate-400 hover:text-pink-600 hover:bg-pink-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Save <strong>The Sparkly Drow</strong> to your phone’s Home Screen so it opens full-screen like a native app (no browser bars!) and works anywhere at the gym:
              </p>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-teal-50/60 border border-teal-200/80 flex items-start gap-2.5">
                  <Share className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900">1. Tap Share or Browser Menu</p>
                    <p className="text-slate-600 mt-0.5">
                      On iPhone (Safari), tap the <strong>Share</strong> icon at the bottom. On Android (Chrome), tap the <strong>3-dot menu</strong>.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-pink-50/60 border border-pink-200/80 flex items-start gap-2.5">
                  <PlusSquare className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900">2. Tap “Add to Home Screen”</p>
                    <p className="text-slate-600 mt-0.5">
                      Tap <strong>Add to Home Screen</strong> (or <strong>Install App</strong>) and launch it anytime from your home screen!
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowMobileGuide(false)}
                className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-pink-500 text-white text-xs font-bold hover:opacity-95 transition-opacity"
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
    <div className="fixed bottom-20 md:bottom-4 left-4 z-50 flex items-center gap-2 rounded-2xl bg-pink-600 px-3.5 py-2 text-xs font-bold text-white shadow-lg">
      <span className="h-2 w-2 rounded-full bg-teal-300 animate-pulse" />
      Offline Mode — Your workouts & logs are saved on this device.
    </div>
  );
};
