import { apiClient, handleApiError } from '../api';
import { Trade } from '@/src/types/fantasy';

// TODO: Replace with actual user context/auth when implemented
const CURRENT_USER_ID = 'user_1';

export const TradeService = {
    getTrades: async (leagueId: string): Promise<Trade[]> => {
        try {
            const response = await apiClient.get(`/fantasy-leagues/${leagueId}/trades`, {
                params: { userId: CURRENT_USER_ID }
            });
            return response.data.trades || [];
        } catch (error) {
            throw handleApiError(error);
        }
    },

    proposeTrade: async (
        leagueId: string,
        recipientId: string,
        offeredAssets: string[],
        requestedAssets: string[]
    ): Promise<Trade> => {
        try {
            const response = await apiClient.post(`/fantasy-leagues/${leagueId}/trades`, {
                creatorId: CURRENT_USER_ID,
                recipientId,
                offeredAssetIds: offeredAssets,
                requestedAssetIds: requestedAssets
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    acceptTrade: async (tradeId: string): Promise<Trade> => {
        try {
            const response = await apiClient.post(`/fantasy-trades/${tradeId}/accept`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    rejectTrade: async (tradeId: string): Promise<Trade> => {
        try {
            const response = await apiClient.post(`/fantasy-trades/${tradeId}/reject`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    cancelTrade: async (tradeId: string): Promise<Trade> => {
        try {
            const response = await apiClient.post(`/fantasy-trades/${tradeId}/cancel`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },
};
