import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserLessonState, LessonProgress } from '@/src/types/lesson';

const LESSON_PROGRESS_KEY = '@flit_lesson_progress';

export function useLessons() {
  const [state, setState] = useState<UserLessonState>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const stored = await AsyncStorage.getItem(LESSON_PROGRESS_KEY);
      if (stored) {
        setState(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading lesson progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProgress = async (newState: UserLessonState) => {
    try {
      await AsyncStorage.setItem(LESSON_PROGRESS_KEY, JSON.stringify(newState));
    } catch (error) {
      console.error('Error saving lesson progress:', error);
    }
  };

  const completeLesson = useCallback(
    async (courseId: string, lessonId: string, score: number, totalQuestions: number) => {
      const progress: LessonProgress = {
        lessonId,
        completed: true,
        score,
        totalQuestions,
        completedAt: new Date().toISOString(),
      };

      const newState: UserLessonState = {
        ...state,
        [courseId]: {
          ...(state[courseId] ?? {}),
          [lessonId]: progress,
        },
      };

      setState(newState);
      await saveProgress(newState);
    },
    [state]
  );

  const getLessonProgress = useCallback(
    (courseId: string, lessonId: string): LessonProgress | undefined => {
      return state[courseId]?.[lessonId];
    },
    [state]
  );

  const isLessonCompleted = useCallback(
    (courseId: string, lessonId: string): boolean => {
      return state[courseId]?.[lessonId]?.completed === true;
    },
    [state]
  );

  /**
   * Returns a flat array of all completed lesson IDs across all courses.
   * This is used by the asset locking system (matches Asset.requiredLessons).
   */
  const completedLessonIds: string[] = Object.values(state).flatMap((courseProgress) =>
    Object.values(courseProgress)
      .filter((p) => p.completed)
      .map((p) => p.lessonId)
  );

  const getCourseCompletionCount = useCallback(
    (courseId: string): number => {
      const courseProgress = state[courseId];
      if (!courseProgress) return 0;
      return Object.values(courseProgress).filter((p) => p.completed).length;
    },
    [state]
  );

  const resetProgress = async () => {
    setState({});
    await AsyncStorage.removeItem(LESSON_PROGRESS_KEY);
  };

  return {
    isLoading,
    completedLessonIds,
    completeLesson,
    getLessonProgress,
    isLessonCompleted,
    getCourseCompletionCount,
    resetProgress,
  };
}
