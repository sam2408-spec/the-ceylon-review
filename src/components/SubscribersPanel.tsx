import React, { useCallback, useEffect, useState } from 'react';
import { Copy, Download, RefreshCw, Trash2, Check } from 'lucide-react';
import { fetchSubscribers, deleteSubscriber, Subscriber } from '../firebase';

interface SubscribersPanelProps {
  signedIn: boolean;
}

export default function SubscribersPanel({ signedIn }: SubscribersPanelProps) {
  const [subs, setSubs] = useState<Subscriber[] | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setSubs(await fetchSubscribers());
    } catch {
      setSubs(null);
      setError('Could not load subscribers. Make sure you are signed in as the editor and that the "subscribers" rule is published in Firebase.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (signedIn) load();
  }, [signedIn, load]);

  const copyAll = async () => {
    if (!subs?.length) return;
    try {
      await navigator.clipboard.writeText(subs.map((s) => s.email).join(', '));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Copy was blocked by the browser. Use Download CSV instead.');
    }
  };

  const downloadCsv = () => {
    if (!subs?.length) return;
    const csv = 'email,subscribed_at\n' + subs.map((s) => `${s.email},${s.subscribedAt}`).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `the_ceylon_review_subscribers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const remove = async (id: string) => {
    try {
      await deleteSubscriber(id);
      setSubs((cur) => (cur || []).filter((s) => s.id !== id));
    } catch {
      setError('Could not remove that subscriber.');
    }
    setConfirmId(null);
  };

  const btn = 'flex items-center gap-1.5 border border-[#991b1b]/50 bg-white hover:bg-red-50 text-stone-900 px-3 py-1.5 rounded text-[10px] font-mono font-bold uppercase cursor-pointer disabled:opacity-50';

  return (
    <div className="space-y-4">
      <div className="pb-2 border-b border-[#991b1b]/30">
        <h3 className="font-serif font-black text-sm uppercase tracking-wide text-stone-900">
          Newsletter Subscribers{subs ? ` (${subs.length})` : ''}
        </h3>
        <p className="font-mono text-[9px] text-stone-600">Readers who signed up with the Subscribe button</p>
      </div>

      {!signedIn && (
        <p className="text-xs font-sans text-stone-700">Sign in with Google as the editor to see subscribers.</p>
      )}

      <div className="flex flex-wrap gap-2">
        <button onClick={load} disabled={loading || !signedIn} className={btn}>
          <RefreshCw size={11} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
        <button onClick={copyAll} disabled={!subs?.length} className={btn}>
          {copied ? <Check size={11} /> : <Copy size={11} />} {copied ? 'Copied' : 'Copy all emails'}
        </button>
        <button onClick={downloadCsv} disabled={!subs?.length} className={btn}>
          <Download size={11} /> Download CSV
        </button>
      </div>

      {error && <p role="alert" className="text-xs font-sans font-semibold text-[#991b1b]">{error}</p>}
      {subs && subs.length === 0 && <p className="text-xs font-sans text-stone-700">No subscribers yet.</p>}

      <ul className="divide-y divide-[#991b1b]/15 border border-[#991b1b]/25 rounded bg-white" hidden={!subs?.length}>
        {subs?.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-2 px-3 py-2">
            <div className="min-w-0">
              <div className="text-xs font-mono font-bold text-stone-900 truncate">{s.email}</div>
              <div className="text-[9px] font-mono text-stone-600">
                {s.subscribedAt ? new Date(s.subscribedAt).toLocaleString('en-GB', { timeZone: 'Asia/Colombo' }) : ''}
              </div>
            </div>
            {confirmId === s.id ? (
              <span className="flex items-center gap-2 shrink-0 text-[10px] font-mono font-bold">
                <button onClick={() => remove(s.id)} className="text-[#991b1b] underline cursor-pointer">Remove</button>
                <button onClick={() => setConfirmId(null)} className="text-stone-600 underline cursor-pointer">Cancel</button>
              </span>
            ) : (
              <button onClick={() => setConfirmId(s.id)} aria-label={`Remove ${s.email}`} className="text-stone-500 hover:text-[#991b1b] cursor-pointer shrink-0">
                <Trash2 size={14} />
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
