// Vercel serverless function: GET /api/news
// Collects the latest world headlines from public RSS feeds so the site's
// top ticker can show "World Flash" news. Headlines link back to the publisher.

const FEEDS = [
  { source: 'AL JAZEERA', url: 'https://www.aljazeera.com/xml/rss/all.xml' },
  { source: 'MIDDLE EAST EYE', url: 'https://www.middleeasteye.net/rss' },
  { source: 'THE NEW HUMANITARIAN', url: 'https://www.thenewhumanitarian.org/rss.xml' },
  { source: 'MONDOWEISS', url: 'https://mondoweiss.net/feed/' },
  { source: 'DEMOCRACY NOW', url: 'https://www.democracynow.org/democracynow.rss' },
];

// The ticker only carries justice and humanitarian coverage: Palestine and Israel's
// war and occupation, Congo, Sudan, the Rohingya, and rights, law and accountability.
const TOPIC =
  /\b(gaza|palestin\w*|israel\w*|west bank|occupation|zionis\w*|netanyahu|idf|hamas|flotilla|lebanon|congo|drc|kivu|goma|m23|sudan\w*|darfur|khartoum|el[- ]fasher|rsf|rohingya|myanmar|rakhine|cox'?s bazar|genocide|war crimes?|icc|icj|international (criminal )?court|human rights|humanitarian|famine|starv\w*|refugee\w*|displace\w*|apartheid|sanctions|accountab\w*|justice|aid convoy|ceasefire|detention|torture|extrajudicial|terrorism law|anti-terror\w*)\b/i;

// Skip sport, weather/UK local, lifestyle and video-clip items: the ticker is for world news.
const SKIP_LINK = /\/(sport|sports|football|uk-news|lifeandstyle|culture|film|music|fashion|travel|video)\//i;

const PER_FEED = 6;
const MAX_ITEMS = 16;

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

export function parseFeed(xml, source) {
  const items = [];
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || [];
  for (const block of blocks) {
    const title = pick(block, 'title');
    const link = pick(block, 'link');
    const date = Date.parse(pick(block, 'pubDate') || pick(block, 'dc:date')) || 0;
    if (!title || !/^https?:\/\//.test(link) || SKIP_LINK.test(link)) continue;
    if (!TOPIC.test(title)) continue;
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
      headers: { 'user-agent': 'TheCeylonReviewTicker/1.0 (+https://www.theceylonreview.lk)' },
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

  // Cache at Vercel's edge for 5 minutes so the feeds are not hit on every visit.
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=900');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(items.length ? 200 : 502).json({ items, updatedAt: new Date().toISOString() });
}
