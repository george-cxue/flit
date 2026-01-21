import { apiClient, handleApiError } from '../api';
import { Asset, WaiverClaim } from '@/src/types/fantasy';

// TODO: Replace with actual user context/auth when implemented
const CURRENT_USER_ID = 'user_1';

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
            const response = await apiClient.post(`/fantasy-groups/${groupId}/waivers`, {
                userId: CURRENT_USER_ID,
                assetId,
                dropAssetId
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },
};
