const BOOSTER_ITEMS = [
  {
    slug: 'argon-ocean-bypeased',
    name: 'Argon Ocean Bypeased',
    cat: 'booster',
    recentlyAdded: false,
    img: 'https://cyde.xyz/assets/images/post_images/argonClient.webp',
    desc: 'Argon Client that bypasses all ss tools',
    loader: 'Fabric | Put it in mods folder.',
    keybinds: 'Right Shift - Open Menu',
    versions: [
      { ver: '1.21.1 / 1.21', link: 'https://shrinkme.click/poG6d' }
    ],
    screenshots: [
      'https://cyde.xyz/assets/images/post_images/argonClient.webp'
    ]
  },
  {
    slug: 'polar-client',
    name: 'Polar Client', 
    cat: 'booster',
    recentlyAdded: false,
    img: 'https://media.discordapp.net/attachments/1484305507308011742/1484305750548545686/image.png?ex=69e2a8f3&is=69e15773&hm=6135efcb3ee6d8160a6543f3ac8dfc0e9956bc7d3581a6d1c0ab054be46471e5&=&format=webp&quality=lossless&width=1172&height=339',
    desc: 'Bypasses Ocean',
    loader: 'Fabric | Put it in mods folder.',
    keybinds: 'Right Shift - Open Menu',
    versions: [
      { ver: '1.21.1 / 1.21', link: 'https://shrinkme.click/VCBCO' }
    ],
    screenshots: [
      'https://media.discordapp.net/attachments/1484305507308011742/1484305750548545686/image.png?ex=69e2a8f3&is=69e15773&hm=6135efcb3ee6d8160a6543f3ac8dfc0e9956bc7d3581a6d1c0ab054be46471e5&=&format=webp&quality=lossless&width=1172&height=339'
    ]
  },
  {
    slug: 'syringe-v1',
    name: 'Syringe V1',
    cat: 'booster',
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTukqqNRXWMcVhwfC__4P0e0oufz2qXPVnp3g&s',
    desc: 'It has no gui Modules | Triggerbot Jumpreset Mouse Tweaks Fast Place For Fast Potting Self Destruct Bypasses Ocean and Other SS TOOLS',
    loader: 'Loader | Fabric - Put it in mods folder',
    keybinds: 'Triggerbot R | Z | K - You Can Choose Which key you want from the downloads option JumpReset | J SelfDestruct | M It Will Bypass all ss tools after self destruct',
    recentlyAdded: true,
    versions: [
      { ver: '1.21 / 1.21.1 | R', link: 'https://shrinkme.click/iaCw' },
      { ver: '1.21 / 1.21.1 | K', link: 'https://shrinkme.click/ABlGziel' },
      { ver: '1.21 / 1.21.1 | Z', link: 'https://shrinkme.click/HWTTW' }
    ],
    screenshots: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTukqqNRXWMcVhwfC__4P0e0oufz2qXPVnp3g&s'
    ]
  },
  {
    slug: 'syringe-v2',
    name: 'Syringe V2',
    cat: 'booster',
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTukqqNRXWMcVhwfC__4P0e0oufz2qXPVnp3g&s',
    desc: 'It has no gui Modules | Triggerbot Jumpreset Mouse Tweaks Fast Place For Fast Potting Self Destruct Bypasses Ocean and Other SS TOOLS',
    loader: 'Loader | Fabric - Put it in mods folder',
    keybinds: 'Triggerbot Y - JumpReset | J SelfDestruct | M It Will Bypass all ss tools after self destruct',
    recentlyAdded: true,
    versions: [
      { ver: '1.21.4', link: 'https://shrinkme.click/BAgls' }
    ],
    screenshots: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTukqqNRXWMcVhwfC__4P0e0oufz2qXPVnp3g&s'
    ]
  }
];

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
  if (cookies.vault_booster !== '1') {
    res.status(403).json({ error: 'Booster access required' });
    return;
  }

  res.status(200).json({ items: BOOSTER_ITEMS });
};
