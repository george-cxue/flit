import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MOCK_LEAGUES, MOCK_PORTFOLIOS } from '@/data/mock-portfolio';
import { Portfolio, AssetAllocation, Stock, TimeFrame } from '@/types/portfolio';

interface PortfolioContextType {
  // Current state
  selectedLeagueId: string;
  timeFrame: TimeFrame;
  portfolios: Record<string, Portfolio>;

  // Actions
  setSelectedLeagueId: (id: string) => void;
  setTimeFrame: (timeFrame: TimeFrame) => void;
  allocateFunds: (leagueId: string, asset: keyof AssetAllocation, amount: number) => void;
  buyStock: (leagueId: string, stock: Stock, shares: number) => void;
  ensurePortfolioExists: (leagueId: string, leagueName: string) => void;

  // Getters
  getCurrentPortfolio: () => Portfolio;
  getPortfolioByLeague: (leagueId: string) => Portfolio | undefined;
  hasPortfolio: (leagueId: string) => boolean;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

interface PortfolioProviderProps {
  children: ReactNode;
}

export function PortfolioProvider({ children }: PortfolioProviderProps) {
  const [selectedLeagueId, setSelectedLeagueId] = useState(MOCK_LEAGUES[0].id);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1M');
  const [portfolios, setPortfolios] = useState<Record<string, Portfolio>>(MOCK_PORTFOLIOS);

  const allocateFunds = (leagueId: string, asset: keyof AssetAllocation, amount: number) => {
    setPortfolios((prev) => ({
      ...prev,
      [leagueId]: {
        ...prev[leagueId],
        liquidFunds: prev[leagueId].liquidFunds - amount,
        allocation: {
          ...prev[leagueId].allocation,
          [asset]: prev[leagueId].allocation[asset] + amount,
        },
        totalValue: prev[leagueId].totalValue + amount,
      },
    }));
  };

  const buyStock = (leagueId: string, stock: Stock, shares: number) => {
    const totalCost = stock.currentPrice * shares;
    setPortfolios((prev) => {
      const portfolio = prev[leagueId];
      const existingHolding = portfolio.holdings.find((h) => h.symbol === stock.symbol);

      let updatedHoldings;
      if (existingHolding) {
        const totalShares = existingHolding.shares + shares;
        const newAveragePrice =
          (existingHolding.averagePrice * existingHolding.shares + totalCost) / totalShares;

        updatedHoldings = portfolio.holdings.map((h) =>
          h.symbol === stock.symbol
            ? {
                ...h,
                shares: totalShares,
                averagePrice: newAveragePrice,
                totalValue: stock.currentPrice * totalShares,
                changePercent: ((stock.currentPrice - newAveragePrice) / newAveragePrice) * 100,
              }
            : h
        );
      } else {
        updatedHoldings = [
          ...portfolio.holdings,
          {
            symbol: stock.symbol,
            name: stock.name,
            shares,
            averagePrice: stock.currentPrice,
            currentPrice: stock.currentPrice,
            totalValue: totalCost,
            changePercent: 0,
          },
        ];
      }

      return {
        ...prev,
        [leagueId]: {
          ...portfolio,
          lessonRewards: portfolio.lessonRewards - totalCost,
          holdings: updatedHoldings,
          totalValue: portfolio.totalValue + totalCost,
        },
      };
    });
  };

  const getCurrentPortfolio = (): Portfolio => {
    return portfolios[selectedLeagueId];
  };

  const getPortfolioByLeague = (leagueId: string): Portfolio | undefined => {
    return portfolios[leagueId];
  };

  const hasPortfolio = (leagueId: string): boolean => {
    return !!portfolios[leagueId];
  };

  const ensurePortfolioExists = (leagueId: string, leagueName: string) => {
    if (!portfolios[leagueId]) {
      // Create a new portfolio for this league
      const newPortfolio: Portfolio = {
        leagueId,
        totalValue: 10000, // Starting value
        liquidFunds: 5000,
        lessonRewards: 500,
        allocation: {
          savings: 0,
          bonds: 0,
          indexFunds: 0,
        },
        holdings: [],
        history: [], // Will be populated with historical data
      };

      setPortfolios((prev) => ({
        ...prev,
        [leagueId]: newPortfolio,
      }));
    }
  };

  const value: PortfolioContextType = {
    selectedLeagueId,
    timeFrame,
    portfolios,
    setSelectedLeagueId,
    setTimeFrame,
    allocateFunds,
    buyStock,
    ensurePortfolioExists,
    getCurrentPortfolio,
    getPortfolioByLeague,
    hasPortfolio,
  };

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
}
