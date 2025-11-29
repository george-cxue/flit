import { MOCK_ASSETS } from '@/src/mocks/fantasy/assets';
import { Asset, WaiverClaim } from '@/src/types/fantasy';

const DELAY_MS = 500;
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const WaiverService = {
    getAvailableAssets: async (leagueId: string, query: string = ''): Promise<Asset[]> => {
        await delay(DELAY_MS);
        // Mock: All assets are available except those in portfolios (not filtered here for simplicity)
        let assets = MOCK_ASSETS;
        if (query) {
            const lowerQuery = query.toLowerCase();
            assets = assets.filter(a =>
                a.ticker.toLowerCase().includes(lowerQuery) ||
                a.name.toLowerCase().includes(lowerQuery)
            );
        }
        return assets;
    },

    submitClaim: async (leagueId: string, assetId: string, dropAssetId?: string): Promise<WaiverClaim> => {
        await delay(DELAY_MS);
        return {
            id: `claim_${Date.now()}`,
            leagueId,
            userId: 'user_1',
            assetId,
            dropAssetId,
            status: 'pending',
            priority: 1,
        };
    },
};
