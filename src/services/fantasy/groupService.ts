import { apiClient, handleApiError } from '../api';
import { Group, GroupSettings } from '@/src/types/fantasy';

// TODO: Replace with actual user context/auth when implemented
const CURRENT_USER_ID = 'cmkn5ix8o000110hyj2i6vca4'; // johndoe

export const GroupService = {
    getGroups: async (): Promise<Group[]> => {
        try {
            const response = await apiClient.get('/fantasy-groups', {
                params: { userId: CURRENT_USER_ID }
            });
            return response.data.groups || [];
        } catch (error) {
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
            const response = await apiClient.post('/fantasy-groups', {
                name,
                adminUserId: CURRENT_USER_ID,
                settings
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    startCompetition: async (groupId: string): Promise<void> => {
        try {
            await apiClient.post(`/fantasy-groups/${groupId}/start`, {
                userId: CURRENT_USER_ID
            });
        } catch (error) {
            throw handleApiError(error);
        }
    },

    joinByCode: async (joinCode: string): Promise<{ group: Group; membership: any }> => {
        try {
            const response = await apiClient.post('/fantasy-groups/join-by-code', {
                joinCode: joinCode.toUpperCase(),
                userId: CURRENT_USER_ID
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    leaveGroup: async (groupId: string): Promise<{ message: string; groupDeleted: boolean }> => {
        try {
            const response = await apiClient.delete(`/fantasy-groups/${groupId}/leave`, {
                data: { userId: CURRENT_USER_ID }
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },
};
