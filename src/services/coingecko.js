const CACHE = { t: 0, data: {} };

export async function fetchPrices(ids = []) {
  const filtered = ids.filter(Boolean);
  if (!filtered.length) return {};

  const now = Date.now();
  if (now - CACHE.t < 60000 && Object.keys(CACHE.data).length) {
    return CACHE.data;
  }

  try {
    const q = filtered.join(',');
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${q}&vs_currencies=usd`
    );
    if (!res.ok) return CACHE.data;
    const data = await res.json();
    CACHE.t = now;
    CACHE.data = data;
    return data;
  } catch {
    return CACHE.data;
  }
}

export function usdValue(amount, coingeckoId, prices) {
  if (!coingeckoId || !prices?.[coingeckoId]?.usd) return 0;
  return Number(amount) * prices[coingeckoId].usd;
}
