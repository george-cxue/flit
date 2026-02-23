export type ContentBlockType = 'paragraph' | 'heading' | 'example' | 'keypoint' | 'list';

export type ParagraphBlock = {
  type: 'paragraph';
  text: string;
};

export type HeadingBlock = {
  type: 'heading';
  text: string;
};

export type ExampleBlock = {
  type: 'example';
  title: string;
  body?: string;
  rows?: { label: string; value: string }[];
};

export type KeypointBlock = {
  type: 'keypoint';
  icon: string;
  text: string;
};

export type ListBlock = {
  type: 'list';
  items: string[];
};

export type ContentBlock =
  | ParagraphBlock
  | HeadingBlock
  | ExampleBlock
  | KeypointBlock
  | ListBlock;

export interface LessonQuestion {
  id: string;
  question: string;
  answers: string[];
  correctIndex: number;
  explanation: string;
}

export type LessonDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Lesson {
  id: string;
  courseId: string;
  unitId: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  difficulty: LessonDifficulty;
  reward: number; // Learning dollars earned on completion
  content: ContentBlock[];
  questions: LessonQuestion[];
}

export interface LessonUnit {
  id: string;
  courseId: string;
  title: string;
  description: string;
  icon: string;
  lessons: Lesson[];
}

export interface LessonCourse {
  id: string;
  title: string;
  description: string;
  attribution: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
  units: LessonUnit[];
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  score: number; // number of correct answers
  totalQuestions: number;
  completedAt?: string; // ISO date string
}

export interface CourseProgress {
  [lessonId: string]: LessonProgress;
}

export interface UserLessonState {
  [courseId: string]: CourseProgress;
}
