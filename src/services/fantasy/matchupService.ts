import { apiClient, handleApiError, getAuthenticatedUserId } from '../api';
import { Matchup } from '@/src/types/fantasy';

export const MatchupService = {
    getCurrentMatchup: async (groupId: string): Promise<Matchup | undefined> => {
        try {
            const userId = getAuthenticatedUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }
            const response = await apiClient.get(`/fantasy-groups/${groupId}/matchup/current`, {
                params: { userId }
            });
            return response.data;
        } catch (error) {
            if ((error as any).response?.status === 404) {
                return undefined;
            }
            throw handleApiError(error);
        }
    },

    getMatchupByWeek: async (groupId: string, week: number): Promise<Matchup | undefined> => {
        try {
            const userId = getAuthenticatedUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }
            const response = await apiClient.get(`/fantasy-groups/${groupId}/matchup/week/${week}`, {
                params: { userId }
            });
            return response.data;
        } catch (error) {
            if ((error as any).response?.status === 404) {
                return undefined;
            }
            throw handleApiError(error);
        }
    },

    /**
     * Legacy method - use getMatchupByWeek instead
     * Note: Backend returns single matchup per user per week, not array
     */
    getMatchupsByWeek: async (groupId: string, week: number): Promise<Matchup[]> => {
        const matchup = await MatchupService.getMatchupByWeek(groupId, week);
        return matchup ? [matchup] : [];
    },
};
