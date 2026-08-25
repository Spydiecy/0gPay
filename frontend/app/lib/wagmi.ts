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
import type { Chain } from 'wagmi/chains';

// ── BOT Chain Mainnet ──────────────────────────────────────────────────────────
export const botChainMainnet = {
  id: 677,
  name: 'BOT Chain Mainnet',
  nativeCurrency: {
    name: 'BOT',
    symbol: 'BOT',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc.botchain.ai'] },
  },
  blockExplorers: {
    default: {
      name: 'BOT Chain Explorer',
      url: 'https://scan.botchain.ai',
    },
  },
  testnet: false,
} as const satisfies Chain;

// ── Contract address ──────────────────────────────────────────────────────────
export const CONTRACT_ADDRESS = (
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x87C97999e9b6D295A8eAc677d8872F6f86666A2D'
) as `0x${string}`;

// Single-chain deployment — kept as a map for backward-compatible call sites.
export const CONTRACT_ADDRESSES: Record<number, `0x${string}`> = {
  [botChainMainnet.id]: CONTRACT_ADDRESS,
};

export function getContractAddress(chainId?: number): `0x${string}` {
  return CONTRACT_ADDRESSES[chainId ?? botChainMainnet.id] ?? CONTRACT_ADDRESS;
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
        appName: 'ProtectedPay',
        projectId: WC_PROJECT_ID,
      }
    )
  : [injected(), metaMask(), coinbaseWallet({ appName: 'ProtectedPay' })];

// ── Wagmi config ──────────────────────────────────────────────────────────────
export const wagmiConfig = createConfig({
  chains: [botChainMainnet],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  connectors: connectors as any,
  transports: {
    [botChainMainnet.id]: http('https://rpc.botchain.ai'),
  },
  ssr: true,
});

// ── Explorer URLs ──────────────────────────────────────────────────────────────
export const EXPLORER_URL = botChainMainnet.blockExplorers.default.url;

export const EXPLORER_URLS: Record<number, string> = {
  [botChainMainnet.id]: EXPLORER_URL,
};

export function getExplorerUrl(chainId?: number): string {
  return EXPLORER_URLS[chainId ?? botChainMainnet.id] ?? EXPLORER_URL;
}

export function explorerTx(hash: string, chainId?: number): string {
  const base = getExplorerUrl(chainId);
  return `${base}/tx/${hash}`;
}

export function explorerAddress(addr: string, chainId?: number): string {
  const base = getExplorerUrl(chainId);
  return `${base}/address/${addr}`;
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
