// Vercel serverless function: GET /share/:id  (rewritten to /api/article?id=:id)
// Returns a small HTML page with Open Graph / Twitter tags for one article, so a shared
// link shows that article's title, summary and cover image in WhatsApp, Facebook, X, etc.
// People who open the link are sent on to the normal site at /?article=:id.

// Public web config (the same values shipped in the site's own JavaScript).
const cfg = {
  projectId: 'gen-lang-client-0240728514',
  firestoreDatabaseId: 'ai-studio-theceylonreview-8f6bff53-af7a-4544-86a1-73cbef1af2f1',
  apiKey: 'AIzaSyAQa2UZ3VCtUEe7CYx1vtWt6XFgRRLb9cM',
};

const SITE = 'https://www.theceylonreview.lk';
const DEFAULT_IMAGE = SITE + '/icon-512.png';

// Covers that the site swaps in on the client (see withPublishedCovers in src/firebase.ts).
const COVER_OVERRIDES = {
  'art-gaza-ceasefire-day-410': '/images/gaza-day-410-cover.jpg',
  'art-sudan-drone-war': '/images/sudan-drones-cover-2.jpg',
  'art-saleh-aljafarawi': '/images/saleh-aljafarawi-tribute.jpg',
  'art-sunflower-circle-fundraiser': '/images/fundraiser/table-from-above.jpg',
  'art-gaza-floods': '/images/gaza-floods/flooded-camp.jpg',
  'art-manufactured-silence': '/images/hasbara-flag.jpg',
  'art-colonial-law': '/images/psta-protest-parliament.jpg',
  'art-behind-the-screen': '/images/behind-the-screen-cover-2.jpg',
  'art-rohingya-genocide-icj': '/images/rohingya-judgment-cover.jpg',
};

// Fallback headlines for share previews when the article is not (yet) in the database.
const FALLBACK = {
 "art-gaza-ceasefire-day-410": {"t": "Five Killed Before Mid-Morning, Operating Rooms Shut: Gaza on the 410th Day of the Ceasefire", "d": "Between midnight and 10:30 a.m. on 25 November 2026, five Palestinians were killed in Israeli shelling and gunfire across Gaza, according to Radio Alam’s correspondent. Gaza’s Health Ministry said Al-Oyoun Hospital’s operating rooms stopped after a generator shut down at Al-Rantisi Hospital. The Gaza Government Media Office counts 1,690 killed in 410 days of ceasefire."},
 "art-sudan-drone-war": {"t": "Death from the Sky: Who Arms Sudan's Drone War", "d": "More than 1,630 of the 2,230 civilian deaths verified by the UN Human Rights Office in Sudan between January and October 2026 were caused by drone strikes. A UN inquiry has mapped a UAE-linked supply network to the RSF, which the UAE denies. Drones flown by the army have been linked to Türkiye, Egypt and Iran. The UN arms embargo covers Darfur alone."},
 "art-manufactured-silence": {"t": "The Manufactured Silence: Hasbara, Hate Speech, and the War on Truth", "d": "An investigation into Hasbara: the Israeli government’s public-diplomacy effort, and what it means for Sri Lanka."},
 "art-saleh-aljafarawi": {
  "t": "Saleh Aljafarawi, 27: A Journalist Remembered, and the Toll Behind His Name",
  "d": "Saleh Aljafarawi, a 27-year-old Gaza journalist, was shot dead in Sabra on 12 October 2025. Accounts of the killing differ, and no court has examined it. His case sits within a toll of at least 209 journalists, according to CPJ, and 263 according to Gaza’s media office."
 },
 "art-sunflower-circle-fundraiser": {
  "t": "An Afternoon of Art and Breath at The Fearless Space",
  "d": "On 22 November the Sunflower Circle held a fundraiser at The Fearless Space in Colombo 5. All funds raised go to Al Noor Educational Classes, a school in Gaza, to help it through the winter."
 },
 "art-fergie-chambers": {
  "t": "Lost in Translation: The Case Against Fergie Chambers",
  "d": "Fergie Chambers was freed on bail in Spain on 20 November after the US admitted three errors in the Spanish translation of its evidence. He denies every allegation and is not charged with terrorism. A UN rapporteur, lawyers, and pro-Palestinian protesters have backed him."
 },
 "art-gaza-floods": {
  "t": "Tents Are Not Shelter: What Gaza’s First Winter Storm Did, in the Numbers",
  "d": "Tents were flooded across Gaza by the first winter storm of 6–8 November. Over 6,000 family shelters were destroyed, according to OCHA, and five people were killed when a sandy hill collapsed. More than 150,000 tents are held outside Gaza. Different explanations are given by Israel and aid groups."
 },
 "art-colonial-law": {
  "t": "Forty-Seven Years of a “Temporary” Law: The PTA and What Replaces It",
  "d": "Parliament has yet to vote on a bill meant to replace the Prevention of Terrorism Act. Rights groups say it keeps the old powers. UN experts call it much improved. This is what each side has actually said."
 },
 "art-rohingya-genocide-icj": {
  "t": "Nine Years After the Burning: The World Court Finds Myanmar Responsible for Genocide Against the Rohingya",
  "d": "On 19 November 2026 the International Court of Justice found, by 9 votes to 6, that Myanmar committed genocide against the Rohingya. At least 10,000 were killed, according to the Court, and at least 1,834 rapes were recorded. Myanmar denies it. The Court cannot enforce its ruling."
 },
 "art-behind-the-screen": {
  "t": "Behind the Screen: Online Harassment of Women and Children in Sri Lanka",
  "d": "A 2025 UNFPA and UN Women study found that 64% of surveyed survivors of technology-facilitated violence in Sri Lanka withdrew from social media. The National Child Protection Authority recorded 151 and 150 cyberbullying complaints involving nude photographs in 2024 and 2025. Thanzeela Osman asks what must change."
 }
};

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function absolute(url) {
  if (!url) return DEFAULT_IMAGE;
  if (/^https?:\/\//i.test(url)) return url;
  return SITE + (url.startsWith('/') ? url : '/' + url);
}

export default async function handler(req, res) {
  const id = String(req.query.id || '').trim();
  const valid = /^[A-Za-z0-9_-]{1,120}$/.test(id);
  let title = 'The Ceylon Review';
  let desc = 'An independent publication on law, human rights and global justice, from Sri Lanka.';
  let image = DEFAULT_IMAGE;

  if (valid && FALLBACK[id]) {
    title = FALLBACK[id].t;
    desc = FALLBACK[id].d;
  }

  if (valid) {
    try {
      const url =
        `https://firestore.googleapis.com/v1/projects/${cfg.projectId}/databases/${cfg.firestoreDatabaseId}` +
        `/documents/articles/${encodeURIComponent(id)}?key=${cfg.apiKey}`;
      const r = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (r.ok) {
        const f = (await r.json()).fields || {};
        const str = (k) => (f[k] && f[k].stringValue) || '';
        title = str('title') || title;
        desc = str('summary') || str('subtitle') || desc;
        let img = str('imageUrl');
        if (COVER_OVERRIDES[id] && (!img || img.includes('images.unsplash.com'))) img = COVER_OVERRIDES[id];
        image = absolute(img);
      }
      else if (COVER_OVERRIDES[id]) image = absolute(COVER_OVERRIDES[id]);
    } catch {
      /* fall back to the article's own cover where known, else site defaults */
      if (COVER_OVERRIDES[id]) image = absolute(COVER_OVERRIDES[id]);
    }
  }

  const target = valid ? `${SITE}/?article=${encodeURIComponent(id)}` : SITE + '/';
  const shareUrl = valid ? `${SITE}/share/${encodeURIComponent(id)}` : SITE + '/';
  const d = desc.length > 300 ? desc.slice(0, 297).trimEnd() + '…' : desc;

  // Best path: serve the real site page (index.html) with THIS article's tags swapped in.
  // Crawlers and people get the identical page, so there is no redirect for a crawler to follow
  // and nothing depends on recognising a crawler. The site's script then opens the article.
  const tags = [
    `<title>${esc(title === 'The Ceylon Review' ? title : title + ' — The Ceylon Review')}</title>`,
    `<meta name="description" content="${esc(d)}" />`,
    `<link rel="canonical" href="${esc(shareUrl)}" />`,
    `<meta property="og:type" content="article" />`,
    `<meta property="og:site_name" content="The Ceylon Review" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(d)}" />`,
    `<meta property="og:url" content="${esc(shareUrl)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta property="og:image:alt" content="${esc(title)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(d)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
  ].join('\n    ');
  if (valid) {
    try {
      const pr = await fetch(SITE + '/index.html', { signal: AbortSignal.timeout(6000) });
      if (pr.ok) {
        let page = await pr.text();
        if (/<\/head>/i.test(page) && /<div id="root">/.test(page)) {
          page = page
            .replace(/<title>[\s\S]*?<\/title>/i, '')
            .replace(/<link\s+rel="canonical"[^>]*>/gi, '')
            .replace(/<meta\s+(?:name|property)="(?:description|og:[^"]*|twitter:[^"]*)"[^>]*>/gi, '')
            .replace(/<\/head>/i, `    ${tags}\n  </head>`);
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600');
          res.status(200).send(page);
          return;
        }
      }
    } catch {
      /* fall through to the small preview page below */
    }
  }

  // Link-preview crawlers (Facebook, WhatsApp, X, LinkedIn...) must read this page's own
  // meta tags, and some follow a redirect and use the destination's tags instead. So crawlers
  // get the page; everyone else is sent straight to the article.
  const ua = String(req.headers['user-agent'] || '');
  const isCrawler = /facebookexternalhit|facebot|meta-externalagent|meta-externalfetcher|whatsapp|twitterbot|linkedinbot|slackbot|telegrambot|discordbot|skypeuripreview|pinterest|googlebot|bingbot|applebot|embedly|vkshare|redditbot|bot\b|crawler|spider|preview/i.test(ua);
  if (!isCrawler) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Location', target);
    res.status(302).end();
    return;
  }

  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title === "The Ceylon Review" ? title : title + " — The Ceylon Review")}</title>
<meta name="description" content="${esc(d)}" />
<link rel="canonical" href="${esc(shareUrl)}" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="The Ceylon Review" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(d)}" />
<meta property="og:url" content="${esc(shareUrl)}" />
<meta property="og:image" content="${esc(image)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(d)}" />
<meta name="twitter:image" content="${esc(image)}" />
</head><body><p><a href="${esc(target)}">${esc(title)}</a></p></body></html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600');
  res.setHeader('Vary', 'User-Agent');
  res.status(200).send(html);
}
