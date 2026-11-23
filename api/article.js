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
  'art-manufactured-silence': '/images/hasbara-flag.jpg',
  'art-colonial-law': '/images/psta-protest-parliament.jpg',
  'art-rohingya-genocide-icj': '/images/rohingya-judgment-cover.jpg',
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
    } catch {
      /* fall back to site defaults */
    }
  }

  const target = valid ? `${SITE}/?article=${encodeURIComponent(id)}` : SITE + '/';
  const shareUrl = valid ? `${SITE}/share/${encodeURIComponent(id)}` : SITE + '/';
  const d = desc.length > 300 ? desc.slice(0, 297).trimEnd() + '…' : desc;

  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title === "The Ceylon Review" ? title : title + " — The Ceylon Review")}</title>
<meta name="description" content="${esc(d)}" />
<link rel="canonical" href="${esc(shareUrl)}" />
<meta http-equiv="refresh" content="0; url=${esc(target)}" />
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
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
  res.status(200).send(html);
}
