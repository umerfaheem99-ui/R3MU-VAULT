// api/auth.js — Place in "api" folder in your GitHub repo root

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { code, guild } = req.query;
  if (!code || !guild) return res.status(400).json({ error: 'Missing params' });

  const CLIENT_ID     = process.env.DISCORD_CLIENT_ID;
  const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
  const REDIRECT_URI  = process.env.DISCORD_REDIRECT_URI;

  try {
    // Step 1: Exchange code for access token
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id:     CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type:    'authorization_code',
        code:          code,
        redirect_uri:  REDIRECT_URI,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return res.status(401).json({ error: 'Token exchange failed', detail: tokenData });
    }

    const accessToken = tokenData.access_token;

    // Step 2: Get user info (for userId and username)
    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const user = await userRes.json();

    // Step 3: Get guild member info (roles + booster status)
    const memberRes = await fetch(`https://discord.com/api/users/@me/guilds/${guild}/member`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (memberRes.status === 404) {
      return res.status(200).json({
        isBooster: false,
        userId: user.id,
        username: user.username,
        roles: [],
        reason: 'not_in_guild'
      });
    }

    const member = await memberRes.json();

    // Step 4: Fetch full guild roles to get role names
    // We need Bot token for this — using the role IDs from member
    // and matching against guild roles via bot token
    const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
    let roleNames = [];

    if (BOT_TOKEN && member.roles && member.roles.length > 0) {
      const guildRolesRes = await fetch(`https://discord.com/api/guilds/${guild}/roles`, {
        headers: { Authorization: `Bot ${BOT_TOKEN}` },
      });
      if (guildRolesRes.ok) {
        const guildRoles = await guildRolesRes.json();
        // Map role IDs to names
        roleNames = guildRoles
          .filter(r => member.roles.includes(r.id))
          .map(r => r.name);
      }
    }

    return res.status(200).json({
      isBooster:  !!member.premium_since,
      userId:     user.id,
      username:   user.username,
      roles:      roleNames,
      reason:     member.premium_since ? 'boosting' : 'not_boosting'
    });

  } catch (err) {
    console.error('Auth error:', err);
    return res.status(500).json({ error: err.message });
  }
}
