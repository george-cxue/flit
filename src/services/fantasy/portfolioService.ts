import { apiClient, handleApiError, getAuthenticatedUserId } from '../api';
import { Portfolio } from '@/src/types/fantasy';

export const PortfolioService = {
    getPortfolios: async (): Promise<Portfolio[]> => {
        // Note: This would require getting portfolios across all groups for a user
        // The backend doesn't have a dedicated endpoint for this yet
        // For now, this is a placeholder
        throw new Error('getPortfolios not implemented - use getPortfolioByGroupId instead');
    },

    getPortfolioByGroupId: async (groupId: string, userId?: string): Promise<Portfolio | undefined> => {
        try {
            const targetUserId = userId || getAuthenticatedUserId();
            if (!targetUserId) {
                throw new Error('User not authenticated');
            }
            const response = await apiClient.get(`/fantasy-groups/${groupId}/portfolio/${targetUserId}`);
            return response.data;
        } catch (error) {
            if ((error as any).response?.status === 404) {
                return undefined;
            }
            throw handleApiError(error);
        }
    },

    updateLineup: async (portfolioId: string, activeSlotIds: string[], benchSlotIds: string[]): Promise<void> => {
        try {
            await apiClient.put(`/fantasy-portfolios/${portfolioId}/lineup`, {
                activeSlotIds,
                benchSlotIds
            });
        } catch (error) {
            throw handleApiError(error);
        }
    },

    buyAsset: async (groupId: string, assetId: string, shares: number): Promise<any> => {
        try {
            const userId = getAuthenticatedUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }
            const response = await apiClient.post(`/fantasy-groups/${groupId}/buy`, {
                userId,
                assetId,
                shares
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    sellAsset: async (groupId: string, assetId: string, shares: number): Promise<any> => {
        try {
            const userId = getAuthenticatedUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }
            const response = await apiClient.post(`/fantasy-groups/${groupId}/sell`, {
                userId,
                assetId,
                shares
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },
};
