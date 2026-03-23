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

    createGroup: async (name: string, settings: GroupSettings): Promise<Group> => {
        try {
            const userId = getAuthenticatedUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }
            const response = await apiClient.post('/fantasy-groups', {
                name,
                settings
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
            await apiClient.post(`/fantasy-groups/${groupId}/start`);
        } catch (error) {
            throw handleApiError(error);
        }
    },

    joinByCode: async (joinCode: string): Promise<{ group: Group; membership: any }> => {
        try {
            const userId = getAuthenticatedUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }
            const response = await apiClient.post('/fantasy-groups/join-by-code', {
                joinCode: joinCode.toUpperCase()
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
            const response = await apiClient.delete(`/fantasy-groups/${groupId}/leave`);
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
            const response = await apiClient.post(`/fantasy-groups/${groupId}/end`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Tournament methods
    getActiveTournament: async (): Promise<Group | null> => {
        try {
            const response = await apiClient.get('/fantasy-groups/tournaments/active');
            return response.data.tournament || null;
        } catch (error) {
            console.error('Error fetching tournament:', error);
            return null;
        }
    },

    joinTournament: async (tournamentId: string): Promise<void> => {
        try {
            const userId = getAuthenticatedUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }
            await apiClient.post(`/fantasy-groups/tournaments/${tournamentId}/join`);
        } catch (error) {
            throw handleApiError(error);
        }
    },
};
