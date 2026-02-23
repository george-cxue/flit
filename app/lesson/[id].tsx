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
import {
  ContentBlock,
  LessonQuestion,
  ParagraphBlock,
  HeadingBlock,
  ExampleBlock,
  KeypointBlock,
  ListBlock,
} from '@/src/types/lesson';

type Phase = 'content' | 'question' | 'complete';

export default function LessonPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const cardBg = useThemeColor({}, 'cardBackground' as any);
  const primaryColor = useThemeColor({}, 'primary' as any);
  const successColor = useThemeColor({}, 'success' as any);
  const dangerColor = useThemeColor({}, 'danger' as any);
  const borderColor = useThemeColor({}, 'border' as any);

  const { completeLesson } = useLessons();

  const lesson = lessonService.getLessonById(id ?? '');

  const [phase, setPhase] = useState<Phase>('content');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const questions: LessonQuestion[] = lesson?.questions ?? [];
  const currentQuestion = questions[questionIndex];
  const totalSteps = 1 + questions.length; // content + each question
  const currentStep = phase === 'content' ? 1 : phase === 'question' ? 1 + questionIndex + 1 : totalSteps + 1;
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
        await completeLesson(lesson!.courseId, lesson!.id, 0, 0);
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
        // All questions done
        await completeLesson(
          lesson!.courseId,
          lesson!.id,
          correctCount + (isCorrect ? 1 : 0),
          questions.length
        );
        setPhase('complete');
      }
    }
  }, [phase, questionIndex, questions.length, lesson, completeLesson, correctCount, isCorrect]);

  const handleClose = () => {
    router.back();
  };

  if (!lesson) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={{ padding: 40 }}>Lesson not found.</ThemedText>
      </ThemedView>
    );
  }

  // ── Completion Screen ─────────────────────────────────────────────
  if (phase === 'complete') {
    const finalScore = correctCount;
    const total = questions.length;
    const pct = total > 0 ? Math.round((finalScore / total) * 100) : 100;

    return (
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.completionContent}>
          <ThemedText style={styles.completionEmoji}>🎉</ThemedText>
          <ThemedText type="title" style={styles.completionTitle}>
            Lesson Complete!
          </ThemedText>
          <ThemedText style={styles.completionSubtitle}>
            {lesson.title}
          </ThemedText>

          <View style={[styles.completionCard, { backgroundColor: cardBg, borderColor }]}>
            <View style={styles.completionRow}>
              <ThemedText style={styles.completionLabel}>Questions correct</ThemedText>
              <ThemedText type="defaultSemiBold" style={[styles.completionValue, { color: successColor }]}>
                {total > 0 ? `${finalScore} / ${total}` : '—'}
              </ThemedText>
            </View>
            {total > 0 && (
              <View style={styles.completionRow}>
                <ThemedText style={styles.completionLabel}>Score</ThemedText>
                <ThemedText type="defaultSemiBold" style={[styles.completionValue, { color: successColor }]}>
                  {pct}%
                </ThemedText>
              </View>
            )}
            <View style={styles.completionRow}>
              <ThemedText style={styles.completionLabel}>Earned</ThemedText>
              <ThemedText type="defaultSemiBold" style={[styles.completionValue, { color: successColor }]}>
                +${lesson.reward.toLocaleString()} learning dollars
              </ThemedText>
            </View>
          </View>

          <View style={[styles.attributionBox, { backgroundColor: colors.primaryPale, borderColor: colors.primaryLight }]}>
            <ThemedText style={[styles.attributionText, { color: colors.primary }]}>
              Content based on Khan Academy Financial Literacy • CC BY-NC-SA 4.0
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

  // ── Lesson Content Screen ─────────────────────────────────────────
  const continueEnabled = phase === 'content' || (phase === 'question' && selectedAnswer !== null);

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
        {/* Header */}
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
              <ThemedText style={styles.rewardLabel}>Complete this lesson to earn</ThemedText>
              <ThemedText type="defaultSemiBold" style={[styles.rewardValue, { color: successColor }]}>
                +${lesson.reward.toLocaleString()} learning dollars
              </ThemedText>
            </View>
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
                    style={[
                      styles.answerButton,
                      { backgroundColor: bgC, borderColor: borderC },
                    ]}
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

            {/* Feedback */}
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
          {b.body && (
            <ThemedText style={styles.exampleBody}>{b.body}</ThemedText>
          )}
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
  container: {
    flex: 1,
  },
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
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    opacity: 0.6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  lessonBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  lessonTitle: {
    fontSize: 26,
    lineHeight: 32,
  },
  // Content blocks
  contentText: {
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 16,
  },
  contentHeading: {
    fontSize: 18,
    marginTop: 8,
    marginBottom: 12,
  },
  exampleBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  exampleTitle: {
    fontSize: 14,
    marginBottom: 10,
    opacity: 0.8,
  },
  exampleBody: {
    fontSize: 14,
    marginBottom: 10,
    opacity: 0.7,
  },
  exampleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  exampleLabel: {
    fontSize: 14,
    opacity: 0.7,
    flex: 1,
  },
  exampleValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  keypoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  keypointIcon: {
    fontSize: 22,
    lineHeight: 28,
  },
  keypointText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
  listBlock: {
    marginBottom: 16,
    gap: 10,
  },
  listItem: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  listBullet: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 'bold',
  },
  listText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
  },
  rewardCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  rewardValue: {
    fontSize: 16,
  },
  // Question phase
  questionText: {
    fontSize: 20,
    lineHeight: 28,
    marginBottom: 24,
  },
  answersContainer: {
    gap: 12,
    marginBottom: 24,
  },
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
  answerCircleFill: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  answerText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  resultIcon: {
    fontSize: 20,
  },
  feedbackCard: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    marginBottom: 16,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 14,
    lineHeight: 22,
  },
  bottomPadding: {
    height: 60,
  },
  // Bottom bar
  bottomBar: {
    padding: 20,
    paddingBottom: 36,
    borderTopWidth: 1,
  },
  continueButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Completion screen
  completionContent: {
    padding: 32,
    alignItems: 'center',
    flexGrow: 1,
  },
  completionEmoji: {
    fontSize: 72,
    marginTop: 60,
    marginBottom: 16,
  },
  completionTitle: {
    fontSize: 28,
    marginBottom: 8,
    textAlign: 'center',
  },
  completionSubtitle: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: 'center',
    marginBottom: 32,
  },
  completionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  completionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completionLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  completionValue: {
    fontSize: 16,
  },
  attributionBox: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    width: '100%',
    marginTop: 8,
  },
  attributionText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
