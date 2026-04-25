export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const cache = caches.default;
  
  if (request.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  let cachedResponse = await cache.match(request);
  if (cachedResponse) {
    console.log("Serving from cache:", url.search);
    return cachedResponse;
  }

  const uid = url.searchParams.get('uid') || '12584504';
  const server = url.searchParams.get('server') || 'ap';

  const targetUrl = `https://api.huaxu.app/servers/${server}/players/${uid}`;

  try {
    const response = await fetch(targetUrl, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    
    if (!response.ok) {
       return new Response(JSON.stringify({ error: "Data pemain tidak ditemukan atau disetel Private." }), { status: response.status });
    }

    const json = await response.json();
    if (!json.data || !json.data.player) {
       return new Response(JSON.stringify({ error: "Data pemain tidak valid." }), { status: 404 });
    }

    const player = json.data.player;
    const isGlobal = ['ap', 'na', 'eu'].includes(server);
    const assetRegion = isGlobal ? 'glb' : server;

    const pgrData = {
      id: player.id,
      name: player.name,
      level: player.level,
      sign: (player.sign && player.sign.trim() !== '') ? player.sign : null,
      avatarUrl: player.portrait ? `https://assets.huaxu.app/${assetRegion}/${player.portrait}.webp` : null,
      frameUrl: (typeof player.frame === 'string' && player.frame.trim() !== '') 
                ? `https://assets.huaxu.app/${assetRegion}/${player.frame}.webp` 
                : null,
      guild: (player.guildName && player.guildName.trim() !== '') ? player.guildName : "No Guild",
      likes: player.likes
    };

    pgrData.started = json.data.startDate ? json.data.startDate.split('T')[0] : "Unknown";

    const finalResponse = new Response(JSON.stringify(pgrData), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=600',
        'Vary': 'Accept-Encoding'
      }
    });

    context.waitUntil(cache.put(request, finalResponse.clone()));

    return finalResponse;
  } catch (error) {
    return new Response(JSON.stringify({ error: "Terjadi kesalahan" }), { status: 500 });
  }
}