import { Trade } from '@/src/types/fantasy';

const DELAY_MS = 500;
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const TradeService = {
    getTrades: async (leagueId: string): Promise<Trade[]> => {
        await delay(DELAY_MS);
        return []; // Start with no trades
    },

    proposeTrade: async (leagueId: string, recipientId: string, offeredAssets: string[], requestedAssets: string[]): Promise<Trade> => {
        await delay(DELAY_MS);
        return {
            id: `trade_${Date.now()}`,
            leagueId,
            proposerId: 'user_1',
            recipientId,
            status: 'pending',
            offeredAssets,
            requestedAssets,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 86400000).toISOString(), // 24h
        };
    },
};
