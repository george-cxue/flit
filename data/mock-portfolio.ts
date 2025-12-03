import { League, Portfolio, Stock, MarketIndex, PortfolioSnapshot } from '@/types/portfolio';

// Generate historical data points
const generateHistoricalData = (
  days: number,
  startValue: number,
  volatility: number = 0.02,
  trend: number = 0.0005
): PortfolioSnapshot[] => {
  const data: PortfolioSnapshot[] = [];
  const now = Date.now();
  let value = startValue;

  for (let i = days; i >= 0; i--) {
    const timestamp = now - i * 24 * 60 * 60 * 1000;
    // Random walk with slight upward trend
    const change = (Math.random() - 0.5) * volatility * value + trend * value;
    value = Math.max(value + change, startValue * 0.8); // Floor at 80% of start
    data.push({ timestamp, value: Math.round(value * 100) / 100 });
  }

  return data;
};

// Mock Leagues
export const MOCK_LEAGUES: League[] = [
  {
    id: 'league-1',
    name: 'Economics 101',
    type: 'class',
    memberCount: 28,
  },
  {
    id: 'league-2',
    name: 'College Friends',
    type: 'friends',
    memberCount: 7,
  },
  {
    id: 'league-3',
    name: 'National Rankings',
    type: 'public',
    memberCount: 1247,
  },
];

// Mock Stock Database
export const MOCK_STOCKS: Stock[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', currentPrice: 178.32, changePercent: 1.24, sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', currentPrice: 378.91, changePercent: 0.87, sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', currentPrice: 140.25, changePercent: -0.45, sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', currentPrice: 155.67, changePercent: 2.13, sector: 'Consumer' },
  { symbol: 'TSLA', name: 'Tesla Inc.', currentPrice: 242.84, changePercent: -1.89, sector: 'Automotive' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', currentPrice: 495.22, changePercent: 3.45, sector: 'Technology' },
  { symbol: 'META', name: 'Meta Platforms Inc.', currentPrice: 338.54, changePercent: 0.92, sector: 'Technology' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway', currentPrice: 368.45, changePercent: 0.23, sector: 'Financial' },
  { symbol: 'V', name: 'Visa Inc.', currentPrice: 252.89, changePercent: 0.67, sector: 'Financial' },
  { symbol: 'JPM', name: 'JPMorgan Chase', currentPrice: 158.34, changePercent: -0.34, sector: 'Financial' },
  { symbol: 'WMT', name: 'Walmart Inc.', currentPrice: 68.92, changePercent: 0.45, sector: 'Retail' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', currentPrice: 157.23, changePercent: -0.12, sector: 'Healthcare' },
  { symbol: 'PG', name: 'Procter & Gamble', currentPrice: 156.78, changePercent: 0.34, sector: 'Consumer' },
  { symbol: 'DIS', name: 'The Walt Disney Co.', currentPrice: 91.45, changePercent: 1.78, sector: 'Entertainment' },
  { symbol: 'NFLX', name: 'Netflix Inc.', currentPrice: 448.92, changePercent: 2.45, sector: 'Entertainment' },
];

// S&P 500 baseline data
export const MOCK_SP500: MarketIndex = {
  history: generateHistoricalData(30, 10000, 0.015, 0.0003),
};

// Mock Portfolios for each league
export const MOCK_PORTFOLIOS: Record<string, Portfolio> = {
  'league-1': {
    leagueId: 'league-1',
    totalValue: 11234.56,
    liquidFunds: 2450.00,
    lessonRewards: 850.00,
    allocation: {
      savings: 1500.00,
      bonds: 2000.00,
      indexFunds: 3500.00,
    },
    holdings: [
      {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        shares: 5,
        averagePrice: 170.50,
        currentPrice: 178.32,
        totalValue: 891.60,
        changePercent: 4.59,
      },
      {
        symbol: 'MSFT',
        name: 'Microsoft Corporation',
        shares: 3,
        averagePrice: 365.00,
        currentPrice: 378.91,
        totalValue: 1136.73,
        changePercent: 3.81,
      },
      {
        symbol: 'NVDA',
        name: 'NVIDIA Corporation',
        shares: 2,
        averagePrice: 455.00,
        currentPrice: 495.22,
        totalValue: 990.44,
        changePercent: 8.84,
      },
    ],
    history: generateHistoricalData(30, 10500, 0.025, 0.0008),
  },
  'league-2': {
    leagueId: 'league-2',
    totalValue: 8567.23,
    liquidFunds: 1200.00,
    lessonRewards: 450.00,
    allocation: {
      savings: 2000.00,
      bonds: 1500.00,
      indexFunds: 2800.00,
    },
    holdings: [
      {
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        shares: 4,
        averagePrice: 250.00,
        currentPrice: 242.84,
        totalValue: 971.36,
        changePercent: -2.86,
      },
      {
        symbol: 'AMZN',
        name: 'Amazon.com Inc.',
        shares: 3,
        averagePrice: 148.00,
        currentPrice: 155.67,
        totalValue: 467.01,
        changePercent: 5.18,
      },
    ],
    history: generateHistoricalData(30, 8000, 0.03, 0.0006),
  },
  'league-3': {
    leagueId: 'league-3',
    totalValue: 15678.90,
    liquidFunds: 3500.00,
    lessonRewards: 1200.00,
    allocation: {
      savings: 1000.00,
      bonds: 2500.00,
      indexFunds: 5000.00,
    },
    holdings: [
      {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        shares: 8,
        averagePrice: 175.00,
        currentPrice: 178.32,
        totalValue: 1426.56,
        changePercent: 1.90,
      },
      {
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        shares: 10,
        averagePrice: 135.00,
        currentPrice: 140.25,
        totalValue: 1402.50,
        changePercent: 3.89,
      },
      {
        symbol: 'META',
        name: 'Meta Platforms Inc.',
        shares: 4,
        averagePrice: 320.00,
        currentPrice: 338.54,
        totalValue: 1354.16,
        changePercent: 5.79,
      },
      {
        symbol: 'V',
        name: 'Visa Inc.',
        shares: 6,
        averagePrice: 245.00,
        currentPrice: 252.89,
        totalValue: 1517.34,
        changePercent: 3.22,
      },
    ],
    history: generateHistoricalData(30, 14500, 0.022, 0.0007),
  },
};
