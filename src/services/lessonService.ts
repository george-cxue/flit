import { LessonCourse, LessonUnit, Lesson } from '@/src/types/lesson';
import { KHAN_ACADEMY_FINANCIAL_LITERACY } from '@/src/mocks/lessons/khan-academy-financial-literacy';
import {
  STOCK_MARKET_BASICS,
  CRYPTO_FUNDAMENTALS,
  REAL_ESTATE_101,
  RETIREMENT_PLANNING,
} from '@/src/mocks/lessons/dummy-courses';

// All available courses in display order. Real courses first, then coming-soon.
const ALL_COURSES: LessonCourse[] = [
  KHAN_ACADEMY_FINANCIAL_LITERACY,
  STOCK_MARKET_BASICS,
  CRYPTO_FUNDAMENTALS,
  REAL_ESTATE_101,
  RETIREMENT_PLANNING,
];

export const lessonService = {
  getCourses(): LessonCourse[] {
    return ALL_COURSES;
  },

  getCourseById(courseId: string): LessonCourse | undefined {
    return ALL_COURSES.find((c) => c.id === courseId);
  },

  getAllLessons(): Lesson[] {
    return ALL_COURSES.flatMap((course) =>
      course.units.flatMap((unit) => unit.lessons)
    );
  },

  getLessonById(lessonId: string): Lesson | undefined {
    return this.getAllLessons().find((l) => l.id === lessonId);
  },

  getUnitById(unitId: string): LessonUnit | undefined {
    for (const course of ALL_COURSES) {
      const unit = course.units.find((u) => u.id === unitId);
      if (unit) return unit;
    }
    return undefined;
  },

  getLessonsForUnit(unitId: string): Lesson[] {
    for (const course of ALL_COURSES) {
      const unit = course.units.find((u) => u.id === unitId);
      if (unit) return unit.lessons;
    }
    return [];
  },

  getTotalLessonsCount(courseId: string): number {
    const course = this.getCourseById(courseId);
    if (!course) return 0;
    return course.units.reduce((sum, unit) => sum + unit.lessons.length, 0);
  },

  /** Returns the lesson immediately before `lessonId` in the same unit, or undefined if it's first. */
  getPreviousLesson(unitId: string, lessonId: string): import('@/src/types/lesson').Lesson | undefined {
    const unit = this.getUnitById(unitId);
    if (!unit) return undefined;
    const idx = unit.lessons.findIndex((l) => l.id === lessonId);
    if (idx <= 0) return undefined;
    return unit.lessons[idx - 1];
  },

  /** Returns the unit immediately before `unitId` in the same course, or undefined if it's first. */
  getPreviousUnit(courseId: string, unitId: string): import('@/src/types/lesson').LessonUnit | undefined {
    const course = this.getCourseById(courseId);
    if (!course) return undefined;
    const idx = course.units.findIndex((u) => u.id === unitId);
    if (idx <= 0) return undefined;
    return course.units[idx - 1];
  },
};