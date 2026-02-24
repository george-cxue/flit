import { apiClient, handleApiError } from '../api';
import { Asset, DraftPick, DraftState } from '@/src/types/fantasy';

// TODO: Replace with actual user context/auth when implemented
const CURRENT_USER_ID = 'user_1';

export const DraftService = {
    getDraftState: async (groupId: string): Promise<DraftState> => {
        try {
            const response = await apiClient.get(`/fantasy-groups/${groupId}/draft`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    makePick: async (groupId: string, assetId: string): Promise<DraftPick> => {
        try {
            const response = await apiClient.post(`/fantasy-groups/${groupId}/draft/pick`, {
                userId: CURRENT_USER_ID,
                assetId
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    startDraft: async (groupId: string): Promise<DraftState> => {
        try {
            const response = await apiClient.post(`/fantasy-groups/${groupId}/draft/start`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    getDraftableAssets: async (groupId: string, query: string = ''): Promise<Asset[]> => {
        try {
            const response = await apiClient.get(`/fantasy-groups/${groupId}/draft/assets`, {
                params: { search: query }
            });
            return response.data.assets || [];
        } catch (error) {
            throw handleApiError(error);
        }
    }
};
