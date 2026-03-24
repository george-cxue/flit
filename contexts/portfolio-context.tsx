import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react';
import { Portfolio, AssetAllocation, Stock, TimeFrame } from '@/types/portfolio';
import { GroupService } from '@/src/services/fantasy/groupService';
import { PortfolioService } from '@/src/services/fantasy/portfolioService';
import { apiClient } from '@/src/services/api';
import { generatePortfolioHistory, calculateVolatilityFactor } from '@/utils/portfolio-history';
import { useAuthContext } from '@/contexts/auth-context';

/** Coerce API values (string/number/Decimal) to safe numbers; avoids NaN/Invalid from Prisma Decimal or bad data */
const toNum = (v: unknown, fallback = 0): number => {
  if (v == null || v === '') return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

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
  const hasSetInitialLeague = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fetch portfolios from backend
  const fetchPortfolios = useCallback(async () => {
    console.log('[PortfolioContext] fetchPortfolios called - userId:', userId);
    if (!userId) {
      console.log('[PortfolioContext] No userId, skipping fetch');
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

      console.log('[PortfolioContext] Fetching groups...');
      // Fetch all groups for the user
      const leagues = await GroupService.getGroups();
      console.log('[PortfolioContext] Fetched', leagues.length, 'groups');

      if (leagues.length === 0) {
        if (isMountedRef.current) {
          setPortfolios({});
          setLoading(false);
        }
        return;
      }

      // Set first group as selected if none selected
      if (!hasSetInitialLeague.current && leagues.length > 0 && isMountedRef.current) {
        setSelectedLeagueId(leagues[0].id);
        hasSetInitialLeague.current = true;
      }

      // Fetch portfolio for each group
      const portfolioPromises = leagues.map(async (group) => {
        try {
          const response = await apiClient.get(`/fantasy-groups/${group.id}/portfolio/${userId}`);
          const backendPortfolio = response.data;

          // Transform backend portfolio to frontend Portfolio type (coerce numbers; API may return Decimal strings)
          const totalValue = toNum(backendPortfolio.totalValue, toNum(backendPortfolio.cashBalance));
          const startingBalance = toNum(group.settings?.startingBalance, 10000);
          const leagueStartDate = new Date(group.settings.startDate || Date.now());

          // Fetch real historical performance data from backend
          let history = [];
          let baselines = undefined;
          try {
            const historyData = await PortfolioService.getPortfolioHistory(group.id, '1Y');
            
            if (historyData.history && historyData.history.length > 0) {
              // Use real data from backend; coerce values to avoid invalid number from Decimal/string
              history = historyData.history.map((p: any) => ({
                timestamp: typeof p.timestamp === 'number' ? p.timestamp : new Date(p.date ?? p.timestamp).getTime(),
                value: toNum(p.value),
              }));
              baselines = historyData.baselines && {
                sp500: (historyData.baselines.sp500 ?? []).map((b: any) => ({
                  timestamp: typeof b.timestamp === 'number' ? b.timestamp : new Date(b.date ?? b.timestamp).getTime(),
                  value: toNum(b.value),
                })),
                nasdaq: (historyData.baselines?.nasdaq ?? []).map((b: any) => ({
                  timestamp: typeof b.timestamp === 'number' ? b.timestamp : new Date(b.date ?? b.timestamp).getTime(),
                  value: toNum(b.value),
                })),
                dow: (historyData.baselines?.dow ?? []).map((b: any) => ({
                  timestamp: typeof b.timestamp === 'number' ? b.timestamp : new Date(b.date ?? b.timestamp).getTime(),
                  value: toNum(b.value),
                })),
              };
              
              // If we have limited data points (< 2), add a synthetic starting point
              // This allows charts to display percent changes properly
              if (history.length === 1) {
                const startTimestamp = leagueStartDate.getTime();
                const firstSnapshot = history[0];
                
                // Only add starting point if it's before the first snapshot
                if (startTimestamp < firstSnapshot.timestamp) {
                  history.unshift({
                    timestamp: startTimestamp,
                    value: startingBalance,
                  });
                  
                  // Add corresponding baseline starting points
                  if (baselines?.sp500 && baselines.sp500.length > 0) {
                    baselines.sp500.unshift({
                      timestamp: startTimestamp,
                      value: startingBalance,
                    });
                  }
                  if (baselines?.nasdaq && baselines.nasdaq.length > 0) {
                    baselines.nasdaq.unshift({
                      timestamp: startTimestamp,
                      value: startingBalance,
                    });
                  }
                  if (baselines?.dow && baselines.dow.length > 0) {
                    baselines.dow.unshift({
                      timestamp: startTimestamp,
                      value: startingBalance,
                    });
                  }
                }
              }
            } else {
              // Fallback to generated data if no history exists yet
              console.log(`[PortfolioContext] No history data for group ${group.id}, using fallback`);
              const volatilityFactor = calculateVolatilityFactor(group.id, startingBalance);
              history = generatePortfolioHistory(
                totalValue,
                startingBalance,
                leagueStartDate,
                volatilityFactor
              );
            }
          } catch (historyError) {
            console.error(`Error fetching history for group ${group.id}:`, historyError);
            // Fallback to generated data
            const volatilityFactor = calculateVolatilityFactor(group.id, startingBalance);
            history = generatePortfolioHistory(
              totalValue,
              startingBalance,
              leagueStartDate,
              volatilityFactor
            );
          }

          const portfolio: Portfolio = {
            leagueId: group.id,
            totalValue,
            liquidFunds: toNum(backendPortfolio.cashBalance),
            lessonRewards: 0, // Not tracked in backend yet
            allocation: {
              savings: 0,
              bonds: 0,
              indexFunds: 0,
            },
            holdings: (backendPortfolio.slots ?? []).map((slot: any) => {
              const shares = toNum(slot.shares);
              const currentPrice = toNum(slot.asset?.currentPrice ?? slot.currentPrice);
              const averageCost = toNum(slot.averageCost);
              const gainLossPercent = toNum(slot.gainLossPercent);
              return {
                assetId: slot.assetId || slot.asset?.id,
                symbol: slot.asset?.ticker || '',
                name: slot.asset?.name || '',
                shares,
                averagePrice: averageCost,
                currentPrice,
                totalValue: shares * currentPrice,
                changePercent: gainLossPercent,
              };
            }),
            history,
            baselines,
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
  }, [userId]);

  // Initial fetch when user ID is available
  useEffect(() => {
    console.log('[PortfolioContext] Effect triggered - userId:', userId, 'authLoaded:', authLoaded);
    if (userId) {
      console.log('[PortfolioContext] Fetching portfolios for userId:', userId);
      fetchPortfolios();
    } else if (authLoaded) {
      // Auth is loaded but no user - clear portfolios
      console.log('[PortfolioContext] Auth loaded but no userId, clearing portfolios');
      setPortfolios({});
      setLoading(false);
    }
  }, [userId, authLoaded, fetchPortfolios]);

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