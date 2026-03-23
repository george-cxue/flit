import { useState, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Typography, Radii, Spacing, AmbientShadow, SubtleShadow } from '@/constants/theme';
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

const c = Colors.light;

type Phase = 'content' | 'question' | 'failed' | 'complete';

const PASS_PCT = Math.round(PASS_THRESHOLD * 100); // 75

export default function LessonPlayerScreen() {
  const { user, syncUser } = useAuthContext();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

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
      if (correct) setCorrectCount((ct) => ct + 1);
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
          <ThemedText type="headline-lg" style={styles.resultTitle}>
            Lesson Locked
          </ThemedText>
          <ThemedText type="body-lg" style={[styles.resultSubtitle, { color: c.onSurfaceVariant }]}>
            {lesson.title}
          </ThemedText>
          <View style={[styles.resultCard, { backgroundColor: c.surfaceContainerLowest }]}>
            <ThemedText type="body-md" style={[styles.resultLabel, { textAlign: 'center' }]}>
              {prevLesson
                ? `Complete "${prevLesson.title}" before starting this lesson.`
                : `Complete all lessons in the previous unit first.`}
            </ThemedText>
          </View>
        </ScrollView>
        <View style={[styles.bottomBar, { backgroundColor: c.surfaceContainerLowest }]}>
          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: c.primary }]}
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
          <ThemedText type="headline-lg" style={styles.resultTitle}>
            Not quite!
          </ThemedText>
          <ThemedText type="body-lg" style={[styles.resultSubtitle, { color: c.onSurfaceVariant }]}>
            {lesson.title}
          </ThemedText>

          <View style={[styles.resultCard, { backgroundColor: c.surfaceContainerLowest }]}>
            <View style={styles.resultRow}>
              <ThemedText type="body-md" style={[styles.resultLabel, { color: c.onSurfaceVariant }]}>
                Your score
              </ThemedText>
              <ThemedText
                type="title-md"
                style={[styles.resultValue, { color: c.danger }]}
              >
                {quizResult.score}/{quizResult.total} ({pct}%)
              </ThemedText>
            </View>
            <View style={{ height: 1, backgroundColor: c.surfaceContainerHigh, marginHorizontal: '10%' }} />
            <View style={styles.resultRow}>
              <ThemedText type="body-md" style={[styles.resultLabel, { color: c.onSurfaceVariant }]}>
                Required to pass
              </ThemedText>
              <ThemedText
                type="title-md"
                style={[styles.resultValue, { color: c.warning }]}
              >
                {PASS_PCT}%
              </ThemedText>
            </View>
            <View
              style={[
                styles.failHint,
                { backgroundColor: c.danger + '12' },
              ]}
            >
              <ThemedText type="body-md" style={[styles.failHintText, { color: c.danger }]}>
                Re-read the lesson content and try again. You can do it!
              </ThemedText>
            </View>
          </View>
        </ScrollView>

        <View style={[styles.bottomBar, { backgroundColor: c.surfaceContainerLowest }]}>
          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: c.primary }]}
            onPress={handleRetry}
          >
            <ThemedText style={styles.continueButtonText}>Try Again</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryButton, { backgroundColor: c.secondaryContainer }]}
            onPress={handleClose}
          >
            <ThemedText type="label-lg" style={[styles.secondaryButtonText, { color: c.onSecondaryContainer }]}>
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
          <ThemedText type="headline-lg" style={styles.resultTitle}>
            Lesson Passed!
          </ThemedText>
          <ThemedText type="body-lg" style={[styles.resultSubtitle, { color: c.onSurfaceVariant }]}>
            {lesson.title}
          </ThemedText>

          <View style={[styles.resultCard, { backgroundColor: c.surfaceContainerLowest }]}>
            {total > 0 && (
              <>
                <View style={styles.resultRow}>
                  <ThemedText type="body-md" style={[styles.resultLabel, { color: c.onSurfaceVariant }]}>
                    Score
                  </ThemedText>
                  <ThemedText
                    type="title-md"
                    style={[styles.resultValue, { color: c.success }]}
                  >
                    {finalScore}/{total} ({pct}%)
                  </ThemedText>
                </View>
                <View style={{ height: 1, backgroundColor: c.surfaceContainerHigh, marginHorizontal: '10%' }} />
              </>
            )}
            <View style={styles.resultRow}>
              <ThemedText type="body-md" style={[styles.resultLabel, { color: c.onSurfaceVariant }]}>
                Added to portfolio
              </ThemedText>
              <ThemedText
                type="title-md"
                style={[styles.resultValue, { color: c.success }]}
              >
                +${lesson.reward.toLocaleString()}
              </ThemedText>
            </View>
            {earnedStats && earnedStats.financialIQEarned > 0 && (
              <>
                <View style={{ height: 1, backgroundColor: c.surfaceContainerHigh, marginHorizontal: '10%' }} />
                <View style={styles.resultRow}>
                  <ThemedText type="body-md" style={[styles.resultLabel, { color: c.onSurfaceVariant }]}>
                    Financial IQ
                  </ThemedText>
                  <ThemedText
                    type="title-md"
                    style={[styles.resultValue, { color: c.success }]}
                  >
                    +{earnedStats.financialIQEarned} pts ({earnedStats.financialIQScore} total)
                  </ThemedText>
                </View>
              </>
            )}
            {earnedStats && earnedStats.learningStreak > 0 && (
              <>
                <View style={{ height: 1, backgroundColor: c.surfaceContainerHigh, marginHorizontal: '10%' }} />
                <View style={styles.resultRow}>
                  <ThemedText type="body-md" style={[styles.resultLabel, { color: c.onSurfaceVariant }]}>
                    Daily Streak
                  </ThemedText>
                  <ThemedText
                    type="title-md"
                    style={[styles.resultValue, { color: c.success }]}
                  >
                    🔥 {earnedStats.learningStreak} day{earnedStats.learningStreak !== 1 ? 's' : ''}
                  </ThemedText>
                </View>
              </>
            )}
          </View>

          {course?.attribution ? (
            <View
              style={[
                styles.attributionBox,
                { backgroundColor: c.surfaceContainerLow },
              ]}
            >
              <ThemedText type="label-md" style={[styles.attributionText, { color: c.primary }]}>
                {course.attribution} • {course.license}
              </ThemedText>
            </View>
          ) : null}
        </ScrollView>

        <View style={[styles.bottomBar, { backgroundColor: c.surfaceContainerLowest }]}>
          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: c.primary }]}
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
          <LinearGradient
            colors={[c.primary, c.primaryContainer]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.progressBarFill,
              { width: `${progressPct}%` },
            ]}
          />
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <ThemedText style={[styles.closeButtonText, { color: c.onSurfaceVariant }]}>✕</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header badge */}
        <View style={styles.header}>
          <View style={[styles.lessonBadge, { backgroundColor: c.surfaceContainerLow }]}>
            <ThemedText type="label-md" style={[styles.badgeText, { color: c.primary }]}>
              {lesson.difficulty} · {lesson.estimatedMinutes} min
            </ThemedText>
          </View>
          {phase === 'content' && (
            <ThemedText type="headline-lg" style={styles.lessonTitle}>
              {lesson.title}
            </ThemedText>
          )}
          {phase === 'question' && (
            <ThemedText type="headline-lg" style={styles.lessonTitle}>
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
              />
            ))}
            <View style={[styles.rewardCard, { backgroundColor: c.surfaceContainerLowest }]}>
              <ThemedText type="body-md" style={[styles.rewardLabel, { color: c.onSurfaceVariant }]}>
                Pass this lesson to add to portfolio
              </ThemedText>
              <ThemedText
                type="title-md"
                style={[styles.rewardValue, { color: c.success }]}
              >
                +${lesson.reward.toLocaleString()}
              </ThemedText>
            </View>
            {questions.length > 0 && (
              <View
                style={[
                  styles.passRequirement,
                  { backgroundColor: c.warning + '15' },
                ]}
              >
                <ThemedText type="label-lg" style={[styles.passRequirementText, { color: c.warning }]}>
                  ⚡ {PASS_PCT}% required to pass ({Math.ceil(questions.length * PASS_THRESHOLD)}/{questions.length} correct)
                </ThemedText>
              </View>
            )}
          </>
        )}

        {/* Question Phase */}
        {phase === 'question' && currentQuestion && (
          <>
            <ThemedText type="title-lg" style={styles.questionText}>
              {currentQuestion.question}
            </ThemedText>

            <View style={styles.answersContainer}>
              {currentQuestion.answers.map((answer, index) => {
                const isSelected = selectedAnswer === index;
                const isThisCorrect = index === currentQuestion.correctIndex;
                const showResult = selectedAnswer !== null;

                let bgC = c.surfaceContainerLowest;
                let accentColor = c.outlineVariant;
                if (showResult && isSelected && isCorrect) {
                  accentColor = c.success;
                  bgC = c.success + '15';
                } else if (showResult && isSelected && !isCorrect) {
                  accentColor = c.danger;
                  bgC = c.danger + '15';
                } else if (showResult && isThisCorrect) {
                  accentColor = c.success;
                  bgC = c.success + '10';
                }

                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.answerButton, { backgroundColor: bgC }, showResult && (isSelected || isThisCorrect) ? { borderWidth: 2, borderColor: accentColor } : null]}
                    onPress={() => handleAnswerSelect(index)}
                    disabled={selectedAnswer !== null}
                  >
                    <View style={[styles.answerCircle, { backgroundColor: c.surfaceContainerHigh }]}>
                      {isSelected && (
                        <View
                          style={[
                            styles.answerCircleFill,
                            { backgroundColor: isCorrect ? c.success : c.danger },
                          ]}
                        />
                      )}
                    </View>
                    <ThemedText type="body-lg" style={styles.answerText}>{answer}</ThemedText>
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
                    backgroundColor: isCorrect ? c.success + '15' : c.danger + '15',
                  },
                ]}
              >
                <ThemedText
                  type="title-md"
                  style={[
                    styles.feedbackTitle,
                    { color: isCorrect ? c.success : c.danger },
                  ]}
                >
                  {isCorrect ? '🎉 Correct!' : '❌ Not quite'}
                </ThemedText>
                <ThemedText type="body-md" style={styles.feedbackText}>
                  {currentQuestion.explanation}
                </ThemedText>
              </View>
            )}
          </>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Action */}
      <View style={[styles.bottomBar, { backgroundColor: c.surfaceContainerLowest }]}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            {
              backgroundColor: continueEnabled ? c.primary : c.surfaceContainerHighest,
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
}: {
  block: ContentBlock;
}) {
  switch (block.type) {
    case 'paragraph':
      return (
        <ThemedText type="body-lg" style={styles.contentText}>
          {(block as ParagraphBlock).text}
        </ThemedText>
      );
    case 'heading':
      return (
        <ThemedText type="title-lg" style={styles.contentHeading}>
          {(block as HeadingBlock).text}
        </ThemedText>
      );
    case 'example': {
      const b = block as ExampleBlock;
      return (
        <View style={[styles.exampleBox, { backgroundColor: c.surfaceContainerLowest, ...SubtleShadow }]}>
          <ThemedText type="label-lg" style={[styles.exampleTitle, { color: c.onSurfaceVariant }]}>
            {b.title}
          </ThemedText>
          {b.body && <ThemedText type="body-md" style={[styles.exampleBody, { color: c.onSurfaceVariant }]}>{b.body}</ThemedText>}
          {b.rows?.map((row, i) => (
            <View key={i}>
              {i > 0 && (
                <View style={{ height: 1, backgroundColor: c.surfaceContainerHigh, marginHorizontal: '10%' }} />
              )}
              <View style={styles.exampleRow}>
                <ThemedText type="body-md" style={[styles.exampleLabel, { color: c.onSurfaceVariant }]}>{row.label}</ThemedText>
                <ThemedText type="label-lg" style={[styles.exampleValue, { color: c.success }]}>
                  {row.value}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      );
    }
    case 'keypoint': {
      const b = block as KeypointBlock;
      return (
        <View style={[styles.keypoint, { backgroundColor: c.surfaceContainerLow }]}>
          <ThemedText style={styles.keypointIcon}>{b.icon}</ThemedText>
          <ThemedText type="label-lg" style={[styles.keypointText, { color: c.primary }]}>
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
              <ThemedText style={[styles.listBullet, { color: c.primary }]}>•</ThemedText>
              <ThemedText type="body-lg" style={styles.listText}>{item}</ThemedText>
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
    paddingHorizontal: Spacing.md + 4,
    paddingTop: 60,
    paddingBottom: Spacing.sm + 4,
    gap: Spacing.sm + 4,
  },
  progressBarBg: {
    flex: 1,
    height: 10,
    backgroundColor: c.surfaceContainerHighest,
    borderRadius: Radii.full,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: Radii.full },
  closeButton: {
    width: Spacing.xl,
    height: Spacing.xl,
    borderRadius: Radii.full,
    backgroundColor: c.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: { fontSize: 18 },
  scrollView: { flex: 1 },
  scrollContent: { padding: Spacing.md + 4, paddingBottom: 40 },
  header: { marginBottom: Spacing.lg },
  lessonBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radii.md,
    marginBottom: Spacing.sm + 4,
  },
  badgeText: {},
  lessonTitle: { fontSize: 26, lineHeight: 32 },
  contentText: { marginBottom: Spacing.md },
  contentHeading: { marginTop: Spacing.sm, marginBottom: Spacing.sm + 4 },
  exampleBox: { borderRadius: Radii.md, padding: Spacing.md, marginBottom: Spacing.md },
  exampleTitle: { marginBottom: Spacing.sm + 2 },
  exampleBody: { marginBottom: Spacing.sm + 2 },
  exampleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  exampleLabel: { flex: 1 },
  exampleValue: {},
  keypoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.sm + 6,
    borderRadius: Radii.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm + 4,
  },
  keypointIcon: { fontSize: 22, lineHeight: 28 },
  keypointText: { flex: 1, lineHeight: 22 },
  listBlock: { marginBottom: Spacing.md, gap: Spacing.sm + 2 },
  listItem: { flexDirection: 'row', gap: Spacing.sm + 2, alignItems: 'flex-start' },
  listBullet: { fontSize: 16, lineHeight: 24, fontWeight: 'bold' },
  listText: { flex: 1 },
  rewardCard: {
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SubtleShadow,
  },
  rewardLabel: {},
  rewardValue: {},
  passRequirement: {
    borderRadius: Radii.sm + 2,
    padding: Spacing.sm + 4,
    marginTop: Spacing.xs,
  },
  passRequirementText: { textAlign: 'center' },
  questionText: { marginBottom: Spacing.lg },
  answersContainer: { gap: Spacing.sm + 4, marginBottom: Spacing.lg },
  answerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radii.md,
    padding: Spacing.md,
    gap: Spacing.sm + 4,
    ...SubtleShadow,
  },
  answerCircle: {
    width: Spacing.lg,
    height: Spacing.lg,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerCircleFill: { width: 14, height: 14, borderRadius: Radii.full },
  answerText: { flex: 1 },
  resultIcon: { fontSize: 20 },
  feedbackCard: { borderRadius: Radii.md, padding: Spacing.md, marginBottom: Spacing.md },
  feedbackTitle: { marginBottom: Spacing.sm },
  feedbackText: { lineHeight: 22 },
  bottomPadding: { height: 60 },
  bottomBar: {
    padding: Spacing.md + 4,
    paddingBottom: 36,
    gap: Spacing.sm + 2,
    ...SubtleShadow,
  },
  continueButton: { borderRadius: Radii.lg, paddingVertical: Spacing.md, alignItems: 'center' },
  continueButtonText: { color: c.onPrimary, fontFamily: Typography['title-md'].fontFamily, fontSize: Typography['title-md'].fontSize },
  secondaryButton: { alignItems: 'center', paddingVertical: Spacing.sm + 2, borderRadius: Radii.lg },
  secondaryButtonText: {},
  // Result screens (pass & fail)
  resultContent: { padding: Spacing.xl, alignItems: 'center', flexGrow: 1 },
  resultEmoji: { fontSize: 72, marginTop: 60, marginBottom: Spacing.md },
  resultTitle: { marginBottom: Spacing.sm, textAlign: 'center' },
  resultSubtitle: { textAlign: 'center', marginBottom: Spacing.xl },
  resultCard: {
    borderRadius: Radii.md,
    padding: Spacing.md + 4,
    width: '100%',
    gap: Spacing.sm + 6,
    marginBottom: Spacing.md + 4,
    ...AmbientShadow,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultLabel: {},
  resultValue: {},
  failHint: {
    borderRadius: Radii.sm + 2,
    padding: Spacing.sm + 4,
    marginTop: Spacing.xs,
  },
  failHintText: { lineHeight: 18, textAlign: 'center' },
  attributionBox: {
    borderRadius: Radii.sm,
    padding: Spacing.sm + 4,
    width: '100%',
    marginTop: Spacing.sm,
  },
  attributionText: { textAlign: 'center', lineHeight: 18 },
});
