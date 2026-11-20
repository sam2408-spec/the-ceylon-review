import React, { useState } from 'react';
import { BookOpen, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'the_ceylon_review_note_folded';

function readFolded(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export default function EditorialNote() {
  const [folded, setFolded] = useState<boolean>(readFolded);

  const toggle = () => {
    const next = !folded;
    setFolded(next);
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // storage unavailable: the note still folds for this visit
    }
  };

  return (
    <section
      className="mb-8 bg-white border-2 border-[#991b1b]/40 border-l-4 border-l-[#991b1b] rounded shadow-md"
      id="editorial-note-why-we-exist"
      aria-labelledby="editorial-note-title"
    >
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-[#991b1b]/25 bg-red-50">
        <span className="flex items-center gap-2 font-mono text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#991b1b]">
          <BookOpen size={14} />
          Editorial Note: Why We Exist
        </span>
        <button
          type="button"
          onClick={toggle}
          aria-expanded={!folded}
          aria-controls="editorial-note-body"
          className="flex items-center gap-1 font-mono text-[10px] font-bold uppercase text-stone-700 border border-[#991b1b]/40 bg-white hover:bg-red-50 px-2.5 py-1 rounded cursor-pointer"
        >
          {folded ? 'Read Note' : 'Fold Note'}
          {folded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
        </button>
      </div>

      {!folded && (
        <div className="px-5 sm:px-8 py-6 max-w-4xl" id="editorial-note-body">
          <h2
            id="editorial-note-title"
            className="font-serif text-2xl sm:text-3xl font-black uppercase tracking-tight text-stone-900 leading-tight"
          >
            The Ceylon Review — A Note on Why We Exist
          </h2>
          <p className="mt-4 border-l-4 border-[#dc2626] pl-4 font-serif italic text-lg sm:text-xl text-[#991b1b] leading-snug">
            There is no shortage of commentary. What is in short supply is accountability.
          </p>

          <div className="mt-6 space-y-4 font-sans text-[15px] leading-relaxed text-stone-800">
            <p>
              Sri Lanka has no shortage of media. It has newspapers that report, broadcasters that transmit, and social
              feeds that churn without pause. What it has lacked — and what this publication exists to provide — is a
              space for sustained, rigorous, independent analysis of the systems that govern public life: the laws that
              constrain or liberate, the institutions that protect or prey, the historical forces that explain why
              things are as they are and not otherwise.
            </p>
            <p>
              The Ceylon Review is an independent publication covering law, politics, human rights, and public affairs.
              It is written for readers who want more than a headline — who understand that a court ruling is also a
              political act, that a piece of legislation carries the weight of its colonial origins, that what is called
              security is sometimes the name given to impunity.
            </p>
            <p>
              We write from Sri Lanka, and we write about Sri Lanka. But we do not write only for Sri Lanka. The
              dynamics we examine — emergency law that outlasts its emergency, counter-terrorism frameworks that
              criminalise dissent, the slow violence of institutional indifference — are not unique to this island. They
              are the unfinished business of the postcolonial world.
            </p>
            <p>
              <strong className="font-bold text-stone-900">A note on the publication name.</strong> Ceylon is a colonial
              designation, and we use it deliberately. Not in nostalgia for empire, but as a reminder that the systems
              we scrutinise did not emerge from nowhere. They were designed, exported, inherited, and in many cases,
              preserved with care. Understanding the present requires naming the past accurately.
            </p>
            <p>
              We are committed to factual rigour, legal precision, and the kind of intellectual honesty that does not
              soften a finding because the finding is inconvenient. We will make arguments. We will follow evidence. We
              will not mistake balance for truth, or neutrality for objectivity.
            </p>
            <p>
              The Ceylon Review is published independently. It takes no direction from political parties, state
              institutions, or commercial sponsors. Its only obligation is to its readers and to the public interest
              those readers represent.
            </p>
          </div>

          <p className="mt-6 flex items-center gap-2 font-mono text-xs font-black uppercase tracking-wider text-[#991b1b]">
            <Sparkles size={14} />
            Everything is connected. Nothing is neutral.
          </p>

          <div className="mt-6 pt-4 border-t border-[#991b1b]/25 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <p className="font-mono text-[10px] uppercase tracking-widest text-stone-500">
              Ceylon Editorial Desk Gazette • Vol. I No. I
            </p>
            <div className="sm:text-right">
              <p className="font-serif italic font-bold text-lg text-stone-900">— Sameera Mahboobdeen</p>
              <p className="font-mono text-[10px] text-stone-500">(Founder &amp; Editorial Director, June 2026)</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
