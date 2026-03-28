// api/auth.js — Put this file in an "api" folder in your GitHub repo root
// Vercel will automatically run it as a serverless function

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { code, guild } = req.query;
  if (!code || !guild) return res.status(400).json({ error: 'Missing params' });

  const CLIENT_ID     = process.env.DISCORD_CLIENT_ID;
  const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
  const REDIRECT_URI  = process.env.DISCORD_REDIRECT_URI;

  try {
    // Step 1: Exchange code for token
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) return res.status(401).json({ error: 'Token failed', detail: tokenData });

    // Step 2: Check guild member booster status
    const memberRes = await fetch(`https://discord.com/api/users/@me/guilds/${guild}/member`, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (memberRes.status === 404) return res.status(200).json({ isBooster: false, reason: 'not_in_guild' });

    const member = await memberRes.json();
    return res.status(200).json({ isBooster: !!member.premium_since });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
