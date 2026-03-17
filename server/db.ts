import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  courses,
  subjects,
  enrollments,
  grades,
  attendance,
  announcements,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Queries para Usuários
 */
export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllStudents() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users).where(eq(users.role, 'user'));
}

/**
 * Queries para Cursos
 */
export async function getCourseById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllCourses() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(courses);
}

/**
 * Queries para Disciplinas
 */
export async function getSubjectsByCourse(courseId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(subjects).where(eq(subjects.courseId, courseId));
}

/**
 * Queries para Matrículas
 */
export async function getEnrollmentsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(enrollments).where(eq(enrollments.userId, userId));
}

/**
 * Queries para Notas
 */
export async function getGradesByEnrollment(enrollmentId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(grades).where(eq(grades.enrollmentId, enrollmentId));
}

/**
 * Queries para Frequência
 */
export async function getAttendanceByEnrollment(enrollmentId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(attendance).where(eq(attendance.enrollmentId, enrollmentId));
}

/**
 * Queries para Avisos
 */
export async function getPublishedAnnouncements() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(announcements).where(eq(announcements.published, true));
}
