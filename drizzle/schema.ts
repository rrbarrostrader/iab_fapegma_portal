import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  date,
  unique,
} from "drizzle-orm/mysql-core";

/**
 * Tabela de usuários - Alunos e Administradores
 * Estende a autenticação com campos acadêmicos
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  passwordHash: text("passwordHash"), // Para login com email/senha
  role: mysqlEnum("role", ["user", "admin"]).$default(() => "user").notNull(),
  status: mysqlEnum("status", ["active", "inactive", "suspended"]).$default(() => "active").notNull(),
  passwordChangedAt: timestamp("passwordChangedAt"),
  firstLoginCompleted: boolean("firstLoginCompleted").$default(() => false).notNull(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela de cursos (Graduação, Pós-graduação, Técnico)
 */
export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: text("description"),
  type: mysqlEnum("type", ["graduation", "postgraduate", "technical"]).$default(() => "graduation").notNull(),
  duration: int("duration"), // em meses
  status: mysqlEnum("status", ["active", "inactive"]).$default(() => "active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;

/**
 * Tabela de disciplinas/matérias
 */
export const subjects = mysqlTable("subjects", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  courseId: int("courseId").notNull(),
  description: text("description"),
  credits: int("credits"),
  workload: int("workload"), // em horas
  semester: int("semester"), // 1º, 2º, 3º semestre, etc
  status: mysqlEnum("status", ["active", "inactive"]).$default(() => "active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subject = typeof subjects.$inferSelect;
export type InsertSubject = typeof subjects.$inferInsert;

/**
 * Tabela de matrículas (Aluno + Curso)
 */
export const enrollments = mysqlTable(
  "enrollments",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    courseId: int("courseId").notNull(),
    enrollmentDate: date("enrollmentDate").notNull(),
    status: mysqlEnum("status", ["active", "completed", "dropped", "suspended"]).$default(() => "active").notNull(),
    currentSemester: int("currentSemester").$default(() => 1).notNull(),
    registrationNumber: varchar("registrationNumber", { length: 50 }).unique(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userCourseUnique: unique("user_course_unique").on(table.userId, table.courseId),
  })
);

export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = typeof enrollments.$inferInsert;

/**
 * Tabela de notas (Bimestrais, Semestrais)
 */
export const grades = mysqlTable(
  "grades",
  {
    id: int("id").autoincrement().primaryKey(),
    enrollmentId: int("enrollmentId").notNull(),
    subjectId: int("subjectId").notNull(),
    semester: int("semester").notNull(),
    firstBimester: decimal("firstBimester", { precision: 4, scale: 2 }),
    secondBimester: decimal("secondBimester", { precision: 4, scale: 2 }),
    thirdBimester: decimal("thirdBimester", { precision: 4, scale: 2 }),
    fourthBimester: decimal("fourthBimester", { precision: 4, scale: 2 }),
    semesterGrade: decimal("semesterGrade", { precision: 4, scale: 2 }),
    finalExam: decimal("finalExam", { precision: 4, scale: 2 }),
    finalGrade: decimal("finalGrade", { precision: 4, scale: 2 }),
    status: mysqlEnum("status", ["pending", "approved", "failed", "incomplete"]).$default(() => "pending").notNull(),
    recordedBy: int("recordedBy"), // ID do admin que registrou
    recordedAt: timestamp("recordedAt").defaultNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    enrollmentSubjectSemesterUnique: unique("enrollment_subject_semester_unique").on(
      table.enrollmentId,
      table.subjectId,
      table.semester
    ),
  })
);

export type Grade = typeof grades.$inferSelect;
export type InsertGrade = typeof grades.$inferInsert;

/**
 * Tabela de frequência (Presença/Ausência)
 */
export const attendance = mysqlTable(
  "attendance",
  {
    id: int("id").autoincrement().primaryKey(),
    enrollmentId: int("enrollmentId").notNull(),
    subjectId: int("subjectId").notNull(),
    semester: int("semester").notNull(),
    totalClasses: int("totalClasses").$default(() => 0).notNull(),
    attendedClasses: int("attendedClasses").$default(() => 0).notNull(),
    attendancePercentage: decimal("attendancePercentage", { precision: 5, scale: 2 }).$default(() => "0.00").notNull(),
    status: mysqlEnum("status", ["good", "warning", "critical"]).$default(() => "good").notNull(),
    recordedBy: int("recordedBy"),
    recordedAt: timestamp("recordedAt").defaultNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    enrollmentSubjectSemesterUnique: unique("attendance_enrollment_subject_semester_unique").on(
      table.enrollmentId,
      table.subjectId,
      table.semester
    ),
  })
);

export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = typeof attendance.$inferInsert;

/**
 * Tabela de avisos e comunicados
 */
export const announcements = mysqlTable("announcements", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  type: mysqlEnum("type", ["general", "academic", "financial", "administrative"]).$default(() => "general").notNull(),
  targetRole: mysqlEnum("targetRole", ["all", "students", "admins"]).$default(() => "all").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).$default(() => "medium").notNull(),
  published: boolean("published").$default(() => false).notNull(),
  publishedAt: timestamp("publishedAt"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = typeof announcements.$inferInsert;

/**
 * Tabela de histórico de login
 */
export const loginHistory = mysqlTable("loginHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  loginTime: timestamp("loginTime").defaultNow().notNull(),
  logoutTime: timestamp("logoutTime"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
});

export type LoginHistory = typeof loginHistory.$inferSelect;
export type InsertLoginHistory = typeof loginHistory.$inferInsert;

/**
 * Tabela de logs de auditoria para alterações críticas
 */
export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 50 }).notNull(),
  entityId: int("entityId"),
  performedBy: int("performedBy"),
  changes: text("changes"), // JSON string com antes/depois
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
