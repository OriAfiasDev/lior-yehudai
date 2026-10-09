// Content source for a remote content API (headless CMS, a small DB-backed service, etc).
// It expects the API to return the same shapes as the files in /content:
//   GET {base}/settings            -> content/settings.json
//   GET {base}/theme               -> content/theme.json
//   GET {base}/pages/{id}          -> content/pages/{id}.json
//   GET {base}/collections/{name}  -> content/collections/{name}.json
// If the CMS speaks a different shape, map it here and nowhere else.

export function createHttpSource(baseUrl, { token } = {}) {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const headers = { accept: 'application/json', ...(token && { authorization: `Bearer ${token}` }) };

  const get = async (path) => {
    const res = await fetch(new URL(path, base), { headers });
    if (!res.ok) throw new Error(`Content API returned ${res.status} for ${path}`);
    return res.json();
  };

  return {
    name: `http:${base}`,
    getSettings: () => get('settings'),
    getTheme: () => get('theme'),
    getPage: (id) => get(`pages/${encodeURIComponent(id)}`),
    getCollection: async (name) => (await get(`collections/${encodeURIComponent(name)}`)).items,
  };
}
