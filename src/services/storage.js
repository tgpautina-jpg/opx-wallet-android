import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  settings: 'opx_settings',
  walletMeta: 'opx_wallet_meta'
};

/**
 * Settings (non-secret): node URLs, flags
 */
export async function loadSettings() {
  const raw = await AsyncStorage.getItem(KEYS.settings);
  if (!raw) {
    return {
      walletRpcUrl: '',
      offlineOnly: true
    };
  }
  return JSON.parse(raw);
}

export async function saveSettings(settings) {
  await AsyncStorage.setItem(KEYS.settings, JSON.stringify(settings));
}

/**
 * Wallet metadata only — NOT the seed in MVP production path.
 * Seed should live in SecureStore only if user explicitly uses
 * keys-only experimental mode after OPX native module is integrated.
 */
export async function loadWalletMeta() {
  const raw = await SecureStore.getItemAsync(KEYS.walletMeta);
  return raw ? JSON.parse(raw) : null;
}

export async function saveWalletMeta(meta) {
  await SecureStore.setItemAsync(KEYS.walletMeta, JSON.stringify(meta));
}

export async function saveSeedExperimental(seed) {
  // Marked experimental — for MVP demo only after user consent in UI
  await SecureStore.setItemAsync('opx_seed_experimental', seed);
}

export async function loadSeedExperimental() {
  return SecureStore.getItemAsync('opx_seed_experimental');
}

export async function clearSecrets() {
  await SecureStore.deleteItemAsync(KEYS.walletMeta);
  await SecureStore.deleteItemAsync('opx_seed_experimental');
}
