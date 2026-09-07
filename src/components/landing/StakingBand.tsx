import { ArrowDownWideNarrow } from 'lucide-react';
import { FeatureBand } from './FeatureBand';

const VALIDATORS = [
  { rank: 1, id: 'F7a3kQ…m9ZtL', stake: '2.41M', commission: 5, apy: '7.42' },
  { rank: 2, id: '9cL2pD…xR4vB', stake: '1.98M', commission: 7, apy: '7.31' },
  { rank: 3, id: 'B3nKjT…qP8Lm', stake: '1.76M', commission: 0, apy: '7.15', hot: true },
  { rank: 4, id: '5gVtYz…c2FhQ', stake: '1.52M', commission: 8, apy: '6.98' },
  { rank: 5, id: 'Hq7mWx…nT3Kd', stake: '1.41M', commission: 5, apy: '6.94' },
  { rank: 6, id: 'Ap9zRc…vB6Ln', stake: '1.28M', commission: 10, apy: '6.87' },
  { rank: 7, id: 'Ez4tMv…kQ9Xs', stake: '1.15M', commission: 6, apy: '6.81' },
  { rank: 8, id: 'Ns6bHy…wD2Pj', stake: '0.98M', commission: 7, apy: '6.74' },
  { rank: 9, id: 'Tk3fLd…gR8Vm', stake: '0.87M', commission: 9, apy: '6.71' },
  { rank: 10, id: 'Wp5nQj…hZ4Ct', stake: '0.79M', commission: 5, apy: '6.68' },
];

/* Rank + validator + APY on phones; stake joins at sm, commission at lg. */
const COLS =
  'grid items-center gap-3 px-4 grid-cols-[1.5rem_1.6fr_.9fr] ' +
  'sm:grid-cols-[2rem_1.6fr_1fr_.9fr] sm:px-5 ' +
  'lg:grid-cols-[2rem_1.6fr_1fr_1fr_.9fr]';
const EPOCH_PROGRESS = 68;

export function StakingBand() {
  return (
    <FeatureBand
      label="Staking Monitor"
      headline={
        <>
          Fifty validators,
          <br />
          ranked by what they actually do.
        </>
      }
      body={[
        'Real APY, real commission, real uptime.',
        'Sorted by performance, refreshed every epoch.',
      ]}
      linkText="Open staking monitor"
      linkTo="/app/staking"
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4 border-b border-white/[0.07] p-4">
        <div className="flex items-center gap-3">
          <span className="rounded-md border border-spire/40 bg-spire/10 px-2.5 py-1 font-mono text-xs text-spire">
            EPOCH 743
          </span>
          <div className="flex items-center gap-2">
            <div className="h-[3px] w-28 overflow-hidden rounded-full bg-white/[0.08]">
              <div className="h-full rounded-full bg-spire" style={{ width: `${EPOCH_PROGRESS}%` }} />
            </div>
            <span className="font-mono text-xs text-zinc-500">{EPOCH_PROGRESS}% complete</span>
          </div>
        </div>

        <span className="ml-auto flex items-center gap-2 font-mono text-xs text-zinc-400">
          <ArrowDownWideNarrow className="h-3.5 w-3.5 text-zinc-500" />
          Sorted by APY
        </span>
      </div>

      {/* Header */}
      <div className={`${COLS} border-b border-white/[0.07] py-2.5`}>
        <span className="mono-label">#</span>
        <span className="mono-label">Validator</span>
        <span className="mono-label hidden text-right sm:block">Stake</span>
        <span className="mono-label hidden text-right lg:block">Commission</span>
        <span className="mono-label text-right">APY</span>
      </div>

      {/* Rows */}
      <div>
        {VALIDATORS.map((v) => (
          <div
            key={v.id}
            className={`${COLS} relative border-b border-white/[0.04] py-2.5 transition-colors hover:bg-white/[0.02] ${
              v.hot ? 'bg-spire/[0.05]' : ''
            }`}
          >
            {v.hot && <span className="absolute inset-y-0 left-0 w-[2px] bg-spire" />}
            <span className="font-mono text-xs text-zinc-600">{v.rank}</span>
            <span className="truncate font-mono text-[13px] text-zinc-200">{v.id}</span>
            <span className="hidden text-right font-mono text-[13px] text-zinc-300 sm:block">
              {v.stake}
              <span className="ml-1.5 text-[11px] text-zinc-500">SOL</span>
            </span>
            <span
              className={`hidden text-right font-mono text-[13px] lg:block ${
                v.commission === 0 ? 'text-spire' : 'text-zinc-400'
              }`}
            >
              {v.commission}%
            </span>
            <span className="text-right font-mono text-[13px] font-medium text-spire">{v.apy}%</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3">
        <span className="font-mono text-xs text-zinc-500">Showing 10 of 50 validators</span>
        <span className="font-mono text-xs text-zinc-600">Updated 12s ago</span>
      </div>
    </FeatureBand>
  );
}
