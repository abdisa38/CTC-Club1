export type CourseAccessMode = 'open' | 'paid' | 'locked';
export type StudentCourseOverride = 'none' | 'locked' | 'unlocked';
export type StudentCourseAccessReason =
  | 'privileged'
  | 'manually_locked'
  | 'course_locked'
  | 'manually_unlocked'
  | 'payment_required'
  | 'enrollment_required'
  | 'granted';

export type CourseLikeForAccess = {
  price?: unknown;
  accessMode?: unknown;
  students?: unknown;
  lockedStudentIds?: unknown;
  unlockedStudentIds?: unknown;
};

export type StudentCourseAccessState = {
  accessMode: CourseAccessMode;
  studentAccessOverride: StudentCourseOverride;
  blockedByInstructor: boolean;
  requiresPayment: boolean;
  hasAccess: boolean;
  isEnrolled: boolean;
  isPaidCourse: boolean;
  reason: StudentCourseAccessReason;
};

const toIdString = (value: unknown): string => {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value).trim();
  }

  if (!value || typeof value !== 'object') {
    return '';
  }

  const record = value as Record<string, unknown>;
  if (record._id !== undefined) {
    return toIdString(record._id);
  }

  if (record.id !== undefined) {
    return toIdString(record.id);
  }

  const toStringCandidate = (value as { toString?: () => string }).toString;
  if (typeof toStringCandidate === 'function') {
    const raw = toStringCandidate.call(value);
    if (raw && raw !== '[object Object]') {
      return String(raw).trim();
    }
  }

  return '';
};

export const normalizeCourseAccessMode = (value: unknown): CourseAccessMode => {
  if (value === 'paid' || value === 'locked') {
    return value;
  }

  return 'open';
};

export const idExistsInList = (items: unknown, targetId: string): boolean => {
  const normalizedTargetId = toIdString(targetId);
  if (!normalizedTargetId || !Array.isArray(items)) {
    return false;
  }

  return items.some((item) => toIdString(item) === normalizedTargetId);
};

export const getStudentCourseOverride = (
  course: Pick<CourseLikeForAccess, 'lockedStudentIds' | 'unlockedStudentIds'>,
  studentId: string
): StudentCourseOverride => {
  if (idExistsInList(course.lockedStudentIds, studentId)) {
    return 'locked';
  }

  if (idExistsInList(course.unlockedStudentIds, studentId)) {
    return 'unlocked';
  }

  return 'none';
};

export const evaluateStudentCourseAccess = (input: {
  course: CourseLikeForAccess;
  studentId: string;
  isPrivilegedUser?: boolean;
  hasSuccessfulPayment?: boolean;
}): StudentCourseAccessState => {
  const accessMode = normalizeCourseAccessMode(input.course.accessMode);
  const isEnrolled = idExistsInList(input.course.students, input.studentId);
  const numericPrice = Number(input.course.price || 0);
  const isPaidCourse = Number.isFinite(numericPrice) && numericPrice > 0;

  if (input.isPrivilegedUser) {
    return {
      accessMode,
      studentAccessOverride: 'none',
      blockedByInstructor: false,
      requiresPayment: false,
      hasAccess: true,
      isEnrolled,
      isPaidCourse,
      reason: 'privileged',
    };
  }

  const studentAccessOverride = getStudentCourseOverride(input.course, input.studentId);

  if (studentAccessOverride === 'locked') {
    return {
      accessMode,
      studentAccessOverride,
      blockedByInstructor: true,
      requiresPayment: false,
      hasAccess: false,
      isEnrolled,
      isPaidCourse,
      reason: 'manually_locked',
    };
  }

  if (studentAccessOverride === 'unlocked') {
    return {
      accessMode,
      studentAccessOverride,
      blockedByInstructor: false,
      requiresPayment: false,
      hasAccess: true,
      isEnrolled,
      isPaidCourse,
      reason: 'manually_unlocked',
    };
  }

  if (accessMode === 'locked') {
    return {
      accessMode,
      studentAccessOverride,
      blockedByInstructor: true,
      requiresPayment: false,
      hasAccess: false,
      isEnrolled,
      isPaidCourse,
      reason: 'course_locked',
    };
  }

  const requiresPayment = accessMode === 'paid' || isPaidCourse;

  if (requiresPayment) {
    const hasAccess = Boolean(input.hasSuccessfulPayment);

    return {
      accessMode,
      studentAccessOverride,
      blockedByInstructor: false,
      requiresPayment,
      hasAccess,
      isEnrolled,
      isPaidCourse,
      reason: hasAccess ? 'granted' : 'payment_required',
    };
  }

  if (isEnrolled) {
    return {
      accessMode,
      studentAccessOverride,
      blockedByInstructor: false,
      requiresPayment: false,
      hasAccess: true,
      isEnrolled,
      isPaidCourse,
      reason: 'granted',
    };
  }

  return {
    accessMode,
    studentAccessOverride,
    blockedByInstructor: false,
    requiresPayment: false,
    hasAccess: false,
    isEnrolled,
    isPaidCourse,
    reason: 'enrollment_required',
  };
};
