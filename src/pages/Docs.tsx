import { ReactNode, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, TriangleAlert } from 'lucide-react';
import { LandingNav } from '../components/landing/LandingNav';
import { XIcon, X_URL } from '../components/brand/XIcon';
import { SiteFooter } from '../components/landing/SiteFooter';

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section
      id={id}
      className="scroll-mt-28 border-t border-white/[0.06] py-12 first:border-t-0 first:pt-0"
    >
      <h2 className="text-2xl font-semibold tracking-tight text-bone">{title}</h2>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-2xl text-[15px] leading-relaxed text-zinc-400">{children}</p>;
}

function H3({ children }: { children: ReactNode }) {
  return <h3 className="pt-4 text-base font-semibold tracking-tight text-bone">{children}</h3>;
}

function Term({ children }: { children: string }) {
  return (
    <span className="rounded border border-white/[0.09] bg-black/40 px-1.5 py-0.5 font-mono text-[13px] text-spire-300">
      {children}
    </span>
  );
}

function Note({ tone = 'info', children }: { tone?: 'info' | 'warn'; children: ReactNode }) {
  const warn = tone === 'warn';
  return (
    <div
      className={`max-w-2xl rounded-[10px] border p-4 ${
        warn ? 'border-spire/30 bg-spire/[0.06]' : 'border-white/[0.09] bg-white/[0.02]'
      }`}
    >
      <div className="flex gap-3">
        {warn && <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-spire" />}
        <div className="space-y-2 text-[14px] leading-relaxed text-zinc-400">{children}</div>
      </div>
    </div>
  );
}

function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="max-w-2xl overflow-x-auto rounded-[10px] border border-white/[0.09]">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-white/[0.09]">
            {head.map((h) => (
              <th key={h} className="mono-label whitespace-nowrap px-4 py-2.5">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-white/[0.04] last:border-0">
              {r.map((cell, j) => (
                <td key={j} className="px-4 py-2.5 align-top text-[13.5px] text-zinc-400">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Three stage pipeline, rendered as layout rather than as a code block. */
function Pipeline() {
  const stages = [
    { kind: 'Source', title: 'Solana mainnet', note: 'Read through a Helius RPC endpoint' },
    { kind: 'Process', title: 'Your browser', note: 'Parses, normalises and ranks the response' },
    { kind: 'Output', title: 'The dashboard', note: 'Four views over one live dataset' },
  ];

  return (
    <div className="grid max-w-2xl gap-3 sm:grid-cols-3">
      {stages.map((s) => (
        <div key={s.title} className="rounded-[10px] border border-white/[0.09] bg-white/[0.02] p-4">
          <span className="mono-label">{s.kind}</span>
          <p className="mt-1.5 text-[15px] font-semibold text-bone">{s.title}</p>
          <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">{s.note}</p>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

const NAV = [
  { id: 'overview', label: 'Overview' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'data-sources', label: 'Data sources' },
  { id: 'modules', label: 'The four modules' },
  { id: 'refresh', label: 'Refresh and limits' },
  { id: 'security', label: 'Security model' },
  { id: 'limitations', label: 'Known limitations' },
];

function useActiveSection() {
  const [active, setActive] = useState(NAV[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-25% 0px -65% 0px', threshold: 0 }
    );

    NAV.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return active;
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Docs() {
  const active = useActiveSection();

  return (
    <div className="min-h-screen overflow-x-clip bg-murk text-bone">
      <LandingNav />

      <main className="container pb-16 pt-32 sm:pt-40">
        <div className="max-w-2xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500 transition-colors hover:text-spire"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to home
          </Link>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-bone sm:text-5xl">
            Documentation
          </h1>
          <p className="mt-5 text-[16px] leading-relaxed text-zinc-400">
            What Murkspire reads, how it reads it, and what it deliberately does not do.
          </p>
        </div>

        <div className="mt-16 gap-16 lg:flex">
          {/* Sidebar */}
          <aside className="mb-12 lg:mb-0 lg:w-56 lg:shrink-0">
            <nav className="lg:sticky lg:top-28">
              <p className="mono-label">On this page</p>
              <ul className="mt-4 space-y-1 border-l border-white/[0.08]">
                {NAV.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className={`-ml-px block border-l py-1.5 pl-4 text-[13.5px] transition-colors ${
                        active === item.id
                          ? 'border-spire text-bone'
                          : 'border-transparent text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <Section id="overview" title="Overview">
              <P>
                Murkspire is a read only intelligence layer for the Solana blockchain. It watches
                large wallet movements, market flow across decentralised exchanges, validator
                performance, and a combined event stream, then presents all four in a single
                dashboard.
              </P>
              <P>
                The problem it solves is narrow and concrete. Solana produces far more activity than
                a person can follow through a block explorer. Answering a simple question, such as
                whether a large holder moved funds in the last hour or whether a validator is still
                performing, means opening several tabs, reading raw responses, and doing arithmetic
                by hand. Murkspire does that work continuously and shows only the result.
              </P>
              <P>
                It holds no funds, stores no credentials, and requires no account. Every page works
                without connecting a wallet.
              </P>
            </Section>

            <Section id="architecture" title="Architecture">
              <P>
                Murkspire is a single page application. For three of its four modules there is no
                backend at all. The browser reads Solana directly through a Helius endpoint, parses
                the response, and renders it.
              </P>

              <Pipeline />

              <P>
                This keeps the moving parts small. There is no database of user state, no session
                layer, and no server that has to be trusted with anything. The only server side
                component is the aggregation function behind the Live Feed.
              </P>

              <H3>Where things live</H3>
              <Table
                head={['Area', 'Responsibility']}
                rows={[
                  [<Term key="a">lib/helius</Term>, 'All chain reads and response parsing'],
                  [<Term key="b">pages</Term>, 'One file per dashboard module'],
                  [<Term key="c">components/landing</Term>, 'Public site sections'],
                  [<Term key="d">supabase/functions</Term>, 'Edge functions behind the Live Feed'],
                ]}
              />
            </Section>

            <Section id="data-sources" title="Data sources">
              <P>
                Everything comes from Solana mainnet over standard JSON RPC, proxied through Helius.
                No third party analytics service sits in between, and no data is cached on a server
                that Murkspire controls.
              </P>

              <Table
                head={['Method', 'Used for']}
                rows={[
                  [<Term key="1">getSignaturesForAddress</Term>, 'Recent transactions for a watched wallet'],
                  [<Term key="2">getTransaction</Term>, 'Full detail, balance deltas, token transfers'],
                  [<Term key="3">getVoteAccounts</Term>, 'Validator set, activated stake, commission'],
                  [<Term key="4">getEpochInfo</Term>, 'Current epoch number and progress'],
                  [<Term key="5">getTokenSupply</Term>, 'Token supply lookups'],
                ]}
              />

              <H3>How a whale transaction is read</H3>
              <P>
                Signatures are fetched for each watched address, then the most recent ten are
                expanded into full transactions. The transferred amount is taken from the difference
                between the balance before and after the transaction, then converted from lamports
                into SOL by dividing by one billion.
              </P>
              <P>
                If the transaction also carries token balances, the token amount takes precedence
                over the native SOL difference.
              </P>
            </Section>

            <Section id="modules" title="The four modules">
              <H3>Whale Activity</H3>
              <P>
                Monitors three large Solana wallets. For each one the most recent signatures are
                fetched and the top ten are expanded in full. Anything above one thousand SOL is
                flagged as notable. The display threshold is one hundred SOL.
              </P>

              <H3>Market Flow</H3>
              <P>
                Intended to show swap volume and direction across Jupiter, Raydium and Orca for the
                major pairs.
              </P>
              <Note tone="warn">
                <p>
                  <strong className="text-bone">This module currently returns generated data.</strong>{' '}
                  The exchange aggregator integration is not wired up yet, so the figures shown are
                  representative rather than live. Everything else described on this page reads real
                  chain state.
                </p>
              </Note>

              <H3>Staking Monitor</H3>
              <P>
                Pulls the full validator set and ranks the top fifty by activated stake. Stake and
                commission come straight from the chain. The epoch number and its progress come from
                the same source. Yield is estimated within the typical Solana range rather than
                measured for each validator individually.
              </P>

              <H3>Live Feed</H3>
              <P>
                Merges whale, market and staking events into one chronological stream through a
                Supabase edge function, with a realtime subscription that pushes new rows as they
                land.
              </P>
            </Section>

            <Section id="refresh" title="Refresh and limits">
              <P>
                Each module polls on its own interval, chosen to match how quickly the underlying
                data actually changes. Validator figures only move once per epoch, so polling them
                aggressively would waste quota for nothing.
              </P>

              <Table
                head={['Module', 'Interval', 'Reason']}
                rows={[
                  ['Whale Activity', '30 seconds', 'Transactions land continuously'],
                  ['Market Flow', '30 seconds', 'Volume shifts minute to minute'],
                  ['Staking Monitor', '60 seconds', 'Validator state changes once per epoch'],
                  ['Live Feed', '10 seconds plus realtime push', 'Aggregated stream'],
                ]}
              />

              <Note tone="warn">
                <p>
                  Whale Activity issues one signature request plus ten transaction requests for each
                  watched wallet, every thirty seconds, in every open browser tab. With three wallets
                  that is roughly thirty three requests per cycle. Leaving several tabs open will
                  consume an RPC quota quickly.
                </p>
              </Note>
            </Section>

            <Section id="security" title="Security model">
              <P>
                Murkspire is built so that there is nothing worth attacking. It is easier to state
                what it cannot do than what it protects.
              </P>

              <Table
                head={['Property', 'Detail']}
                rows={[
                  ['Custody', 'None. No deposit address, no vault, and no withdrawal path exists in the codebase.'],
                  ['Signing', 'No code path can sign, send, or approve a transaction.'],
                  ['Accounts', 'No signup, no email, no password, and no session storage.'],
                  ['Wallet connection', 'Optional. It grants read access to a public address only.'],
                  ['Licence', 'MIT. Every request the client makes is visible in the source.'],
                ]}
              />

              <Note tone="warn">
                <p>
                  <strong className="text-bone">On the API key.</strong> The Helius key is supplied
                  through an environment variable that the build inlines into the client bundle by
                  design, which makes it public. If you deploy this, treat the key as disclosed and
                  either restrict it by domain or move the chain reads behind a serverless proxy.
                </p>
              </Note>
            </Section>

            <Section id="limitations" title="Known limitations">
              <P>
                Stated plainly, because a tool you cannot calibrate is a tool you cannot trust.
              </P>

              <Table
                head={['Limitation', 'Impact']}
                rows={[
                  [
                    'Market Flow uses generated data',
                    'Volume, price impact and exchange split are representative, not live.',
                  ],
                  [
                    'The SOL price is a fixed constant',
                    'Dollar columns are approximations and drift from the real rate.',
                  ],
                  [
                    'Validator yield is estimated',
                    'Derived from a typical range rather than measured for each validator.',
                  ],
                  [
                    'Fifty validators, not the full set',
                    'The leaderboard covers the top fifty by stake.',
                  ],
                  [
                    'Balance change reads the first account',
                    'When the watched wallet is not the fee payer, the amount can be misattributed.',
                  ],
                  [
                    'Polling rather than streaming',
                    'Changes surface on the next interval, not the instant they occur.',
                  ],
                ]}
              />

              <Note>
                <p>
                  These are tracked as work, not accepted as final. If you rely on a figure for a
                  decision, verify it against an explorer first.
                </p>
              </Note>
            </Section>

            <div className="mt-8 flex flex-wrap gap-3 border-t border-white/[0.06] pt-8">
              <Link to="/app" className="pill-primary px-6 py-3 text-sm font-semibold">
                Open the dashboard
              </Link>
              <a
                href={X_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="pill-ghost px-6 py-3 text-sm font-semibold"
              >
                <XIcon className="h-4 w-4" />
                Follow on X
              </a>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
