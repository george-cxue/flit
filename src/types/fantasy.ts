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
  seasonLength: number;
  draftDate: string; // ISO date string
  portfolioSize: number;
  activeSlots: number;
  benchSlots: number;
  scoringMethod: 'Total Return %' | 'Absolute Gain $';
  enabledAssetClasses: AssetType[];
  minAssetPrice: number;
  draftType: 'Snake' | 'Auction';
  draftTimePerPick: number;
  matchupType: 'Head-to-head' | 'Rotisserie';
  playoffsEnabled: boolean;
  tradeDeadlineWeek: number;
  waiverPriority: 'Rolling' | 'Reverse Standings';
}

export interface League {
  id: string;
  name: string;
  adminUserId: string;
  members: User[];
  settings: LeagueSettings;
  status: 'pre-draft' | 'drafting' | 'active' | 'completed';
  currentWeek: number;
}

export interface PortfolioSlot {
  id: string;
  assetId: string;
  asset?: Asset; // Hydrated asset
  status: 'ACTIVE' | 'BENCH';
  acquiredAt: string;
  purchasePrice: number;
  currentValue: number;
  gainLossPercent: number;
}

export interface Portfolio {
  id: string;
  leagueId: string;
  userId: string;
  name: string;
  slots: PortfolioSlot[];
  totalValue: number;
  weeklyReturn: number;
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
