import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserLessonState, LessonProgress } from '@/src/types/lesson';
import { lessonService } from '@/src/services/lessonService';

const LESSON_PROGRESS_KEY = '@flit_lesson_progress';
const LEARNING_DOLLARS_KEY = '@flit_learning_dollars';

export function useLessons() {
  const [state, setState] = useState<UserLessonState>({});
  const [learningDollars, setLearningDollars] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Stable reload function — safe to call from useFocusEffect on any screen.
  // setState/setLearningDollars are stable React identities, so deps array is empty.
  const reload = useCallback(async () => {
    try {
      const [storedProgress, storedDollars] = await Promise.all([
        AsyncStorage.getItem(LESSON_PROGRESS_KEY),
        AsyncStorage.getItem(LEARNING_DOLLARS_KEY),
      ]);
      if (storedProgress) setState(JSON.parse(storedProgress));
      if (storedDollars) setLearningDollars(Number(storedDollars));
    } catch (error) {
      console.error('Error loading lesson data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    reload();
  }, [reload]);

  /**
   * Called only when the user has passed (>= PASS_THRESHOLD).
   * Marks the lesson completed and awards learning dollars.
   */
  const completeLesson = useCallback(
    async (courseId: string, lessonId: string, score: number, totalQuestions: number) => {
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

      const newDollars = learningDollars + reward;

      setState(newState);
      setLearningDollars(newDollars);

      await Promise.all([
        AsyncStorage.setItem(LESSON_PROGRESS_KEY, JSON.stringify(newState)),
        AsyncStorage.setItem(LEARNING_DOLLARS_KEY, String(newDollars)),
      ]);
    },
    [state, learningDollars]
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
    setLearningDollars(0);
    await Promise.all([
      AsyncStorage.removeItem(LESSON_PROGRESS_KEY),
      AsyncStorage.removeItem(LEARNING_DOLLARS_KEY),
    ]);
  };

  return {
    isLoading,
    learningDollars,
    completedLessonIds,
    completeLesson,
    getLessonProgress,
    isLessonCompleted,
    getCourseCompletionCount,
    resetProgress,
    reload,
  };
}
