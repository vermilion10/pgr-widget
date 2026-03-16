export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  const uid = url.searchParams.get('uid') || '12584504';

  const targetUrl = `https://huaxu.app/ap/players/${uid}/characters`;

  try {
    const response = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    
    const htmlText = await response.text();
    const match = htmlText.match(/<script type="application\/json".*?id="__NUXT_DATA__">(.*?)<\/script>/);
    
    if (!match) return new Response(JSON.stringify({ error: "Data tidak ditemukan" }), { status: 404 });

    const nuxtData = JSON.parse(match[1]);

    const uidIndex = nuxtData.indexOf(parseInt(uid));
    if (uidIndex === -1) return new Response(JSON.stringify({ error: "UID tidak ditemukan" }), { status: 404 });

    const rawSign = nuxtData[uidIndex + 3];
    const rawAvatar = nuxtData[uidIndex + 5];
    const rawFrame = nuxtData[uidIndex + 7];
    const rawGuild = nuxtData[uidIndex + 10];

    const pgrData = {
      id: nuxtData[uidIndex],
      name: nuxtData[uidIndex + 1],
      level: nuxtData[uidIndex + 2],
      
      sign: (rawSign && rawSign.trim() !== '') ? rawSign : null,
      
      avatarUrl: rawAvatar ? `https://assets.huaxu.app/glb/${rawAvatar}.webp` : null,
      
      frameUrl: (typeof rawFrame === 'string' && rawFrame.trim() !== '') 
                ? `https://assets.huaxu.app/glb/${rawFrame}.webp` 
                : null,
                
      guild: (rawGuild && rawGuild.trim() !== '') ? rawGuild : "No Guild",
      likes: nuxtData[uidIndex + 8]
    };

    const startDateRaw = nuxtData.find(item => typeof item === 'string' && item.includes('T00:00:00Z'));
    pgrData.started = startDateRaw ? startDateRaw.split('T')[0] : "Unknown";

    return new Response(JSON.stringify(pgrData), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Terjadi kesalahan" }), { status: 500 });
  }
}