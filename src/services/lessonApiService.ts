import { apiClient, handleApiError, getAuthenticatedUserId } from './api';

export interface LessonProgressData {
  lessonId: string;
  courseId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  score: number;
  totalQuestions: number;
  completedAt?: string;
}

export interface LessonSyncResponse {
  synced: number;
  message: string;
  stats?: {
    financialIQScore: number;
    learningStreak: number;
    financialIQEarned: number;
  };
}

export const LessonApiService = {
  /**
   * Get all lesson progress for the authenticated user
   */
  getUserLessonProgress: async (): Promise<any[]> => {
    try {
      const userId = getAuthenticatedUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const response = await apiClient.get(`/lessons/progress/${userId}/all`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Sync multiple lesson completions to the backend
   */
  syncLessonProgress: async (lessons: LessonProgressData[]): Promise<LessonSyncResponse> => {
    try {
      const userId = getAuthenticatedUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const response = await apiClient.post(`/lessons/progress/${userId}/sync`, { lessons });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Update progress for a single lesson
   */
  updateLessonProgress: async (
    lessonId: string,
    data: {
      status?: 'not_started' | 'in_progress' | 'completed';
      progress?: number;
      score?: number;
      timeSpent?: number;
    }
  ): Promise<any> => {
    try {
      const userId = getAuthenticatedUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const response = await apiClient.put(`/lessons/${lessonId}/progress/${userId}`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
