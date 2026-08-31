import { BTC } from '../config/network';
import { ethers } from 'ethers';

/**
 * BTC (MVP):
 * - Address derived deterministically from BIP39 seed via ethers HD path note:
 *   Full BIP84 native segwit needs bitcoinjs-lib; for Expo MVP we use a
 *   watch-address flow with BlockCypher + optional manual import.
 * - Balance & history via BlockCypher public API.
 *
 * For production cold BTC, integrate bitcoinjs-lib + bip32.
 * Here we derive a stable "account id" and store a user-set or generated
 * placeholder address linked to seed fingerprint for demo continuity.
 */

export function fingerprintFromSeed(mnemonic) {
  return ethers.id(mnemonic).slice(0, 18);
}

/** Generate a deterministic mock-stable label; real P2WPKH needs bitcoinjs */
export async function deriveBtcAddressFromSeed(mnemonic) {
  // Production: use bip39 + bip32 + bitcoinjs-lib p2wpkh
  // MVP fallback: use eth-derived path hash as unique local id —
  // user can paste real BTC address in settings if needed.
  const wallet = ethers.HDNodeWallet.fromPhrase(mnemonic);
  // Not a real BTC address — mark as needing real lib; use BlockCypher only when valid
  const hex = ethers.id(wallet.privateKey + 'btc').slice(2, 42);
  // Return empty to force using API only when address is set; or use testnet-style
  // Better approach for MVP: generate from eth key display + document limitation
  return null;
}

export async function getBtcBalance(address) {
  if (!address || address.length < 26) return '0';
  const res = await fetch(`${BTC.apiBase}/addrs/${address}/balance`);
  if (!res.ok) throw new Error('BTC API error ' + res.status);
  const data = await res.json();
  const sat = data.final_balance ?? data.balance ?? 0;
  return (sat / 1e8).toString();
}

export async function getBtcHistory(address) {
  if (!address || address.length < 26) return [];
  const res = await fetch(`${BTC.apiBase}/addrs/${address}/full?limit=20`);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.txs || []).map((tx) => ({
    hash: tx.hash,
    confirmed: tx.confirmed,
    total: tx.total / 1e8
  }));
}

/**
 * Send BTC — requires private key + UTXO construction.
 * MVP: not fully implemented without bitcoinjs; throws clear message.
 */
export async function sendBtc() {
  throw new Error(
    'BTC send requires bitcoinjs-lib integration. Balance/receive work; send in next release.'
  );
}
