import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react';
import { MOCK_SP500 } from '@/data/mock-portfolio';
import { Portfolio, AssetAllocation, Stock, TimeFrame } from '@/types/portfolio';
import { GroupService } from '@/src/services/fantasy/groupService';
import { PortfolioService } from '@/src/services/fantasy/portfolioService';
import { apiClient } from '@/src/services/api';
import { generatePortfolioHistory, calculateVolatilityFactor } from '@/utils/portfolio-history';
import { useAuthContext } from '@/contexts/auth-context';

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
  buyStock: (leagueId: string, stock: Stock, shares: number) => Promise<void>;
  sellStock: (leagueId: string, symbol: string, shares: number) => Promise<void>;
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

export function PortfolioProvider({ children }: PortfolioProviderProps) {
  const { userId, isLoaded: authLoaded } = useAuthContext();
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>('');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1M');
  const [portfolios, setPortfolios] = useState<Record<string, Portfolio>>({});
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fetch portfolios from backend
  const fetchPortfolios = useCallback(async () => {
    if (!userId) {
      if (isMountedRef.current) {
        setPortfolios({});
        setLoading(false);
      }
      return;
    }

    try {
      if (isMountedRef.current) {
        setLoading(true);
      }

      // Fetch all groups for the user
      const leagues = await GroupService.getGroups();

      if (leagues.length === 0) {
        if (isMountedRef.current) {
          setPortfolios({});
          setLoading(false);
        }
        return;
      }

      // Set first group as selected if none selected
      if (!selectedLeagueId && leagues.length > 0 && isMountedRef.current) {
        setSelectedLeagueId(leagues[0].id);
      }

      // Fetch portfolio for each group
      const portfolioPromises = leagues.map(async (group) => {
        try {
          const response = await apiClient.get(`/fantasy-groups/${group.id}/portfolio/${userId}`);
          const backendPortfolio = response.data;

          // Transform backend portfolio to frontend Portfolio type
          const totalValue = backendPortfolio.totalValue || backendPortfolio.cashBalance;
          const startingBalance = group.settings.startingBalance || 10000;
          const leagueStartDate = new Date(group.settings.startDate || Date.now());

          // Generate unique performance history for this portfolio
          const volatilityFactor = calculateVolatilityFactor(group.id, startingBalance);
          const history = generatePortfolioHistory(
            totalValue,
            startingBalance,
            leagueStartDate,
            volatilityFactor
          );

          const portfolio: Portfolio = {
            leagueId: group.id,
            totalValue,
            liquidFunds: backendPortfolio.cashBalance,
            lessonRewards: 0, // Not tracked in backend yet
            allocation: {
              savings: 0,
              bonds: 0,
              indexFunds: 0,
            },
            holdings: backendPortfolio.slots?.map((slot: any) => ({
              assetId: slot.assetId || slot.asset?.id,
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

          return { leagueId: group.id, portfolio };
        } catch (error) {
          console.error(`Failed to fetch portfolio for group ${group.id}:`, error);

          // Return default portfolio if fetch fails
          const startingBalance = group.settings.startingBalance || 10000;
          const leagueStartDate = new Date(group.settings.startDate || Date.now());
          const volatilityFactor = calculateVolatilityFactor(group.id, startingBalance);

          return {
            leagueId: group.id,
            portfolio: {
              leagueId: group.id,
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

      if (isMountedRef.current) {
        setPortfolios(newPortfolios);
      }
    } catch (error) {
      console.error('Error fetching portfolios:', error);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [userId, selectedLeagueId]);

  // Initial fetch when auth is loaded and user is available
  useEffect(() => {
    if (authLoaded) {
      fetchPortfolios();
    }
  }, [authLoaded, userId, fetchPortfolios]);

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
          // totalValue stays the same - just converting cash to assets
        },
      };
    });
  };

  const buyStock = async (leagueId: string, stock: Stock, shares: number) => {
    if (!stock.id) {
      throw new Error('Stock ID is required to buy stock');
    }

    try {
      // Call backend API to buy the asset
      await PortfolioService.buyAsset(leagueId, stock.id, shares);
      
      // Refresh portfolios from backend to get updated data
      await fetchPortfolios();
    } catch (error) {
      console.error('Failed to buy stock:', error);
      throw error;
    }
  };

  const sellStock = async (leagueId: string, symbol: string, shares: number) => {
    try {
      // Find the asset ID from current holdings
      const portfolio = portfolios[leagueId];
      if (!portfolio) {
        throw new Error('Portfolio not found');
      }

      const holding = portfolio.holdings.find((h) => h.symbol === symbol);
      if (!holding || !holding.assetId) {
        throw new Error('Asset not found in portfolio');
      }

      // Call backend API to sell the asset
      await PortfolioService.sellAsset(leagueId, holding.assetId, shares);
      
      // Refresh portfolios from backend to get updated data
      await fetchPortfolios();
    } catch (error) {
      console.error('Failed to sell stock:', error);
      throw error;
    }
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

  const refreshPortfolios = useCallback(async () => {
    await fetchPortfolios();
  }, [fetchPortfolios]);

  const value: PortfolioContextType = {
    selectedLeagueId,
    timeFrame,
    portfolios,
    loading,
    setSelectedLeagueId,
    setTimeFrame,
    allocateFunds,
    buyStock,
    sellStock,
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