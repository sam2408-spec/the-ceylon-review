// Vercel serverless function: GET /api/gaza
// Latest reports about Gaza from public RSS feeds, for the "From Gaza" column.
// Headlines link back to the publisher. Only items whose title is about Gaza are kept.

const FEEDS = [
  { source: 'AL JAZEERA', url: 'https://www.aljazeera.com/xml/rss/all.xml' },
  { source: 'MIDDLE EAST EYE', url: 'https://www.middleeasteye.net/rss' },
  { source: 'MONDOWEISS', url: 'https://mondoweiss.net/feed/' },
  { source: 'ELECTRONIC INTIFADA', url: 'https://electronicintifada.net/rss.xml' },
  { source: 'DEMOCRACY NOW', url: 'https://www.democracynow.org/democracynow.rss' },
];

const GAZA =
  /\b(gaza\w*|rafah|khan y[ou]nis|jabalia|deir al[- ]balah|beit hanoun|beit lahia|nuseirat|al[- ]shifa|gaza city|strip|rafah crossing|flotilla)\b/i;

const SKIP_LINK = /\/(sport|sports|football|lifeandstyle|culture|film|music|fashion|travel|video)\//i;

const PER_FEED = 5;
const MAX_ITEMS = 14;

function decode(text) {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, ' ')
    .trim();
}

function pick(block, tag) {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  return m ? decode(m[1]) : '';
}

function parseFeed(xml, source) {
  const items = [];
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || [];
  for (const block of blocks) {
    const title = pick(block, 'title');
    const link = pick(block, 'link');
    const date = Date.parse(pick(block, 'pubDate') || pick(block, 'dc:date')) || 0;
    if (!title || !/^https?:\/\//.test(link) || SKIP_LINK.test(link)) continue;
    if (!GAZA.test(title)) continue;
    items.push({ title, link, source, time: date });
  }
  return items.sort((a, b) => b.time - a.time).slice(0, PER_FEED);
}

async function loadFeed({ source, url }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'user-agent': 'TheCeylonReviewGaza/1.0 (+https://www.theceylonreview.lk)' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return parseFeed(await res.text(), source);
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req, res) {
  const settled = await Promise.allSettled(FEEDS.map(loadFeed));
  const all = settled.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));

  const seen = new Set();
  const items = all
    .sort((a, b) => b.time - a.time)
    .filter((it) => {
      const key = it.title.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, MAX_ITEMS)
    .map(({ title, link, source, time }) => ({
      title,
      link,
      source,
      publishedAt: time ? new Date(time).toISOString() : null,
    }));

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=900');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(items.length ? 200 : 502).json({
    items,
    sources: settled.map((r, i) => ({ source: FEEDS[i].source, ok: r.status === 'fulfilled', count: r.status === 'fulfilled' ? r.value.length : 0 })),
    updatedAt: new Date().toISOString(),
  });
}
