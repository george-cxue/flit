import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserLessonState, LessonProgress } from '@/src/types/lesson';
import { lessonService } from '@/src/services/lessonService';
import { LessonApiService } from '@/src/services/lessonApiService';

const getLessonProgressKey = (userId: string | null) => 
  userId ? `@flit_lesson_progress_${userId}` : '@flit_lesson_progress';
const getPortfolioBalanceKey = (userId: string | null) => 
  userId ? `@flit_portfolio_balance_${userId}` : '@flit_portfolio_balance';
export const PORTFOLIO_BASE = 1000;

export function useLessons(userId: string | null = null) {
  const [state, setState] = useState<UserLessonState>({});
  const [portfolioBalance, setPortfolioBalance] = useState(PORTFOLIO_BASE);
  const [isLoading, setIsLoading] = useState(true);

  const LESSON_PROGRESS_KEY = getLessonProgressKey(userId);
  const PORTFOLIO_BALANCE_KEY = getPortfolioBalanceKey(userId);

  // Stable reload function — safe to call from useFocusEffect on any screen.
  const reload = useCallback(async () => {
    // Don't load if no userId
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      const [storedProgress, storedBalance] = await Promise.all([
        AsyncStorage.getItem(LESSON_PROGRESS_KEY),
        AsyncStorage.getItem(PORTFOLIO_BALANCE_KEY),
      ]);
      if (storedProgress) setState(JSON.parse(storedProgress));
      if (storedBalance) setPortfolioBalance(Number(storedBalance));

      // Try to load from backend and merge (non-blocking)
      try {
        const backendProgress = await LessonApiService.getUserLessonProgress();
        if (backendProgress && backendProgress.length > 0) {
          // Convert backend format to our state format
          const mergedState: UserLessonState = storedProgress ? JSON.parse(storedProgress) : {};
          
          backendProgress.forEach((userLesson: any) => {
            const courseId = userLesson.lesson?.category || 'unknown';
            const lessonId = userLesson.lessonId;
            
            if (!mergedState[courseId]) {
              mergedState[courseId] = {};
            }
            
            // Only add if not already in local state or if backend is newer
            if (!mergedState[courseId][lessonId] || 
                (userLesson.completedAt && userLesson.status === 'completed')) {
              mergedState[courseId][lessonId] = {
                lessonId,
                completed: userLesson.status === 'completed',
                score: userLesson.score || 0,
                totalQuestions: userLesson.score ? Math.ceil(userLesson.score / 0.75) : 0,
                completedAt: userLesson.completedAt,
              };
            }
          });
          
          setState(mergedState);
          await AsyncStorage.setItem(LESSON_PROGRESS_KEY, JSON.stringify(mergedState));
        }
      } catch (backendError) {
        console.error('Failed to load lesson progress from backend:', backendError);
        // Continue with local data
      }
    } catch (error) {
      console.error('Error loading lesson data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, LESSON_PROGRESS_KEY, PORTFOLIO_BALANCE_KEY]);

  useEffect(() => {
    reload();
  }, [reload]);

  // Clear state when user logs out
  useEffect(() => {
    if (!userId) {
      setState({});
      setPortfolioBalance(PORTFOLIO_BASE);
    }
  }, [userId]);

  /**
   * Called only when the user has passed (>= PASS_THRESHOLD).
   * Marks the lesson completed and awards learning dollars.
   * Also syncs to backend.
   */
  const completeLesson = useCallback(
    async (courseId: string, lessonId: string, score: number, totalQuestions: number) => {
      // Prevent duplicate rewards for lessons already completed.
      if (state[courseId]?.[lessonId]?.completed) {
        return null;
      }

      const reward = lessonService.getLessonById(lessonId)?.reward ?? 0;

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

      const newBalance = portfolioBalance + reward;

      setState(newState);
      setPortfolioBalance(newBalance);

      await Promise.all([
        AsyncStorage.setItem(LESSON_PROGRESS_KEY, JSON.stringify(newState)),
        AsyncStorage.setItem(PORTFOLIO_BALANCE_KEY, String(newBalance)),
      ]);

      // Sync to backend and return stats
      try {
        const result = await LessonApiService.syncLessonProgress([
          {
            lessonId,
            courseId,
            status: 'completed',
            score,
            totalQuestions,
            completedAt: new Date().toISOString(),
          },
        ]);
        
        // Return the stats so they can be displayed
        return result.stats;
      } catch (error) {
        console.error('Failed to sync lesson progress to backend:', error);
        // Continue even if backend sync fails - data is still saved locally
        return null;
      }
    },
    [state, portfolioBalance, LESSON_PROGRESS_KEY, PORTFOLIO_BALANCE_KEY]
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
   * Flat array of all completed lesson IDs — used by the asset locking system.
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
    setPortfolioBalance(PORTFOLIO_BASE);
    await Promise.all([
      AsyncStorage.removeItem(LESSON_PROGRESS_KEY),
      AsyncStorage.setItem(PORTFOLIO_BALANCE_KEY, String(PORTFOLIO_BASE)),
    ]);
  };

  return {
    isLoading,
    portfolioBalance,
    completedLessonIds,
    completeLesson,
    getLessonProgress,
    isLessonCompleted,
    getCourseCompletionCount,
    resetProgress,
    reload,
  };
}