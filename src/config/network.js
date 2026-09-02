/** OPX Wallet v3 — network & asset config */

export const THEME = {
  bg: '#0B1220',
  card: '#111827',
  input: '#0f172a',
  border: '#1e293b',
  text: '#e2e8f0',
  muted: '#94a3b8',
  accent: '#10B981',
  danger: '#ef4444',
  warning: '#f59e0b'
};

export const OPX = {
  name: 'OPX',
  networkId: 'b0639745c560d80ecd1fbee1147dc8fe',
  genesisHash: 'a64322d64ecc07d070fb0f7b615d14a57268e9a9b36786ae378352d0bf858f33',
  p2pPort: 28981,
  daemonRpcPort: 28982,
  walletRpcPort: 28984,
  addressPrefix: 30,
  atomic: 1e12,
  // Non-custodial: local wallet-rpc on device loopback, no auth (Phase B bundles the binary).
  defaultWalletRpc: 'http://127.0.0.1:28984/json_rpc',
  stakingAddress: '62FBkUpbDyCHEMbEnf2A74Xs2dkMbwogZeTKjbyAbb86JhCJqRtnQe17EbBo5eC5oSJJa8eJkmWFbgaucMmScuXkPjg9mta', // operator wallet (server wallet-rpc)
  stakingApy: { 1: 5, 3: 10, 6: 20 }
};

export const EVM = {
  // Public RPCs — user can override later
  rpcUrl: 'https://ethereum.publicnode.com',
  chainId: 1,
  explorer: 'https://etherscan.io',
  usdt: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
};

export const BTC = {
  network: 'main',
  // BlockCypher public API (rate-limited)
  apiBase: 'https://api.blockcypher.com/v1/btc/main'
};

export const TON = {
  apiBase: 'https://toncenter.com/api/v2',
  // Optional API key can be set in settings later
  apiKey: ''
};

/** Built-in assets shown on home */
export const BUILTIN_ASSETS = [
  { id: 'opx', symbol: 'OPX', name: 'OPX', type: 'opx', decimals: 12, coingeckoId: null },
  { id: 'btc', symbol: 'BTC', name: 'Bitcoin', type: 'btc', decimals: 8, coingeckoId: 'bitcoin' },
  { id: 'eth', symbol: 'ETH', name: 'Ethereum', type: 'evm', decimals: 18, coingeckoId: 'ethereum' },
  {
    id: 'usdt',
    symbol: 'USDT',
    name: 'Tether USD',
    type: 'erc20',
    decimals: 6,
    contract: EVM.usdt,
    coingeckoId: 'tether'
  },
  {
    id: 'usdc',
    symbol: 'USDC',
    name: 'USD Coin',
    type: 'erc20',
    decimals: 6,
    contract: EVM.usdc,
    coingeckoId: 'usd-coin'
  },
  { id: 'ton', symbol: 'TON', name: 'Toncoin', type: 'ton', decimals: 9, coingeckoId: 'the-open-network' },
  { id: 'gram', symbol: 'GRAM', name: 'Gram', type: 'ton', decimals: 9, coingeckoId: null }
];
