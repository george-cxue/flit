import { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Typography, Radii, Spacing, SubtleShadow } from '@/constants/theme';
import { useLessons } from '@/hooks/use-lessons';
import { lessonService } from '@/src/services/lessonService';
import type { LessonCourse, LessonUnit, Lesson } from '@/src/types/lesson';
import { useAuthContext } from '@/contexts/auth-context';

export default function LessonsScreen() {
  const { user } = useAuthContext();
  const c = Colors.light;
  const router = useRouter();

  const { isLessonCompleted, getCourseCompletionCount, portfolioBalance, reload } = useLessons(user?.id || null);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const courses = lessonService.getCourses();
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id ?? '');
  const selectedCourse = courses.find((co) => co.id === selectedCourseId);

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
          <ThemedText type="headline-lg" style={styles.title}>
            Lessons
          </ThemedText>

          {/* Portfolio Balance — Hero gradient */}
          <LinearGradient
            colors={[c.primary, c.primaryContainer]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceCard}
          >
            <ThemedText type="label-lg" style={styles.balanceLabel}>Learning Dollars</ThemedText>
            <ThemedText style={styles.balanceAmount}>
              ${portfolioBalance.toLocaleString()}
            </ThemedText>
            <ThemedText type="body-md" style={styles.balanceHint}>
              Complete lessons to grow your learning dollars
            </ThemedText>
          </LinearGradient>

          {/* Learning Dollars Explanation */}
          <View style={[styles.infoCard, { backgroundColor: c.surfaceContainerLowest }]}>
            <ThemedText type="title-md" style={styles.infoTitle}>What are Learning Dollars?</ThemedText>
            <ThemedText type="body-md" style={styles.infoText}>
              Learning Dollars determine your starting portfolio size when you join or create a group. The more lessons you complete, the bigger your starting balance!
            </ThemedText>
            <ThemedText type="body-md" style={[styles.infoText, { marginTop: 8 }]}>
              {'\u2022'} Monthly Tournament requires $10,000{'\n'}
              {'\u2022'} Custom groups can set any starting balance{'\n'}
              {'\u2022'} You must have enough Learning Dollars to join
            </ThemedText>
          </View>
        </View>

        {/* Course Selector */}
        <ThemedText type="title-md" style={styles.sectionLabel}>
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
                    backgroundColor: isSelected ? c.primary : c.surfaceContainerLowest,
                  },
                  !isSelected && SubtleShadow,
                ]}
                onPress={() => setSelectedCourseId(course.id)}
                activeOpacity={0.75}
              >
                <ThemedText style={styles.courseCardIcon}>{course.icon}</ThemedText>
                <ThemedText
                  type="label-lg"
                  style={[
                    styles.courseCardTitle,
                    { color: isSelected ? '#FFFFFF' : c.onSurface },
                  ]}
                  numberOfLines={2}
                >
                  {course.title}
                </ThemedText>
                {course.isComingSoon ? (
                  <ThemedText
                    type="label-md"
                    style={[
                      styles.courseCardMeta,
                      { color: isSelected ? 'rgba(255,255,255,0.7)' : c.onSurfaceVariant },
                    ]}
                  >
                    Coming Soon
                  </ThemedText>
                ) : (
                  <ThemedText
                    type="label-md"
                    style={[
                      styles.courseCardMeta,
                      { color: isSelected ? 'rgba(255,255,255,0.7)' : c.onSurfaceVariant },
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
          <ComingSoonPlaceholder course={selectedCourse} />
        ) : selectedCourse ? (
          <CourseContent
            course={selectedCourse}
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

function ComingSoonPlaceholder({ course }: { course: LessonCourse }) {
  const c = Colors.light;

  return (
    <View style={[styles.comingSoonCard, { backgroundColor: c.surfaceContainerLowest }]}>
      <ThemedText style={styles.comingSoonIcon}>{course.icon}</ThemedText>
      <ThemedText type="title-lg" style={styles.comingSoonTitle}>
        {course.title}
      </ThemedText>
      <ThemedText type="body-md" style={styles.comingSoonDescription}>{course.description}</ThemedText>
      <View style={[styles.comingSoonBadge, { backgroundColor: c.surfaceTint }]}>
        <ThemedText type="label-lg" style={[styles.comingSoonBadgeText, { color: c.primary }]}>
          Coming Soon
        </ThemedText>
      </View>
    </View>
  );
}

// ─── Course Content (Units + Lessons) ────────────────────────────────────────

function CourseContent({
  course,
  isLessonCompleted,
  completedCount,
  totalCount,
  onLessonPress,
}: {
  course: LessonCourse;
  isLessonCompleted: (courseId: string, lessonId: string) => boolean;
  completedCount: number;
  totalCount: number;
  onLessonPress: (lesson: Lesson) => void;
}) {
  const c = Colors.light;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <>
      {/* Course progress strip */}
      <View style={[styles.courseProgress, { backgroundColor: c.surfaceContainerLowest }]}>
        <View style={styles.courseProgressTop}>
          <ThemedText type="title-md" style={styles.courseProgressTitle}>
            {course.title}
          </ThemedText>
          <ThemedText type="label-md" style={styles.courseProgressCount}>
            {completedCount}/{totalCount}
          </ThemedText>
        </View>
        <View style={styles.courseProgressBarBg}>
          <LinearGradient
            colors={[c.primary, c.primaryContainer]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.courseProgressBarFill, { width: `${progressPct}%` }]}
          />
        </View>
        {course.attribution ? (
          <ThemedText type="label-md" style={styles.courseAttribution}>
            {course.attribution} · {course.license}
          </ThemedText>
        ) : null}
      </View>

      {/* Units */}
      {course.units.map((unit, unitIndex) => {
        const prevUnit = unitIndex > 0 ? course.units[unitIndex - 1] : null;
        const unitLocked =
          prevUnit !== null &&
          prevUnit.lessons.some((l) => !isLessonCompleted(course.id, l.id));

        return (
          <UnitSection
            key={unit.id}
            unit={unit}
            courseId={course.id}
            unitLocked={unitLocked}
            isLessonCompleted={isLessonCompleted}
            onLessonPress={onLessonPress}
          />
        );
      })}
    </>
  );
}

// ─── Unit Section ─────────────────────────────────────────────────────────────

function UnitSection({
  unit,
  courseId,
  unitLocked,
  isLessonCompleted,
  onLessonPress,
}: {
  unit: LessonUnit;
  courseId: string;
  unitLocked: boolean;
  isLessonCompleted: (courseId: string, lessonId: string) => boolean;
  onLessonPress: (lesson: Lesson) => void;
}) {
  const c = Colors.light;
  const unitCompleted = unit.lessons.filter((l) =>
    isLessonCompleted(courseId, l.id)
  ).length;

  return (
    <View
      style={[
        styles.unitSection,
        { backgroundColor: c.surfaceContainerLowest },
        unitLocked && styles.unitSectionLocked,
      ]}
    >
      <View style={styles.unitHeader}>
        <ThemedText style={[styles.unitIcon, unitLocked && styles.lockedOpacity]}>
          {unitLocked ? '🔒' : unit.icon}
        </ThemedText>
        <View style={styles.unitHeaderText}>
          <ThemedText
            type="title-md"
            style={[styles.unitTitle, unitLocked && styles.lockedOpacity]}
          >
            {unit.title}
          </ThemedText>
          <ThemedText type="label-md" style={styles.unitMeta}>
            {unitLocked
              ? 'Complete previous unit to unlock'
              : `${unitCompleted}/${unit.lessons.length} complete`}
          </ThemedText>
        </View>
      </View>

      {!unitLocked &&
        unit.lessons.map((lesson, index) => {
          const completed = isLessonCompleted(courseId, lesson.id);
          const prevLesson = index > 0 ? unit.lessons[index - 1] : null;
          const lessonLocked =
            prevLesson !== null && !isLessonCompleted(courseId, prevLesson.id);

          return (
            <TouchableOpacity
              key={lesson.id}
              style={[
                styles.lessonRow,
                lessonLocked && styles.lessonRowLocked,
              ]}
              onPress={() => !lessonLocked && onLessonPress(lesson)}
              activeOpacity={lessonLocked ? 1 : 0.7}
            >
              {/* Floating divider above (except first) */}
              {index > 0 && <View style={styles.floatingDivider} />}

              <View style={styles.lessonRowInner}>
                <View
                  style={[
                    styles.lessonStatusDot,
                    {
                      backgroundColor: completed
                        ? c.success
                        : lessonLocked
                        ? c.surfaceContainerHigh
                        : 'rgba(0, 75, 228, 0.08)',
                    },
                  ]}
                >
                  {completed ? (
                    <ThemedText style={styles.lessonCheckmark}>✓</ThemedText>
                  ) : lessonLocked ? (
                    <ThemedText style={styles.lessonLockIcon}>🔒</ThemedText>
                  ) : null}
                </View>

                <View style={styles.lessonInfo}>
                  <ThemedText
                    type="title-md"
                    style={[
                      styles.lessonTitle,
                      (completed || lessonLocked) && { opacity: 0.45 },
                    ]}
                    numberOfLines={1}
                  >
                    {lesson.title}
                  </ThemedText>
                  <ThemedText type="label-md" style={styles.lessonMeta}>
                    {lessonLocked
                      ? 'Complete previous lesson first'
                      : `${lesson.estimatedMinutes} min · ${lesson.difficulty}`}
                  </ThemedText>
                </View>

                <View style={styles.lessonRight}>
                  {!completed && !lessonLocked && (
                    <View style={[styles.rewardBadge, { backgroundColor: 'rgba(0, 75, 228, 0.08)' }]}>
                      <ThemedText type="label-md" style={[styles.rewardText, { color: c.primary }]}>
                        +${lesson.reward}
                      </ThemedText>
                    </View>
                  )}
                  {!lessonLocked && (
                    <ThemedText style={styles.chevron}>›</ThemedText>
                  )}
                </View>
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
  scrollContent: { padding: Spacing.lg, paddingTop: 60 },
  header: { marginBottom: Spacing.lg },
  title: { marginBottom: Spacing.md },

  // Learning dollars balance — gradient applied via LinearGradient
  balanceCard: {
    borderRadius: Radii.xl,
    padding: Spacing.lg,
    marginBottom: 4,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 4,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 40,
    fontFamily: Typography['display-md'].fontFamily,
    marginBottom: 4,
  },
  balanceHint: {
    color: 'rgba(255,255,255,0.6)',
  },

  // Info card — no border, tonal bg
  infoCard: {
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    ...SubtleShadow,
  },
  infoTitle: {
    marginBottom: Spacing.sm,
  },
  infoText: {
    color: Colors.light.onSurfaceVariant,
    lineHeight: 20,
  },

  // Course selector
  sectionLabel: {
    marginBottom: 12,
    marginTop: Spacing.sm,
  },
  courseScroll: { marginHorizontal: -Spacing.lg },
  courseRow: { paddingHorizontal: Spacing.lg, gap: 12, paddingBottom: 4 },
  courseCard: {
    width: 140,
    borderRadius: Radii.md,
    padding: 14,
    gap: 6,
    // No borderWidth
  },
  courseCardIcon: { fontSize: 28, marginBottom: 2 },
  courseCardTitle: { lineHeight: 18 },
  courseCardMeta: {},

  // Coming soon
  comingSoonCard: {
    marginTop: Spacing.md,
    borderRadius: Radii.md,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: 12,
    ...SubtleShadow,
  },
  comingSoonIcon: { fontSize: 56 },
  comingSoonTitle: { textAlign: 'center' },
  comingSoonDescription: {
    color: Colors.light.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
  },
  comingSoonBadge: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.full,
  },
  comingSoonBadgeText: {},

  // Course progress strip — no border
  courseProgress: {
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: 12,
    gap: Spacing.sm,
    ...SubtleShadow,
  },
  courseProgressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseProgressTitle: {},
  courseProgressCount: { color: Colors.light.onSurfaceVariant },
  courseProgressBarBg: {
    height: 6,
    backgroundColor: Colors.light.surfaceContainerHighest,
    borderRadius: Radii.full,
    overflow: 'hidden',
  },
  courseProgressBarFill: { height: '100%', borderRadius: Radii.full },
  courseAttribution: { color: Colors.light.onSurfaceVariant, opacity: 0.6 },

  // Units — no border
  unitSection: {
    borderRadius: Radii.md,
    marginBottom: 12,
    overflow: 'hidden',
    ...SubtleShadow,
  },
  unitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: 12,
  },
  unitIcon: { fontSize: 28 },
  unitHeaderText: { flex: 1 },
  unitTitle: { marginBottom: 2 },
  unitMeta: { color: Colors.light.onSurfaceVariant },
  unitSectionLocked: { opacity: 0.55 },
  lockedOpacity: { opacity: 0.45 },

  // Lesson rows — floating dividers instead of borderBottom
  lessonRow: {
    paddingHorizontal: Spacing.md,
  },
  lessonRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },
  floatingDivider: {
    height: 1,
    backgroundColor: Colors.light.surfaceContainerHigh,
    marginHorizontal: '10%',
  },
  lessonStatusDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    // No borderWidth
  },
  lessonCheckmark: { color: '#FFFFFF', fontSize: 14, fontFamily: Typography['label-lg'].fontFamily },
  lessonLockIcon: { fontSize: 10 },
  lessonRowLocked: { opacity: 0.5 },
  lessonInfo: { flex: 1 },
  lessonTitle: { marginBottom: 2 },
  lessonMeta: { color: Colors.light.onSurfaceVariant },
  lessonRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  rewardBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radii.full },
  rewardText: {},
  chevron: { fontSize: 20, color: Colors.light.onSurfaceVariant },
  bottomPadding: { height: 40 },
});
