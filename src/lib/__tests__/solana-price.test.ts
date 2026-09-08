import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const SOL_MINT = 'So11111111111111111111111111111111111111112';

/** Fresh module per test so the internal cache never leaks between cases. */
async function loadModule() {
  vi.resetModules();
  return import('../solana-price');
}

const jupiterOk = (usd: number) => ({
  ok: true,
  json: async () => ({ [SOL_MINT]: { usdPrice: usd } }),
});
const geckoOk = (usd: number) => ({ ok: true, json: async () => ({ solana: { usd } }) });

describe('getSolPrice', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn()));
  afterEach(() => vi.unstubAllGlobals());

  it('uses Jupiter when it answers', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jupiterOk(103.99));
    vi.stubGlobal('fetch', fetchMock);

    const { getSolPrice } = await loadModule();
    expect(await getSolPrice()).toBeCloseTo(103.99, 2);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toContain('jup.ag');
  });

  it('falls back to CoinGecko when Jupiter fails', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce(geckoOk(103.87));
    vi.stubGlobal('fetch', fetchMock);

    const { getSolPrice } = await loadModule();
    expect(await getSolPrice()).toBeCloseTo(103.87, 2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  /* The old code hardcoded 98 with no way to notice it had gone stale. The
     fallback still exists, but only after both live sources have failed. */
  it('falls back to a constant only when every source fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { getSolPrice } = await loadModule();
    expect(await getSolPrice()).toBe(100);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('caches, so a burst of callers makes one request', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jupiterOk(101));
    vi.stubGlobal('fetch', fetchMock);

    const { getSolPrice } = await loadModule();
    const results = await Promise.all([getSolPrice(), getSolPrice(), getSolPrice()]);

    expect(results).toEqual([101, 101, 101]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('rejects a non-numeric price rather than propagating NaN', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ [SOL_MINT]: { usdPrice: null } }) })
      .mockResolvedValueOnce(geckoOk(99.5));
    vi.stubGlobal('fetch', fetchMock);

    const { getSolPrice } = await loadModule();
    expect(await getSolPrice()).toBeCloseTo(99.5, 2);
  });
});

describe('getSolSupply', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('reads total supply from CoinGecko', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ market_data: { total_supply: 633_642_953 } }),
      })
    );

    const { getSolSupply } = await loadModule();
    expect(await getSolSupply()).toBe(633_642_953);
  });

  it('returns null instead of a fabricated number when unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { getSolSupply } = await loadModule();
    expect(await getSolSupply()).toBeNull();
    warn.mockRestore();
  });
});
