import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"), // Nullable for Google OAuth users
  phone: text("phone"), // Phone number field
  coins: integer("coins").notNull().default(500), // Free 500 coins on signup
  isActive: boolean("is_active").notNull().default(true),
  hasUsedIntroOffer: boolean("has_used_intro_offer").notNull().default(false),
  isEmailVerified: boolean("is_email_verified").notNull().default(false),
  emailVerificationToken: text("email_verification_token"),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  googleId: text("google_id").unique(), // For Google OAuth
  profilePicture: text("profile_picture"), // For Google OAuth profile picture
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const walletTransactions = pgTable("wallet_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // 'credit', 'debit', 'bonus'
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  razorpayPaymentId: text("razorpay_payment_id"),
  razorpayOrderId: text("razorpay_order_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Boards table (new)
export const boards = pgTable("boards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(), // NCERT, CBSE, ICSE, State boards
  fullName: text("full_name").notNull(), // Full descriptive name
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const subjects = pgTable("subjects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  board: text("board").notNull(), // Keep for backward compatibility
  boardId: varchar("board_id").references(() => boards.id),
  grade: integer("grade").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const topics = pgTable("topics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  subjectId: varchar("subject_id").references(() => subjects.id).notNull(),
  pdfFilename: text("pdf_filename"), // Optional PDF for AI training
  createdAt: timestamp("created_at").defaultNow(),
});

// Topic content for question generation
export const topicContent = pgTable("topic_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  topicId: varchar("topic_id").references(() => topics.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(), // Main text content
  contentType: text("content_type").notNull().default("text"), // text, pdf, docx, etc
  fileName: text("file_name"), // Original filename if uploaded
  fileSize: integer("file_size"), // File size in bytes
  uploadedBy: varchar("uploaded_by").references(() => adminUsers.id).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiRules = pgTable("ai_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: text("category").notNull(), // 'global', 'question_type', 'bloom_level'
  subcategory: text("subcategory"), // specific type like 'multiple_choice', 'remembering', etc.
  rules: text("rules").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// New table for Bloom's Taxonomy sample items
export const bloomSampleItems = pgTable("bloom_sample_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bloomLevel: text("bloom_level").notNull(), // 'remembering', 'understanding', 'applying', 'analyzing', 'evaluating', 'creating'
  sampleQuestion: text("sample_question").notNull(),
  grade: integer("grade").notNull().default(5), // Grade level (1-12)
  subject: text("subject").notNull().default("Science"), // Subject name
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const questionSets = pgTable("question_sets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  board: text("board").notNull(),
  grade: integer("grade").notNull(),
  subject: text("subject").notNull(),
  topic: text("topic").notNull(),
  itemType: text("item_type").notNull(),
  bloomLevel: text("bloom_level").notNull(),
  questionCount: integer("question_count").notNull(),
  questions: jsonb("questions").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const trainingFiles = pgTable("training_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  grade: text("grade"),
  subject: text("subject"),
  topic: text("topic"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  email: true,
  password: true,
  phone: true,
  googleId: true,
  profilePicture: true,
  isEmailVerified: true,
  emailVerificationToken: true,
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).pick({
  email: true,
  password: true,
});

export const insertWalletTransactionSchema = createInsertSchema(walletTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertBoardSchema = createInsertSchema(boards).omit({
  id: true,
  createdAt: true,
});

export const insertSubjectSchema = createInsertSchema(subjects).omit({
  id: true,
  createdAt: true,
});

export const insertTopicSchema = createInsertSchema(topics).omit({
  id: true,
  createdAt: true,
});

export const insertTopicContentSchema = createInsertSchema(topicContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiRuleSchema = createInsertSchema(aiRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuestionSetSchema = createInsertSchema(questionSets).omit({
  id: true,
  createdAt: true,
});

export const insertTrainingFileSchema = createInsertSchema(trainingFiles).omit({
  id: true,
  uploadedAt: true,
});

export const insertBloomSampleItemSchema = createInsertSchema(bloomSampleItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const questionGenerationSchema = z.object({
  board: z.string().min(1, "Board is required"),
  grade: z.number().int().min(1).max(12),
  subject: z.string().min(1, "Subject is required"),
  topic: z.string().min(1, "Topic is required"),
  itemType: z.enum(["multiple_choice", "multiple_select", "fill_blanks", "inline_choice", "matching", "true_false"]),
  bloomLevel: z.enum(["remembering", "understanding", "applying", "analyzing", "evaluating", "creating"]),
  questionCount: z.number().int().min(1).max(20),
  learningOutcome: z.string().optional(),
});

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").optional(),
});

// Email verification schema
export const emailVerificationSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

// Google OAuth schema
export const googleOAuthSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(1, "Name is required"),
  googleId: z.string().min(1, "Google ID is required"),
  profilePicture: z.string().optional(),
});

export const adminLoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// Wallet schemas
export const rechargeSchema = z.object({
  amount: z.number().int().min(100, "Minimum recharge is ₹100").refine(
    (val) => val % 100 === 0,
    "Amount must be in multiples of ₹100"
  ),
});

export type LoginRequest = z.infer<typeof loginSchema>;
export type SignupRequest = z.infer<typeof signupSchema>;
export type AdminLoginRequest = z.infer<typeof adminLoginSchema>;
export type RechargeRequest = z.infer<typeof rechargeSchema>;
export type EmailVerificationRequest = z.infer<typeof emailVerificationSchema>;
export type GoogleOAuthRequest = z.infer<typeof googleOAuthSchema>;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertWalletTransaction = z.infer<typeof insertWalletTransactionSchema>;
export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type InsertBoard = z.infer<typeof insertBoardSchema>;
export type Board = typeof boards.$inferSelect;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type Subject = typeof subjects.$inferSelect;
export type InsertTopic = z.infer<typeof insertTopicSchema>;
export type Topic = typeof topics.$inferSelect;
export type InsertTopicContent = z.infer<typeof insertTopicContentSchema>;
export type TopicContent = typeof topicContent.$inferSelect;
export type InsertAiRule = z.infer<typeof insertAiRuleSchema>;
export type AiRule = typeof aiRules.$inferSelect;
export type InsertQuestionSet = z.infer<typeof insertQuestionSetSchema>;
export type QuestionSet = typeof questionSets.$inferSelect;
export type InsertTrainingFile = z.infer<typeof insertTrainingFileSchema>;
export type TrainingFile = typeof trainingFiles.$inferSelect;
export type InsertBloomSampleItem = z.infer<typeof insertBloomSampleItemSchema>;
export type BloomSampleItem = typeof bloomSampleItems.$inferSelect;
export type QuestionGenerationRequest = z.infer<typeof questionGenerationSchema>;

export interface GeneratedQuestion {
  id: string;
  type: string;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  optionExplanations?: Record<string, string>;
  bloomLevel: string;
  confidence: number;
}
