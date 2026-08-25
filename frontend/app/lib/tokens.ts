/**
 * ProtectedPay — known/preset ERC-20 tokens on BOT Chain Mainnet.
 *
 * Currently empty: no tokens are pre-added. Users pick any ERC-20 token via
 * the token lookup (paste a contract address) available on the Protected
 * Transfer page. Preset tokens can be added back here later — `usdc.png`
 * and `usdt.png` logos are already in `public/token/` and ready to use.
 */

export interface PresetToken {
  symbol: string;
  label: string;
  name: string;
  address: `0x${string}`;
  decimals: number;
  logo: string;
}

export const PRESET_TOKENS: PresetToken[] = [];

/** Lookup a preset token by its contract address (case-insensitive). */
export function getKnownToken(address?: string | null): PresetToken | undefined {
  if (!address) return undefined;
  const lower = address.toLowerCase();
  return PRESET_TOKENS.find(p => p.address.toLowerCase() === lower);
}
