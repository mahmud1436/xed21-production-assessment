import { 
  type User, type InsertUser,
  type AdminUser, type InsertAdminUser,
  type WalletTransaction, type InsertWalletTransaction,
  type Board, type InsertBoard,
  type Subject, type InsertSubject,
  type Topic, type InsertTopic,
  type AiRule, type InsertAiRule,
  type BloomSampleItem, type InsertBloomSampleItem,
  type QuestionSet, type InsertQuestionSet,
  type TrainingFile, type InsertTrainingFile,
  type TopicContent, type InsertTopicContent 
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserCoins(id: string, coins: number): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  updateUserStatus(id: string, isActive: boolean): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  verifyUserEmail(token: string): Promise<User | undefined>;
  updateUserEmailVerificationToken(id: string, token: string | null): Promise<User | undefined>;
  setPasswordResetToken(email: string, token: string): Promise<User | undefined>;
  getUserByPasswordResetToken(token: string): Promise<User | undefined>;
  resetUserPassword(id: string, newPassword: string): Promise<User | undefined>;

  // Admin management
  getAdmin(id: string): Promise<AdminUser | undefined>;
  getAdminByEmail(email: string): Promise<AdminUser | undefined>;
  createAdmin(admin: InsertAdminUser): Promise<AdminUser>;

  // Board management
  getAllBoards(): Promise<Board[]>;
  getBoardByName(name: string): Promise<Board | undefined>;
  createBoard(board: InsertBoard): Promise<Board>;
  updateBoard(id: string, updates: Partial<Board>): Promise<Board | undefined>;
  deleteBoard(id: string): Promise<boolean>;

  // Wallet transactions
  createWalletTransaction(transaction: InsertWalletTransaction): Promise<WalletTransaction>;
  getUserTransactions(userId: string): Promise<WalletTransaction[]>;
  getTotalUserCount(): Promise<number>;
  markUserIntroOfferUsed(userId: string): Promise<User | undefined>;

  // Subject and topic management
  getSubjects(board: string, grade: number): Promise<Subject[]>;
  getAllSubjects(): Promise<Subject[]>;
  getSubjectsByBoard(boardId: string): Promise<Subject[]>;
  getSubjectByDetails(board: string, name: string, grade: number): Promise<Subject | undefined>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  updateSubject(id: string, updates: Partial<Subject>): Promise<Subject | undefined>;
  deleteSubject(id: string): Promise<boolean>;

  getTopicsBySubject(subjectId: string): Promise<Topic[]>;
  getAllTopics(): Promise<Topic[]>;
  getTopicById(id: string): Promise<Topic | undefined>;
  createTopic(topic: InsertTopic): Promise<Topic>;
  updateTopic(id: string, updates: Partial<Topic>): Promise<Topic | undefined>;
  deleteTopic(id: string): Promise<boolean>;

  // Topic Content management
  getAllTopicContent(): Promise<TopicContent[]>;
  getTopicContentByTopicId(topicId: string): Promise<TopicContent[]>;
  getTopicContent(id: string): Promise<TopicContent | undefined>;
  createTopicContent(content: InsertTopicContent): Promise<TopicContent>;
  updateTopicContent(id: string, data: Partial<InsertTopicContent>): Promise<TopicContent>;
  deleteTopicContent(id: string): Promise<boolean>;
  toggleTopicContentStatus(id: string, isActive: boolean): Promise<TopicContent>;

  // AI Rules management
  getAiRules(): Promise<AiRule[]>;
  getAllAiRules(): Promise<AiRule[]>;
  getAiRulesByCategory(category: string, subcategory?: string): Promise<AiRule[]>;
  createAiRule(rule: InsertAiRule): Promise<AiRule>;
  updateAiRule(id: string, updates: Partial<AiRule>): Promise<AiRule | undefined>;
  updateAiRuleStatus(id: string, isActive: boolean): Promise<AiRule | undefined>;
  deleteAiRule(id: string): Promise<boolean>;

  // Bloom Sample Items management
  getBloomSampleItems(filters?: { bloomLevel?: string }): Promise<BloomSampleItem[]>;
  getBloomSampleItem(id: string): Promise<BloomSampleItem | undefined>;
  createBloomSampleItem(item: InsertBloomSampleItem): Promise<BloomSampleItem>;
  updateBloomSampleItem(id: string, updates: Partial<InsertBloomSampleItem>): Promise<BloomSampleItem>;
  deleteBloomSampleItem(id: string): Promise<void>;
  toggleBloomSampleItemStatus(id: string, isActive: boolean): Promise<BloomSampleItem>;

  // Question sets (existing)
  createQuestionSet(questionSet: InsertQuestionSet): Promise<QuestionSet>;
  getQuestionSet(id: string): Promise<QuestionSet | undefined>;
  getQuestionSets(limit?: number): Promise<QuestionSet[]>;
  getUserQuestionSets(userId: string): Promise<QuestionSet[]>;

  // Training files (existing)
  createTrainingFile(file: InsertTrainingFile): Promise<TrainingFile>;
  getTrainingFiles(): Promise<TrainingFile[]>;
  deleteTrainingFile(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private adminUsers: Map<string, AdminUser>;
  private walletTransactions: Map<string, WalletTransaction>;
  private boards: Map<string, Board>;
  private subjects: Map<string, Subject>;
  private topics: Map<string, Topic>;
  private aiRules: Map<string, AiRule>;
  private bloomSampleItems: Map<string, BloomSampleItem>;
  private questionSets: Map<string, QuestionSet>;
  private trainingFiles: Map<string, TrainingFile>;
  private topicContent: Map<string, TopicContent>;

  constructor() {
    this.users = new Map();
    this.adminUsers = new Map();
    this.walletTransactions = new Map();
    this.boards = new Map();
    this.subjects = new Map();
    this.topics = new Map();
    this.aiRules = new Map();
    this.bloomSampleItems = new Map();
    this.questionSets = new Map();
    this.trainingFiles = new Map();
    this.topicContent = new Map();

    // Initialize default admin user
    this.initializeAdmin();
    // Initialize default AI rules
    this.initializeAiRules();
    // Initialize Indian educational boards and subjects
    this.initializeIndianEducationData();
  }

  private async initializeAdmin() {
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash('Abutaleb@35', 10);
    const adminId = randomUUID();
    const admin: AdminUser = {
      id: adminId,
      email: 'hassan.jobs07@gmail.com',
      password: hashedPassword,
      createdAt: new Date()
    };
    this.adminUsers.set(adminId, admin);
  }

  private initializeAiRules() {
    const defaultRules = [
      { 
        category: 'global', 
        subcategory: null, 
        rules: 'MANDATORY GLOBAL RULES: 1. Clarity & Brevity: Keep stems under 25 words; avoid double-negatives, jargon, or convoluted phrasing. 2. Alignment & Scope: Each item must align to a specific standard or learning objective; specify the standard code in metadata. 3. Grade-Appropriateness: Language, context, and stimulus complexity should match the intended grade band\'s reading level. 4. Unambiguous Wording: Avoid pronouns without clear antecedents; limit "all of the following except" structures. 5. Distractor Quality: All incorrect answer choices must be plausible misconceptions or common errors, equal in length and complexity to the correct answer. 6. Answer Choice Arrangement: For all question types, arrange answer options by character length (shortest to longest). Single-word or numerical options: sort alphabetically or numerically ascending. Phrase options (multiple words): use sentence case with lowercase initial letters; complete sentences must end with a period. 7. Scenario & Visual Requirement: Except for Recall (DOK 1) and Easy-level items, all questions must include a brief scenario/context and embed a relevant visual element (image, chart, table, or data snippet) in the stem.' 
      },
      { 
        category: 'question_type', 
        subcategory: 'multiple_choice', 
        rules: 'MULTIPLE CHOICE STANDARDS: Create exactly 4 options (A-D) with only one correct answer. Question stem must be a complete sentence ending with a question mark. All distractors must be plausible misconceptions representing common student errors. Arrange options by character length (shortest to longest). For numerical answers, sort in ascending order. Avoid "all of the above" or "none of the above" options. Ensure grammatical consistency between stem and all options.' 
      },
      { 
        category: 'question_type', 
        subcategory: 'multiple_select', 
        rules: 'MULTIPLE SELECT STANDARDS: Create exactly 6 options (A-F) with 2-4 correct answers (never just 1 or all 6). Clearly indicate in instructions that students must "Select all that apply." Each option should be grammatically parallel and of similar length. Correct answers should represent different aspects of the concept being tested. Incorrect options must be plausible but clearly wrong to knowledgeable students.' 
      },
      { 
        category: 'question_type', 
        subcategory: 'fill_blanks', 
        rules: 'FILL-IN-THE-BLANK STANDARDS: Create 1-3 meaningful blanks that test key concepts, not trivial details. Each blank should have only one clearly correct answer. Provide sufficient context so the answer is unambiguous. Arrange multiple blanks logically within the sentence structure. Avoid blanks at the beginning of sentences. All blanks should be the same length (10-15 characters) regardless of answer length.' 
      },
      { 
        category: 'question_type', 
        subcategory: 'true_false', 
        rules: 'TRUE/FALSE STANDARDS: Create clear, factual statements that are definitively true or false with no ambiguity. Avoid absolute terms like "always," "never," "all," unless factually accurate. Focus on significant concepts, not trivial details. Statement should be a single, complete sentence. Provide clear explanations for why the statement is true or false, addressing common misconceptions.' 
      },
      { 
        category: 'question_type', 
        subcategory: 'matching', 
        rules: 'MATCHING STANDARDS: Create 4-5 clear pairs with unambiguous one-to-one relationships. All items in both columns should be grammatically parallel. Include one extra option in the second column to eliminate guessing. Arrange items in the first column logically (chronologically, alphabetically, or by complexity). Ensure all matches are clearly correct and defensible.' 
      },
      { 
        category: 'question_type', 
        subcategory: 'inline_choice', 
        rules: 'INLINE CHOICE STANDARDS: Embed 2-3 meaningful dropdown choices within sentences that test conceptual understanding. Each dropdown should have only one clearly correct answer. Options should be grammatically consistent with the sentence structure. Avoid making the sentence awkward or unnatural. Focus on key terminology or conceptual relationships.' 
      },
      { 
        category: 'bloom_level', 
        subcategory: 'remembering', 
        rules: 'REMEMBERING (DOK 1): Focus on direct recall of facts, terms, definitions, and basic concepts. Use action verbs: define, identify, list, name, state, recall, recognize. Questions should test memorized information without requiring analysis or application. Acceptable to use simple, direct questions without complex scenarios for this level only.' 
      },
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

    defaultRules.forEach(rule => {
      const id = randomUUID();
      const aiRule: AiRule = {
        id,
        category: rule.category,
        subcategory: rule.subcategory,
        rules: rule.rules,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.aiRules.set(id, aiRule);
    });
  }

  private initializeIndianEducationData() {
    // Initialize Indian Education Boards
    const boards = [
      { name: 'NCERT', fullName: 'National Council of Educational Research and Training', description: 'National curriculum framework' },
      { name: 'CBSE', fullName: 'Central Board of Secondary Education', description: 'Central board for secondary education in India' },
      { name: 'ICSE', fullName: 'Indian Certificate of Secondary Education', description: 'Council for the Indian School Certificate Examinations' },
      { name: 'State Boards', fullName: 'Various State Education Boards', description: 'State-specific education boards across India' },
    ];

    boards.forEach(board => {
      const id = randomUUID();
      const boardData: Board = {
        id,
        name: board.name,
        fullName: board.fullName,
        description: board.description,
        isActive: true,
        createdAt: new Date()
      };
      this.boards.set(id, boardData);
    });

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

    subjectsData.forEach(subjectData => {
      subjectData.grades.forEach(grade => {
        const id = randomUUID();
        const subject: Subject = {
          id,
          name: subjectData.name,
          board: subjectData.board,
          boardId: null, // Will be set later when we link to boards
          grade,
          description: `${subjectData.name} for Grade ${grade} - ${subjectData.board}`,
          isActive: true,
          createdAt: new Date()
        };
        this.subjects.set(id, subject);

        // Add some sample topics for each subject
        this.initializeTopicsForSubject(id, subjectData.name, grade);
      });
    });
  }

  private initializeTopicsForSubject(subjectId: string, subjectName: string, grade: number) {
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

    const topics = topicsMap[subjectName] || ['Introduction', 'Basic Concepts', 'Advanced Topics'];

    topics.forEach(topicName => {
      const topicId = randomUUID();
      const topic: Topic = {
        id: topicId,
        name: topicName,
        subjectId,
        pdfFilename: null,
        createdAt: new Date()
      };
      this.topics.set(topicId, topic);
    });
  }

  // Board management methods
  async getAllBoards(): Promise<Board[]> {
    return Array.from(this.boards.values());
  }

  async createBoard(insertBoard: InsertBoard): Promise<Board> {
    const id = randomUUID();
    const board: Board = {
      ...insertBoard,
      id,
      isActive: insertBoard.isActive ?? true,
      description: insertBoard.description ?? null,
      createdAt: new Date()
    };
    this.boards.set(id, board);
    return board;
  }

  async updateBoard(id: string, updates: Partial<Board>): Promise<Board | undefined> {
    const board = this.boards.get(id);
    if (!board) return undefined;

    const updatedBoard = { ...board, ...updates };
    this.boards.set(id, updatedBoard);
    return updatedBoard;
  }

  async deleteBoard(id: string): Promise<boolean> {
    return this.boards.delete(id);
  }

  async getBoardByName(name: string): Promise<Board | undefined> {
    return Array.from(this.boards.values()).find(board => board.name === name);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async updateUserCoins(id: string, coins: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, coins };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<User | undefined> {
    return this.updateUser(id, { isActive });
  }

  async deleteUser(id: string): Promise<boolean> {
    const exists = this.users.has(id);
    if (exists) {
      this.users.delete(id);
      // Also clean up any related data like wallet transactions
      for (const [txId, transaction] of Array.from(this.walletTransactions.entries())) {
        if (transaction.userId === id) {
          this.walletTransactions.delete(txId);
        }
      }
      // Clean up question sets
      for (const [qsId, questionSet] of Array.from(this.questionSets.entries())) {
        if (questionSet.userId === id) {
          this.questionSets.delete(qsId);
        }
      }
    }
    return exists;
  }

  // Admin management
  async getAdmin(id: string): Promise<AdminUser | undefined> {
    return this.adminUsers.get(id);
  }

  async getAdminByEmail(email: string): Promise<AdminUser | undefined> {
    return Array.from(this.adminUsers.values()).find(
      (admin) => admin.email === email,
    );
  }

  async createAdmin(insertAdmin: InsertAdminUser): Promise<AdminUser> {
    const id = randomUUID();
    const admin: AdminUser = {
      ...insertAdmin,
      id,
      createdAt: new Date()
    };
    this.adminUsers.set(id, admin);
    return admin;
  }

  // Wallet transactions
  async createWalletTransaction(insertTransaction: InsertWalletTransaction): Promise<WalletTransaction> {
    const id = randomUUID();
    const transaction: WalletTransaction = {
      ...insertTransaction,
      id,
      razorpayPaymentId: insertTransaction.razorpayPaymentId ?? null,
      razorpayOrderId: insertTransaction.razorpayOrderId ?? null,
      createdAt: new Date()
    };
    this.walletTransactions.set(id, transaction);
    return transaction;
  }

  async getUserTransactions(userId: string): Promise<WalletTransaction[]> {
    return Array.from(this.walletTransactions.values())
      .filter(t => t.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getTotalUserCount(): Promise<number> {
    return this.users.size;
  }

  async markUserIntroOfferUsed(userId: string): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;

    const updatedUser = { ...user, hasUsedIntroOffer: true };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Subject and topic management
  async getSubjects(board: string, grade: number): Promise<Subject[]> {
    return Array.from(this.subjects.values())
      .filter(s => s.board === board && s.grade === grade);
  }

  async getAllSubjects(): Promise<Subject[]> {
    return Array.from(this.subjects.values());
  }

  async getSubjectsByBoard(boardId: string): Promise<Subject[]> {
    return Array.from(this.subjects.values()).filter(subject => subject.boardId === boardId);
  }

  async getSubjectByDetails(board: string, name: string, grade: number): Promise<Subject | undefined> {
    return Array.from(this.subjects.values())
      .find(s => s.board === board && s.name === name && s.grade === grade);
  }

  async createSubject(insertSubject: InsertSubject): Promise<Subject> {
    const id = randomUUID();
    const subject: Subject = {
      ...insertSubject,
      id,
      isActive: insertSubject.isActive ?? true,
      boardId: insertSubject.boardId ?? null,
      description: insertSubject.description ?? null,
      createdAt: new Date()
    };
    this.subjects.set(id, subject);
    return subject;
  }

  async updateSubject(id: string, updates: Partial<Subject>): Promise<Subject | undefined> {
    const subject = this.subjects.get(id);
    if (!subject) return undefined;

    const updatedSubject = { ...subject, ...updates };
    this.subjects.set(id, updatedSubject);
    return updatedSubject;
  }

  async deleteSubject(id: string): Promise<boolean> {
    return this.subjects.delete(id);
  }

  async getTopicsBySubject(subjectId: string): Promise<Topic[]> {
    return Array.from(this.topics.values())
      .filter(t => t.subjectId === subjectId);
  }

  async getAllTopics(): Promise<Topic[]> {
    return Array.from(this.topics.values());
  }

  async getTopicById(id: string): Promise<Topic | undefined> {
    return this.topics.get(id);
  }

  async createTopic(insertTopic: InsertTopic): Promise<Topic> {
    const id = randomUUID();
    const topic: Topic = {
      ...insertTopic,
      id,
      pdfFilename: insertTopic.pdfFilename ?? null,
      createdAt: new Date()
    };
    this.topics.set(id, topic);
    return topic;
  }

  async updateTopic(id: string, updates: Partial<Topic>): Promise<Topic | undefined> {
    const topic = this.topics.get(id);
    if (!topic) return undefined;

    const updatedTopic = { ...topic, ...updates };
    this.topics.set(id, updatedTopic);
    return updatedTopic;
  }

  async deleteTopic(id: string): Promise<boolean> {
    return this.topics.delete(id);
  }

  // AI Rules management
  async getAiRules(): Promise<AiRule[]> {
    return Array.from(this.aiRules.values());
  }

  async getAllAiRules(): Promise<AiRule[]> {
    return Array.from(this.aiRules.values());
  }

  async getAiRulesByCategory(category: string, subcategory?: string): Promise<AiRule[]> {
    return Array.from(this.aiRules.values())
      .filter(rule => 
        rule.category === category && 
        (!subcategory || rule.subcategory === subcategory) &&
        rule.isActive
      );
  }

  async createAiRule(insertRule: InsertAiRule): Promise<AiRule> {
    const id = randomUUID();
    const rule: AiRule = {
      ...insertRule,
      id,
      subcategory: insertRule.subcategory ?? null,
      isActive: insertRule.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.aiRules.set(id, rule);
    return rule;
  }

  async updateAiRule(id: string, updates: Partial<AiRule>): Promise<AiRule | undefined> {
    const rule = this.aiRules.get(id);
    if (!rule) return undefined;

    const updatedRule = { 
      ...rule, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.aiRules.set(id, updatedRule);
    return updatedRule;
  }

  async updateAiRuleStatus(id: string, isActive: boolean): Promise<AiRule | undefined> {
    return this.updateAiRule(id, { isActive });
  }

  async deleteAiRule(id: string): Promise<boolean> {
    return this.aiRules.delete(id);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      coins: 500, // Free 500 coins on signup
      isActive: true,
      hasUsedIntroOffer: false,
      isEmailVerified: insertUser.isEmailVerified ?? false,
      emailVerificationToken: insertUser.emailVerificationToken ?? null,
      googleId: insertUser.googleId ?? null,
      profilePicture: insertUser.profilePicture ?? null,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.googleId === googleId) {
        return user;
      }
    }
    return undefined;
  }

  async verifyUserEmail(token: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.emailVerificationToken === token) {
        user.isEmailVerified = true;
        user.emailVerificationToken = null;
        return user;
      }
    }
    return undefined;
  }

  async updateUserEmailVerificationToken(id: string, token: string | null): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      user.emailVerificationToken = token;
      return user;
    }
    return undefined;
  }

  async setPasswordResetToken(email: string, token: string): Promise<User | undefined> {
    const user = Array.from(this.users.values()).find(u => u.email === email);
    if (user) {
      user.passwordResetToken = token;
      user.passwordResetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      return user;
    }
    return undefined;
  }

  async getUserByPasswordResetToken(token: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => 
      user.passwordResetToken === token && 
      user.passwordResetExpires && 
      user.passwordResetExpires > new Date()
    );
  }

  async resetUserPassword(id: string, newPassword: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      user.password = newPassword;
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      return user;
    }
    return undefined;
  }

  async createQuestionSet(insertQuestionSet: InsertQuestionSet): Promise<QuestionSet> {
    const id = randomUUID();
    const questionSet: QuestionSet = { 
      ...insertQuestionSet, 
      id,
      createdAt: new Date()
    };
    this.questionSets.set(id, questionSet);
    return questionSet;
  }

  async getQuestionSet(id: string): Promise<QuestionSet | undefined> {
    return this.questionSets.get(id);
  }

  async getQuestionSets(limit?: number): Promise<QuestionSet[]> {
    const sets = Array.from(this.questionSets.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
    return limit ? sets.slice(0, limit) : sets;
  }

  async getUserQuestionSets(userId: string): Promise<QuestionSet[]> {
    return Array.from(this.questionSets.values())
      .filter(q => (q as any).userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createTrainingFile(insertFile: InsertTrainingFile): Promise<TrainingFile> {
    const id = randomUUID();
    const file: TrainingFile = { 
      ...insertFile, 
      id,
      grade: insertFile.grade ?? null,
      subject: insertFile.subject ?? null,
      topic: insertFile.topic ?? null,
      uploadedAt: new Date()
    };
    this.trainingFiles.set(id, file);
    return file;
  }

  async getTrainingFiles(): Promise<TrainingFile[]> {
    return Array.from(this.trainingFiles.values())
      .sort((a, b) => (b.uploadedAt?.getTime() || 0) - (a.uploadedAt?.getTime() || 0));
  }

  async deleteTrainingFile(id: string): Promise<boolean> {
    return this.trainingFiles.delete(id);
  }

  // Topic Content methods
  async getAllTopicContent(): Promise<TopicContent[]> {
    return Array.from(this.topicContent.values());
  }

  async getTopicContentByTopicId(topicId: string): Promise<TopicContent[]> {
    return Array.from(this.topicContent.values()).filter(content => content.topicId === topicId);
  }

  async getTopicContent(id: string): Promise<TopicContent | undefined> {
    return this.topicContent.get(id);
  }

  async createTopicContent(content: InsertTopicContent): Promise<TopicContent> {
    const id = randomUUID();
    const newContent: TopicContent = {
      id,
      ...content,
      isActive: content.isActive ?? true,
      fileSize: content.fileSize ?? null,
      contentType: content.contentType ?? 'text/plain',
      fileName: content.fileName ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.topicContent.set(id, newContent);
    return newContent;
  }

  async updateTopicContent(id: string, data: Partial<InsertTopicContent>): Promise<TopicContent> {
    const existing = this.topicContent.get(id);
    if (!existing) {
      throw new Error(`Topic content with id ${id} not found`);
    }

    const updated: TopicContent = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };
    this.topicContent.set(id, updated);
    return updated;
  }

  async deleteTopicContent(id: string): Promise<boolean> {
    return this.topicContent.delete(id);
  }

  async toggleTopicContentStatus(id: string, isActive: boolean): Promise<TopicContent> {
    const existing = this.topicContent.get(id);
    if (!existing) {
      throw new Error(`Topic content with id ${id} not found`);
    }

    const updated: TopicContent = {
      ...existing,
      isActive,
      updatedAt: new Date(),
    };
    this.topicContent.set(id, updated);
    return updated;
  }

  // Bloom Sample Items management
  async getBloomSampleItems(filters?: { bloomLevel?: string }): Promise<BloomSampleItem[]> {
    const items = Array.from(this.bloomSampleItems.values());
    
    if (!filters) return items;
    
    return items.filter(item => {
      if (filters.bloomLevel && item.bloomLevel !== filters.bloomLevel) return false;
      return true;
    });
  }

  async getBloomSampleItem(id: string): Promise<BloomSampleItem | undefined> {
    return this.bloomSampleItems.get(id);
  }

  async createBloomSampleItem(item: InsertBloomSampleItem): Promise<BloomSampleItem> {
    const id = randomUUID();
    const bloomSampleItem: BloomSampleItem = {
      ...item,
      id,
      grade: item.grade || 1, // Default to grade 1 if not specified
      subject: item.subject || 'General', // Default subject
      isActive: true, // Always enabled by default for AI reference
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.bloomSampleItems.set(id, bloomSampleItem);
    return bloomSampleItem;
  }

  async updateBloomSampleItem(id: string, updates: Partial<InsertBloomSampleItem>): Promise<BloomSampleItem> {
    const existing = this.bloomSampleItems.get(id);
    if (!existing) {
      throw new Error(`Bloom sample item with id ${id} not found`);
    }

    const updated: BloomSampleItem = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.bloomSampleItems.set(id, updated);
    return updated;
  }

  async deleteBloomSampleItem(id: string): Promise<void> {
    this.bloomSampleItems.delete(id);
  }

  async toggleBloomSampleItemStatus(id: string, isActive: boolean): Promise<BloomSampleItem> {
    const existing = this.bloomSampleItems.get(id);
    if (!existing) {
      throw new Error(`Bloom sample item with id ${id} not found`);
    }

    const updated: BloomSampleItem = {
      ...existing,
      isActive,
      updatedAt: new Date(),
    };
    this.bloomSampleItems.set(id, updated);
    return updated;
  }
}

import { DatabaseStorage } from "./storage/database";

// Use database storage in production
export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();