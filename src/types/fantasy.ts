export type AssetTier = 'Tier 1' | 'Tier 2' | 'Tier 3';
export type AssetType = 'Stock' | 'ETF' | 'Commodity' | 'REIT';

export interface Asset {
  id: string;
  ticker: string;
  name: string;
  type: AssetType;
  tier: AssetTier;
  currentPrice: number;
  changePercent: number;
  marketCap?: string;
  exchange?: string;
  description?: string;
  requiredLessons: string[]; // IDs of lessons required to unlock
  isLocked?: boolean; // Helper for UI, derived from user progress
}

export interface User {
  id: string;
  username: string;
  name: string;
  avatar: string;
  completedLessons: string[]; // IDs of completed lessons
}

export interface LeagueSettings {
  leagueSize: number;
  startingBalance: number;
  competitionPeriod: '1_week' | '2_weeks' | '1_month' | '3_months' | '6_months' | '1_year';
  startDate: string; // ISO date string
  scoringMethod: 'Total Return %' | 'Absolute Gain $';
  enabledAssetClasses: AssetType[];
  minAssetPrice: number;
  allowShortSelling: boolean;
  tradingEnabled: boolean;
}

export interface League {
  id: string;
  name: string;
  adminUserId: string;
  members: User[];
  settings: LeagueSettings;
  status: 'pending' | 'active' | 'completed';
  currentWeek: number;
  joinCode?: string;
}

export interface PortfolioSlot {
  id: string;
  assetId: string;
  asset?: Asset; // Hydrated asset
  shares: number;
  averageCost: number; // Average cost per share
  currentPrice: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercent: number;
  status?: 'ACTIVE' | 'BENCH'; // Optional, for draft leagues
  acquiredAt: string;
}

export interface Portfolio {
  id: string;
  leagueId: string;
  userId: string;
  name: string;
  cashBalance: number;
  slots: PortfolioSlot[];
  totalHoldingsValue: number;
  totalValue: number;
  weeklyGainLoss: number;
  weeklyGainLossPercent: number;
}

export interface DraftPick {
  round: number;
  pickNumber: number;
  userId: string;
  assetId: string;
  timestamp: string;
}

export interface DraftState {
  leagueId: string;
  status: 'pending' | 'active' | 'paused' | 'completed';
  currentRound: number;
  currentPickNumber: number;
  currentUserId: string; // User who is "on the clock"
  picks: DraftPick[];
  remainingTimeSeconds: number;
}

export interface Matchup {
  id: string;
  leagueId: string;
  week: number;
  userAId: string;
  userBId: string;
  scoreA: number;
  scoreB: number;
  winnerId?: string;
  userAPortfolioName: string;
  userBPortfolioName: string;
  userAAvatar: string;
  userBAvatar: string;
}

export interface TradeAsset {
  assetId: string;
  fromUserId: string;
  toUserId: string;
}

export interface Trade {
  id: string;
  leagueId: string;
  proposerId: string;
  recipientId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  offeredAssets: string[]; // Asset IDs
  requestedAssets: string[]; // Asset IDs
  createdAt: string;
  expiresAt: string;
}

export interface WaiverClaim {
  id: string;
  leagueId: string;
  userId: string;
  assetId: string;
  dropAssetId?: string; // Optional asset to drop
  status: 'pending' | 'processed' | 'failed';
  priority: number;
  processedAt?: string;
}
