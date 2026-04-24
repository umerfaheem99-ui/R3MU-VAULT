function parseCookies(header = '') {
  return header.split(';').reduce((acc, part) => {
    const idx = part.indexOf('=');
    if (idx === -1) return acc;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    acc[key] = value;
    return acc;
  }, {});
}

module.exports = function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const cookies = parseCookies(req.headers.cookie || '');
  res.status(200).json({
    isBooster: cookies.vault_booster === '1',
    isAdmin: cookies.vault_admin === '1'
  });
};
