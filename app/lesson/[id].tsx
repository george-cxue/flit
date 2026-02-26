import { useState, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLessons } from '@/hooks/use-lessons';
import { lessonService } from '@/src/services/lessonService';
import { PASS_THRESHOLD } from '@/src/types/lesson';
import { useAuthContext } from '@/contexts/auth-context';
import type {
  ContentBlock,
  LessonQuestion,
  ParagraphBlock,
  HeadingBlock,
  ExampleBlock,
  KeypointBlock,
  ListBlock,
} from '@/src/types/lesson';

type Phase = 'content' | 'question' | 'failed' | 'complete';

const PASS_PCT = Math.round(PASS_THRESHOLD * 100); // 75

export default function LessonPlayerScreen() {
  const { user, syncUser } = useAuthContext();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const cardBg = useThemeColor({}, 'cardBackground' as any);
  const primaryColor = useThemeColor({}, 'primary' as any);
  const successColor = useThemeColor({}, 'success' as any);
  const dangerColor = useThemeColor({}, 'danger' as any);
  const borderColor = useThemeColor({}, 'border' as any);
  const warningColor = useThemeColor({}, 'warning' as any);

  const { completeLesson, isLessonCompleted } = useLessons(user?.id || null);

  // State for Financial IQ stats
  const [earnedStats, setEarnedStats] = useState<{
    financialIQEarned: number;
    financialIQScore: number;
    learningStreak: number;
  } | null>(null);

  const lesson = lessonService.getLessonById(id ?? '');
  const course = lesson ? lessonService.getCourseById(lesson.courseId) : undefined;

  // Determine if this lesson is locked (previous lesson or previous unit incomplete)
  const prevLesson = lesson ? lessonService.getPreviousLesson(lesson.unitId, lesson.id) : undefined;
  const prevUnit = lesson ? lessonService.getPreviousUnit(lesson.courseId, lesson.unitId) : undefined;
  const isLocked =
    (prevLesson !== undefined && !isLessonCompleted(lesson!.courseId, prevLesson.id)) ||
    (prevUnit !== undefined &&
      prevUnit.lessons.some((l) => !isLessonCompleted(lesson!.courseId, l.id)));

  const [phase, setPhase] = useState<Phase>('content');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  // Stored at the moment we evaluate pass/fail so both result screens can read it
  const [quizResult, setQuizResult] = useState<{ score: number; total: number } | null>(null);

  const questions: LessonQuestion[] = lesson?.questions ?? [];
  const currentQuestion = questions[questionIndex];

  // Progress bar: content=1 step, each question=1 step, complete/failed = full
  const totalSteps = 1 + questions.length;
  const currentStep =
    phase === 'content'
      ? 1
      : phase === 'question'
      ? 2 + questionIndex
      : totalSteps + 1;
  const progressPct = Math.min((currentStep / (totalSteps + 1)) * 100, 100);

  const handleAnswerSelect = useCallback(
    (index: number) => {
      if (selectedAnswer !== null) return;
      setSelectedAnswer(index);
      const correct = index === currentQuestion.correctIndex;
      setIsCorrect(correct);
      if (correct) setCorrectCount((c) => c + 1);
    },
    [selectedAnswer, currentQuestion]
  );

  const handleContinue = useCallback(async () => {
    if (phase === 'content') {
      if (questions.length === 0) {
        // No questions — auto-pass
        const stats = await completeLesson(lesson!.courseId, lesson!.id, 0, 0);
        if (stats) setEarnedStats(stats);
        // Refresh user data to get updated Financial IQ and streak
        await syncUser();
        setQuizResult({ score: 0, total: 0 });
        setPhase('complete');
      } else {
        setPhase('question');
        setQuestionIndex(0);
        setSelectedAnswer(null);
        setIsCorrect(null);
      }
      return;
    }

    if (phase === 'question') {
      if (questionIndex < questions.length - 1) {
        setQuestionIndex((i) => i + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        // Last question answered — evaluate.
        // correctCount is already updated by handleAnswerSelect (via setCorrectCount)
        // before handleContinue runs, because React re-renders between answer selection
        // and the user pressing Continue. Adding isCorrect again would double-count.
        const finalScore = correctCount;
        const total = questions.length;
        const passed = finalScore / total >= PASS_THRESHOLD;

        setQuizResult({ score: finalScore, total });

        if (passed) {
          const stats = await completeLesson(lesson!.courseId, lesson!.id, finalScore, total);
          if (stats) setEarnedStats(stats);
          // Refresh user data to get updated Financial IQ and streak
          await syncUser();
          setPhase('complete');
        } else {
          setPhase('failed');
        }
      }
    }
  }, [phase, questionIndex, questions.length, lesson, completeLesson, correctCount, syncUser]);

  const handleRetry = useCallback(() => {
    setPhase('question');
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setCorrectCount(0);
    setQuizResult(null);
  }, []);

  const handleClose = () => router.back();

  if (!lesson) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={{ padding: 40 }}>Lesson not found.</ThemedText>
      </ThemedView>
    );
  }

  // ── Locked Screen ─────────────────────────────────────────────────
  if (isLocked) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.resultContent}>
          <ThemedText style={styles.resultEmoji}>🔒</ThemedText>
          <ThemedText type="title" style={styles.resultTitle}>
            Lesson Locked
          </ThemedText>
          <ThemedText style={styles.resultSubtitle}>{lesson.title}</ThemedText>
          <View style={[styles.resultCard, { backgroundColor: cardBg, borderColor }]}>
            <ThemedText style={[styles.resultLabel, { textAlign: 'center' }]}>
              {prevLesson
                ? `Complete "${prevLesson.title}" before starting this lesson.`
                : `Complete all lessons in the previous unit first.`}
            </ThemedText>
          </View>
        </ScrollView>
        <View style={[styles.bottomBar, { borderTopColor: borderColor }]}>
          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: primaryColor }]}
            onPress={handleClose}
          >
            <ThemedText style={styles.continueButtonText}>Back to Lessons</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  // ── Failed Screen ─────────────────────────────────────────────────
  if (phase === 'failed' && quizResult) {
    const pct = Math.round((quizResult.score / quizResult.total) * 100);
    return (
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.resultContent}>
          <ThemedText style={styles.resultEmoji}>😔</ThemedText>
          <ThemedText type="title" style={styles.resultTitle}>
            Not quite!
          </ThemedText>
          <ThemedText style={styles.resultSubtitle}>{lesson.title}</ThemedText>

          <View style={[styles.resultCard, { backgroundColor: cardBg, borderColor }]}>
            <View style={styles.resultRow}>
              <ThemedText style={styles.resultLabel}>Your score</ThemedText>
              <ThemedText
                type="defaultSemiBold"
                style={[styles.resultValue, { color: dangerColor }]}
              >
                {quizResult.score}/{quizResult.total} ({pct}%)
              </ThemedText>
            </View>
            <View style={styles.resultRow}>
              <ThemedText style={styles.resultLabel}>Required to pass</ThemedText>
              <ThemedText
                type="defaultSemiBold"
                style={[styles.resultValue, { color: warningColor }]}
              >
                {PASS_PCT}%
              </ThemedText>
            </View>
            <View
              style={[
                styles.failHint,
                { backgroundColor: dangerColor + '12', borderColor: dangerColor + '40' },
              ]}
            >
              <ThemedText style={[styles.failHintText, { color: dangerColor }]}>
                Re-read the lesson content and try again. You can do it!
              </ThemedText>
            </View>
          </View>
        </ScrollView>

        <View style={[styles.bottomBar, { borderTopColor: borderColor }]}>
          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: primaryColor }]}
            onPress={handleRetry}
          >
            <ThemedText style={styles.continueButtonText}>Try Again</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleClose}>
            <ThemedText style={[styles.secondaryButtonText, { color: primaryColor }]}>
              Back to Lessons
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  // ── Completion Screen ─────────────────────────────────────────────
  if (phase === 'complete' && quizResult !== null) {
    const total = quizResult.total;
    const finalScore = quizResult.score;
    const pct = total > 0 ? Math.round((finalScore / total) * 100) : 100;

    return (
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.resultContent}>
          <ThemedText style={styles.resultEmoji}>🎉</ThemedText>
          <ThemedText type="title" style={styles.resultTitle}>
            Lesson Passed!
          </ThemedText>
          <ThemedText style={styles.resultSubtitle}>{lesson.title}</ThemedText>

          <View style={[styles.resultCard, { backgroundColor: cardBg, borderColor }]}>
            {total > 0 && (
              <View style={styles.resultRow}>
                <ThemedText style={styles.resultLabel}>Score</ThemedText>
                <ThemedText
                  type="defaultSemiBold"
                  style={[styles.resultValue, { color: successColor }]}
                >
                  {finalScore}/{total} ({pct}%)
                </ThemedText>
              </View>
            )}
            <View style={styles.resultRow}>
              <ThemedText style={styles.resultLabel}>Added to portfolio</ThemedText>
              <ThemedText
                type="defaultSemiBold"
                style={[styles.resultValue, { color: successColor }]}
              >
                +${lesson.reward.toLocaleString()}
              </ThemedText>
            </View>
            {earnedStats && earnedStats.financialIQEarned > 0 && (
              <View style={styles.resultRow}>
                <ThemedText style={styles.resultLabel}>Financial IQ</ThemedText>
                <ThemedText
                  type="defaultSemiBold"
                  style={[styles.resultValue, { color: successColor }]}
                >
                  +{earnedStats.financialIQEarned} pts ({earnedStats.financialIQScore} total)
                </ThemedText>
              </View>
            )}
            {earnedStats && earnedStats.learningStreak > 0 && (
              <View style={styles.resultRow}>
                <ThemedText style={styles.resultLabel}>Daily Streak</ThemedText>
                <ThemedText
                  type="defaultSemiBold"
                  style={[styles.resultValue, { color: successColor }]}
                >
                  🔥 {earnedStats.learningStreak} day{earnedStats.learningStreak !== 1 ? 's' : ''}
                </ThemedText>
              </View>
            )}
          </View>

          {course?.attribution ? (
            <View
              style={[
                styles.attributionBox,
                { backgroundColor: colors.primaryPale, borderColor: colors.primaryLight },
              ]}
            >
              <ThemedText style={[styles.attributionText, { color: colors.primary }]}>
                {course.attribution} • {course.license}
              </ThemedText>
            </View>
          ) : null}
        </ScrollView>

        <View style={[styles.bottomBar, { borderTopColor: borderColor }]}>
          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: primaryColor }]}
            onPress={handleClose}
          >
            <ThemedText style={styles.continueButtonText}>Back to Lessons</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  // ── Content / Question Screen ─────────────────────────────────────
  const continueEnabled =
    phase === 'content' || (phase === 'question' && selectedAnswer !== null);

  return (
    <ThemedView style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${progressPct}%`, backgroundColor: primaryColor },
            ]}
          />
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <ThemedText style={styles.closeButtonText}>✕</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header badge */}
        <View style={styles.header}>
          <View style={[styles.lessonBadge, { backgroundColor: colors.primaryPale }]}>
            <ThemedText style={[styles.badgeText, { color: primaryColor }]}>
              {lesson.difficulty} · {lesson.estimatedMinutes} min
            </ThemedText>
          </View>
          {phase === 'content' && (
            <ThemedText type="title" style={styles.lessonTitle}>
              {lesson.title}
            </ThemedText>
          )}
          {phase === 'question' && (
            <ThemedText type="title" style={styles.lessonTitle}>
              Question {questionIndex + 1} of {questions.length}
            </ThemedText>
          )}
        </View>

        {/* Content Phase */}
        {phase === 'content' && (
          <>
            {lesson.content.map((block, i) => (
              <ContentBlockView
                key={i}
                block={block}
                cardBg={cardBg}
                borderColor={borderColor}
                primaryColor={primaryColor}
                successColor={successColor}
                colors={colors}
              />
            ))}
            <View style={[styles.rewardCard, { backgroundColor: cardBg, borderColor }]}>
              <ThemedText style={styles.rewardLabel}>Pass this lesson to add to portfolio</ThemedText>
              <ThemedText
                type="defaultSemiBold"
                style={[styles.rewardValue, { color: successColor }]}
              >
                +${lesson.reward.toLocaleString()}
              </ThemedText>
            </View>
            {questions.length > 0 && (
              <View
                style={[
                  styles.passRequirement,
                  { backgroundColor: warningColor + '15', borderColor: warningColor + '50' },
                ]}
              >
                <ThemedText style={[styles.passRequirementText, { color: warningColor }]}>
                  ⚡ {PASS_PCT}% required to pass ({Math.ceil(questions.length * PASS_THRESHOLD)}/{questions.length} correct)
                </ThemedText>
              </View>
            )}
          </>
        )}

        {/* Question Phase */}
        {phase === 'question' && currentQuestion && (
          <>
            <ThemedText type="defaultSemiBold" style={styles.questionText}>
              {currentQuestion.question}
            </ThemedText>

            <View style={styles.answersContainer}>
              {currentQuestion.answers.map((answer, index) => {
                const isSelected = selectedAnswer === index;
                const isThisCorrect = index === currentQuestion.correctIndex;
                const showResult = selectedAnswer !== null;

                let borderC = borderColor;
                let bgC = cardBg;
                if (showResult && isSelected && isCorrect) {
                  borderC = successColor;
                  bgC = colors.success + '15';
                } else if (showResult && isSelected && !isCorrect) {
                  borderC = dangerColor;
                  bgC = colors.danger + '15';
                } else if (showResult && isThisCorrect) {
                  borderC = successColor;
                  bgC = colors.success + '10';
                }

                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.answerButton, { backgroundColor: bgC, borderColor: borderC }]}
                    onPress={() => handleAnswerSelect(index)}
                    disabled={selectedAnswer !== null}
                  >
                    <View style={[styles.answerCircle, { borderColor: borderC }]}>
                      {isSelected && (
                        <View
                          style={[
                            styles.answerCircleFill,
                            { backgroundColor: isCorrect ? successColor : dangerColor },
                          ]}
                        />
                      )}
                    </View>
                    <ThemedText style={styles.answerText}>{answer}</ThemedText>
                    {showResult && isSelected && (
                      <ThemedText style={styles.resultIcon}>
                        {isCorrect ? '✓' : '✗'}
                      </ThemedText>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {selectedAnswer !== null && (
              <View
                style={[
                  styles.feedbackCard,
                  {
                    backgroundColor: isCorrect ? successColor + '15' : dangerColor + '15',
                    borderColor: isCorrect ? successColor : dangerColor,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.feedbackTitle,
                    { color: isCorrect ? successColor : dangerColor },
                  ]}
                >
                  {isCorrect ? '🎉 Correct!' : '❌ Not quite'}
                </ThemedText>
                <ThemedText style={styles.feedbackText}>
                  {currentQuestion.explanation}
                </ThemedText>
              </View>
            )}
          </>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Action */}
      <View style={[styles.bottomBar, { borderTopColor: borderColor }]}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            {
              backgroundColor: continueEnabled ? primaryColor : borderColor,
              opacity: continueEnabled ? 1 : 0.5,
            },
          ]}
          disabled={!continueEnabled}
          onPress={handleContinue}
        >
          <ThemedText style={styles.continueButtonText}>
            {phase === 'content'
              ? questions.length > 0
                ? 'Start Quiz'
                : 'Complete Lesson'
              : selectedAnswer === null
              ? 'Select an answer'
              : questionIndex < questions.length - 1
              ? 'Next Question'
              : 'Finish Lesson'}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

// ─── Content Block Renderer ───────────────────────────────────────────────────

function ContentBlockView({
  block,
  cardBg,
  borderColor,
  primaryColor,
  successColor,
  colors,
}: {
  block: ContentBlock;
  cardBg: string;
  borderColor: string;
  primaryColor: string;
  successColor: string;
  colors: (typeof Colors)['light'];
}) {
  switch (block.type) {
    case 'paragraph':
      return (
        <ThemedText style={styles.contentText}>
          {(block as ParagraphBlock).text}
        </ThemedText>
      );
    case 'heading':
      return (
        <ThemedText type="defaultSemiBold" style={styles.contentHeading}>
          {(block as HeadingBlock).text}
        </ThemedText>
      );
    case 'example': {
      const b = block as ExampleBlock;
      return (
        <View style={[styles.exampleBox, { backgroundColor: cardBg, borderColor }]}>
          <ThemedText type="defaultSemiBold" style={styles.exampleTitle}>
            {b.title}
          </ThemedText>
          {b.body && <ThemedText style={styles.exampleBody}>{b.body}</ThemedText>}
          {b.rows?.map((row, i) => (
            <View key={i} style={styles.exampleRow}>
              <ThemedText style={styles.exampleLabel}>{row.label}</ThemedText>
              <ThemedText style={[styles.exampleValue, { color: successColor }]}>
                {row.value}
              </ThemedText>
            </View>
          ))}
        </View>
      );
    }
    case 'keypoint': {
      const b = block as KeypointBlock;
      return (
        <View style={[styles.keypoint, { backgroundColor: colors.primaryPale }]}>
          <ThemedText style={styles.keypointIcon}>{b.icon}</ThemedText>
          <ThemedText style={[styles.keypointText, { color: colors.primaryDark }]}>
            {b.text}
          </ThemedText>
        </View>
      );
    }
    case 'list': {
      const b = block as ListBlock;
      return (
        <View style={styles.listBlock}>
          {b.items.map((item, i) => (
            <View key={i} style={styles.listItem}>
              <ThemedText style={[styles.listBullet, { color: primaryColor }]}>•</ThemedText>
              <ThemedText style={styles.listText}>{item}</ThemedText>
            </View>
          ))}
        </View>
      );
    }
    default:
      return null;
  }
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
    gap: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: 5 },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: { fontSize: 18, opacity: 0.6 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 24 },
  lessonBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  badgeText: { fontSize: 12, fontWeight: '600' },
  lessonTitle: { fontSize: 26, lineHeight: 32 },
  contentText: { fontSize: 16, lineHeight: 26, marginBottom: 16 },
  contentHeading: { fontSize: 18, marginTop: 8, marginBottom: 12 },
  exampleBox: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16 },
  exampleTitle: { fontSize: 14, marginBottom: 10, opacity: 0.8 },
  exampleBody: { fontSize: 14, marginBottom: 10, opacity: 0.7 },
  exampleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  exampleLabel: { fontSize: 14, opacity: 0.7, flex: 1 },
  exampleValue: { fontSize: 14, fontWeight: '600' },
  keypoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  keypointIcon: { fontSize: 22, lineHeight: 28 },
  keypointText: { flex: 1, fontSize: 14, lineHeight: 22, fontWeight: '500' },
  listBlock: { marginBottom: 16, gap: 10 },
  listItem: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  listBullet: { fontSize: 16, lineHeight: 24, fontWeight: 'bold' },
  listText: { flex: 1, fontSize: 15, lineHeight: 24 },
  rewardCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginTop: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardLabel: { fontSize: 14, opacity: 0.7 },
  rewardValue: { fontSize: 16 },
  passRequirement: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginTop: 4,
  },
  passRequirementText: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  questionText: { fontSize: 20, lineHeight: 28, marginBottom: 24 },
  answersContainer: { gap: 12, marginBottom: 24 },
  answerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    gap: 12,
  },
  answerCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerCircleFill: { width: 14, height: 14, borderRadius: 7 },
  answerText: { flex: 1, fontSize: 15, lineHeight: 22 },
  resultIcon: { fontSize: 20 },
  feedbackCard: { borderRadius: 12, borderWidth: 2, padding: 16, marginBottom: 16 },
  feedbackTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  feedbackText: { fontSize: 14, lineHeight: 22 },
  bottomPadding: { height: 60 },
  bottomBar: { padding: 20, paddingBottom: 36, borderTopWidth: 1, gap: 10 },
  continueButton: { borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  continueButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  secondaryButton: { alignItems: 'center', paddingVertical: 10 },
  secondaryButtonText: { fontSize: 15, fontWeight: '600' },
  // Result screens (pass & fail)
  resultContent: { padding: 32, alignItems: 'center', flexGrow: 1 },
  resultEmoji: { fontSize: 72, marginTop: 60, marginBottom: 16 },
  resultTitle: { fontSize: 28, marginBottom: 8, textAlign: 'center' },
  resultSubtitle: { fontSize: 16, opacity: 0.6, textAlign: 'center', marginBottom: 32 },
  resultCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    width: '100%',
    gap: 14,
    marginBottom: 20,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultLabel: { fontSize: 14, opacity: 0.7 },
  resultValue: { fontSize: 16 },
  failHint: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginTop: 4,
  },
  failHintText: { fontSize: 13, lineHeight: 18, textAlign: 'center' },
  attributionBox: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    width: '100%',
    marginTop: 8,
  },
  attributionText: { fontSize: 12, textAlign: 'center', lineHeight: 18 },
});
