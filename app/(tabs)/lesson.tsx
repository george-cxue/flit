import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLessons } from '@/hooks/use-lessons';
import { lessonService } from '@/src/services/lessonService';
import { LessonCourse, LessonUnit, Lesson } from '@/src/types/lesson';

export default function LessonsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();

  const cardBg = useThemeColor({}, 'cardBackground' as any);
  const primaryColor = useThemeColor({}, 'primary' as any);
  const successColor = useThemeColor({}, 'success' as any);
  const borderColor = useThemeColor({}, 'border' as any);

  const { isLessonCompleted, getCourseCompletionCount } = useLessons();

  const courses = lessonService.getCourses();

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
          <ThemedText style={styles.subtitle}>
            Complete lessons to earn learning dollars and unlock assets.
          </ThemedText>
        </View>

        {/* Courses */}
        {courses.map((course) => (
          <CourseSection
            key={course.id}
            course={course}
            cardBg={cardBg}
            borderColor={borderColor}
            primaryColor={primaryColor}
            successColor={successColor}
            colors={colors}
            isLessonCompleted={isLessonCompleted}
            completedCount={getCourseCompletionCount(course.id)}
            totalCount={lessonService.getTotalLessonsCount(course.id)}
            onLessonPress={handleLessonPress}
          />
        ))}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </ThemedView>
  );
}

// ─── Course Section ───────────────────────────────────────────────────────────

function CourseSection({
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
    <View style={styles.courseSection}>
      {/* Course Header Card */}
      <View style={[styles.courseHeader, { backgroundColor: primaryColor }]}>
        <View style={styles.courseHeaderTop}>
          <View>
            <ThemedText style={styles.courseAttribution}>{course.attribution}</ThemedText>
            <ThemedText style={styles.courseTitle}>{course.title}</ThemedText>
          </View>
          <ThemedText style={styles.courseLicense}>{course.license}</ThemedText>
        </View>
        <ThemedText style={styles.courseDescription}>{course.description}</ThemedText>
        <View style={styles.courseProgressRow}>
          <View style={styles.courseProgressBar}>
            <View
              style={[
                styles.courseProgressFill,
                { width: `${progressPct}%` },
              ]}
            />
          </View>
          <ThemedText style={styles.courseProgressLabel}>
            {completedCount}/{totalCount} lessons
          </ThemedText>
        </View>
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
    </View>
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
      {/* Unit header */}
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

      {/* Lessons */}
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
            {/* Status indicator */}
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
                style={[styles.lessonTitle, completed && { opacity: 0.5 }]}
                numberOfLines={1}
              >
                {lesson.title}
              </ThemedText>
              <ThemedText style={styles.lessonMeta}>
                {lesson.estimatedMinutes} min · {lesson.difficulty}
              </ThemedText>
            </View>

            <View style={styles.lessonRight}>
              <View style={[styles.rewardBadge, { backgroundColor: colors.primaryPale }]}>
                <ThemedText style={[styles.rewardText, { color: primaryColor }]}>
                  +${lesson.reward}
                </ThemedText>
              </View>
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
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.6,
    lineHeight: 22,
  },
  courseSection: {
    marginBottom: 28,
  },
  courseHeader: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  courseHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  courseAttribution: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  courseTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  courseLicense: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    paddingTop: 2,
  },
  courseDescription: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  courseProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  courseProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  courseProgressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  courseProgressLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
  },
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
  unitIcon: {
    fontSize: 28,
  },
  unitHeaderText: {
    flex: 1,
  },
  unitTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  unitMeta: {
    fontSize: 13,
    opacity: 0.5,
  },
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
  lessonCheckmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 15,
    marginBottom: 2,
  },
  lessonMeta: {
    fontSize: 12,
    opacity: 0.5,
  },
  lessonRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rewardBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '700',
  },
  chevron: {
    fontSize: 20,
    opacity: 0.4,
  },
  bottomPadding: {
    height: 40,
  },
});
