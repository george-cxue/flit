import { PortfolioSnapshot } from '@/types/portfolio';

/**
 * Generate historical performance data for a portfolio
 * Creates realistic market-like data with volatility and trends
 */
export const generatePortfolioHistory = (
  currentValue: number,
  startingBalance: number,
  leagueStartDate: Date,
  volatilityFactor: number = 1.0 // Multiplier for how volatile this portfolio is
): PortfolioSnapshot[] => {
  const data: PortfolioSnapshot[] = [];
  const now = Date.now();
  const leagueStart = leagueStartDate.getTime();

  // Calculate days since league started
  const daysSinceStart = Math.floor((now - leagueStart) / (24 * 60 * 60 * 1000));

  // Also add 5 years of historical data before league started (for comparison with S&P 500)
  const fiveYearsInDays = 1825;
  const totalDays = fiveYearsInDays + daysSinceStart;

  // Calculate overall return since league started
  const totalReturn = (currentValue - startingBalance) / startingBalance;
  const dailyTrend = totalReturn / Math.max(daysSinceStart, 1);

  // Base volatility (adjusted by factor)
  const baseVolatility = 0.02 * volatilityFactor;

  // Start from 5 years ago at a calculated historical value
  // Work backwards from starting balance
  let value = startingBalance * 0.85; // Assume started lower 5 years ago

  for (let i = totalDays; i >= 0; i--) {
    const timestamp = now - i * 24 * 60 * 60 * 1000;

    // Different behavior before and after league start
    const daysFromNow = i;
    const isBeforeLeagueStart = daysFromNow > daysSinceStart;

    if (isBeforeLeagueStart) {
      // Before league started: moderate growth toward starting balance
      const daysBeforeStart = daysFromNow - daysSinceStart;
      const trend = (startingBalance - value) / Math.max(daysBeforeStart, 1) * 0.3;
      const change = (Math.random() - 0.5) * baseVolatility * value + trend;
      value = Math.max(value + change, startingBalance * 0.7);
    } else {
      // After league started: trend toward current value
      const volatility = baseVolatility * (1 + Math.random() * 0.5); // Variable volatility
      const change = (Math.random() - 0.5) * volatility * value + dailyTrend * value;
      value = Math.max(value + change, startingBalance * 0.8);
    }

    data.push({
      timestamp,
      value: Math.round(value * 100) / 100,
    });
  }

  // Ensure the last point matches current value
  if (data.length > 0) {
    data[data.length - 1].value = currentValue;
  }

  // Add some intraday data for today
  const intradayData = generateIntradayData(currentValue, baseVolatility * 0.5);

  return [...data.slice(0, -1), ...intradayData];
};

/**
 * Generate intraday (hourly) data for today
 */
const generateIntradayData = (
  currentValue: number,
  volatility: number = 0.01
): PortfolioSnapshot[] => {
  const data: PortfolioSnapshot[] = [];
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Market hours: 9:30 AM - 4:00 PM ET (6.5 hours)
  const marketOpen = new Date(today);
  marketOpen.setHours(9, 30, 0, 0);

  const marketClose = new Date(today);
  marketClose.setHours(16, 0, 0, 0);

  // Start from yesterday's close value (slightly lower)
  let value = currentValue * 0.998;

  // Generate data points every 30 minutes during market hours
  const current = new Date(marketOpen);
  while (current <= marketClose && current <= now) {
    const change = (Math.random() - 0.5) * volatility * value;
    value = Math.max(value + change, currentValue * 0.95);
    data.push({
      timestamp: current.getTime(),
      value: Math.round(value * 100) / 100,
    });

    current.setMinutes(current.getMinutes() + 30);
  }

  // Ensure we end at current value
  if (data.length > 0) {
    data[data.length - 1].value = currentValue;
  }

  return data;
};

/**
 * Calculate a unique volatility factor for a league based on its characteristics
 */
export const calculateVolatilityFactor = (
  leagueId: string,
  startingBalance: number
): number => {
  // Use league ID to generate a consistent but unique volatility
  const hash = leagueId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const normalized = (hash % 100) / 100; // 0-1 range

  // Higher starting balance = slightly lower volatility (more conservative)
  const balanceFactor = Math.max(0.7, 1.2 - startingBalance / 50000);

  // Final volatility between 0.7x and 1.4x
  return 0.7 + normalized * 0.7 * balanceFactor;
};
