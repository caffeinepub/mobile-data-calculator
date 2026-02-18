export interface CalculationInputs {
  niftyClose: string;
  cePremium: string;
  pePremium: string;
  rnCePremium: string;
  rnPePremium: string;
  entryPrice: string;
}

export interface CalculationResults {
  roundNumber: number | null;
  ceStrike: number | null;
  peStrike: number | null;
  panicPrice: number | null;
  stopLoss: number | null;
  target: number | null;
  gapUpEntry: number | null;
  gapDownEntry: number | null;
}

/**
 * Calculate the round number (nearest 100) from Nifty close price
 */
export function calculateRoundNumber(niftyClose: number): number {
  return Math.round(niftyClose / 100) * 100;
}

/**
 * Calculate CE and PE strike prices from round number
 */
export function calculateStrikes(roundNumber: number): { ce: number; pe: number } {
  return {
    ce: roundNumber + 100,
    pe: roundNumber - 100
  };
}

/**
 * Calculate panic price (average of CE and PE premiums)
 */
export function calculatePanicPrice(cePremium: number, pePremium: number): number {
  return (cePremium + pePremium) / 2;
}

/**
 * Calculate stop loss and target based on entry price
 * Stop Loss: -30% of entry
 * Target: +60% of entry
 */
export function calculateManagement(entryPrice: number): { stopLoss: number; target: number } {
  return {
    stopLoss: entryPrice * 0.7, // -30%
    target: entryPrice * 1.6 // +60%
  };
}
