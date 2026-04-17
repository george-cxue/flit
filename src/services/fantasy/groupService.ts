import { apiClient, handleApiError, getAuthenticatedUserId } from '../api';
import { Group, GroupSettings } from '@/src/types/fantasy';

export const GroupService = {
    getGroups: async (): Promise<Group[]> => {
        try {
            const userId = getAuthenticatedUserId();
            if (!userId) {
                // Auth may still be syncing on initial app load.
                // Return empty list so callers can retry on focus without surfacing noisy errors.
                return [];
            }
            const response = await apiClient.get('/fantasy-groups', {
                params: { userId },
            });
            return response.data.groups || [];
        } catch (error) {
            if ((error as any)?.response?.status === 401) {
                return [];
            }
            throw handleApiError(error);
        }
    },

    getGroupById: async (id: string): Promise<Group | undefined> => {
        try {
            const response = await apiClient.get(`/fantasy-groups/${id}`);
            return response.data;
        } catch (error) {
            if ((error as any).response?.status === 404) {
                return undefined;
            }
            throw handleApiError(error);
        }
    },

    createGroup: async (name: string, settings: GroupSettings, learningDollars?: number): Promise<Group> => {
        try {
            const userId = getAuthenticatedUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }
            const response = await apiClient.post('/fantasy-groups', {
                name,
                adminUserId: userId,
                settings,
                learningDollars,
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    startCompetition: async (groupId: string): Promise<void> => {
        try {
            const userId = getAuthenticatedUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }
            await apiClient.post(`/fantasy-groups/${groupId}/start`, { userId });
        } catch (error) {
            throw handleApiError(error);
        }
    },

    joinByCode: async (joinCode: string, learningDollars?: number): Promise<{ group: Group; membership: any }> => {
        try {
            const userId = getAuthenticatedUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }
            const response = await apiClient.post('/fantasy-groups/join-by-code', {
                joinCode: joinCode.toUpperCase(),
                userId,
                learningDollars,
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    leaveGroup: async (groupId: string): Promise<{ message: string; groupDeleted: boolean }> => {
        try {
            const userId = getAuthenticatedUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }
            const response = await apiClient.delete(`/fantasy-groups/${groupId}/leave`, {
                data: { userId },
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    endGroup: async (groupId: string): Promise<{ message: string; endDate: string }> => {
        try {
            const userId = getAuthenticatedUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }
            const response = await apiClient.post(`/fantasy-groups/${groupId}/end`, { userId });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Tournament methods
    getActiveTournament: async (): Promise<Group | null> => {
        try {
            const userId = getAuthenticatedUserId();
            const response = await apiClient.get('/fantasy-groups/tournaments/active', {
                params: userId ? { userId } : undefined,
            });
            return response.data.tournament || null;
        } catch (error) {
            console.error('Error fetching tournament:', error);
            return null;
        }
    },

    joinTournament: async (tournamentId: string, learningDollars?: number): Promise<void> => {
        try {
            const userId = getAuthenticatedUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }
            await apiClient.post(`/fantasy-groups/tournaments/${tournamentId}/join`, { userId, learningDollars });
        } catch (error) {
            throw handleApiError(error);
        }
    },
};
