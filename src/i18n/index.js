import AsyncStorage from '@react-native-async-storage/async-storage';

const D = {
  en: {
    app_name: 'OPX Wallet',
    create_wallet: 'Create wallet',
    restore_wallet: 'Restore from seed',
    continue: 'Continue',
    seed_title: 'Save your seed phrase',
    seed_warn: 'Write these words down offline. Anyone with this phrase can control your funds (ETH/USDT/BTC/TON). OPX uses a separate server wallet for MVP.',
    seed_confirm: 'I saved the seed phrase',
    home: 'Home',
    assets: 'Assets',
    staking: 'Staking',
    settings: 'Settings',
    total_balance: 'Total balance',
    receive: 'Receive',
    send: 'Send',
    history: 'History',
    copy: 'Copy',
    copied: 'Copied',
    amount: 'Amount',
    address: 'Address',
    to: 'Recipient',
    confirm: 'Confirm',
    add_token: 'Add ERC-20 token',
    contract: 'Contract address',
    save: 'Save',
    language: 'Language',
    opx_node: 'OPX wallet-rpc URL',
    view_seed: 'View seed phrase',
    logout: 'Reset wallet',
    staking_title: 'OPX Staking',
    months: 'Months',
    apy: 'APY',
    stake: 'Stake',
    loading: 'Loading…',
    error: 'Error',
    no_history: 'No transactions yet',
    pin_title: 'Set PIN',
    pin_enter: 'Enter PIN',
    unlock: 'Unlock',
    exchange: 'Exchange',
    back: 'Back',
    updated: 'Updated'
  },
  ru: {
    app_name: 'OPX Wallet',
    create_wallet: 'Создать кошелёк',
    restore_wallet: 'Восстановить из seed',
    continue: 'Продолжить',
    seed_title: 'Сохраните seed-фразу',
    seed_warn: 'Запишите слова офлайн. Кто знает фразу — контролирует ETH/USDT/BTC/TON. OPX в MVP использует отдельный wallet-rpc.',
    seed_confirm: 'Я сохранил seed-фразу',
    home: 'Главная',
    assets: 'Активы',
    staking: 'Стейкинг',
    settings: 'Настройки',
    total_balance: 'Общий баланс',
    receive: 'Получить',
    send: 'Отправить',
    history: 'История',
    copy: 'Копировать',
    copied: 'Скопировано',
    amount: 'Сумма',
    address: 'Адрес',
    to: 'Получатель',
    confirm: 'Подтвердить',
    add_token: 'Добавить ERC-20',
    contract: 'Адрес контракта',
    save: 'Сохранить',
    language: 'Язык',
    opx_node: 'URL OPX wallet-rpc',
    view_seed: 'Показать seed',
    logout: 'Сбросить кошелёк',
    staking_title: 'Стейкинг OPX',
    months: 'Месяцев',
    apy: 'APY',
    stake: 'Застейкать',
    loading: 'Загрузка…',
    error: 'Ошибка',
    no_history: 'Пока нет транзакций',
    pin_title: 'Установите PIN',
    pin_enter: 'Введите PIN',
    unlock: 'Разблокировать',
    exchange: 'Обменник',
    back: 'Назад',
    updated: 'Обновлено'
  }
};

let lang = 'ru';

export async function initLang() {
  const v = await AsyncStorage.getItem('opx_lang_v3');
  if (v) lang = v;
  return lang;
}

export async function setLang(l) {
  lang = l;
  await AsyncStorage.setItem('opx_lang_v3', l);
}

export function getLang() {
  return lang;
}

export function t(key) {
  return D[lang]?.[key] || D.en[key] || key;
}
