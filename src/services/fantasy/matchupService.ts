import { apiClient, handleApiError } from '../api';
import { Matchup } from '@/src/types/fantasy';

// TODO: Replace with actual user context/auth when implemented
const CURRENT_USER_ID = 'user_1';

export const MatchupService = {
    getCurrentMatchup: async (leagueId: string): Promise<Matchup | undefined> => {
        try {
            const response = await apiClient.get(`/fantasy-leagues/${leagueId}/matchup/current`, {
                params: { userId: CURRENT_USER_ID }
            });
            return response.data;
        } catch (error) {
            if ((error as any).response?.status === 404) {
                return undefined;
            }
            throw handleApiError(error);
        }
    },

    getMatchupByWeek: async (leagueId: string, week: number): Promise<Matchup | undefined> => {
        try {
            const response = await apiClient.get(`/fantasy-leagues/${leagueId}/matchup/week/${week}`, {
                params: { userId: CURRENT_USER_ID }
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
    getMatchupsByWeek: async (leagueId: string, week: number): Promise<Matchup[]> => {
        const matchup = await MatchupService.getMatchupByWeek(leagueId, week);
        return matchup ? [matchup] : [];
    },
};
