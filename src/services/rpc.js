import { Buffer } from 'buffer';
import { NativeModules } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
// Устанавливается: npm install github:ebellocchia/monero-js
// НЕ опубликован в стандартном npm-реестре как обычный пакет — ставится
// напрямую с GitHub. ВАЖНО: перед использованием в проде — свериться
// с официальными тестовыми векторами Monero (mnemonic <-> entropy) из
// monero-project/monero (src/mnemonics/electrum-words.cpp / tests), эта
// библиотека не имеет независимого стороннего аудита.
import moneroMnemonic from 'monero-js/src/mnemonic';
import { OPX } from '../config/network';

global.Buffer = global.Buffer || Buffer;

const { OpxWalletNative } = NativeModules;

const SECURE_STORE_OPTS = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };
const OPX_PASSWORD_KEY = 'opx_wallet_password';
const OPX_SEED_KEY = 'opx_wallet_seed';

/**
 * OPX wallet client через JNI pointer-based API. Seed — 25-словная
 * Electrum-мнемоника (Monero-style, English, 1626-словный словарь,
 * 25-е слово — CRC32-контрольная сумма первых 24). Это НЕ BIP39 и не
 * совместимо с seed-фразой, используемой для ETH/BTC в этом проекте —
 * OPX-кошелёк имеет отдельную, независимую seed-фразу.
 */

function ensureNativeModuleAvailable() {
  if (!OpxWalletNative) {
    throw new Error(
      'OpxWalletNative module not linked. Requires a custom dev client ' +
      'build (expo-dev-client) — rebuild with `npx expo run:android`.'
    );
  }
}

export function toAtomic(opxAmount) {
  const str = String(opxAmount);
  const [intPart, fracPart=''] = str.split('.');
  const fracPadded = (fracPart + '000000000000').slice(0,12);
  return (BigInt(intPart) * 1000000000000n + BigInt(fracPadded)).toString();
}

export function fromAtomic(atomicStringOrNumber) {
  if (atomicStringOrNumber == null) return 0;
  return Number(atomicStringOrNumber) / OPX.atomic;
}

/**
 * Генерирует новую 25-словную Electrum-мнемонику (English) через
 * monero-js. Энтропия — 32 случайных байта от expo-crypto (CSPRNG на
 * уровне ОС), библиотека только кодирует эти байты в слова — сама она
 * генератором случайности не является (см. её README: mnemonicEncode
 * принимает готовую энтропию, а не сама выбирает источник случайности,
 * поэтому источник байт — за нами, и это должен быть криптографически
 * стойкий генератор, а не Math.random()).
 */
async function generateOpxSeed() {
  const entropy = await Crypto.getRandomBytesAsync(32);
  const mnemonic = moneroMnemonic.encodeWithChecksum(Buffer.from(entropy));
  // Простая внутренняя проверка сразу после генерации: убеждаемся, что
  // сгенерированная фраза проходит собственную валидацию библиотеки
  // (совпадение контрольной суммы) прежде чем отдавать её пользователю.
  if (!moneroMnemonic.isValid(mnemonic)) {
    throw new Error('Generated OPX seed failed internal checksum validation — aborting');
  }
  return mnemonic;
}

function isValidOpxSeed(seed) {
  try {
    return moneroMnemonic.isValid(seed.trim().toLowerCase());
  } catch (_) {
    return false;
  }
}

async function generateOpxPassword() {
  const bytes = await Crypto.getRandomBytesAsync(24);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Создаёт новый кошелёк: генерирует 25-словный seed и пароль на
 * устройстве, сохраняет их в SecureStore, открывает кошелёк в
 * native-слое (единственный доступный в библиотеке способ — restore()
 * с только что сгенерированным seed, отдельного create() для нового
 * кошелька в контракте нет).
 */
export async function opxCreateWallet() {
  ensureNativeModuleAvailable();
  const seed = await generateOpxSeed();
  const password = await generateOpxPassword();

  await SecureStore.setItemAsync(OPX_SEED_KEY, seed, SECURE_STORE_OPTS);
  await SecureStore.setItemAsync(OPX_PASSWORD_KEY, password, SECURE_STORE_OPTS);

  const address = await OpxWalletNative.openWallet(password, seed);
  return { address, seed };
}

/**
 * Восстанавливает кошелёк по seed, предоставленному пользователем.
 * Проверяет валидность (контрольную сумму) ДО передачи в native-слой —
 * так пользователь получает понятную ошибку "неверная seed-фраза" в JS,
 * а не малопонятное исключение из нативного кода.
 */
export async function opxRestoreWallet(seed) {
  ensureNativeModuleAvailable();
  const normalizedSeed = seed.trim().toLowerCase();

  if (!isValidOpxSeed(normalizedSeed)) {
    throw new Error(
      'Invalid OPX seed phrase: must be 25 English words with a valid ' +
      'checksum (Monero-style Electrum mnemonic, not BIP39).'
    );
  }

  const password = await generateOpxPassword();
  await SecureStore.setItemAsync(OPX_SEED_KEY, normalizedSeed, SECURE_STORE_OPTS);
  await SecureStore.setItemAsync(OPX_PASSWORD_KEY, password, SECURE_STORE_OPTS);

  const address = await OpxWalletNative.openWallet(password, normalizedSeed);
  return { address };
}

/**
 * Открывает уже существующий (ранее созданный на этом устройстве)
 * кошелёк заново, используя seed/пароль из SecureStore.
 */
export async function opxReopenWallet() {
  ensureNativeModuleAvailable();
  const seed = await SecureStore.getItemAsync(OPX_SEED_KEY);
  const password = await SecureStore.getItemAsync(OPX_PASSWORD_KEY);
  if (!seed || !password) {
    throw new Error('No OPX wallet found in SecureStore — call opxCreateWallet/opxRestoreWallet first');
  }
  return OpxWalletNative.openWallet(password, seed);
}

export async function opxGetBalance() {
  ensureNativeModuleAvailable();
  const atomicString = await OpxWalletNative.getBalance();
  return { balanceAtomic: atomicString, balance: fromAtomic(atomicString) };
}

export async function opxGetAddress() {
  ensureNativeModuleAvailable();
  return OpxWalletNative.getAddress();
}

export async function opxStoreWallet() {
  ensureNativeModuleAvailable();
  return OpxWalletNative.storeWallet();
}

/**
 * amountOpx — в отображаемых единицах OPX. Разбирает JSON
 * {"txid":...} / {"error":...}, возвращаемый native-слоем без исключения
 * при неудаче.
 */
export async function opxTransfer(address, amountOpx) {
  ensureNativeModuleAvailable();
  const amountAtomic = toAtomic(amountOpx);
  const raw = await OpxWalletNative.transfer(address, amountAtomic);
  const parsed = JSON.parse(raw);
  if (parsed.error) {
    throw new Error(parsed.error);
  }
  return { txid: parsed.txid };
}
