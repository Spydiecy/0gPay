import { createConfig, http } from 'wagmi';
import { injected, metaMask, coinbaseWallet } from 'wagmi/connectors';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  metaMaskWallet,
  coinbaseWallet as coinbaseWalletRK,
  walletConnectWallet,
  injectedWallet,
  rainbowWallet,
  trustWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { SUPPORTED_CHAINS, DEFAULT_CHAIN_ID, getChainConfig, ogGalileoTestnet } from './chains';

// Re-exported for existing call sites — ogGalileoTestnet is the default/first chain.
export { ogGalileoTestnet };

// ── Contract address (chain-aware) ────────────────────────────────────────────
export const CONTRACT_ADDRESS = getChainConfig(DEFAULT_CHAIN_ID).contractAddress;

export const CONTRACT_ADDRESSES: Record<number, `0x${string}`> = Object.fromEntries(
  SUPPORTED_CHAINS.map(c => [c.chain.id, c.contractAddress])
);

export function getContractAddress(chainId?: number): `0x${string}` {
  return getChainConfig(chainId).contractAddress;
}

// ── WalletConnect project ID ──────────────────────────────────────────────────
const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID || '';

// ── RainbowKit connectors ─────────────────────────────────────────────────────
const connectors = WC_PROJECT_ID
  ? connectorsForWallets(
      [
        {
          groupName: 'Popular',
          wallets: [
            metaMaskWallet,
            rainbowWallet,
            coinbaseWalletRK,
            walletConnectWallet,
            trustWallet,
          ],
        },
        {
          groupName: 'More',
          wallets: [injectedWallet],
        },
      ],
      {
        appName: 'OGPay',
        projectId: WC_PROJECT_ID,
      }
    )
  : [injected(), metaMask(), coinbaseWallet({ appName: 'OGPay' })];

// ── Wagmi config — built from every chain in the registry ────────────────────
const chainList = SUPPORTED_CHAINS.map(c => c.chain) as [typeof ogGalileoTestnet, ...typeof ogGalileoTestnet[]];

const transports = Object.fromEntries(
  SUPPORTED_CHAINS.map(c => [c.chain.id, http(c.chain.rpcUrls.default.http[0])])
// eslint-disable-next-line @typescript-eslint/no-explicit-any
) as any;

export const wagmiConfig = createConfig({
  chains: chainList,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  connectors: connectors as any,
  transports,
  ssr: true,
});

// ── Explorer URLs (chain-aware) ───────────────────────────────────────────────
export const EXPLORER_URL = getChainConfig(DEFAULT_CHAIN_ID).explorerUrl;

export const EXPLORER_URLS: Record<number, string> = Object.fromEntries(
  SUPPORTED_CHAINS.map(c => [c.chain.id, c.explorerUrl])
);

export function getExplorerUrl(chainId?: number): string {
  return getChainConfig(chainId).explorerUrl;
}

export function explorerTx(hash: string, chainId?: number): string {
  const base = getExplorerUrl(chainId);
  return `${base}/tx/${hash}`;
}

export function explorerAddress(addr: string, chainId?: number): string {
  const base = getExplorerUrl(chainId);
  return `${base}/address/${addr}`;
}

// ── Native token helpers (chain-aware) ────────────────────────────────────────
export function getNativeSymbol(chainId?: number): string {
  return getChainConfig(chainId).nativeSymbol;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
export function formatNative(wei: bigint, decimals = 4): string {
  if (wei === 0n) return '0';
  const val = Number(wei) / 1e18;
  return val.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

export function toWei(amount: string): bigint {
  if (!amount || amount === '0') return 0n;
  const [whole, frac = ''] = amount.split('.');
  const fracPadded = frac.padEnd(18, '0').slice(0, 18);
  return BigInt(whole || '0') * BigInt(10 ** 18) + BigInt(fracPadded);
}

export function shortAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 8)}…${addr.slice(-6)}`;
}
