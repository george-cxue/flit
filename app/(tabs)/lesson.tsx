import { useState } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLessons } from '@/hooks/use-lessons';
import { lessonService } from '@/src/services/lessonService';
import type { LessonCourse, LessonUnit, Lesson } from '@/src/types/lesson';

export default function LessonsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();

  const cardBg = useThemeColor({}, 'cardBackground' as any);
  const primaryColor = useThemeColor({}, 'primary' as any);
  const successColor = useThemeColor({}, 'success' as any);
  const borderColor = useThemeColor({}, 'border' as any);

  const { isLessonCompleted, getCourseCompletionCount, learningDollars } = useLessons();

  const courses = lessonService.getCourses();
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id ?? '');
  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  const handleLessonPress = (lesson: Lesson) => {
    router.push({ pathname: '/lesson/[id]', params: { id: lesson.id } });
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Lessons
          </ThemedText>

          {/* Learning Dollars Balance */}
          <View style={[styles.balanceCard, { backgroundColor: primaryColor }]}>
            <ThemedText style={styles.balanceLabel}>Learning Dollars</ThemedText>
            <ThemedText style={styles.balanceAmount}>
              ${learningDollars.toLocaleString()}
            </ThemedText>
            <ThemedText style={styles.balanceHint}>
              Earned by completing lessons · used to invest
            </ThemedText>
          </View>
        </View>

        {/* Course Selector */}
        <ThemedText type="defaultSemiBold" style={styles.sectionLabel}>
          Courses
        </ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.courseRow}
          style={styles.courseScroll}
        >
          {courses.map((course) => {
            const isSelected = course.id === selectedCourseId;
            const completed = getCourseCompletionCount(course.id);
            const total = lessonService.getTotalLessonsCount(course.id);

            return (
              <TouchableOpacity
                key={course.id}
                style={[
                  styles.courseCard,
                  {
                    backgroundColor: isSelected ? primaryColor : cardBg,
                    borderColor: isSelected ? primaryColor : borderColor,
                  },
                ]}
                onPress={() => setSelectedCourseId(course.id)}
                activeOpacity={0.75}
              >
                <ThemedText style={styles.courseCardIcon}>{course.icon}</ThemedText>
                <ThemedText
                  style={[
                    styles.courseCardTitle,
                    { color: isSelected ? '#FFFFFF' : undefined },
                  ]}
                  numberOfLines={2}
                >
                  {course.title}
                </ThemedText>
                {course.isComingSoon ? (
                  <ThemedText
                    style={[
                      styles.courseCardMeta,
                      { color: isSelected ? 'rgba(255,255,255,0.7)' : undefined },
                    ]}
                  >
                    Coming Soon
                  </ThemedText>
                ) : (
                  <ThemedText
                    style={[
                      styles.courseCardMeta,
                      { color: isSelected ? 'rgba(255,255,255,0.7)' : undefined },
                    ]}
                  >
                    {completed}/{total} complete
                  </ThemedText>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Selected Course Content */}
        {selectedCourse?.isComingSoon ? (
          <ComingSoonPlaceholder
            course={selectedCourse}
            cardBg={cardBg}
            borderColor={borderColor}
            primaryColor={primaryColor}
            colors={colors}
          />
        ) : selectedCourse ? (
          <CourseContent
            course={selectedCourse}
            cardBg={cardBg}
            borderColor={borderColor}
            primaryColor={primaryColor}
            successColor={successColor}
            colors={colors}
            isLessonCompleted={isLessonCompleted}
            completedCount={getCourseCompletionCount(selectedCourse.id)}
            totalCount={lessonService.getTotalLessonsCount(selectedCourse.id)}
            onLessonPress={handleLessonPress}
          />
        ) : null}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </ThemedView>
  );
}

// ─── Coming Soon Placeholder ──────────────────────────────────────────────────

function ComingSoonPlaceholder({
  course,
  cardBg,
  borderColor,
  primaryColor,
  colors,
}: {
  course: LessonCourse;
  cardBg: string;
  borderColor: string;
  primaryColor: string;
  colors: (typeof Colors)['light'];
}) {
  return (
    <View style={[styles.comingSoonCard, { backgroundColor: cardBg, borderColor }]}>
      <ThemedText style={styles.comingSoonIcon}>{course.icon}</ThemedText>
      <ThemedText type="defaultSemiBold" style={styles.comingSoonTitle}>
        {course.title}
      </ThemedText>
      <ThemedText style={styles.comingSoonDescription}>{course.description}</ThemedText>
      <View style={[styles.comingSoonBadge, { backgroundColor: colors.primaryPale }]}>
        <ThemedText style={[styles.comingSoonBadgeText, { color: primaryColor }]}>
          🚀 Coming Soon
        </ThemedText>
      </View>
    </View>
  );
}

// ─── Course Content (Units + Lessons) ────────────────────────────────────────

function CourseContent({
  course,
  cardBg,
  borderColor,
  primaryColor,
  successColor,
  colors,
  isLessonCompleted,
  completedCount,
  totalCount,
  onLessonPress,
}: {
  course: LessonCourse;
  cardBg: string;
  borderColor: string;
  primaryColor: string;
  successColor: string;
  colors: (typeof Colors)['light'];
  isLessonCompleted: (courseId: string, lessonId: string) => boolean;
  completedCount: number;
  totalCount: number;
  onLessonPress: (lesson: Lesson) => void;
}) {
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <>
      {/* Course progress strip */}
      <View style={[styles.courseProgress, { backgroundColor: cardBg, borderColor }]}>
        <View style={styles.courseProgressTop}>
          <ThemedText type="defaultSemiBold" style={styles.courseProgressTitle}>
            {course.title}
          </ThemedText>
          <ThemedText style={styles.courseProgressCount}>
            {completedCount}/{totalCount}
          </ThemedText>
        </View>
        <View style={styles.courseProgressBarBg}>
          <View
            style={[
              styles.courseProgressBarFill,
              { width: `${progressPct}%`, backgroundColor: primaryColor },
            ]}
          />
        </View>
        {course.attribution ? (
          <ThemedText style={styles.courseAttribution}>
            {course.attribution} · {course.license}
          </ThemedText>
        ) : null}
      </View>

      {/* Units */}
      {course.units.map((unit) => (
        <UnitSection
          key={unit.id}
          unit={unit}
          courseId={course.id}
          cardBg={cardBg}
          borderColor={borderColor}
          primaryColor={primaryColor}
          successColor={successColor}
          colors={colors}
          isLessonCompleted={isLessonCompleted}
          onLessonPress={onLessonPress}
        />
      ))}
    </>
  );
}

// ─── Unit Section ─────────────────────────────────────────────────────────────

function UnitSection({
  unit,
  courseId,
  cardBg,
  borderColor,
  primaryColor,
  successColor,
  colors,
  isLessonCompleted,
  onLessonPress,
}: {
  unit: LessonUnit;
  courseId: string;
  cardBg: string;
  borderColor: string;
  primaryColor: string;
  successColor: string;
  colors: (typeof Colors)['light'];
  isLessonCompleted: (courseId: string, lessonId: string) => boolean;
  onLessonPress: (lesson: Lesson) => void;
}) {
  const unitCompleted = unit.lessons.filter((l) =>
    isLessonCompleted(courseId, l.id)
  ).length;

  return (
    <View style={[styles.unitSection, { backgroundColor: cardBg, borderColor }]}>
      <View style={styles.unitHeader}>
        <ThemedText style={styles.unitIcon}>{unit.icon}</ThemedText>
        <View style={styles.unitHeaderText}>
          <ThemedText type="defaultSemiBold" style={styles.unitTitle}>
            {unit.title}
          </ThemedText>
          <ThemedText style={styles.unitMeta}>
            {unitCompleted}/{unit.lessons.length} complete
          </ThemedText>
        </View>
      </View>

      {unit.lessons.map((lesson, index) => {
        const completed = isLessonCompleted(courseId, lesson.id);
        const isLast = index === unit.lessons.length - 1;

        return (
          <TouchableOpacity
            key={lesson.id}
            style={[
              styles.lessonRow,
              !isLast && { borderBottomWidth: 1, borderBottomColor: borderColor },
            ]}
            onPress={() => onLessonPress(lesson)}
          >
            <View
              style={[
                styles.lessonStatusDot,
                {
                  backgroundColor: completed ? successColor : colors.primaryPale,
                  borderColor: completed ? successColor : borderColor,
                },
              ]}
            >
              {completed && (
                <ThemedText style={styles.lessonCheckmark}>✓</ThemedText>
              )}
            </View>

            <View style={styles.lessonInfo}>
              <ThemedText
                type="defaultSemiBold"
                style={[styles.lessonTitle, completed && { opacity: 0.45 }]}
                numberOfLines={1}
              >
                {lesson.title}
              </ThemedText>
              <ThemedText style={styles.lessonMeta}>
                {lesson.estimatedMinutes} min · {lesson.difficulty}
              </ThemedText>
            </View>

            <View style={styles.lessonRight}>
              {!completed && (
                <View style={[styles.rewardBadge, { backgroundColor: colors.primaryPale }]}>
                  <ThemedText style={[styles.rewardText, { color: primaryColor }]}>
                    +${lesson.reward}
                  </ThemedText>
                </View>
              )}
              <ThemedText style={styles.chevron}>›</ThemedText>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 60 },
  header: { marginBottom: 20 },
  title: { fontSize: 28, marginBottom: 16 },
  // Learning dollars balance
  balanceCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 4,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  balanceHint: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  // Course selector
  sectionLabel: {
    fontSize: 16,
    marginBottom: 12,
    marginTop: 8,
  },
  courseScroll: { marginHorizontal: -20 },
  courseRow: { paddingHorizontal: 20, gap: 12, paddingBottom: 4 },
  courseCard: {
    width: 140,
    borderRadius: 14,
    borderWidth: 2,
    padding: 14,
    gap: 6,
  },
  courseCardIcon: { fontSize: 28, marginBottom: 2 },
  courseCardTitle: { fontSize: 13, fontWeight: '700', lineHeight: 18 },
  courseCardMeta: { fontSize: 11, opacity: 0.6 },
  // Coming soon
  comingSoonCard: {
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  comingSoonIcon: { fontSize: 56 },
  comingSoonTitle: { fontSize: 20, textAlign: 'center' },
  comingSoonDescription: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 22,
  },
  comingSoonBadge: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  comingSoonBadgeText: { fontSize: 14, fontWeight: '700' },
  // Course progress strip
  courseProgress: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginTop: 16,
    marginBottom: 12,
    gap: 8,
  },
  courseProgressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseProgressTitle: { fontSize: 15 },
  courseProgressCount: { fontSize: 13, opacity: 0.5 },
  courseProgressBarBg: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  courseProgressBarFill: { height: '100%', borderRadius: 3 },
  courseAttribution: { fontSize: 11, opacity: 0.4 },
  // Units
  unitSection: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  unitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  unitIcon: { fontSize: 28 },
  unitHeaderText: { flex: 1 },
  unitTitle: { fontSize: 16, marginBottom: 2 },
  unitMeta: { fontSize: 13, opacity: 0.5 },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  lessonStatusDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonCheckmark: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  lessonInfo: { flex: 1 },
  lessonTitle: { fontSize: 15, marginBottom: 2 },
  lessonMeta: { fontSize: 12, opacity: 0.5 },
  lessonRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rewardBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  rewardText: { fontSize: 12, fontWeight: '700' },
  chevron: { fontSize: 20, opacity: 0.4 },
  bottomPadding: { height: 40 },
});
