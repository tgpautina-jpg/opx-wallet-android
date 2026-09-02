import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OPX } from '../config/network';

const K = {
  onboarded: 'opx_onboarded',
  settings: 'opx_settings_v3',
  assets: 'opx_custom_assets_v3',
  seed: 'opx_seed_v3',
  pin: 'opx_pin_v3',
  opxCreds: 'opx_rpc_creds_v3',
  ethAddress: 'opx_eth_addr_v3',
  ethPrivate: 'opx_eth_pk_v3',
  btcAddress: 'opx_btc_addr_v3',
  btcWif: 'opx_btc_wif_v3',
  tonAddress: 'opx_ton_addr_v3'
};

export async function isOnboarded() {
  return (await AsyncStorage.getItem(K.onboarded)) === '1';
}

export async function setOnboarded() {
  await AsyncStorage.setItem(K.onboarded, '1');
}

export async function loadSettings() {
  const raw = await AsyncStorage.getItem(K.settings);
  if (!raw) {
    return {
      lang: 'ru',
      opxRpc: OPX.defaultWalletRpc,
      opxWalletFile: 'mobile_wallet',
      opxWalletPassword: '',
      showBalances: true
    };
  }
  const s = JSON.parse(raw);
  return {
    ...s,
    opxRpc: s.opxRpc || OPX.defaultWalletRpc
  };
}

export async function saveSettings(s) {
  await AsyncStorage.setItem(K.settings, JSON.stringify(s));
}

export async function saveSeed(mnemonic) {
  await SecureStore.setItemAsync(K.seed, mnemonic);
}

export async function loadSeed() {
  return SecureStore.getItemAsync(K.seed);
}

export async function savePin(pin) {
  await SecureStore.setItemAsync(K.pin, pin);
}

export async function loadPin() {
  return SecureStore.getItemAsync(K.pin);
}

export async function saveEthKeys(address, privateKey) {
  await SecureStore.setItemAsync(K.ethAddress, address);
  await SecureStore.setItemAsync(K.ethPrivate, privateKey);
}

export async function loadEthKeys() {
  const address = await SecureStore.getItemAsync(K.ethAddress);
  const privateKey = await SecureStore.getItemAsync(K.ethPrivate);
  return { address, privateKey };
}

export async function saveBtcKeys(address, wifOrKey) {
  await SecureStore.setItemAsync(K.btcAddress, address);
  if (wifOrKey) await SecureStore.setItemAsync(K.btcWif, wifOrKey);
}

export async function loadBtcKeys() {
  return {
    address: await SecureStore.getItemAsync(K.btcAddress),
    key: await SecureStore.getItemAsync(K.btcWif)
  };
}

export async function saveTonAddress(address) {
  await SecureStore.setItemAsync(K.tonAddress, address);
}

export async function loadTonAddress() {
  return SecureStore.getItemAsync(K.tonAddress);
}

export async function saveOpxCreds(creds) {
  await SecureStore.setItemAsync(K.opxCreds, JSON.stringify(creds));
}

export async function loadOpxCreds() {
  const raw = await SecureStore.getItemAsync(K.opxCreds);
  return raw ? JSON.parse(raw) : null;
}

export async function loadCustomAssets() {
  const raw = await AsyncStorage.getItem(K.assets);
  return raw ? JSON.parse(raw) : [];
}

export async function saveCustomAssets(list) {
  await AsyncStorage.setItem(K.assets, JSON.stringify(list));
}

export async function wipeAll() {
  const keys = Object.values(K);
  for (const k of keys) {
    try {
      await SecureStore.deleteItemAsync(k);
    } catch (_) {}
    try {
      await AsyncStorage.removeItem(k);
    } catch (_) {}
  }
}
