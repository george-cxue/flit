import { apiClient, handleApiError } from '../api';
import { Asset } from '@/src/types/fantasy';

export const MarketService = {
    /**
     * Search for available assets in a league's market
     * @param leagueId - The league ID to search within
     * @param query - Search query for ticker or asset name
     */
    searchAssets: async (leagueId: string, query: string = ''): Promise<Asset[]> => {
        try {
            const response = await apiClient.get(`/fantasy-leagues/${leagueId}/market/assets`, {
                params: { search: query }
            });
            return response.data.assets || [];
        } catch (error) {
            throw handleApiError(error);
        }
    },

    /**
     * Get detailed asset information by ID
     * Note: Backend uses asset ID, not ticker
     */
    getAssetById: async (assetId: string): Promise<Asset | undefined> => {
        try {
            const response = await apiClient.get(`/fantasy-assets/${assetId}`);
            return response.data;
        } catch (error) {
            if ((error as any).response?.status === 404) {
                return undefined;
            }
            throw handleApiError(error);
        }
    },

    /**
     * Legacy method - searches by ticker (less efficient)
     * Consider migrating to getAssetById where possible
     */
    getAssetByTicker: async (leagueId: string, ticker: string): Promise<Asset | undefined> => {
        try {
            const assets = await MarketService.searchAssets(leagueId, ticker);
            return assets.find(a => a.ticker.toUpperCase() === ticker.toUpperCase());
        } catch (error) {
            throw handleApiError(error);
        }
    },
};
