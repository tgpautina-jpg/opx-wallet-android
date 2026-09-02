import { createMnemonic, walletFromMnemonic } from '../services/eth';
import {
  saveSeed,
  loadSeed,
  saveEthKeys,
  loadEthKeys,
  saveBtcKeys,
  saveTonAddress,
  saveOpxCreds,
  loadSettings,
  saveSettings,
  setOnboarded
} from '../services/storage';
import { deriveTonHint } from '../services/ton';
import { ethers } from 'ethers';
import { opxCreateWallet, opxRestoreWallet, isValidOpxSeed } from '../services/rpc';

/**
 * Детерминированный пароль OPX-кошелька из seed-фразы.
 * Восстанавливается при переустановке/восстановлении — больше не теряется.
 */
function deriveOpxPassword(mnemonic) {
  return ethers.keccak256(ethers.toUtf8Bytes('opx-wallet-v3:' + mnemonic)).slice(2, 34) + 'Aa1!';
}

/**
 * Create local BIP39 wallet for EVM (+ linked BTC/TON metadata).
 * OPX: open/create on LOCAL (on-device) wallet-rpc with deterministic password.
 */
export async function createNewWallet() {
  const mnemonic = createMnemonic(128);
  const eth = walletFromMnemonic(mnemonic);

  await saveSeed(mnemonic);
  await saveEthKeys(eth.address, eth.privateKey);

  // BTC: store empty until user sets real address or bitcoinjs integrated
  // Use ethereum-style derivation note in docs
  await saveBtcKeys('', '');

  const tonHint = await deriveTonHint(mnemonic);
  await saveTonAddress(tonHint);

  const settings = await loadSettings();
  const opxPassword = deriveOpxPassword(mnemonic);
  const opxFile = 'opx_' + eth.address.slice(2, 10);

  settings.opxWalletFile = opxFile;
  settings.opxWalletPassword = opxPassword;
  await saveSettings(settings);
  await saveOpxCreds({ filename: opxFile, password: opxPassword });

  // Non-custodial OPX-кошелёк: 25-словная Electrum-мнемоника + пароль
  // генерируются на этом же устройстве и хранятся только в SecureStore
  // (rpc.js). Сервер их не видит. Адрес нужен для майнинга и баланса.
  const opx = await opxCreateWallet();

  await setOnboarded();
  return { mnemonic, ethAddress: eth.address, opxAddress: opx.address, opxSeed: opx.seed };
}

export async function restoreFromMnemonic(mnemonic) {
  const phrase = mnemonic.trim().toLowerCase().replace(/\s+/g, ' ');
  const eth = walletFromMnemonic(phrase);
  await saveSeed(phrase);
  await saveEthKeys(eth.address, eth.privateKey);
  await saveBtcKeys('', '');
  await saveTonAddress(await deriveTonHint(phrase));

  const settings = await loadSettings();
  if (!settings.opxWalletPassword) {
    const opxPassword = deriveOpxPassword(phrase);
    const opxFile = 'opx_' + eth.address.slice(2, 10);
    settings.opxWalletFile = opxFile;
    settings.opxWalletPassword = opxPassword;
    await saveSettings(settings);
    await saveOpxCreds({ filename: opxFile, password: opxPassword });
  }

  // Non-custodial OPX: восстановить по 25-словной Electrum-фразе.
  // Проверка контрольной суммы выполняется в rpc.js (isValidOpxSeed)
  // до передачи в native-слой. Если пользователь ввёл 12-словную
  // BIP39-фразу ETH — это отдельный кошелёк, не трогаем его, а
  // восстанавливаем только OPX по своей фразе.
  if (isValidOpxSeed(phrase)) {
    const opx = await opxRestoreWallet(phrase);
    await setOnboarded();
    return { ethAddress: eth.address, opxAddress: opx.address };
  }

  await setOnboarded();
  return { ethAddress: eth.address };
}

export async function loadLocalAddresses() {
  const eth = await loadEthKeys();
  return {
    eth: eth.address,
    seed: await loadSeed()
  };
}
