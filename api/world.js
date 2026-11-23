// Vercel serverless function: GET /api/world?region=sudan
// Live headlines for a region tab. Headlines come from public news search feeds and link
// back to the publisher; The Ceylon Review does not edit them. region=world returns a mix
// of world headlines from the same feeds that power the World Flash ticker.

const GOOGLE = (q) => `https://news.google.com/rss/search?q=${encodeURIComponent(q + ' when:3d')}&hl=en&gl=US&ceid=US:en`;

const REGIONS = {
  palestine: GOOGLE('Gaza OR Palestine OR "West Bank"'),
  'sri-lanka': GOOGLE('"Sri Lanka"'),
  sudan: GOOGLE('Sudan OR Darfur OR Khartoum'),
  congo: GOOGLE('Congo OR DRC OR Goma OR Kivu'),
  syria: GOOGLE('Syria OR Damascus'),
  lebanon: GOOGLE('Lebanon OR Beirut'),
  cuba: GOOGLE('Cuba OR Havana'),
};

const WORLD_FEEDS = [
  { source: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml' },
  { source: 'Middle East Eye', url: 'https://www.middleeasteye.net/rss' },
  { source: 'The New Humanitarian', url: 'https://www.thenewhumanitarian.org/rss.xml' },
  { source: 'Democracy Now', url: 'https://www.democracynow.org/democracynow.rss' },
  { source: 'UN News', url: 'https://news.un.org/feed/subscribe/en/news/all/rss.xml' },
];

const SKIP_LINK = /\/(sport|sports|football|lifeandstyle|culture|film|music|fashion|travel|video)\//i;

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

export function parseFeed(xml, fallbackSource, limit) {
  const items = [];
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || [];
  for (const block of blocks) {
    let title = pick(block, 'title');
    const link = pick(block, 'link');
    let source = pick(block, 'source') || fallbackSource;
    // Search feeds append " - Publisher" to every headline.
    if (source && title.endsWith(' - ' + source)) title = title.slice(0, -(source.length + 3));
    const time = Date.parse(pick(block, 'pubDate') || pick(block, 'dc:date')) || 0;
    if (!title || !/^https?:\/\//.test(link) || SKIP_LINK.test(link)) continue;
    items.push({ title, link, source, time });
  }
  return items.sort((a, b) => b.time - a.time).slice(0, limit);
}

async function load(url, source, limit) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'user-agent': 'TheCeylonReviewRegions/1.0 (+https://www.theceylonreview.lk)' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return parseFeed(await res.text(), source, limit);
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req, res) {
  const region = String(req.query.region || 'world').toLowerCase();
  let tasks;
  if (region === 'world') tasks = WORLD_FEEDS.map((f) => load(f.url, f.source, 10));
  else if (REGIONS[region]) tasks = [load(REGIONS[region], '', 20)];
  else {
    res.status(400).json({ error: 'unknown region' });
    return;
  }

  const settled = await Promise.allSettled(tasks);
  const all = settled.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
  const seen = new Set();
  const items = all
    .sort((a, b) => b.time - a.time)
    .filter((it) => {
      const key = it.title.toLowerCase().slice(0, 70);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 20)
    .map(({ title, link, source, time }) => ({
      title,
      link,
      source,
      publishedAt: time ? new Date(time).toISOString() : null,
    }));

  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1800');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(200).json({ region, items, updatedAt: new Date().toISOString() });
}
