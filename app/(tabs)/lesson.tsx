import { useState } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function LessonScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const cardBg = useThemeColor({}, 'cardBackground' as any);
  const primaryColor = useThemeColor({}, 'primary' as any);
  const successColor = useThemeColor({}, 'success' as any);
  const dangerColor = useThemeColor({}, 'danger' as any);
  const borderColor = useThemeColor({}, 'border' as any);

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
    // For demo: answer 2 is correct
    setIsCorrect(index === 2);
  };

  const answers = [
    'Only the initial investment amount',
    'Interest calculated on a monthly basis',
    'Interest earned on both principal and accumulated interest',
    'A type of savings account',
  ];

  return (
    <ThemedView style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: '40%', backgroundColor: primaryColor }]} />
        </View>
        <TouchableOpacity style={styles.closeButton}>
          <ThemedText style={styles.closeButtonText}>✕</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Lesson Header */}
        <View style={styles.header}>
          <View style={[styles.lessonBadge, { backgroundColor: colors.primaryPale }]}>
            <ThemedText style={[styles.badgeText, { color: primaryColor }]}>
              Lesson 4 of 10
            </ThemedText>
          </View>
          <ThemedText type="title" style={styles.lessonTitle}>
            Understanding Compound Interest
          </ThemedText>
        </View>

        {/* Educational Content */}
        <View style={[styles.contentCard, { backgroundColor: cardBg, borderColor }]}>
          <ThemedText style={styles.contentText}>
            Compound interest is interest calculated on the initial principal and also on the
            accumulated interest from previous periods.
          </ThemedText>

          <View style={styles.exampleBox}>
            <ThemedText style={styles.exampleTitle}>Example:</ThemedText>
            <ThemedText style={styles.exampleText}>
              Invest $1,000 at 8% annual interest:
            </ThemedText>
            <View style={styles.exampleRow}>
              <ThemedText style={styles.exampleLabel}>Year 1:</ThemedText>
              <ThemedText style={styles.exampleValue}>$1,080</ThemedText>
            </View>
            <View style={styles.exampleRow}>
              <ThemedText style={styles.exampleLabel}>Year 5:</ThemedText>
              <ThemedText style={styles.exampleValue}>$1,469</ThemedText>
            </View>
            <View style={styles.exampleRow}>
              <ThemedText style={styles.exampleLabel}>Year 10:</ThemedText>
              <ThemedText style={[styles.exampleValue, { color: successColor, fontWeight: 'bold' }]}>
                $2,159
              </ThemedText>
            </View>
          </View>

          <View style={[styles.keyPoint, { backgroundColor: colors.primaryPale }]}>
            <ThemedText style={styles.keyPointIcon}>💡</ThemedText>
            <ThemedText style={styles.keyPointText}>
              The longer you invest, the more powerful compound interest becomes!
            </ThemedText>
          </View>
        </View>

        {/* Interactive Question */}
        <View style={styles.questionSection}>
          <ThemedText type="defaultSemiBold" style={styles.questionText}>
            What is compound interest?
          </ThemedText>

          <View style={styles.answersContainer}>
            {answers.map((answer, index) => {
              const isSelected = selectedAnswer === index;
              const showResult = isSelected && isCorrect !== null;

              let answerStyle = [styles.answerButton, { backgroundColor: cardBg, borderColor }];
              if (isSelected && isCorrect) {
                answerStyle.push({ borderColor: successColor, backgroundColor: colors.success + '15' });
              } else if (isSelected && !isCorrect) {
                answerStyle.push({ borderColor: dangerColor, backgroundColor: colors.danger + '15' });
              }

              return (
                <TouchableOpacity
                  key={index}
                  style={answerStyle}
                  onPress={() => handleAnswerSelect(index)}
                  disabled={selectedAnswer !== null}
                >
                  <View style={[styles.answerCircle, { borderColor }]}>
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
                  {showResult && (
                    <ThemedText style={styles.resultIcon}>
                      {isCorrect ? '✓' : '✗'}
                    </ThemedText>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Feedback Section */}
        {isCorrect !== null && (
          <View
            style={[
              styles.feedbackCard,
              {
                backgroundColor: isCorrect ? successColor + '15' : dangerColor + '15',
                borderColor: isCorrect ? successColor : dangerColor,
              },
            ]}
          >
            <ThemedText style={[styles.feedbackTitle, { color: isCorrect ? successColor : dangerColor }]}>
              {isCorrect ? '🎉 Correct!' : '❌ Not quite'}
            </ThemedText>
            <ThemedText style={styles.feedbackText}>
              {isCorrect
                ? "Great job! You've earned +$500 learning dollars."
                : 'Compound interest includes interest on both principal and previously earned interest.'}
            </ThemedText>
          </View>
        )}

        {/* Earnings Display */}
        <View style={[styles.earningsCard, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.earningsRow}>
            <ThemedText style={styles.earningsLabel}>Lesson Progress</ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.earningsValue}>
              4 / 8 questions
            </ThemedText>
          </View>
          <View style={styles.earningsRow}>
            <ThemedText style={styles.earningsLabel}>Earned This Lesson</ThemedText>
            <ThemedText type="defaultSemiBold" style={[styles.earningsValue, { color: successColor }]}>
              +$2,000
            </ThemedText>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Action Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            {
              backgroundColor: isCorrect ? primaryColor : borderColor,
              opacity: isCorrect ? 1 : 0.5,
            },
          ]}
          disabled={!isCorrect}
        >
          <ThemedText style={styles.continueButtonText}>
            {isCorrect ? 'Continue' : 'Select an answer'}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

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
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
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
  },
  contentCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  exampleBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    opacity: 0.7,
  },
  exampleText: {
    fontSize: 14,
    marginBottom: 12,
  },
  exampleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  exampleLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  exampleValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  keyPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  keyPointIcon: {
    fontSize: 24,
  },
  keyPointText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  questionSection: {
    marginBottom: 24,
  },
  questionText: {
    fontSize: 20,
    marginBottom: 20,
  },
  answersContainer: {
    gap: 12,
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
  },
  resultIcon: {
    fontSize: 20,
  },
  feedbackCard: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    marginBottom: 24,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 14,
    lineHeight: 20,
  },
  earningsCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    gap: 12,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earningsLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  earningsValue: {
    fontSize: 16,
  },
  bottomPadding: {
    height: 100,
  },
  bottomBar: {
    padding: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
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
});
