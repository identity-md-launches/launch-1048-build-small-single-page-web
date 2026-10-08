export const POOLS = [
  { id: 'new', name: 'New pool', eth: 10 },
  { id: 'growing', name: 'Growing pool', eth: 100 },
  { id: 'deep', name: 'Deep pool', eth: 1000 },
] as const;

export const FEE_RATE = 0.003;
export const STARTING_RATE = 1000;
export const DEFAULTS = { amount: '1', pool: 'growing', slippage: '0.5' };

export function parseAmount(raw: string): { value: number; error: null } | { value: null; error: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { value: null, error: 'Enter an ETH amount to see your estimate.' };
  if (!/^(?:\d+\.?\d*|\.\d+)$/.test(trimmed)) {
    return { value: null, error: 'Use a number with a decimal point, such as 0.5.' };
  }
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value < 0.001 || value > 1000) {
    return { value: null, error: 'Enter an amount from 0.001 to 1,000 ETH.' };
  }
  return { value, error: null };
}

/** Constant-product pool with an input fee; impact excludes the fee. */
export function quote(amount: number, ethReserve: number, slippagePercent: number) {
  if (!Number.isFinite(amount) || amount <= 0 || !Number.isFinite(ethReserve) || ethReserve <= 0 ||
      !Number.isFinite(slippagePercent) || slippagePercent < 0 || slippagePercent >= 100) {
    throw new RangeError('Use positive finite amounts and reserves, and slippage from 0 to less than 100.');
  }
  const fee = amount * FEE_RATE;
  const effectiveInput = amount - fee;
  const tokenReserve = ethReserve * STARTING_RATE;
  const output = tokenReserve * effectiveInput / (ethReserve + effectiveInput);
  const impact = effectiveInput / (ethReserve + effectiveInput) * 100;
  return {
    output,
    impact,
    fee,
    minimum: output * (1 - slippagePercent / 100),
    spotOutput: effectiveInput * STARTING_RATE,
    effectiveRate: output / amount,
  };
}

export function format(value: number, decimals = 2): string {
  if (value > 0 && value < 0.01) return value.toLocaleString('en-US', { maximumSignificantDigits: 3 });
  return value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
