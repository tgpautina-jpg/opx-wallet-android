import 'react-native-get-random-values';
import { ethers } from 'ethers';
import { EVM } from '../config/network';

const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function transfer(address to, uint256 amount) returns (bool)'
];

export function createMnemonic(strength = 128) {
  return ethers.Wallet.createRandom().mnemonic.phrase;
}

export function walletFromMnemonic(mnemonic) {
  return ethers.HDNodeWallet.fromPhrase(mnemonic);
}

export function getProvider(rpcUrl = EVM.rpcUrl) {
  return new ethers.JsonRpcProvider(rpcUrl);
}

export async function getEthBalance(address, rpcUrl = EVM.rpcUrl) {
  const provider = getProvider(rpcUrl);
  const bal = await provider.getBalance(address);
  return ethers.formatEther(bal);
}

export async function getErc20Balance(address, contract, rpcUrl = EVM.rpcUrl) {
  const provider = getProvider(rpcUrl);
  const c = new ethers.Contract(contract, ERC20_ABI, provider);
  const [bal, decimals] = await Promise.all([c.balanceOf(address), c.decimals()]);
  return ethers.formatUnits(bal, decimals);
}

export async function getErc20Meta(contract, rpcUrl = EVM.rpcUrl) {
  const provider = getProvider(rpcUrl);
  const c = new ethers.Contract(contract, ERC20_ABI, provider);
  const [symbol, name, decimals] = await Promise.all([
    c.symbol().catch(() => 'TOKEN'),
    c.name().catch(() => 'Token'),
    c.decimals().catch(() => 18)
  ]);
  return { symbol, name, decimals: Number(decimals) };
}

export async function sendEth(privateKey, to, amountEth, rpcUrl = EVM.rpcUrl) {
  const provider = getProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const tx = await wallet.sendTransaction({
    to,
    value: ethers.parseEther(String(amountEth))
  });
  return tx.hash;
}

export async function sendErc20(privateKey, contract, to, amount, decimals, rpcUrl = EVM.rpcUrl) {
  const provider = getProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const c = new ethers.Contract(contract, ERC20_ABI, wallet);
  const tx = await c.transfer(to, ethers.parseUnits(String(amount), decimals));
  return tx.hash;
}

export async function getEthHistory(address) {
  // Lightweight: etherscan-less MVP returns empty; balance-driven UX
  // Can be extended with public explorers later
  return [];
}
