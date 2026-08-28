/**
 * OGPay — multichain registry.
 *
 * Single source of truth for every chain the app supports. Each entry pairs
 * an EVM chain definition with the OGPay contract deployed on it,
 * its native gas token, explorer, and icon. To bring up a new chain:
 *
 *   1. Deploy the OGPay contract on the new chain.
 *   2. Add one entry to SUPPORTED_CHAINS below.
 *   3. Drop a chain icon in /public/chain/.
 *
 * Nothing else in the app needs to change — wagmi config, the chain
 * switcher, contract address resolution, explorer links, and native-token
 * formatting all read from this registry.
 */

import type { Chain } from 'wagmi/chains';

export interface ChainConfig {
  chain: Chain;
  contractAddress: `0x${string}`;
  nativeSymbol: string;
  nativeDecimals: number;
  explorerUrl: string;
  icon: string;
  /** Brand accent used for the chain badge/switcher. */
  color: string;
}

// ── 0G Galileo Testnet ────────────────────────────────────────────────────────
export const ogGalileoTestnet = {
  id: 16602,
  name: '0G Galileo Testnet',
  nativeCurrency: {
    name: '0G',
    symbol: '0G',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://evmrpc-testnet.0g.ai'] },
  },
  blockExplorers: {
    default: {
      name: '0G Chainscan',
      url: 'https://chainscan-galileo.0g.ai',
    },
  },
  testnet: true,
} as const satisfies Chain;

// ── Registry ───────────────────────────────────────────────────────────────────
// Add new chains here. Order determines default selection + switcher order.
export const SUPPORTED_CHAINS: ChainConfig[] = [
  {
    chain: ogGalileoTestnet,
    contractAddress: (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xA4F7977Ab2a47a510eAB6b75F8B5AeC09FdED030') as `0x${string}`,
    nativeSymbol: '0G',
    nativeDecimals: 18,
    explorerUrl: 'https://chainscan-galileo.0g.ai',
    icon: '/chain/0G.png',
    color: '#2DD4BF',
  },
];

export const DEFAULT_CHAIN_ID = SUPPORTED_CHAINS[0].chain.id;

export function getChainConfig(chainId?: number): ChainConfig {
  return SUPPORTED_CHAINS.find(c => c.chain.id === chainId) ?? SUPPORTED_CHAINS[0];
}

export function isSupportedChain(chainId?: number): boolean {
  return SUPPORTED_CHAINS.some(c => c.chain.id === chainId);
}
