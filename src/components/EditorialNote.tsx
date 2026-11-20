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
      className="mb-8 bg-white border-2 border-[#7a1f2b]/40 border-l-4 border-l-[#7a1f2b] rounded shadow-md"
      id="editorial-note-why-we-exist"
      aria-labelledby="editorial-note-title"
    >
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-[#7a1f2b]/25 bg-[#f8eff1]">
        <span className="flex items-center gap-2 font-mono text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#7a1f2b]">
          <BookOpen size={14} />
          Editorial Note: Why We Exist
        </span>
        <button
          type="button"
          onClick={toggle}
          aria-expanded={!folded}
          aria-controls="editorial-note-body"
          className="flex items-center gap-1 font-mono text-[10px] font-bold uppercase text-stone-700 border border-[#7a1f2b]/40 bg-white hover:bg-[#f8eff1] px-2.5 py-1 rounded cursor-pointer"
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
          <p className="mt-4 border-l-4 border-[#9b2c3b] pl-4 font-serif italic text-lg sm:text-xl text-[#7a1f2b] leading-snug">
            There is no shortage of commentary. What is in short supply is accountability.
          </p>

          <div className="mt-6 space-y-4 font-sans text-[15px] leading-relaxed text-stone-800">
            <p>
              The Ceylon Review is an independent publication on justice: law, human rights, and the public affairs that
              decide who is protected and who is left exposed. It is written for readers who want more than a headline
              — who understand that a court ruling is also a political act, that a piece of legislation carries the
              weight of its colonial origins, that what is called security is sometimes the name given to impunity.
            </p>
            <p>
              We write from Sri Lanka, and we write about Sri Lanka. But we do not write only for Sri Lanka. The
              dynamics we examine — emergency law that outlasts its emergency, counter-terrorism frameworks that
              criminalise dissent, the slow violence of institutional indifference, the starvation and bombing of
              civilians — are not unique to this island. They are the unfinished business of the postcolonial world.
            </p>
            <p>
              <strong className="font-bold text-stone-900">A note on the publication name.</strong> Ceylon is a colonial
              name, and we use it deliberately. This island was colonised three times — by the Portuguese, the Dutch and
              the British — across more than four centuries, and its people resisted each of them until independence in
              1948. We carry the name not in nostalgia for empire but as a claim: those who know what it is to be ruled
              without consent, and to fight for freedom, have standing to speak for justice wherever people are denied
              it. The systems we scrutinise did not emerge from nowhere. They were designed, exported, inherited, and in
              many cases preserved with care. Understanding the present requires naming the past accurately.
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

          <p className="mt-6 flex items-center gap-2 font-mono text-xs font-black uppercase tracking-wider text-[#7a1f2b]">
            <Sparkles size={14} />
            Everything is connected. Nothing is neutral.
          </p>

          <div className="mt-6 pt-4 border-t border-[#7a1f2b]/25 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
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
