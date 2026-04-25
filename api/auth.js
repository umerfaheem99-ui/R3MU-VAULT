const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1487495610239287478';
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID || '1455947243415801949';
const OWNER_DISCORD_ID = process.env.OWNER_DISCORD_ID || '1469970101259210803';
const PANEL_ACCESS_ROLE = process.env.PANEL_ACCESS_ROLE || '1487516769018187876';
const BOOSTER_WHITELIST = ['1249631122900647978'];
const BOOSTER_COOKIE = 'vault_booster';
const ADMIN_COOKIE = 'vault_admin';
const COOKIE_MAX_AGE = 60 * 60 * 8;

function buildCookie(name, value, maxAge = COOKIE_MAX_AGE) {
  return `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${maxAge}`;
}

function clearCookie(name) {
  return `${name}=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!DISCORD_CLIENT_SECRET) {
    res.status(500).json({ error: 'Missing DISCORD_CLIENT_SECRET' });
    return;
  }

  const code = req.query.code;
  const guildId = req.query.guild || DISCORD_GUILD_ID;

  if (!code || !guildId) {
    res.status(400).json({ error: 'Missing code or guild' });
    return;
  }

  const forwardedProto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host;
  const requestedRedirect = req.query.redirect;
  const fallbackRedirect = `${forwardedProto}://${host}/`;
  const redirectUri = requestedRedirect && requestedRedirect.startsWith(`${forwardedProto}://${host}`)
    ? requestedRedirect
    : fallbackRedirect;

  try {
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri
      })
    });

    if (!tokenRes.ok) {
      const detail = await tokenRes.text();
      res.status(401).json({ error: 'Discord token exchange failed', detail });
      return;
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    const [userRes, memberRes] = await Promise.all([
      fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      }),
      fetch(`https://discord.com/api/users/@me/guilds/${guildId}/member`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
    ]);

    if (!userRes.ok || !memberRes.ok) {
      res.status(403).json({ error: 'Discord membership verification failed' });
      return;
    }

    const user = await userRes.json();
    const member = await memberRes.json();
    const roleIds = Array.isArray(member.roles) ? member.roles : [];
    const isOwner = user.id === OWNER_DISCORD_ID;
    const isBooster = isOwner || Boolean(member.premium_since) || BOOSTER_WHITELIST.includes(user.id);
    const isAdmin = isOwner || roleIds.includes(PANEL_ACCESS_ROLE);

    res.setHeader('Set-Cookie', [
      isBooster ? buildCookie(BOOSTER_COOKIE, '1') : clearCookie(BOOSTER_COOKIE),
      isAdmin ? buildCookie(ADMIN_COOKIE, '1') : clearCookie(ADMIN_COOKIE)
    ]);

    res.status(200).json({
      userId: user.id,
      username: user.username,
      roleIds,
      isBooster,
      isAdmin
    });
  } catch (error) {
    res.status(500).json({ error: 'Unexpected auth failure', detail: error.message });
  }
};
