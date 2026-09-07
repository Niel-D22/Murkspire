import { Link, useLocation } from 'react-router-dom';
import { Activity, TrendingUp, Layers, Radio, ArrowLeft } from 'lucide-react';
import { WalletButton } from '../WalletButton';
import { XIcon, X_URL } from '../brand/XIcon';

interface LayoutProps {
  children: React.ReactNode;
}

const NAV = [
  { path: '/app/whale',   label: 'Whale Activity',   icon: Activity },
  { path: '/app/market',  label: 'Market Flow',      icon: TrendingUp },
  { path: '/app/staking', label: 'Staking Monitor',  icon: Layers },
  { path: '/app/feed',    label: 'Live Feed',        icon: Radio },
];

export default function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation();

  return (
    <div className="relative flex min-h-screen flex-col bg-murk text-bone">
      {/* Static ambient wash — no animated canvas, keeps the dashboard cheap */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255,90,54,.10), transparent 60%),' +
            'radial-gradient(ellipse 50% 40% at 100% 100%, rgba(255,90,54,.05), transparent 65%)',
        }}
      />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-murk/70 backdrop-blur-xl">
          <div className="container mx-auto flex h-16 items-center justify-between gap-3">
            <Link
              to="/"
              className="group flex min-w-0 shrink items-center gap-2 sm:gap-3"
              aria-label="Murkspire home"
            >
              <ArrowLeft className="hidden h-3.5 w-3.5 shrink-0 text-zinc-600 transition-colors group-hover:text-spire sm:block" />
              <img src="/logo-512.png" alt="" aria-hidden="true" className="h-7 w-auto shrink-0" />
              <span className="hidden truncate font-sans text-[14px] font-medium tracking-[0.26em] text-bone sm:inline">
                MURKSPIRE
              </span>
            </Link>

            <nav className="hidden items-center gap-1 rounded-[12px] border border-white/[0.07] bg-white/[0.02] p-1 backdrop-blur-md lg:flex">
              {NAV.map(({ path, label, icon: Icon }) => {
                const active = pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all duration-300 ${
                      active
                        ? 'bg-spire/15 text-bone ring-1 ring-spire/30'
                        : 'text-zinc-400 hover:bg-white/5 hover:text-bone'
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${active ? 'text-spire' : ''}`} />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <span className="hidden items-center gap-2 rounded-md border border-white/[0.07] px-3 py-1.5 xl:flex">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-spire opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-spire" />
                </span>
                <span className="mono-label !text-zinc-400">Live</span>
              </span>

              <a
                href={X_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-white/5 hover:text-bone"
                title="Murkspire on X"
              >
                <XIcon className="h-4 w-4" />
              </a>

              <WalletButton />
            </div>
          </div>

          {/* Mobile nav */}
          <nav className="no-scrollbar mask-fade-x flex gap-1 overflow-x-auto border-t border-white/[0.06] px-4 py-2 lg:hidden">
            {NAV.map(({ path, label, icon: Icon }) => {
              const active = pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium ${
                    active ? 'bg-spire/15 text-bone ring-1 ring-spire/30' : 'text-zinc-400'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${active ? 'text-spire' : ''}`} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </header>

        <main className="container mx-auto flex-grow px-6 pb-16 pt-28 lg:pt-24">
          {children}
        </main>

        <footer className="mt-auto border-t border-white/[0.06] py-8">
          <div className="container mx-auto flex flex-col items-center justify-between gap-2 text-xs text-zinc-600 sm:flex-row">
            <p>Murkspire &copy; {new Date().getFullYear()} · Intelligence beyond the noise.</p>
            <p className="font-mono">Solana mainnet · read-only</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
