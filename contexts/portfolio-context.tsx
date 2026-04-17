import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react';
import { Portfolio, AssetAllocation, Stock, TimeFrame } from '@/types/portfolio';
import { GroupService } from '@/src/services/fantasy/groupService';
import { PortfolioService } from '@/src/services/fantasy/portfolioService';
import { apiClient } from '@/src/services/api';
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
  const isMountedRef = useRef(true);
  const hasSetInitialLeague = useRef(false);

  const buildFlatHistory = useCallback((startDate: Date, currentValue: number) => {
    const now = Date.now();
    const startTs = Math.min(startDate.getTime(), now);
    if (!Number.isFinite(currentValue) || currentValue <= 0) {
      return [{ timestamp: now, value: 0 }];
    }
    if (now - startTs < 60_000) {
      return [{ timestamp: now, value: currentValue }];
    }
    return [
      { timestamp: startTs, value: currentValue },
      { timestamp: now, value: currentValue },
    ];
  }, []);

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
      // Fetch regular groups + active tournament (if user joined).
      const [regularGroups, activeTournament] = await Promise.all([
        GroupService.getGroups(),
        GroupService.getActiveTournament(),
      ]);
      const leagues = activeTournament?.isUserMember
        ? [...regularGroups, activeTournament].filter(
            (group, index, self) => self.findIndex((g) => g.id === group.id) === index
          )
        : regularGroups;
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
          // Some older portfolios have totalValue persisted as 0 while cash/holdings are valid.
          const cashBalance = toNum(backendPortfolio.cashBalance);
          const computedHoldingsValue = (backendPortfolio.slots ?? []).reduce((sum: number, slot: any) => {
            const shares = toNum(slot.shares);
            const currentPrice = toNum(slot.asset?.currentPrice ?? slot.currentPrice);
            return sum + shares * currentPrice;
          }, 0);
          const rawTotalValue = toNum(backendPortfolio.totalValue);
          const fallbackTotalValue = cashBalance + computedHoldingsValue;
          const totalValue = rawTotalValue > 0 ? rawTotalValue : fallbackTotalValue;
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
              
              const hasPositiveHistoryPoint = history.some((p: any) => toNum(p.value) > 0);
              if (!hasPositiveHistoryPoint) {
                history = buildFlatHistory(leagueStartDate, totalValue);
              }
            } else {
              // If there are no snapshots yet, keep the chart flat until real data is collected.
              history = buildFlatHistory(leagueStartDate, totalValue);
              baselines = {
                sp500: history.map((point: any) => ({ ...point })),
                nasdaq: history.map((point: any) => ({ ...point })),
                dow: history.map((point: any) => ({ ...point })),
              };
            }
          } catch (historyError) {
            console.error(`Error fetching history for group ${group.id}:`, historyError);
            history = buildFlatHistory(leagueStartDate, totalValue);
            baselines = {
              sp500: history.map((point: any) => ({ ...point })),
              nasdaq: history.map((point: any) => ({ ...point })),
              dow: history.map((point: any) => ({ ...point })),
            };
          }

          const portfolio: Portfolio = {
            leagueId: group.id,
            totalValue,
            liquidFunds: cashBalance,
            bondsLockedUntil:
              backendPortfolio.bondsLockedUntil != null
                ? String(backendPortfolio.bondsLockedUntil)
                : null,
            lessonRewards: 0, // Not tracked in backend yet
            allocation: {
              savings: toNum(backendPortfolio.savingsAccount),
              bonds: toNum(backendPortfolio.bonds),
              indexFunds: toNum(backendPortfolio.indexFunds),
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
          return {
            leagueId: group.id,
            portfolio: {
              leagueId: group.id,
              totalValue: startingBalance,
              liquidFunds: startingBalance,
              bondsLockedUntil: null,
              lessonRewards: 0,
              allocation: { savings: 0, bonds: 0, indexFunds: 0 },
              holdings: [],
              history: buildFlatHistory(leagueStartDate, startingBalance),
              baselines: {
                sp500: buildFlatHistory(leagueStartDate, startingBalance),
                nasdaq: buildFlatHistory(leagueStartDate, startingBalance),
                dow: buildFlatHistory(leagueStartDate, startingBalance),
              },
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
  }, [userId, buildFlatHistory]);

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

  const allocateFunds = async (leagueId: string, asset: keyof AssetAllocation, amount: number) => {
    await PortfolioService.allocateAsset(leagueId, asset, amount);
    await fetchPortfolios();
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
    if (portfolios[selectedLeagueId]) {
      return portfolios[selectedLeagueId];
    }
    const firstAvailable = Object.values(portfolios)[0];
    return firstAvailable || null;
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