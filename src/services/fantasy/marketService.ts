import { MOCK_ASSETS } from '@/src/mocks/fantasy/assets';
import { Asset } from '@/src/types/fantasy';

const DELAY_MS = 300;
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const MarketService = {
    searchAssets: async (query: string): Promise<Asset[]> => {
        await delay(DELAY_MS);
        if (!query) return MOCK_ASSETS;
        const lowerQuery = query.toLowerCase();
        return MOCK_ASSETS.filter(
            a => a.ticker.toLowerCase().includes(lowerQuery) || a.name.toLowerCase().includes(lowerQuery)
        );
    },

    getAssetByTicker: async (ticker: string): Promise<Asset | undefined> => {
        await delay(DELAY_MS);
        return MOCK_ASSETS.find(a => a.ticker === ticker);
    },
};
