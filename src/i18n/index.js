import AsyncStorage from '@react-native-async-storage/async-storage';

const dict = {
  en: {
    choose_lang: 'Choose language',
    continue: 'Continue',
    wallet: 'Wallet',
    settings: 'Settings',
    balance: 'Balance',
    receive: 'Receive',
    send: 'Send',
    history: 'History',
    address: 'Address',
    copy: 'Copy',
    amount: 'Amount (OPX)',
    dest: 'Destination',
    node: 'Remote node (optional)',
    node_hint: 'Keys never leave this device in production cold mode. Remote node is only for broadcast/sync when you enable it.',
    save: 'Save',
    offline: 'Offline mode',
    create: 'Create wallet (seed)',
    restore: 'Restore from seed',
    seed: 'Seed phrase',
    password: 'Local password',
    mvp_notice: 'MVP: crypto signing uses wallet-rpc / native OPX module. monero-ts must be rebuilt against OPX sources for true on-device spend keys.',
    no_tx: 'No transactions',
    refresh: 'Refresh',
    exchange: 'Exchange',
    exchange_hint: 'Buy or sell OPX',
    exchange_coming_soon: 'Exchange is coming soon!',
    fill_fields: 'Please fill in all fields',
    disclaimer: 'MVP cold wallet UI for OPX Network. No security guarantees.'
  },
  ru: {
    choose_lang: 'Выберите язык',
    continue: 'Продолжить',
    wallet: 'Кошелёк',
    settings: 'Настройки',
    balance: 'Баланс',
    receive: 'Получить',
    send: 'Отправить',
    history: 'История',
    address: 'Адрес',
    copy: 'Копировать',
    amount: 'Сумма (OPX)',
    dest: 'Адрес получателя',
    node: 'Удалённый узел (опционально)',
    node_hint: 'Ключи не должны покидать устройство. Удалённый узел — только для синка/отправки, если вы включили.',
    save: 'Сохранить',
    offline: 'Офлайн-режим',
    create: 'Создать кошелёк (seed)',
    restore: 'Восстановить из seed',
    seed: 'Seed-фраза',
    password: 'Локальный пароль',
    mvp_notice: 'MVP: подпись через wallet-rpc / нативный модуль OPX. Для spend-ключей на устройстве monero-ts нужно собрать из исходников OPX.',
    no_tx: 'Нет транзакций',
    refresh: 'Обновить',
    exchange: 'Обменник',
    exchange_hint: 'Купить или продать OPX',
    exchange_coming_soon: 'Обменник скоро будет!',
    fill_fields: 'Заполните все поля',
    disclaimer: 'MVP холодного кошелька OPX Network. Без гарантий безопасности.'
  }
};

let lang = 'en';

export async function loadLang() {
  const v = await AsyncStorage.getItem('opx_lang');
  if (v) lang = v;
  return lang;
}

export async function setLang(l) {
  lang = l;
  await AsyncStorage.setItem('opx_lang', l);
}

export function t(key) {
  return (dict[lang] && dict[lang][key]) || dict.en[key] || key;
}

export function getLang() {
  return lang;
}
