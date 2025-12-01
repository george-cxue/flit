import { apiClient, handleApiError } from '../api';
import { League, LeagueSettings } from '@/src/types/fantasy';

// TODO: Replace with actual user context/auth when implemented
const CURRENT_USER_ID = 'user_1';

export const LeagueService = {
    getLeagues: async (): Promise<League[]> => {
        try {
            const response = await apiClient.get('/fantasy-leagues', {
                params: { userId: CURRENT_USER_ID }
            });
            return response.data.leagues || [];
        } catch (error) {
            throw handleApiError(error);
        }
    },

    getLeagueById: async (id: string): Promise<League | undefined> => {
        try {
            const response = await apiClient.get(`/fantasy-leagues/${id}`);
            return response.data;
        } catch (error) {
            if ((error as any).response?.status === 404) {
                return undefined;
            }
            throw handleApiError(error);
        }
    },

    createLeague: async (name: string, settings: LeagueSettings): Promise<League> => {
        try {
            const response = await apiClient.post('/fantasy-leagues', {
                name,
                adminUserId: CURRENT_USER_ID,
                settings
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },
};
