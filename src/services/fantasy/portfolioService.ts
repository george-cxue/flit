import { apiClient, handleApiError } from '../api';
import { Portfolio } from '@/src/types/fantasy';

// TODO: Replace with actual user context/auth when implemented
const CURRENT_USER_ID = 'user_1';

export const PortfolioService = {
    getPortfolios: async (): Promise<Portfolio[]> => {
        // Note: This would require getting portfolios across all leagues for a user
        // The backend doesn't have a dedicated endpoint for this yet
        // For now, this is a placeholder
        throw new Error('getPortfolios not implemented - use getPortfolioByLeagueId instead');
    },

    getPortfolioByLeagueId: async (leagueId: string, userId?: string): Promise<Portfolio | undefined> => {
        try {
            const targetUserId = userId || CURRENT_USER_ID;
            const response = await apiClient.get(`/fantasy-leagues/${leagueId}/portfolio/${targetUserId}`);
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
};
