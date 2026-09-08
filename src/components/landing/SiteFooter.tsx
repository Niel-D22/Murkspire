import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import AnimatedContent from '../vendor/AnimatedContent';
import { LogoVertical } from '../brand/Logo';
import { XIcon, X_URL } from '../brand/XIcon';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Whale Activity', to: '/app/whale' },
      { label: 'Market Flow', to: '/app/market' },
      { label: 'Staking Monitor', to: '/app/staking' },
      { label: 'Live Feed', to: '/app/feed' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { label: 'How it works', to: '/#how-it-works' },
      { label: 'Trust & custody', to: '/#trust' },
      { label: 'FAQ', to: '/#faq' },
    ],
  },
];

const EXTERNAL = [
  { label: 'X', href: X_URL },
  { label: 'Solana', href: 'https://solana.com' },
  { label: 'Helius', href: 'https://helius.dev' },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden">
      {/* ---------- Closing CTA ---------- */}
      <div className="container relative pb-24 pt-12 lg:pb-32">
        <AnimatedContent distance={40} duration={0.7} threshold={0.15}>
          <div className="relative overflow-hidden rounded-[14px] border border-white/[0.09] bg-[#101114] px-8 py-16 text-center sm:px-16">
            {/* warm pool behind the card */}
            <div
              className="pointer-events-none absolute inset-x-0 -bottom-24 h-64 blur-3xl"
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(255,90,54,.30), transparent 70%)',
              }}
            />

            <div className="relative">
              <h2 className="text-balance text-3xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
                <span className="block text-bone">Stop scrolling explorers.</span>
                <span className="block text-spire">Start reading the chain.</span>
              </h2>

              <p className="mx-auto mt-5 max-w-md text-[15px] text-zinc-400">
                No account, no wallet, no signup. Open it and the data is already there.
              </p>

              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link to="/app" className="pill-primary group w-full px-7 py-3.5 text-sm font-semibold sm:w-auto">
                  Launch Dashboard
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a
                  href={X_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pill-ghost w-full px-7 py-3.5 text-sm font-semibold sm:w-auto"
                >
                  <XIcon className="h-4 w-4" />
                  Follow on X
                </a>
              </div>
            </div>
          </div>
        </AnimatedContent>
      </div>

      {/* ---------- Footer proper ---------- */}
      <div className="border-t border-white/[0.06]">
        <div className="container py-14">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <LogoVertical className="!items-start" />
              <p className="mt-6 max-w-xs text-sm leading-relaxed text-zinc-500">
                Real-time Solana intelligence. Read-only, non-custodial, no account required.
              </p>
            </div>

            {COLUMNS.map((col) => (
              <div key={col.title} className="lg:col-span-2">
                <p className="mono-label">{col.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        to={l.to}
                        className="text-sm text-zinc-400 transition-colors hover:text-bone"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="lg:col-span-3">
              <p className="mono-label">Elsewhere</p>
              <ul className="mt-4 space-y-2.5">
                {EXTERNAL.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-zinc-400 transition-colors hover:text-bone"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-white/[0.06] pt-8 sm:flex-row sm:items-center">
            <p className="font-mono text-xs text-zinc-600">
              Murkspire &copy; {new Date().getFullYear()}
            </p>
            <p className="font-mono text-xs text-zinc-600">
              Solana mainnet · read-only · no custody
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
