'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useAccount, useDisconnect, useBalance } from 'wagmi';
import { useChainId, useSwitchChain } from 'wagmi';
import { formatNative, shortAddress } from '../../lib/wagmi';
import { SUPPORTED_CHAINS, getChainConfig } from '../../lib/chains';
import {
  Lock, Users, Zap, History, ChevronLeft, ChevronRight,
  Copy, Check, Home, Sun, Moon, LogOut, Link2, ChevronsUpDown,
} from 'lucide-react';

export type AppTab = 'home' | 'protected' | 'group' | 'batch' | 'history' | 'links';

interface SidebarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

const NAV_ITEMS: { tab: AppTab; icon: React.ElementType; label: string }[] = [
  { tab: 'protected', icon: Lock,    label: 'Protected Transfer' },
  { tab: 'group',     icon: Users,   label: 'Group Split'        },
  { tab: 'batch',     icon: Zap,     label: 'Batch Payment'      },
  { tab: 'links',     icon: Link2,   label: 'Payment Links'      },
  { tab: 'history',   icon: History, label: 'History'            },
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { address, connector } = useAccount();
  const { disconnect }         = useDisconnect();
  const { theme, setTheme }    = useTheme();
  const { data: balance, refetch: refetchBalance } = useBalance({ address });
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const activeChain = getChainConfig(chainId);

  const [collapsed,    setCollapsed]    = useState(false);
  const [copied,       setCopied]       = useState(false);
  const [mounted,      setMounted]      = useState(false);
  const [chainMenuOpen, setChainMenuOpen] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (address) refetchBalance(); }, [address, refetchBalance]);

  const W = collapsed ? 72 : 240;

  const copy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nativeSymbol = activeChain.nativeSymbol;

  const navBtn = (tab: AppTab, Icon: React.ElementType, label: string) => {
    const active = activeTab === tab;
    return (
      <button key={tab} onClick={() => onTabChange(tab)} title={collapsed ? label : undefined}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 10, padding: collapsed ? '10px 0' : '10px 12px', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: 9, border: 'none', cursor: 'pointer', background: active ? 'rgba(45,212,191,0.12)' : 'transparent', color: active ? 'var(--primary)' : 'var(--foreground-muted)', transition: 'all 0.15s' }}
        onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-hover)'; }}
        onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
      >
        <Icon size={16} color={active ? 'var(--primary)' : 'var(--foreground-muted)'} style={{ flexShrink: 0 }} />
        {!collapsed && <span style={{ fontSize: 13, fontWeight: active ? 600 : 500, whiteSpace: 'nowrap' }}>{label}</span>}
      </button>
    );
  };

  return (
    <aside style={{ width: W, minWidth: W, height: '100vh', background: 'var(--surface-card)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1), min-width 0.25s cubic-bezier(0.4,0,0.2,1)', overflow: 'hidden', flexShrink: 0 }}>

      {/* Logo */}
      <div style={{ padding: collapsed ? '18px 0' : '18px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, overflow: 'hidden' }}>
          <img src="/logo.png" alt="OGPay" style={{ width: 30, height: 30, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
          {!collapsed && <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--foreground)', letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>OG<span style={{ color: 'var(--primary)' }}>Pay</span></span>}
        </div>
        <button onClick={() => setCollapsed(!collapsed)} style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0, background: 'var(--surface-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--foreground-muted)' }}>
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </div>

      {/* Network switcher — one entry today, ready for more chains */}
      <div style={{ padding: collapsed ? '10px 0' : '10px 12px', borderBottom: '1px solid var(--border)', position: 'relative' }}>
        {collapsed ? (
          <div title={activeChain.chain.name} style={{ display: 'flex', justifyContent: 'center' }}>
            <img
              src={activeChain.icon}
              alt={activeChain.chain.name}
              style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', display: 'block', margin: '2px auto' }}
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        ) : (
          <button
            onClick={() => { if (SUPPORTED_CHAINS.length > 1) setChainMenuOpen(o => !o); }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 10px', borderRadius: 8, border: '1px solid rgba(45,212,191,0.3)',
              background: 'rgba(45,212,191,0.1)', cursor: SUPPORTED_CHAINS.length > 1 ? 'pointer' : 'default',
            }}
          >
            <img
              src={activeChain.icon}
              alt={activeChain.chain.name}
              style={{ width: 16, height: 16, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
            <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: 'var(--primary)', textAlign: 'left' }}>
              {activeChain.chain.name}
            </span>
            {SUPPORTED_CHAINS.length > 1 && <ChevronsUpDown size={12} color="var(--primary)" style={{ flexShrink: 0 }} />}
          </button>
        )}

        {/* Dropdown — only renders when there's more than one chain to pick from */}
        {chainMenuOpen && SUPPORTED_CHAINS.length > 1 && (
          <div style={{
            position: 'absolute', top: '100%', left: 12, right: 12, marginTop: 4,
            background: 'var(--surface-card)', border: '1px solid var(--border)',
            borderRadius: 10, zIndex: 50, overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          }}>
            {SUPPORTED_CHAINS.map(c => {
              const active = c.chain.id === chainId;
              return (
                <button
                  key={c.chain.id}
                  onClick={() => { if (!active) switchChain({ chainId: c.chain.id }); setChainMenuOpen(false); }}
                  disabled={isSwitching}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                    padding: '9px 12px', border: 'none', cursor: 'pointer',
                    background: active ? 'rgba(45,212,191,0.1)' : 'transparent',
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-hover)'; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                  <img src={c.icon} alt={c.chain.name} style={{ width: 16, height: 16, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: active ? 'var(--primary)' : 'var(--foreground)', textAlign: 'left' }}>{c.chain.name}</span>
                  {active && <Check size={12} color="var(--primary)" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Address + Balance */}
      {address && (
        <div style={{ padding: collapsed ? '12px 0' : '12px 14px', borderBottom: '1px solid var(--border)' }}>
          {collapsed ? (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)' }}>{address.slice(2, 4).toUpperCase()}</span>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ overflow: 'hidden' }}>
                  {connector?.name && <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--foreground)', marginBottom: 1, whiteSpace: 'nowrap' }}>{connector.name}</p>}
                  <p style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--foreground-muted)', whiteSpace: 'nowrap' }}>{shortAddress(address)}</p>
                </div>
                <button onClick={copy} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 3, color: 'var(--foreground-muted)', flexShrink: 0 }}>
                  {copied ? <Check size={12} color="var(--primary)" /> : <Copy size={12} />}
                </button>
              </div>
              {balance && (
                <div style={{ padding: '7px 10px', borderRadius: 8, background: 'var(--surface-elevated)', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: 'var(--foreground-subtle)', textTransform: 'uppercase', marginBottom: 2 }}>Balance</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', letterSpacing: '-0.3px' }}>
                    {formatNative(balance.value)} {nativeSymbol}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: collapsed ? '10px 0' : '10px 8px', display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto' }}>
        {navBtn('home', Home, 'Home')}
        <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
        {NAV_ITEMS.map(({ tab, icon, label }) => navBtn(tab, icon, label))}
      </nav>

      {/* Bottom */}
      <div style={{ padding: collapsed ? '10px 0' : '10px 8px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {mounted && (
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title={collapsed ? 'Toggle theme' : undefined}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 10, padding: collapsed ? '9px 0' : '9px 12px', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'transparent', color: 'var(--foreground-muted)', transition: 'all 0.15s' }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-hover)'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
          >
            {theme === 'dark' ? <Sun size={14} style={{ flexShrink: 0 }} /> : <Moon size={14} style={{ flexShrink: 0 }} />}
            {!collapsed && <span style={{ fontSize: 12, fontWeight: 500 }}>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
        )}
        {address && (
          <button onClick={() => disconnect()} title={collapsed ? 'Disconnect' : undefined}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 10, padding: collapsed ? '9px 0' : '9px 12px', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'transparent', color: 'var(--foreground-muted)', transition: 'all 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--error-container)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--error)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--foreground-muted)'; }}
          >
            <LogOut size={14} style={{ flexShrink: 0 }} />
            {!collapsed && <span style={{ fontSize: 12, fontWeight: 500 }}>Disconnect</span>}
          </button>
        )}
        <Link href="/" title={collapsed ? 'Back to Home' : undefined}
          style={{ display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 10, padding: collapsed ? '9px 0' : '9px 12px', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: 8, textDecoration: 'none', color: 'var(--foreground-subtle)', transition: 'all 0.15s', fontSize: 12, fontWeight: 500 }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--surface-hover)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--foreground-muted)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--foreground-subtle)'; }}
        >
          <Home size={13} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Back to Home</span>}
        </Link>
      </div>
    </aside>
  );
}
