import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Mail, X, CheckCircle2 } from 'lucide-react';
import { addSubscriber } from '../firebase';

interface SubscribeModalProps {
  onClose: () => void;
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const FALLBACK_MAIL =
  'mailto:theceylonreview@proton.me?subject=Subscribe%20me%20to%20The%20Ceylon%20Review&body=Please%20add%20this%20email%20address%20to%20The%20Ceylon%20Review%20subscriber%20list.';

export default function SubscribeModal({ onClose }: SubscribeModalProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    if (!EMAIL_RE.test(email.trim()) || email.length > 200) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }
    setStatus('sending');
    try {
      await Promise.race([
        addSubscriber(email),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000)),
      ]);
      setStatus('done');
    } catch {
      setStatus('error');
      setMessage('We could not save your address just now.');
    }
  };

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
        className="relative w-full max-w-md bg-white rounded border-2 border-[#991b1b] shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 text-stone-600 hover:text-stone-900 cursor-pointer"
        >
          <X size={18} />
        </button>

        {status === 'done' ? (
          <div className="text-center py-4">
            <CheckCircle2 size={40} className="mx-auto text-[#007A3D] mb-3" />
            <h2 id="subscribe-title" className="font-serif font-black text-2xl text-stone-900">You are subscribed</h2>
            <p className="font-sans text-sm text-stone-700 mt-2">
              Thank you. We will write to <strong>{email.trim()}</strong> when new dispatches are published.
            </p>
            <button
              onClick={onClose}
              className="mt-5 bg-[#991b1b] hover:bg-[#b91c1c] text-white font-sans font-bold text-xs uppercase tracking-wider px-5 py-2 rounded cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <h2 id="subscribe-title" className="font-serif font-black text-2xl text-stone-900 pr-6">
              Subscribe to The Ceylon Review
            </h2>
            <p className="font-sans text-sm text-stone-700 mt-2">
              Get new dispatches by email. We never sell or share your address, and you can unsubscribe at any time.
            </p>
            <label htmlFor="subscribe-email" className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#991b1b] mt-4 mb-1">
              Email address
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#991b1b]" />
              <input
                id="subscribe-email"
                ref={inputRef}
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === 'error') setStatus('idle');
                }}
                placeholder="you@example.com"
                className="w-full border-2 border-[#991b1b]/40 focus:border-[#dc2626] focus:outline-none rounded pl-9 pr-3 py-2.5 text-sm font-sans text-stone-900 placeholder-gray-500"
              />
            </div>
            {status === 'error' && (
              <p role="alert" className="mt-2 text-xs font-sans font-semibold text-[#991b1b]">
                {message}{' '}
                {message.startsWith('We could not') && (
                  <a href={FALLBACK_MAIL} className="underline">Subscribe by email instead</a>
                )}
              </p>
            )}
            <button
              type="submit"
              disabled={status === 'sending'}
              className="mt-4 w-full bg-[#991b1b] hover:bg-[#b91c1c] disabled:opacity-70 text-white font-sans font-bold text-xs uppercase tracking-wider py-2.5 rounded cursor-pointer transition-colors"
            >
              {status === 'sending' ? 'Subscribing…' : 'Subscribe'}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
