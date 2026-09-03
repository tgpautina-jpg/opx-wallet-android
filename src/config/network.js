/**
 * OPX network parameters from https://github.com/tgpautina-jpg/OPX README
 * Configurable — do not hard-code secrets.
 */
export const OPX_NETWORK = {
  name: 'OPX Mainnet',
  networkId: 'b0639745c560d80ecd1fbee1147dc8fe',
  genesisHash: 'd74affc526ce42f2f066d9c2ce570d440ad49757d3858f7bab2c40351f934f5e',
  p2pPort: 28981,
  daemonRpcPort: 28982,
  zmqPort: 28983,
  walletRpcPort: 28984,
  addressPrefix: 30,
  integratedPrefix: 31,
  subaddressPrefix: 32,
  atomicUnits: 1e12,
  // Default remote node for OPTIONAL online ops only (user can change)
  defaultRemoteDaemon: 'http://178.236.247.121:28982',
  defaultRemoteWalletRpc: 'http://127.0.0.1:28984/json_rpc', // empty by default — user must set intentionally
  // Exchange link — set when the exchange is live
  exchangeUrl: '' // e.g. 'https://exchange.opx.org'
};

export const THEME = {
  bg: '#0B1220',
  card: '#111827',
  input: '#0f172a',
  border: '#1e293b',
  text: '#e2e8f0',
  muted: '#94a3b8',
  accent: '#10B981',
  danger: '#ef4444'
};
