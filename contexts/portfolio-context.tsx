import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { MOCK_SP500 } from '@/data/mock-portfolio';
import { Portfolio, AssetAllocation, Stock, TimeFrame } from '@/types/portfolio';
import { GroupService } from '@/src/services/fantasy/groupService';
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
  allocateFunds: (leagueId: string, asset: keyof AssetAllocation, amount: number) => Promise<void>;
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

  // Fetch portfolios from backend
  const fetchPortfolios = async () => {
    if (!userId) {
      setPortfolios({});
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch all groups for the user
      const leagues = await GroupService.getGroups();
      console.log('Fetched leagues:', leagues.length);
      console.log('Fetched leagues:', leagues.length);

      if (leagues.length === 0) {
        console.log('No leagues found');
        setPortfolios({});
        setLoading(false);
        return;
      }

      // Set first group as selected if none selected
      if (!selectedLeagueId && leagues.length > 0) {
        setSelectedLeagueId(leagues[0].id);
      }

      // Fetch all portfolios from new API endpoint
      const response = await apiClient.get('/fantasy-portfolio');
      const backendPortfolios = response.data;
      console.log('Fetched portfolios from backend:', backendPortfolios.length);

      // Transform each portfolio
      const portfolioPromises = backendPortfolios.map(async (backendPortfolio: any) => {
        try {
          const group = leagues.find(g => g.id === backendPortfolio.groupId);
          if (!group) return null;

          // Transform backend portfolio to frontend Portfolio type
          const totalValue = Number(backendPortfolio.totalValue) || Number(backendPortfolio.cashBalance);
          const startingBalance = 10000; // Default starting balance
          const leagueStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to 30 days ago

          // Generate unique performance history for this portfolio
          const volatilityFactor = calculateVolatilityFactor(group.id, startingBalance);
          const history = generatePortfolioHistory(
            totalValue,
            startingBalance,
            leagueStartDate,
            volatilityFactor
          );

          const portfolio: Portfolio = {
            leagueId: backendPortfolio.groupId,
            totalValue,
            liquidFunds: Number(backendPortfolio.cashBalance),
            lessonRewards: 0,
            allocation: {
              savings: Number(backendPortfolio.savingsAccount || 0),
              bonds: Number(backendPortfolio.bonds || 0),
              indexFunds: Number(backendPortfolio.indexFunds || 0),
            },
            holdings: backendPortfolio.slots?.map((slot: any) => ({
              symbol: slot.asset?.ticker || '',
              name: slot.asset?.name || '',
              shares: Number(slot.shares),
              averagePrice: Number(slot.averageCost),
              currentPrice: Number(slot.asset?.currentPrice || slot.currentPrice),
              totalValue: Number(slot.shares) * Number(slot.asset?.currentPrice || slot.currentPrice),
              changePercent: Number(slot.gainLossPercent) || 0,
            })) || [],
            history,
          };

          return { leagueId: backendPortfolio.groupId, portfolio };
        } catch (error) {
          console.error(`Failed to transform portfolio for group ${backendPortfolio.groupId}:`, error);
          return null;
        }
      });

      const portfolioResults = await Promise.all(portfolioPromises);
      // Filter out null results
      // Filter out null results
      const newPortfolios: Record<string, Portfolio> = {};

      portfolioResults.forEach((result) => {
        if (result) {
          const { leagueId, portfolio } = result;
          newPortfolios[leagueId] = portfolio;
        }
      });

      console.log('Transformed portfolios:', Object.keys(newPortfolios));
      setPortfolios(newPortfolios);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch when auth is loaded and user is available
  useEffect(() => {
    if (authLoaded) {
      fetchPortfolios();
    }
  }, [authLoaded, userId]);

  const allocateFunds = async (leagueId: string, asset: keyof AssetAllocation, amount: number) => {
    try {
      // Call backend API to update allocation
      const response = await apiClient.post('/fantasy-portfolio/allocate', {
        groupId: leagueId,
        assetType: asset,
        amount,
      });

      if (response.data.success) {
        // Refresh portfolios to get updated data from backend
        await fetchPortfolios();
      }
    } catch (error) {
      console.error('Error allocating funds:', error);
      throw error;
    }
  };

  const buyStock = async (leagueId: string, stock: Stock, shares: number) => {
    try {
      // Call backend API to execute trade
      const response = await apiClient.post('/fantasy-portfolio/trade', {
        groupId: leagueId,
        ticker: stock.symbol,
        shares,
        tradeType: 'buy',
      });

      if (response.data.success) {
        // Refresh portfolios to get updated data from backend
        await fetchPortfolios();
      }
    } catch (error) {
      console.error('Error buying stock:', error);
      throw error;
    }
  };

  const sellStock = async (leagueId: string, symbol: string, shares: number) => {
    try {
      // Call backend API to execute sell trade
      const response = await apiClient.post('/fantasy-portfolio/trade', {
        groupId: leagueId,
        ticker: symbol,
        shares,
        tradeType: 'sell',
      });

      if (response.data.success) {
        // Refresh portfolios to get updated data from backend
        await fetchPortfolios();
      }
    } catch (error) {
      console.error('Error selling stock:', error);
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
