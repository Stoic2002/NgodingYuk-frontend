// ============ User ============
export interface User {
    id: string;
    username: string;
    email: string;
    xp: number;
    level: number;
    streak_count: number;
    locale: string;
    last_active_date?: string;
    created_at?: string;
}

// ============ Challenges ============
export interface ChallengeListItem {
    id: string;
    slug: string;
    language: string;
    difficulty: "easy" | "medium" | "hard";
    title: string;
    xp_reward: number;
    order_index: number;
    is_completed?: boolean;
}

export interface ChallengeDetail {
    id: string;
    slug: string;
    language: string;
    difficulty: "easy" | "medium" | "hard";
    title: string;
    story: string;
    task: string;
    hint?: string;
    schema_info?: SchemaInfo;
    expected_output: unknown;
    starter_code?: string;
    test_cases: TestCase[];
    xp_reward: number;
}

export interface SchemaInfo {
    tables: {
        name: string;
        columns: { name: string; type: string }[];
        rows: Record<string, unknown>[];
    }[];
}

export interface TestCase {
    input: string;
    expected: string;
}

export interface RunResult {
    passed: boolean;
    input?: string;
    expected?: string;
    actual: string;
    error?: string;
}

export interface ExecuteResponse {
    results: RunResult[];
    all_passed: boolean;
    error?: string;
}

export interface SubmitResponse extends ExecuteResponse {
    xp_gained: number;
}

export interface ChallengeProgress {
    status: "not_started" | "attempted" | "solved";
    attempts: number;
    solved_at?: string;
}

// ============ Courses ============
export interface CourseListItem {
    id: string;
    slug: string;
    language: string;
    level: string;
    title: string;
    description?: string;
    thumbnail_url?: string;
    order_index: number;
}

export interface CourseDetail {
    id: string;
    slug: string;
    language: string;
    level: string;
    title: string;
    description?: string;
    thumbnail_url?: string;
    is_enrolled: boolean;
    has_certificate: boolean;
    lessons: LessonListItem[];
}

export interface LessonListItem {
    id: string;
    title: string;
    order_index: number;
    xp_reward: number;
    is_locked: boolean;
    completed: boolean;
}

export interface LessonDetail {
    id: string;
    course_id: string;
    title: string;
    content_markdown: string;
    order_index: number;
    xp_reward: number;
    quizzes: Quiz[];
}

export interface Quiz {
    id: string;
    question: string;
    options: string[];
    order_index: number;
}

export interface QuizSubmitResponse {
    score: number;
    total: number;
    xp_gained: number;
    details: {
        quiz_id: string;
        correct: boolean;
        correct_index: number;
        explanation?: string;
    }[];
}

export interface CourseProgress {
    completed_lessons: number;
    total_lessons: number;
    lessons: {
        lesson_id: string;
        quiz_completed: boolean;
        quiz_score: number;
        completed_at?: string;
    }[];
}

// ============ Leaderboard ============
export interface LeaderboardEntry {
    rank: number;
    user_id: string;
    username: string;
    xp: number;
    level: number;
}

// ============ XP History ============
export interface XPHistoryItem {
    id: string;
    xp_gained: number;
    source_type: "challenge" | "lesson_quiz";
    source_id?: string;
    created_at: string;
}

// ============ Challenge Stats ============
export interface ChallengeStats {
    easy: { solved: number; attempted: number };
    medium: { solved: number; attempted: number };
    hard: { solved: number; attempted: number };
}

// ============ Exam ============
export interface ExamData {
    course_title: string;
    quizzes: { id: string; question: string; options: string[]; order_index: number }[];
    total_questions: number;
    time_limit_sec: number;
}

export interface ExamSubmitResponse {
    score: number;
    total: number;
    passed: boolean;
    xp_gained: number;
    certificate_id?: string;
    details: {
        quiz_id: string;
        correct: boolean;
        correct_index: number;
        explanation?: string;
    }[];
}

// ============ Certificates ============
export interface CertificateItem {
    id: string;
    course_id: string;
    course_title: string;
    course_slug: string;
    score: number;
    total_questions: number;
    passed_at: string;
}
