/**
 * OPX wallet-rpc JSON-RPC client
 * Architecture: JS layer → HTTP → local wallet-rpc (127.0.0.1:28984)
 */

async function rpc(url, method, params = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message || JSON.stringify(json.error));
  return json.result;
}

export async function getBalance(url) {
  return rpc(url, 'get_balance');
}

export async function getAddress(url) {
  return rpc(url, 'get_address');
}

export async function getTransfers(url) {
  return rpc(url, 'get_transfers', { in: true, out: true, pending: true, pool: true });
}

export async function transfer(url, destinations) {
  return rpc(url, 'transfer', { destinations, get_tx_key: true });
}

export async function openWallet(url, filename, password = '') {
  return rpc(url, 'open_wallet', { filename, password });
}

export async function createWallet(url, filename, password = '', language = 'English') {
  return rpc(url, 'create_wallet', { filename, password, language });
}

export async function closeWallet(url) {
  return rpc(url, 'close_wallet');
}

export function fromAtomic(atomic) {
  return Number(atomic) / 1e12;
}

export function toAtomic(display) {
  return Math.round(parseFloat(display) * 1e12);
}
