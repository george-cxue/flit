import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { MOCK_SP500 } from '@/data/mock-portfolio';
import { Portfolio, AssetAllocation, Stock, TimeFrame } from '@/types/portfolio';
import { LeagueService } from '@/src/services/fantasy/leagueService';
import { apiClient } from '@/src/services/api';
import { generatePortfolioHistory, calculateVolatilityFactor } from '@/utils/portfolio-history';

interface PortfolioContextType {
  // Current state
  selectedLeagueId: string;
  timeFrame: TimeFrame;
  portfolios: Record<string, Portfolio>;
  loading: boolean;

  // Actions
  setSelectedLeagueId: (id: string) => void;
  setTimeFrame: (timeFrame: TimeFrame) => void;
  allocateFunds: (leagueId: string, asset: keyof AssetAllocation, amount: number) => void;
  buyStock: (leagueId: string, stock: Stock, shares: number) => void;
  ensurePortfolioExists: (leagueId: string, leagueName: string) => void;
  refreshPortfolios: () => Promise<void>;

  // Getters
  getCurrentPortfolio: () => Portfolio | null;
  getPortfolioByLeague: (leagueId: string) => Portfolio | undefined;
  hasPortfolio: (leagueId: string) => boolean;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

interface PortfolioProviderProps {
  children: ReactNode;
}

const CURRENT_USER_ID = 'user_1';

export function PortfolioProvider({ children }: PortfolioProviderProps) {
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>('');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1M');
  const [portfolios, setPortfolios] = useState<Record<string, Portfolio>>({});
  const [loading, setLoading] = useState(true);

  // Fetch portfolios from backend
  const fetchPortfolios = async () => {
    try {
      setLoading(true);

      // Fetch all leagues for the user
      const leagues = await LeagueService.getLeagues();

      if (leagues.length === 0) {
        setPortfolios({});
        setLoading(false);
        return;
      }

      // Set first league as selected if none selected
      if (!selectedLeagueId && leagues.length > 0) {
        setSelectedLeagueId(leagues[0].id);
      }

      // Fetch portfolio for each league
      const portfolioPromises = leagues.map(async (league) => {
        try {
          const response = await apiClient.get(`/fantasy-leagues/${league.id}/portfolio/${CURRENT_USER_ID}`);
          const backendPortfolio = response.data;

          // Transform backend portfolio to frontend Portfolio type
          const totalValue = backendPortfolio.totalValue || backendPortfolio.cashBalance;
          const startingBalance = league.settings.startingBalance || 10000;
          const leagueStartDate = new Date(league.settings.startDate || Date.now());

          // Generate unique performance history for this portfolio
          const volatilityFactor = calculateVolatilityFactor(league.id, startingBalance);
          const history = generatePortfolioHistory(
            totalValue,
            startingBalance,
            leagueStartDate,
            volatilityFactor
          );

          const portfolio: Portfolio = {
            leagueId: league.id,
            totalValue,
            liquidFunds: backendPortfolio.cashBalance,
            lessonRewards: 0, // Not tracked in backend yet
            allocation: {
              savings: 0,
              bonds: 0,
              indexFunds: 0,
            },
            holdings: backendPortfolio.slots?.map((slot: any) => ({
              symbol: slot.asset?.ticker || '',
              name: slot.asset?.name || '',
              shares: slot.shares,
              averagePrice: slot.averageCost,
              currentPrice: slot.asset?.currentPrice || slot.currentPrice,
              totalValue: slot.shares * (slot.asset?.currentPrice || slot.currentPrice),
              changePercent: slot.gainLossPercent || 0,
            })) || [],
            history,
          };

          return { leagueId: league.id, portfolio };
        } catch (error) {
          console.error(`Failed to fetch portfolio for league ${league.id}:`, error);

          // Return default portfolio if fetch fails
          const startingBalance = league.settings.startingBalance || 10000;
          const leagueStartDate = new Date(league.settings.startDate || Date.now());
          const volatilityFactor = calculateVolatilityFactor(league.id, startingBalance);

          return {
            leagueId: league.id,
            portfolio: {
              leagueId: league.id,
              totalValue: startingBalance,
              liquidFunds: startingBalance,
              lessonRewards: 0,
              allocation: { savings: 0, bonds: 0, indexFunds: 0 },
              holdings: [],
              history: generatePortfolioHistory(
                startingBalance,
                startingBalance,
                leagueStartDate,
                volatilityFactor
              ),
            },
          };
        }
      });

      const portfolioResults = await Promise.all(portfolioPromises);
      const newPortfolios: Record<string, Portfolio> = {};

      portfolioResults.forEach(({ leagueId, portfolio }) => {
        newPortfolios[leagueId] = portfolio;
      });

      setPortfolios(newPortfolios);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchPortfolios();
  }, []);

  const allocateFunds = (leagueId: string, asset: keyof AssetAllocation, amount: number) => {
    setPortfolios((prev) => {
      const portfolio = prev[leagueId];
      if (!portfolio) return prev;

      return {
        ...prev,
        [leagueId]: {
          ...portfolio,
          liquidFunds: portfolio.liquidFunds - amount,
          allocation: {
            ...portfolio.allocation,
            [asset]: portfolio.allocation[asset] + amount,
          },
          totalValue: portfolio.totalValue + amount,
        },
      };
    });
  };

  const buyStock = (leagueId: string, stock: Stock, shares: number) => {
    const totalCost = stock.currentPrice * shares;
    setPortfolios((prev) => {
      const portfolio = prev[leagueId];
      if (!portfolio) return prev;

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

  const getCurrentPortfolio = (): Portfolio | null => {
    return portfolios[selectedLeagueId] || null;
  };

  const getPortfolioByLeague = (leagueId: string): Portfolio | undefined => {
    return portfolios[leagueId];
  };

  const hasPortfolio = (leagueId: string): boolean => {
    return !!portfolios[leagueId];
  };

  const ensurePortfolioExists = (leagueId: string, leagueName: string) => {
    // Portfolios are now fetched from backend, so this is a no-op
    // Kept for backward compatibility
  };

  const refreshPortfolios = async () => {
    await fetchPortfolios();
  };

  const value: PortfolioContextType = {
    selectedLeagueId,
    timeFrame,
    portfolios,
    loading,
    setSelectedLeagueId,
    setTimeFrame,
    allocateFunds,
    buyStock,
    ensurePortfolioExists,
    refreshPortfolios,
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
