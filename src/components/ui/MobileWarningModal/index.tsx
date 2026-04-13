import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

const MOBILE_WARNING_ACK_KEY = 'mobile_warning_ack_v1';

function isMobileViewport(): boolean {
  return window.matchMedia('(max-width: 1023px)').matches;
}

export default function MobileWarningModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isAcknowledged = sessionStorage.getItem(MOBILE_WARNING_ACK_KEY) === '1';
    if (isAcknowledged) return;

    const mediaQuery = window.matchMedia('(max-width: 1023px)');
    const updateState = () => setOpen(isMobileViewport());

    updateState();

    mediaQuery.addEventListener('change', updateState);
    return () => mediaQuery.removeEventListener('change', updateState);
  }, []);

  const handleConfirm = () => {
    sessionStorage.setItem(MOBILE_WARNING_ACK_KEY, '1');
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/45" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-warning-title"
        className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl"
      >
        <div className="p-6 sm:p-7">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h2 id="mobile-warning-title" className="text-base font-semibold text-gray-900">
              Mobile Device Notice
            </h2>
          </div>

          <p className="text-sm leading-6 text-gray-600">
            You are accessing this dashboard on a mobile device. The experience may be limited,
            and some visualizations can look better on a larger screen.
          </p>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            For the best experience, we recommend accessing SiaSUS DW from a desktop or laptop.
          </p>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleConfirm}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              OK, continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
