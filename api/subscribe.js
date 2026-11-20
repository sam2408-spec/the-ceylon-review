// Vercel serverless function: POST /api/subscribe  { email }
// Sends (1) a notification to the editor's inbox and (2) a thank-you note to the subscriber,
// using the Resend email API. Required environment variable: RESEND_API_KEY
// Optional: SUBSCRIBE_FROM (default "The Ceylon Review <hello@theceylonreview.lk>"),
//           NOTIFY_TO (default theceylonreview@proton.me)

const EMAIL_RE = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;
const hits = new Map(); // tiny per-instance rate limit: IP -> [timestamps]

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

async function send(apiKey, payload) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`resend ${r.status}`);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method' });

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {};
  const email = String(body.email || '').trim().toLowerCase();

  // Honeypot: real readers never fill this hidden field
  if (body.website) return res.status(200).json({ ok: true });

  if (!EMAIL_RE.test(email) || email.length > 200) {
    return res.status(400).json({ ok: false, error: 'invalid' });
  }
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) return res.status(429).json({ ok: false, error: 'rate' });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(503).json({ ok: false, error: 'not-configured' });

  const from = process.env.SUBSCRIBE_FROM || 'The Ceylon Review <hello@theceylonreview.lk>';
  const notifyTo = process.env.NOTIFY_TO || 'theceylonreview@proton.me';
  const when = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Colombo' });

  try {
    // 1. Notify the editor (this is the one that must succeed)
    await send(apiKey, {
      from,
      to: [notifyTo],
      reply_to: email,
      subject: `New subscriber: ${email}`,
      html: `<p>A reader subscribed to The Ceylon Review.</p><p><strong>${esc(email)}</strong><br>${esc(when)} (Sri Lanka time)</p>`,
      text: `A reader subscribed to The Ceylon Review.\n\n${email}\n${when} (Sri Lanka time)`,
    });

    // 2. Thank-you note to the subscriber (best effort)
    await send(apiKey, {
      from,
      to: [email],
      reply_to: notifyTo,
      subject: 'Thank you for subscribing to The Ceylon Review',
      html: `<div style="font-family:Georgia,serif;max-width:520px;margin:auto;color:#1c1917;line-height:1.6">
<h2 style="color:#991b1b;margin-bottom:4px">Thank you for subscribing</h2>
<p>Dear reader,</p>
<p>Your email address has been added to The Ceylon Review's list. We will write to you when new dispatches are published.</p>
<p>The Ceylon Review exists for people who need the attention of the world, support and to be seen. Thank you for reading, and for paying attention.</p>
<p style="font-style:italic;color:#991b1b">Everything is connected. Nothing is neutral.</p>
<p>— Sameera Mahboobdeen<br>Founder &amp; Editorial Director, The Ceylon Review<br><a href="https://www.theceylonreview.lk">www.theceylonreview.lk</a></p>
<p style="font-size:12px;color:#57534e">If you did not subscribe, or you wish to unsubscribe, simply reply to this email and we will remove your address.</p>
</div>`,
      text: `Thank you for subscribing to The Ceylon Review.\n\nYour email address has been added to our list. We will write to you when new dispatches are published.\n\nThe Ceylon Review exists for people who need the attention of the world, support and to be seen. Thank you for reading, and for paying attention.\n\nEverything is connected. Nothing is neutral.\n\n— Sameera Mahboobdeen\nFounder & Editorial Director, The Ceylon Review\nhttps://www.theceylonreview.lk\n\nIf you did not subscribe, or you wish to unsubscribe, reply to this email and we will remove your address.`,
    }).catch(() => {});

    return res.status(200).json({ ok: true });
  } catch {
    return res.status(502).json({ ok: false, error: 'send-failed' });
  }
}

function safeParse(s) {
  try { return JSON.parse(s); } catch { return {}; }
}
