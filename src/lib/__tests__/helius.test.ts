import { describe, expect, it } from 'vitest';
import { extractMovement, type EnhancedTx } from '../helius';

const WHALE = 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK';
const OTHER = '2k5hrzuykwyTbUe8L7UriYAQhr5hijNLgBvEB4B9pP5y';
const USDC = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

const tx = (partial: Partial<EnhancedTx>): EnhancedTx => ({
  signature: 'sig',
  timestamp: 1_788_469_144,
  ...partial,
});

describe('extractMovement', () => {
  it('sums native transfers that involve the watched wallet', () => {
    const moved = extractMovement(
      tx({
        nativeTransfers: [
          { fromUserAccount: OTHER, toUserAccount: WHALE, amount: 2_000_000_000 },
          { fromUserAccount: WHALE, toUserAccount: OTHER, amount: 500_000_000 },
        ],
      }),
      WHALE
    );

    expect(moved).not.toBeNull();
    expect(moved!.symbol).toBe('SOL');
    // 2 SOL in + 0.5 SOL out, reported as gross movement
    expect(moved!.amount).toBeCloseTo(2.5, 6);
  });

  /* This is the regression the rewrite exists for: the old implementation
     read preBalances[0]/postBalances[0], which is the fee payer, so a
     transfer between two unrelated parties was attributed to the whale. */
  it('ignores transfers the watched wallet is not part of', () => {
    const moved = extractMovement(
      tx({
        nativeTransfers: [
          { fromUserAccount: OTHER, toUserAccount: 'SomeoneElse111', amount: 9_000_000_000 },
        ],
      }),
      WHALE
    );

    expect(moved).toBeNull();
  });

  it('falls back to token transfers and resolves known mints', () => {
    const moved = extractMovement(
      tx({
        nativeTransfers: [],
        tokenTransfers: [
          { fromUserAccount: OTHER, toUserAccount: WHALE, tokenAmount: 1250.5, mint: USDC },
        ],
      }),
      WHALE
    );

    expect(moved).not.toBeNull();
    expect(moved!.symbol).toBe('USDC');
    expect(moved!.amount).toBeCloseTo(1250.5, 6);
  });

  it('labels unrecognised mints rather than guessing a symbol', () => {
    const moved = extractMovement(
      tx({
        tokenTransfers: [
          { fromUserAccount: WHALE, toUserAccount: OTHER, tokenAmount: 42, mint: 'Xsomething111' },
        ],
      }),
      WHALE
    );

    expect(moved!.symbol).toBe('SPL');
  });

  it('prefers native movement over token movement when both are present', () => {
    const moved = extractMovement(
      tx({
        nativeTransfers: [{ fromUserAccount: WHALE, toUserAccount: OTHER, amount: 1_000_000_000 }],
        tokenTransfers: [
          { fromUserAccount: WHALE, toUserAccount: OTHER, tokenAmount: 999, mint: USDC },
        ],
      }),
      WHALE
    );

    expect(moved!.symbol).toBe('SOL');
    expect(moved!.amount).toBeCloseTo(1, 6);
  });

  it('returns null when a transaction moves nothing', () => {
    expect(extractMovement(tx({}), WHALE)).toBeNull();
    expect(extractMovement(tx({ nativeTransfers: [], tokenTransfers: [] }), WHALE)).toBeNull();
  });

  it('tolerates transfers with missing amounts', () => {
    const moved = extractMovement(
      tx({ nativeTransfers: [{ fromUserAccount: WHALE, toUserAccount: OTHER }] }),
      WHALE
    );
    expect(moved!.amount).toBe(0);
  });
});
