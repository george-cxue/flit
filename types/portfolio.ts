export interface League {
  id: string;
  name: string;
  type: 'class' | 'friends' | 'public';
  memberCount: number;
}

export interface PortfolioSnapshot {
  timestamp: number;
  value: number;
}

export interface StockHolding {
  symbol: string;
  name: string;
  shares: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  changePercent: number;
}

export interface AssetAllocation {
  savings: number;
  bonds: number;
  indexFunds: number;
}

export interface Portfolio {
  leagueId: string;
  totalValue: number;
  liquidFunds: number;
  lessonRewards: number;
  allocation: AssetAllocation;
  holdings: StockHolding[];
  history: PortfolioSnapshot[];
}

export interface Stock {
  symbol: string;
  name: string;
  currentPrice: number;
  changePercent: number;
  sector: string;
}

export type TimeFrame = '1D' | '1W' | '1M';

export interface MarketIndex {
  history: PortfolioSnapshot[];
}
