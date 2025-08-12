import { eq, desc, and, sql } from "drizzle-orm";
import { db } from "../db";
import {
  users, adminUsers, walletTransactions, boards, subjects, topics, aiRules, questionSets, trainingFiles,
  type User, type InsertUser,
  type AdminUser, type InsertAdminUser,
  type WalletTransaction, type InsertWalletTransaction,
  type Board, type InsertBoard,
  type Subject, type InsertSubject,
  type Topic, type InsertTopic,
  type AiRule, type InsertAiRule,
  type QuestionSet, type InsertQuestionSet,
  type TrainingFile, type InsertTrainingFile
 } from "@shared/schema";
import { topicContent, type TopicContent, type InsertTopicContent } from "@shared/schema";
import { bloomSampleItems, type BloomSampleItem, type InsertBloomSampleItem } from "@shared/schema";
import type { IStorage } from "../storage";
import bcrypt from "bcryptjs";

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeDefaults();
  }

  private async initializeDefaults() {
    try {
      // Check if admin user exists
      const existingAdmin = await db.select().from(adminUsers).where(eq(adminUsers.email, "hassan.jobs07@gmail.com")).limit(1);

      if (existingAdmin.length === 0) {
        // Create admin user
        const hashedPassword = await bcrypt.hash("Abutaleb@35", 10);
        await db.insert(adminUsers).values({
          email: "hassan.jobs07@gmail.com",
          password: hashedPassword,
        });
      }

      // Initialize default AI rules if none exist
      const existingRules = await db.select().from(aiRules).limit(1);
      if (existingRules.length === 0) {
        await this.initializeAiRules();
      }

      // Initialize Indian educational data if none exist
      const existingBoards = await db.select().from(boards).limit(1);
      if (existingBoards.length === 0) {
        await this.initializeIndianEducationData();
      }
    } catch (error) {
      console.error("Error initializing defaults:", error);
    }
  }

  private async initializeAiRules() {
    const defaultRules = [
      { category: 'global', subcategory: null, rules: 'Generate questions that are educationally appropriate, clear, and unambiguous. Ensure all options are plausible but only correct answers are truly accurate.' },
      { category: 'question_type', subcategory: 'multiple_choice', rules: 'Create 4 options (A-D) with only one correct answer. Ensure distractors are plausible but clearly incorrect.' },
      { category: 'question_type', subcategory: 'multiple_select', rules: 'Create 6 options (A-F) with 2-4 correct answers. Ensure good mix of correct and incorrect options.' },
      { category: 'question_type', subcategory: 'fill_blanks', rules: 'Create meaningful blanks that test key concepts. Provide exact answers expected.' },
      { category: 'question_type', subcategory: 'true_false', rules: 'Create clear, factual statements that are definitively true or false. Avoid ambiguous statements.' },
      { category: 'question_type', subcategory: 'matching', rules: 'Create 4-5 clear pairs with unambiguous relationships between items.' },
      { category: 'question_type', subcategory: 'inline_choice', rules: 'Embed 2-3 meaningful choices within sentences that test understanding.' },
      { category: 'bloom_level', subcategory: 'remembering', rules: 'Focus on recall of facts, terms, and basic concepts. Use verbs like define, list, identify.' },
      { 
        category: 'bloom_level', 
        subcategory: 'understanding', 
        rules: 'UNDERSTANDING (DOK 2): Test ability to explain ideas, concepts, or principles in own words. Use action verbs: explain, describe, interpret, summarize, paraphrase, classify, compare, exemplify. Questions must include brief scenarios or examples. Students should demonstrate comprehension beyond mere recall by explaining relationships or providing examples.' 
      },
      { 
        category: 'bloom_level', 
        subcategory: 'applying', 
        rules: 'APPLYING (DOK 2-3): Test ability to use learned information in new, concrete situations. Use action verbs: apply, demonstrate, solve, use, implement, execute, carry out. Must include realistic scenarios or problems where students apply procedures, methods, or principles. Context should be different from instructional examples but use same underlying concepts.' 
      },
      { 
        category: 'bloom_level', 
        subcategory: 'analyzing', 
        rules: 'ANALYZING (DOK 3-4): Test ability to break down information into component parts and examine relationships. Use action verbs: analyze, compare, contrast, examine, categorize, differentiate, distinguish, organize. Must provide complex scenarios, data sets, or multi-part stimuli for analysis. Students should identify patterns, relationships, or underlying structures.' 
      },
      { 
        category: 'bloom_level', 
        subcategory: 'evaluating', 
        rules: 'EVALUATING (DOK 4): Test ability to make informed judgments based on criteria and standards. Use action verbs: evaluate, critique, judge, justify, assess, appraise, defend, support. Must present scenarios requiring students to weigh evidence, assess validity, or make reasoned judgments. Include criteria or standards for evaluation within the question context.' 
      },
      { 
        category: 'bloom_level', 
        subcategory: 'creating', 
        rules: 'CREATING (DOK 4): Test ability to synthesize elements into coherent new patterns or structures. Use action verbs: create, design, construct, develop, formulate, plan, produce, generate. Present open-ended scenarios requiring original thinking or novel solutions. Students should combine elements in new ways or propose alternative solutions to problems.' 
      },
      // Removed difficulty level rules - difficulty feature removed
    ];

    await db.insert(aiRules).values(
      defaultRules.map(rule => ({
        category: rule.category,
        subcategory: rule.subcategory,
        rules: rule.rules,
        isActive: true,
      }))
    );
  }

  private async initializeIndianEducationData() {
    // Initialize Indian Education Boards
    const boardsData = [
      { name: 'NCERT', fullName: 'National Council of Educational Research and Training', description: 'National curriculum framework' },
      { name: 'CBSE', fullName: 'Central Board of Secondary Education', description: 'Central board for secondary education in India' },
      { name: 'ICSE', fullName: 'Indian Certificate of Secondary Education', description: 'Council for the Indian School Certificate Examinations' },
      { name: 'State Boards', fullName: 'Various State Education Boards', description: 'State-specific education boards across India' },
    ];

    const insertedBoards = await db.insert(boards).values(
      boardsData.map(board => ({
        name: board.name,
        fullName: board.fullName,
        description: board.description,
        isActive: true,
      }))
    ).returning();

    // Initialize Subjects for different grades
    const subjectsData = [
      // Primary Education (1-5)
      { name: 'Hindi', board: 'NCERT', grades: [1, 2, 3, 4, 5] },
      { name: 'English', board: 'NCERT', grades: [1, 2, 3, 4, 5] },
      { name: 'Mathematics', board: 'NCERT', grades: [1, 2, 3, 4, 5] },
      { name: 'Environmental Studies', board: 'NCERT', grades: [3, 4, 5] },

      // Middle School (6-8)
      { name: 'Science', board: 'NCERT', grades: [6, 7, 8, 9, 10] },
      { name: 'Social Science', board: 'NCERT', grades: [6, 7, 8, 9, 10] },
      { name: 'Sanskrit', board: 'NCERT', grades: [6, 7, 8, 9, 10] },

      // Secondary Education (9-10)
      { name: 'Physics', board: 'CBSE', grades: [11, 12] },
      { name: 'Chemistry', board: 'CBSE', grades: [11, 12] },
      { name: 'Biology', board: 'CBSE', grades: [11, 12] },
      { name: 'Economics', board: 'CBSE', grades: [9, 10, 11, 12] },
      { name: 'History', board: 'CBSE', grades: [9, 10, 11, 12] },
      { name: 'Geography', board: 'CBSE', grades: [9, 10, 11, 12] },
      { name: 'Political Science', board: 'CBSE', grades: [11, 12] },
      { name: 'Computer Science', board: 'CBSE', grades: [9, 10, 11, 12] },
      { name: 'Business Studies', board: 'CBSE', grades: [11, 12] },
      { name: 'Accountancy', board: 'CBSE', grades: [11, 12] },
    ];

    const allSubjects: any[] = [];
    subjectsData.forEach(subjectData => {
      const boardData = insertedBoards.find(b => b.name === subjectData.board);
      subjectData.grades.forEach(grade => {
        allSubjects.push({
          name: subjectData.name,
          board: subjectData.board,
          boardId: boardData?.id || null,
          grade,
          description: `${subjectData.name} for Grade ${grade} - ${subjectData.board}`,
          isActive: true,
        });
      });
    });

    const insertedSubjects = await db.insert(subjects).values(allSubjects).returning();

    // Initialize topics for each subject
    const topicsMap: Record<string, string[]> = {
      'Mathematics': ['Algebra', 'Geometry', 'Trigonometry', 'Statistics', 'Probability'],
      'Physics': ['Mechanics', 'Thermodynamics', 'Optics', 'Electromagnetism', 'Modern Physics'],
      'Chemistry': ['Atomic Structure', 'Chemical Bonding', 'Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry'],
      'Biology': ['Cell Biology', 'Genetics', 'Evolution', 'Ecology', 'Human Physiology'],
      'English': ['Grammar', 'Literature', 'Writing Skills', 'Reading Comprehension', 'Poetry'],
      'Hindi': ['व्याकरण', 'साहित्य', 'लेखन कौशल', 'गद्य', 'काव्य'],
      'Science': ['Plants and Animals', 'Matter and Materials', 'Natural Phenomena', 'Environment'],
      'Social Science': ['History', 'Geography', 'Civics', 'Economics'],
      'Computer Science': ['Programming', 'Data Structures', 'Algorithms', 'Database', 'Networking']
    };

    const allTopics: any[] = [];
    insertedSubjects.forEach(subject => {
      const topicNames = topicsMap[subject.name] || ['Introduction', 'Basic Concepts', 'Advanced Topics'];
      topicNames.forEach(topicName => {
        allTopics.push({
          name: topicName,
          subjectId: subject.id,
          pdfFilename: null,
        });
      });
    });

    await db.insert(topics).values(allTopics);
  }

  // User management
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserCoins(id: string, coins: number): Promise<User | undefined> {
    const [user] = await db.update(users).set({ coins }).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<User | undefined> {
    return this.updateUser(id, { isActive });
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user || undefined;
  }

  async verifyUserEmail(token: string): Promise<User | undefined> {
    console.log(`[verifyUserEmail] Attempting to verify token: ${token}`);
    
    // First, check if a user exists with this token
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.emailVerificationToken, token))
      .limit(1);
    
    console.log(`[verifyUserEmail] Found ${existingUser.length} users with token`);
    
    if (existingUser.length === 0) {
      console.log(`[verifyUserEmail] No user found with token: ${token}`);
      return undefined;
    }
    
    console.log(`[verifyUserEmail] Found user: ${existingUser[0].email}, verified: ${existingUser[0].isEmailVerified}`);
    
    const [user] = await db
      .update(users)
      .set({ 
        isEmailVerified: true,
        emailVerificationToken: null
      })
      .where(eq(users.emailVerificationToken, token))
      .returning();
      
    console.log(`[verifyUserEmail] Verification result: ${user ? 'Success' : 'Failed'}`);
    return user || undefined;
  }

  async updateUserEmailVerificationToken(id: string, token: string | null): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ emailVerificationToken: token })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async setPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ 
        passwordResetToken: token,
        passwordResetExpires: expiresAt 
      })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async getUserByPasswordResetToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users)
      .where(and(
        eq(users.passwordResetToken, token),
        gt(users.passwordResetExpires, new Date())
      ));
    return user || undefined;
  }

  async clearPasswordResetToken(userId: string): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ 
        passwordResetToken: null,
        passwordResetExpires: null 
      })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async resetUserPassword(userId: string, newPasswordHash: string): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ 
        password: newPasswordHash,
        passwordResetToken: null,
        passwordResetExpires: null 
      })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      // Delete user's related data first (wallet transactions, question sets)
      await db.delete(walletTransactions).where(eq(walletTransactions.userId, id));
      await db.delete(questionSets).where(eq(questionSets.userId, id));
      
      // Delete the user
      const result = await db.delete(users).where(eq(users.id, id));
      return (result as any).rowCount > 0;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }

  // Admin management
  async getAdmin(id: string): Promise<AdminUser | undefined> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return admin || undefined;
  }

  async getAdminByEmail(email: string): Promise<AdminUser | undefined> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
    return admin || undefined;
  }

  async createAdmin(insertAdmin: InsertAdminUser): Promise<AdminUser> {
    const [admin] = await db.insert(adminUsers).values(insertAdmin).returning();
    return admin;
  }

  // Board management
  async getAllBoards(): Promise<Board[]> {
    return await db.select().from(boards).where(eq(boards.isActive, true)).orderBy(boards.name);
  }

  async createBoard(insertBoard: InsertBoard): Promise<Board> {
    const [board] = await db.insert(boards).values(insertBoard).returning();
    return board;
  }

  async updateBoard(id: string, updates: Partial<Board>): Promise<Board | undefined> {
    const [board] = await db.update(boards).set(updates).where(eq(boards.id, id)).returning();
    return board || undefined;
  }

  async getBoardByName(name: string): Promise<Board | undefined> {
    const [board] = await db.select().from(boards).where(eq(boards.name, name));
    return board || undefined;
  }

  async deleteBoard(id: string): Promise<boolean> {
    const result = await db.delete(boards).where(eq(boards.id, id));
    return (result as any).rowCount > 0;
  }

  // Wallet transactions
  async createWalletTransaction(insertTransaction: InsertWalletTransaction): Promise<WalletTransaction> {
    const [transaction] = await db.insert(walletTransactions).values(insertTransaction).returning();
    return transaction;
  }

  async getUserTransactions(userId: string): Promise<WalletTransaction[]> {
    return await db.select().from(walletTransactions)
      .where(eq(walletTransactions.userId, userId))
      .orderBy(desc(walletTransactions.createdAt));
  }

  async getTotalUserCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(users);
    return result[0]?.count || 0;
  }

  async markUserIntroOfferUsed(userId: string): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ hasUsedIntroOffer: true })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  // Subject and topic management
  async getSubjects(board: string, grade: number): Promise<Subject[]> {
    return await db.select().from(subjects)
      .where(and(eq(subjects.board, board), eq(subjects.grade, grade)));
  }

  async getAllSubjects(): Promise<Subject[]> {
    return await db.select().from(subjects).orderBy(subjects.board, subjects.grade, subjects.name);
  }

  async getSubjectsByBoard(boardId: string): Promise<Subject[]> {
    return await db.select().from(subjects).where(eq(subjects.boardId, boardId)).orderBy(subjects.grade, subjects.name);
  }

  async createSubject(insertSubject: InsertSubject): Promise<Subject> {
    const [subject] = await db.insert(subjects).values(insertSubject).returning();
    return subject;
  }

  async updateSubject(id: string, updates: Partial<Subject>): Promise<Subject | undefined> {
    const [subject] = await db.update(subjects).set(updates).where(eq(subjects.id, id)).returning();
    return subject || undefined;
  }

  async getSubjectByDetails(board: string, name: string, grade: number): Promise<Subject | undefined> {
    const [subject] = await db.select().from(subjects).where(
      and(eq(subjects.board, board), eq(subjects.name, name), eq(subjects.grade, grade))
    );
    return subject || undefined;
  }

  async deleteSubject(id: string): Promise<boolean> {
    const result = await db.delete(subjects).where(eq(subjects.id, id));
    return (result as any).rowCount > 0;
  }

  async getTopicsBySubject(subjectId: string): Promise<Topic[]> {
    return await db.select().from(topics).where(eq(topics.subjectId, subjectId));
  }

  async getAllTopics(): Promise<Topic[]> {
    return await db.select().from(topics);
  }

  async getTopicById(id: string): Promise<Topic | undefined> {
    const [topic] = await db.select().from(topics).where(eq(topics.id, id));
    return topic || undefined;
  }

  async createTopic(insertTopic: InsertTopic): Promise<Topic> {
    console.log("Creating topic with data:", insertTopic);
    const [topic] = await db.insert(topics).values(insertTopic).returning();
    console.log("Database returned topic:", topic);
    return topic;
  }

  async updateTopic(id: string, updates: Partial<Topic>): Promise<Topic | undefined> {
    const [topic] = await db.update(topics).set(updates).where(eq(topics.id, id)).returning();
    return topic || undefined;
  }

  async deleteTopic(id: string): Promise<boolean> {
    const result = await db.delete(topics).where(eq(topics.id, id));
    return (result as any).rowCount > 0;
  }

  // AI Rules management
  async getAiRules(): Promise<AiRule[]> {
    return await db.select().from(aiRules).where(eq(aiRules.isActive, true));
  }

  async getAllAiRules(): Promise<AiRule[]> {
    return await db.select().from(aiRules).orderBy(aiRules.category, aiRules.subcategory);
  }

  async getAiRulesByCategory(category: string, subcategory?: string): Promise<AiRule[]> {
    if (subcategory) {
      return await db.select().from(aiRules)
        .where(and(eq(aiRules.category, category), eq(aiRules.subcategory, subcategory), eq(aiRules.isActive, true)));
    }

    return await db.select().from(aiRules)
      .where(and(eq(aiRules.category, category), eq(aiRules.isActive, true)));
  }

  async createAiRule(insertRule: InsertAiRule): Promise<AiRule> {
    const [rule] = await db.insert(aiRules).values(insertRule).returning();
    return rule;
  }

  async updateAiRule(id: string, updates: Partial<AiRule>): Promise<AiRule | undefined> {
    const [rule] = await db.update(aiRules).set({ ...updates, updatedAt: new Date() }).where(eq(aiRules.id, id)).returning();
    return rule || undefined;
  }

  async updateAiRuleStatus(id: string, isActive: boolean): Promise<AiRule | undefined> {
    return this.updateAiRule(id, { isActive });
  }

  async deleteAiRule(id: string): Promise<boolean> {
    const result = await db.delete(aiRules).where(eq(aiRules.id, id));
    return (result as any).rowCount > 0;
  }

  // ===== TOPIC CONTENT METHODS =====
  async getAllTopicContent(): Promise<TopicContent[]> {
    return await db.select().from(topicContent);
  }

  async getTopicContentByTopicId(topicId: string): Promise<TopicContent[]> {
    return await db
      .select()
      .from(topicContent)
      .where(eq(topicContent.topicId, topicId));
  }

  async getTopicContent(id: string): Promise<TopicContent | undefined> {
    const [content] = await db.select().from(topicContent).where(eq(topicContent.id, id));
    return content;
  }

  async createTopicContent(insertTopicContent: InsertTopicContent): Promise<TopicContent> {
    const [content] = await db.insert(topicContent).values(insertTopicContent).returning();
    return content;
  }

  async updateTopicContent(id: string, data: Partial<InsertTopicContent>): Promise<TopicContent> {
    const [content] = await db
      .update(topicContent)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(topicContent.id, id))
      .returning();
    return content;
  }

  async deleteTopicContent(id: string): Promise<boolean> {
    const result = await db.delete(topicContent).where(eq(topicContent.id, id));
    return (result as any).rowCount > 0;
  }

  async toggleTopicContentStatus(id: string, isActive: boolean): Promise<TopicContent> {
    const [content] = await db
      .update(topicContent)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(topicContent.id, id))
      .returning();
    return content;
  }

  // Question sets (existing)
  async createQuestionSet(insertQuestionSet: InsertQuestionSet): Promise<QuestionSet> {
    const [questionSet] = await db.insert(questionSets).values(insertQuestionSet).returning();
    return questionSet;
  }

  async getQuestionSet(id: string): Promise<QuestionSet | undefined> {
    const [questionSet] = await db.select().from(questionSets).where(eq(questionSets.id, id));
    return questionSet || undefined;
  }

  async getQuestionSets(limit?: number): Promise<QuestionSet[]> {
    if (limit) {
      return await db.select().from(questionSets).orderBy(desc(questionSets.createdAt)).limit(limit);
    }
    return await db.select().from(questionSets).orderBy(desc(questionSets.createdAt));
  }

  async getUserQuestionSets(userId: string): Promise<QuestionSet[]> {
    return await db.select().from(questionSets)
      .where(eq(questionSets.userId, userId))
      .orderBy(desc(questionSets.createdAt));
  }

  // Training files (existing)
  async createTrainingFile(insertFile: InsertTrainingFile): Promise<TrainingFile> {
    const [file] = await db.insert(trainingFiles).values(insertFile).returning();
    return file;
  }

  async getTrainingFiles(): Promise<TrainingFile[]> {
    return await db.select().from(trainingFiles).orderBy(desc(trainingFiles.uploadedAt));
  }

  async deleteTrainingFile(id: string): Promise<boolean> {
    const result = await db.delete(trainingFiles).where(eq(trainingFiles.id, id));
    return (result as any).rowCount > 0;
  }

  // Bloom Sample Items management
  async getBloomSampleItems(filters?: { bloomLevel?: string }): Promise<BloomSampleItem[]> {
    let query = db.select().from(bloomSampleItems);
    
    if (filters?.bloomLevel) {
      query = query.where(eq(bloomSampleItems.bloomLevel, filters.bloomLevel));
    }
    
    return await query.orderBy(desc(bloomSampleItems.createdAt));
  }

  async getBloomSampleItem(id: string): Promise<BloomSampleItem | undefined> {
    const [item] = await db.select().from(bloomSampleItems).where(eq(bloomSampleItems.id, id));
    return item || undefined;
  }

  async createBloomSampleItem(item: InsertBloomSampleItem): Promise<BloomSampleItem> {
    const [created] = await db.insert(bloomSampleItems).values({
      ...item,
      isActive: true, // Always enabled by default for AI reference
    }).returning();
    return created;
  }

  async updateBloomSampleItem(id: string, updates: Partial<InsertBloomSampleItem>): Promise<BloomSampleItem> {
    const [updated] = await db.update(bloomSampleItems)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(bloomSampleItems.id, id))
      .returning();
    
    if (!updated) {
      throw new Error(`Bloom sample item with id ${id} not found`);
    }
    
    return updated;
  }

  async deleteBloomSampleItem(id: string): Promise<void> {
    await db.delete(bloomSampleItems).where(eq(bloomSampleItems.id, id));
  }

  async toggleBloomSampleItemStatus(id: string, isActive: boolean): Promise<BloomSampleItem> {
    const [updated] = await db.update(bloomSampleItems)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(bloomSampleItems.id, id))
      .returning();
    
    if (!updated) {
      throw new Error(`Bloom sample item with id ${id} not found`);
    }
    
    return updated;
  }
}