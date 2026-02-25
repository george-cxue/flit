import { apiClient, handleApiError, getAuthenticatedUserId } from '../api';
import { Asset, WaiverClaim } from '@/src/types/fantasy';

export const WaiverService = {
    /**
     * Get available assets on waivers (free agents)
     * Uses the market assets endpoint which excludes owned assets
     */
    getAvailableAssets: async (groupId: string, query: string = ''): Promise<Asset[]> => {
        try {
            const response = await apiClient.get(`/fantasy-groups/${groupId}/market/assets`, {
                params: { search: query }
            });
            return response.data.assets || [];
        } catch (error) {
            throw handleApiError(error);
        }
    },

    submitClaim: async (groupId: string, assetId: string, dropAssetId?: string): Promise<WaiverClaim> => {
        try {
            const userId = getAuthenticatedUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }
            const response = await apiClient.post(`/fantasy-groups/${groupId}/waivers`, {
                userId,
                assetId,
                dropAssetId
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },
};
