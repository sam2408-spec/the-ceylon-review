import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink } from 'lucide-react';

interface SubscribeModalProps {
  onClose: () => void;
}

const SUBSTACK_URL = 'https://theceylonreview.substack.com';

// Subscriptions are handled by Substack: it stores the address, sends the welcome
// email and delivers each newsletter. The sign-up box below is Substack's own.
export default function SubscribeModal({ onClose }: SubscribeModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
      id="subscribe-overlay"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="subscribe-title"
        className="relative w-full max-w-md bg-white rounded border-2 border-[#7a1f2b] shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 text-stone-600 hover:text-stone-900 cursor-pointer"
        >
          <X size={18} />
        </button>

        <h2 id="subscribe-title" className="font-serif font-black text-2xl text-stone-900 pr-6">
          Subscribe to The Ceylon Review
        </h2>
        <p className="font-sans text-sm text-stone-700 mt-2">
          Get new dispatches by email. We never sell or share your address, and you can unsubscribe at any time. Emails are sent through Substack.
        </p>

        <iframe
          title="Subscribe to The Ceylon Review on Substack"
          src={`${SUBSTACK_URL}/embed`}
          className="w-full mt-4 border border-stone-200 rounded bg-white"
          style={{ height: 320 }}
          frameBorder={0}
          scrolling="no"
        />

        <a
          href={`${SUBSTACK_URL}/subscribe`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-sans font-bold text-[#7a1f2b] underline underline-offset-2"
        >
          Box not showing? Subscribe on Substack <ExternalLink size={12} />
        </a>
      </div>
    </div>,
    document.body
  );
}
