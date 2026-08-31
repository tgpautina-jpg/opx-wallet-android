import { TON } from '../config/network';
import { ethers } from 'ethers';

/**
 * TON MVP via Toncenter HTTP API.
 * Full ton-core wallet deploy needs native libs; we support:
 * - balance by address
 * - address derived marker from seed (user can set real TON address)
 */

export async function deriveTonHint(mnemonic) {
  return 'EQ' + ethers.id(mnemonic + 'ton').slice(2, 50);
}

export async function getTonBalance(address, apiKey = TON.apiKey) {
  if (!address) return '0';
  const q = new URLSearchParams({ address });
  const headers = {};
  if (apiKey) headers['X-API-Key'] = apiKey;
  const res = await fetch(`${TON.apiBase}/getAddressBalance?${q}`, { headers });
  if (!res.ok) throw new Error('TON API error');
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'TON balance failed');
  // nanotons
  return (Number(data.result) / 1e9).toString();
}

export async function getTonHistory(address, apiKey = TON.apiKey) {
  if (!address) return [];
  const headers = {};
  if (apiKey) headers['X-API-Key'] = apiKey;
  const q = new URLSearchParams({ address, limit: '20' });
  try {
    const res = await fetch(`${TON.apiBase}/getTransactions?${q}`, { headers });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.result || []).map((t) => ({
      hash: t.transaction_id?.hash || '',
      utime: t.utime
    }));
  } catch {
    return [];
  }
}

export async function sendTon() {
  throw new Error('TON send needs ton-core wallet contract. Balance/receive in MVP; send next.');
}
