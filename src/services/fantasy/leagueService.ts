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

    startCompetition: async (leagueId: string): Promise<void> => {
        try {
            await apiClient.post(`/fantasy-leagues/${leagueId}/start`, {
                userId: CURRENT_USER_ID
            });
        } catch (error) {
            throw handleApiError(error);
        }
    },

    joinByCode: async (joinCode: string): Promise<{ league: League; membership: any }> => {
        try {
            const response = await apiClient.post('/fantasy-leagues/join-by-code', {
                joinCode: joinCode.toUpperCase(),
                userId: CURRENT_USER_ID
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    leaveLeague: async (leagueId: string): Promise<{ message: string; leagueDeleted: boolean }> => {
        try {
            const response = await apiClient.delete(`/fantasy-leagues/${leagueId}/leave`, {
                data: { userId: CURRENT_USER_ID }
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },
};
