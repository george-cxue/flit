import { apiClient, handleApiError, getAuthenticatedUserId } from '../api';
import { Portfolio } from '@/src/types/fantasy';
import { PortfolioSnapshot } from '@/types/portfolio';

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

    /**
     * Get historical portfolio performance data
     * Returns daily snapshots with market baseline comparisons
     */
    getPortfolioHistory: async (
        groupId: string,
        timeFrame?: string
    ): Promise<{
        history: PortfolioSnapshot[];
        baselines: {
            sp500: PortfolioSnapshot[];
            nasdaq: PortfolioSnapshot[];
            dow: PortfolioSnapshot[];
        };
    }> => {
        try {
            const params: any = {};
            if (timeFrame) {
                params.timeFrame = timeFrame;
            }

            const response = await apiClient.get(`/fantasy-portfolio/${groupId}/history`, { params });
            
            // Transform backend response to frontend format
            const history: PortfolioSnapshot[] = response.data.history.map((snapshot: any) => ({
                timestamp: new Date(snapshot.date).getTime(),
                value: snapshot.totalValue,
            }));

            const baselines = {
                sp500: response.data.baselines.sp500
                    .filter((b: any) => b.value !== null)
                    .map((b: any) => ({
                        timestamp: new Date(b.date).getTime(),
                        value: b.value,
                    })),
                nasdaq: response.data.baselines.nasdaq
                    .filter((b: any) => b.value !== null)
                    .map((b: any) => ({
                        timestamp: new Date(b.date).getTime(),
                        value: b.value,
                    })),
                dow: response.data.baselines.dow
                    .filter((b: any) => b.value !== null)
                    .map((b: any) => ({
                        timestamp: new Date(b.date).getTime(),
                        value: b.value,
                    })),
            };

            return { history, baselines };
        } catch (error) {
            console.error('Error fetching portfolio history:', error);
            // Return empty arrays if fetch fails
            return {
                history: [],
                baselines: {
                    sp500: [],
                    nasdaq: [],
                    dow: [],
                },
            };
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
