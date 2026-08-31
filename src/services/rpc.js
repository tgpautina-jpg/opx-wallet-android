import { OPX } from '../config/network';

/**
 * OPX wallet-rpc JSON-RPC client
 * Keys for OPX stay on wallet-rpc (MVP). App stores filename/password only.
 */
export async function opxRpc(url, method, params = {}, auth = null) {
  if (!url) throw new Error('OPX RPC URL not set');

  const headers = { 'Content-Type': 'application/json' };
  if (auth?.user) {
    const token = btoa(`${auth.user}:${auth.pass || ''}`);
    headers.Authorization = `Basic ${token}`;
  }

  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ jsonrpc: '2.0', id: '0', method, params })
    });
  } catch (e) {
    throw new Error('Cannot reach OPX node: ' + (e.message || 'network error'));
  }

  const data = await res.json();
  if (data.error) {
    throw new Error(data.error.message || JSON.stringify(data.error));
  }
  return data.result;
}

export function toAtomic(opxAmount) {
  return Math.round(parseFloat(opxAmount) * OPX.atomic);
}

export function fromAtomic(atomic) {
  if (atomic == null) return 0;
  return Number(atomic) / OPX.atomic;
}

export async function opxOpenWallet(url, auth, filename, password) {
  return opxRpc(url, 'open_wallet', { filename, password }, auth);
}

export async function opxCreateWallet(url, auth, filename, password, language = 'English') {
  return opxRpc(url, 'create_wallet', { filename, password, language }, auth);
}

export async function opxGetBalance(url, auth) {
  return opxRpc(url, 'get_balance', {}, auth);
}

export async function opxGetAddress(url, auth) {
  return opxRpc(url, 'get_address', {}, auth);
}

export async function opxTransfer(url, auth, address, amountAtomic, priority = 0) {
  return opxRpc(
    url,
    'transfer',
    {
      destinations: [{ amount: amountAtomic, address }],
      priority,
      ring_size: 3, // OPX: mixin 2 (ring size 3) — matches wallet2::get_min_ring_size()
      get_tx_key: true
    },
    auth
  );
}

export async function opxGetTransfers(url, auth) {
  return opxRpc(url, 'get_transfers', { in: true, out: true, pending: true }, auth);
}

export async function opxEnsureWallet(url, auth, filename, password) {
  try {
    await opxOpenWallet(url, auth, filename, password);
  } catch (_) {
    try {
      await opxCreateWallet(url, auth, filename, password);
    } catch (e2) {
      // maybe already exists with different state
      await opxOpenWallet(url, auth, filename, password);
    }
  }
}
