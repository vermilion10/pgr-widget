/**
 * PGR SVG Widget — Cloudflare Pages Function
 *
 * Generates an embeddable SVG player card for Punishing: Gray Raven.
 * Design: Cyberpunk Glow — horizontal banner, avatar with game frame,
 *         stacked character showcase, and PGR logo top-right.
 *
 * Usage:
 *   <img src="/api/pgr-svg?uid=12584504&server=ap" width="460" />
 *
 * Query params:
 *   uid           — Player UID (default: 12584504)
 *   server        — ap | eu | na | kr | jp | tw | cn (default: ap)
 *   hide_sign     — Hide bio/signature (default: false)
 *   hide_chars    — Hide character showcase (default: false)
 *   accent        — Accent hex without # (default: ff4d6d)
 */

const HUAXU_API = 'https://api.huaxu.app';
const CARD_W = 460;
const CARD_H = 180;
const RADIUS = 14;

// System sans-serif stack matching iframe's Tailwind font-sans
const FONT = "ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif";

function esc(s) {
  return (s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function trunc(s, n) {
  return !s ? '' : s.length <= n ? s : s.substring(0, n - 1) + '…';
}

async function toBase64(url) {
  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'image/webp,image/*,*/*' },
    });
    if (!r.ok) return null;
    const buf = new Uint8Array(await r.arrayBuffer());
    let bin = '';
    for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
    const ct = r.headers.get('content-type') || 'image/webp';
    return `data:${ct};base64,${btoa(bin)}`;
  } catch {
    return null;
  }
}

function buildSvg(player, chars, accent) {
  const A = `#${accent}`;        // rose accent
  const A2 = `#4d9fff`;          // electric blue accent
  const BG = '#0d1117';          // GitHub dark base
  const SURFACE = '#161b22';     // GitHub dark surface
  const BORDER = '#21262d';      // subtle border
  const MUTED = '#8b949e';       // dim text (GitHub muted)
  const TEXT = '#c9d1d9';        // primary text
  const BRIGHT = '#f0f6fc';      // bright white

  const avatarX = 18;
  const avatarY = CARD_H / 2;
  const avatarR = 42;
  const avatarCX = avatarX + avatarR;
  const infoX = avatarX + avatarR * 2 + 16;

  // --- Defs ---
  const defs = `
    <defs>
      <clipPath id="av"><circle cx="${avatarCX}" cy="${avatarY}" r="${avatarR - 2}"/></clipPath>
      ${chars.map((_, i) => `<clipPath id="cc${i}"><circle cx="0" cy="0" r="22"/></clipPath>`).join('')}
      <radialGradient id="glow" cx="15%" cy="50%" r="55%">
        <stop offset="0%" stop-color="${A}" stop-opacity="0.10"/>
        <stop offset="50%" stop-color="${A2}" stop-opacity="0.04"/>
        <stop offset="100%" stop-color="${BG}" stop-opacity="0"/>
      </radialGradient>
      <filter id="blur4" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="4"/>
      </filter>
      <filter id="blur8" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="8"/>
      </filter>
    </defs>`;

  // --- Card base ---
  const card = `
    <rect width="${CARD_W}" height="${CARD_H}" rx="${RADIUS}" fill="${BG}"/>
    <rect width="${CARD_W}" height="${CARD_H}" rx="${RADIUS}" fill="url(#glow)"/>
    <rect width="${CARD_W}" height="${CARD_H}" rx="${RADIUS}" fill="none" stroke="${BORDER}" stroke-width="1"/>`;

  // Subtle left glow blob
  const glowBlob = `<ellipse cx="30" cy="${CARD_H / 2}" rx="70" ry="60" fill="${A}" opacity="0.05" filter="url(#blur8)"/>`;

  // --- Avatar ---
  let avatarSvg = '';
  // Background circle
  avatarSvg += `<circle cx="${avatarCX}" cy="${avatarY}" r="${avatarR}" fill="${SURFACE}"/>`;
  // Avatar image
  if (player.avatarB64) {
    avatarSvg += `<image href="${player.avatarB64}" x="${avatarX + 2}" y="${avatarY - avatarR + 2}" width="${(avatarR - 2) * 2}" height="${(avatarR - 2) * 2}" clip-path="url(#av)"/>`;
  }
  // Frame overlay
  if (player.frameB64) {
    const fs = avatarR * 2 + 10;
    avatarSvg += `<image href="${player.frameB64}" x="${avatarCX - fs / 2}" y="${avatarY - fs / 2}" width="${fs}" height="${fs}" preserveAspectRatio="xMidYMid meet"/>`;
  }

  // --- Player info ---
  const nameY = 42;
  const nameText = esc(trunc(player.name, 20));

  let infoSvg = `
    <text x="${infoX}" y="${nameY}" font-family="${FONT}"
      font-size="17" font-weight="800" fill="${BRIGHT}" letter-spacing="0.3">${nameText}</text>

    <text x="${infoX}" y="${nameY + 17}" font-family="${FONT}"
      font-size="11" fill="${MUTED}" font-weight="600">UID ${esc(String(player.id))}</text>

    <line x1="${infoX}" y1="${nameY + 24}" x2="${infoX + 140}" y2="${nameY + 24}"
      stroke="${A2}" stroke-width="1.2" opacity="0.35"/>`;

  // Level chip
  infoSvg += `
    <rect x="${infoX}" y="${nameY + 32}" width="48" height="16" rx="4"
      fill="${SURFACE}" stroke="${BORDER}" stroke-width="0.8"/>
    <text x="${infoX + 24}" y="${nameY + 43}" font-family="${FONT}"
      font-size="9.5" font-weight="700" fill="${MUTED}" text-anchor="middle" letter-spacing="0.5">LV.${esc(String(player.level))}</text>`;

  // Bio
  if (player.sign) {
    infoSvg += `
    <text x="${infoX}" y="${nameY + 65}" font-family="${FONT}"
      font-size="10.5" fill="${MUTED}" font-style="italic" opacity="0.8">'${esc(trunc(player.sign, 30))}'</text>`;
  }

  // --- Character showcase ---
  let charSvg = '';
  if (chars.length > 0) {
    const showcaseRightEdge = CARD_W - 18;
    const charR = 24;
    const overlap = 12;
    const totalW = chars.length * (charR * 2) - (chars.length - 1) * overlap;
    const startX = showcaseRightEdge - totalW + charR;
    const charCY = CARD_H / 2 + 2;

    // "SHOWCASE" label
    charSvg += `<text x="${startX + totalW / 2 - charR}" y="${charCY - charR - 8}" font-family="${FONT}"
      font-size="8" font-weight="700" fill="${MUTED}" letter-spacing="2.5" text-anchor="middle" opacity="0.7">SHOWCASE</text>`;

    // Draw characters back-to-front
    chars.forEach((ch, i) => {
      const cx = startX + i * (charR * 2 - overlap);
      const cy = charCY;

      // Dark outline ring
      charSvg += `<circle cx="${cx}" cy="${cy}" r="${charR + 1.5}" fill="${BG}" stroke="${BORDER}" stroke-width="1"/>`;
      // Background
      charSvg += `<circle cx="${cx}" cy="${cy}" r="${charR}" fill="${SURFACE}"/>`;

      if (ch.iconB64) {
        charSvg += `<g transform="translate(${cx},${cy})">
          <image href="${ch.iconB64}" x="${-charR + 2}" y="${-charR + 2}" width="${(charR - 2) * 2}" height="${(charR - 2) * 2}" clip-path="url(#cc${i})"/>
        </g>`;
      }

      // Subtle ring
      charSvg += `<circle cx="${cx}" cy="${cy}" r="${charR}" fill="none" stroke="${BORDER}" stroke-width="1.5"/>`;
    });
  }

  // --- Footer ---
  const footerY = CARD_H - 12;
  const guildText = player.guild && player.guild !== 'No Guild' ? `Guild: ${player.guild}` : 'No Guild';
  const footer = `
    <line x1="${RADIUS}" y1="${CARD_H - 26}" x2="${CARD_W - RADIUS}" y2="${CARD_H - 26}"
      stroke="${BORDER}" stroke-width="0.8" opacity="0.5"/>
    <text x="${infoX}" y="${footerY}" font-family="${FONT}"
      font-size="9" fill="${MUTED}" font-weight="600" opacity="0.7">${esc(trunc(guildText, 22))}</text>
    <text x="${CARD_W - RADIUS - 4}" y="${footerY}" font-family="${FONT}"
      font-size="9" fill="${MUTED}" font-weight="600" opacity="0.7" text-anchor="end">Since ${esc(player.started)}</text>`;

  // --- PGR Logo ---
  const pgrLogoSvg = `<text x="${CARD_W - 16}" y="18" font-family="${FONT}"
    font-size="8" font-weight="700" fill="${MUTED}" text-anchor="end" letter-spacing="1.5" opacity="0.35">PUNISHING: GRAY RAVEN</text>`;

  // --- Watermark ---
  const watermark = `<text x="${CARD_W - 10}" y="${CARD_H - 4}" font-family="${FONT}"
    font-size="6.5" fill="${MUTED}" text-anchor="end" opacity="0.25">pgr-widget</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
    width="${CARD_W}" height="${CARD_H}" viewBox="0 0 ${CARD_W} ${CARD_H}" fill="none">
  ${defs}
  ${card}
  ${glowBlob}
  ${avatarSvg}
  ${infoSvg}
  ${charSvg}
  ${footer}
  ${pgrLogoSvg}
  ${watermark}
</svg>`;
}

function buildErrorSvg(message) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_W}" height="60" viewBox="0 0 ${CARD_W} 60" fill="none">
    <rect width="${CARD_W}" height="60" rx="${RADIUS}" fill="#0d1117" stroke="#21262d" stroke-width="1"/>
    <text x="${CARD_W / 2}" y="34" font-size="12" fill="#8b949e" font-family="${FONT}" text-anchor="middle">${esc(message)}</text>
  </svg>`;
}

export async function onRequest(context) {
  const { request } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  // Edge cache
  const cache = caches.default;
  const cached = await cache.match(request);
  if (cached) return cached;

  const url = new URL(request.url);
  const uid = url.searchParams.get('uid') || '12584504';
  const server = url.searchParams.get('server') || 'ap';
  const hideSign = url.searchParams.get('hide_sign') === 'true';
  const hideChars = url.searchParams.get('hide_chars') === 'true';
  const accent = (url.searchParams.get('accent') || 'ff4d6d').replace('#', '');

  const isGlobal = ['ap', 'na', 'eu'].includes(server);
  const assetRegion = isGlobal ? 'glb' : server;

  try {
    const apiRes = await fetch(`${HUAXU_API}/servers/${server}/players/${uid}`, {
      headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' },
    });

    if (!apiRes.ok) {
      const errSvg = buildErrorSvg('Player not found or profile is private.');
      return new Response(errSvg, {
        status: 200,
        headers: { 'Content-Type': 'image/svg+xml; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=60' },
      });
    }

    const json = await apiRes.json();
    if (!json.data?.player) {
      const errSvg = buildErrorSvg('Invalid player data.');
      return new Response(errSvg, {
        status: 200,
        headers: { 'Content-Type': 'image/svg+xml; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=60' },
      });
    }

    const p = json.data.player;

    const avatarUrl = p.portrait ? `https://assets.huaxu.app/${assetRegion}/${p.portrait}.webp` : null;
    const frameUrl = p.frame?.trim() ? `https://assets.huaxu.app/${assetRegion}/${p.frame}.webp` : null;

    const visibleChars = hideChars
      ? []
      : (json.data.characters || []).filter((c) => c.visible && c.acquired).slice(0, 3);

    // Parallel fetch all images
    const [avatarB64, frameB64, ...charResults] = await Promise.all([
      avatarUrl ? toBase64(avatarUrl) : Promise.resolve(null),
      frameUrl ? toBase64(frameUrl) : Promise.resolve(null),
      ...visibleChars.map(async (c) => {
        const iconPath = c.fashionIcon || c.normalIcon;
        if (!iconPath) return { ...c, iconB64: null };
        return { ...c, iconB64: await toBase64(`https://assets.huaxu.app/${assetRegion}/${iconPath}.webp`) };
      }),
    ]);

    const player = {
      id: p.id,
      name: p.name,
      level: p.level,
      sign: !hideSign && p.sign?.trim() ? p.sign : null,
      avatarB64,
      frameB64,
      guild: p.guildName?.trim() || 'No Guild',
      started: json.data.startDate ? json.data.startDate.split('T')[0] : 'Unknown',
    };

    const svg = buildSvg(player, charResults, accent);

    const response = new Response(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=600',
        'Access-Control-Allow-Origin': '*',
        'Vary': 'Accept-Encoding',
      },
    });

    context.waitUntil(cache.put(request, response.clone()));
    return response;
  } catch (err) {
    console.error('PGR SVG error:', err.message || err);
    return new Response(buildErrorSvg('An error occurred.'), {
      status: 200,
      headers: { 'Content-Type': 'image/svg+xml; charset=utf-8', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
