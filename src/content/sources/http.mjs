// Content source for a remote content API (headless CMS, a small DB-backed service, etc).
// It expects the API to return the same shapes as the files in /content:
//   GET {base}/settings            -> content/settings.json
//   GET {base}/theme               -> content/theme.json
//   GET {base}/pages/{id}          -> content/pages/{id}.json
//   GET {base}/collections/{name}  -> content/collections/{name}.json
// If the CMS speaks a different shape, map it here and nowhere else.
//
// A request that fails on the network or with a 5xx/408/429 is retried 3 times (1s, 2s, 4s).
// After that the build fails: a failed build keeps the previous deployment live, an empty
// page never ships.

const RETRY_DELAYS = [1000, 2000, 4000];
const retryable = (status) => status >= 500 || status === 408 || status === 429;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function createHttpSource(baseUrl, { token } = {}) {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const headers = { accept: 'application/json', ...(token && { authorization: `Bearer ${token}` }) };

  const request = async (path) => {
    let res;
    try {
      res = await fetch(new URL(path, base), { headers });
    } catch (err) {
      return { retry: true, error: new Error(`Content API unreachable for ${path}: ${err.cause?.message ?? err.message}`) };
    }
    if (res.ok) return { data: await res.json() };
    return { retry: retryable(res.status), error: new Error(`Content API returned ${res.status} for ${path}`) };
  };

  const get = async (path) => {
    for (let i = 0; ; i++) {
      const { data, error, retry } = await request(path);
      if (!error) return data;
      if (!retry || i === RETRY_DELAYS.length) throw error;
      await sleep(RETRY_DELAYS[i]);
    }
  };

  return {
    name: `http:${base}`,
    getSettings: () => get('settings'),
    getTheme: () => get('theme'),
    getPage: (id) => get(`pages/${encodeURIComponent(id)}`),
    getCollection: async (name) => (await get(`collections/${encodeURIComponent(name)}`)).items,
  };
}
