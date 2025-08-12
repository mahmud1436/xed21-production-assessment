var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  adminLoginSchema: () => adminLoginSchema,
  adminUsers: () => adminUsers,
  aiRules: () => aiRules,
  bloomSampleItems: () => bloomSampleItems,
  boards: () => boards,
  emailVerificationSchema: () => emailVerificationSchema,
  googleOAuthSchema: () => googleOAuthSchema,
  insertAdminUserSchema: () => insertAdminUserSchema,
  insertAiRuleSchema: () => insertAiRuleSchema,
  insertBloomSampleItemSchema: () => insertBloomSampleItemSchema,
  insertBoardSchema: () => insertBoardSchema,
  insertQuestionSetSchema: () => insertQuestionSetSchema,
  insertSubjectSchema: () => insertSubjectSchema,
  insertTopicContentSchema: () => insertTopicContentSchema,
  insertTopicSchema: () => insertTopicSchema,
  insertTrainingFileSchema: () => insertTrainingFileSchema,
  insertUserSchema: () => insertUserSchema,
  insertWalletTransactionSchema: () => insertWalletTransactionSchema,
  loginSchema: () => loginSchema,
  questionGenerationSchema: () => questionGenerationSchema,
  questionSets: () => questionSets,
  rechargeSchema: () => rechargeSchema,
  signupSchema: () => signupSchema,
  subjects: () => subjects,
  topicContent: () => topicContent,
  topics: () => topics,
  trainingFiles: () => trainingFiles,
  users: () => users,
  walletTransactions: () => walletTransactions
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users, adminUsers, walletTransactions, boards, subjects, topics, topicContent, aiRules, bloomSampleItems, questionSets, trainingFiles, insertUserSchema, insertAdminUserSchema, insertWalletTransactionSchema, insertBoardSchema, insertSubjectSchema, insertTopicSchema, insertTopicContentSchema, insertAiRuleSchema, insertQuestionSetSchema, insertTrainingFileSchema, insertBloomSampleItemSchema, questionGenerationSchema, loginSchema, signupSchema, emailVerificationSchema, googleOAuthSchema, adminLoginSchema, rechargeSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    users = pgTable("users", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      email: text("email").notNull().unique(),
      password: text("password"),
      // Nullable for Google OAuth users
      phone: text("phone"),
      // Phone number field
      coins: integer("coins").notNull().default(500),
      // Free 500 coins on signup
      isActive: boolean("is_active").notNull().default(true),
      hasUsedIntroOffer: boolean("has_used_intro_offer").notNull().default(false),
      isEmailVerified: boolean("is_email_verified").notNull().default(false),
      emailVerificationToken: text("email_verification_token"),
      passwordResetToken: text("password_reset_token"),
      passwordResetExpires: timestamp("password_reset_expires"),
      googleId: text("google_id").unique(),
      // For Google OAuth
      profilePicture: text("profile_picture"),
      // For Google OAuth profile picture
      createdAt: timestamp("created_at").defaultNow()
    });
    adminUsers = pgTable("admin_users", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      email: text("email").notNull().unique(),
      password: text("password").notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    walletTransactions = pgTable("wallet_transactions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").references(() => users.id).notNull(),
      type: text("type").notNull(),
      // 'credit', 'debit', 'bonus'
      amount: integer("amount").notNull(),
      description: text("description").notNull(),
      razorpayPaymentId: text("razorpay_payment_id"),
      razorpayOrderId: text("razorpay_order_id"),
      createdAt: timestamp("created_at").defaultNow()
    });
    boards = pgTable("boards", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull().unique(),
      // NCERT, CBSE, ICSE, State boards
      fullName: text("full_name").notNull(),
      // Full descriptive name
      description: text("description"),
      isActive: boolean("is_active").default(true).notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    subjects = pgTable("subjects", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      board: text("board").notNull(),
      // Keep for backward compatibility
      boardId: varchar("board_id").references(() => boards.id),
      grade: integer("grade").notNull(),
      description: text("description"),
      isActive: boolean("is_active").default(true).notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    topics = pgTable("topics", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      subjectId: varchar("subject_id").references(() => subjects.id).notNull(),
      pdfFilename: text("pdf_filename"),
      // Optional PDF for AI training
      createdAt: timestamp("created_at").defaultNow()
    });
    topicContent = pgTable("topic_content", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      topicId: varchar("topic_id").references(() => topics.id, { onDelete: "cascade" }).notNull(),
      title: text("title").notNull(),
      content: text("content").notNull(),
      // Main text content
      contentType: text("content_type").notNull().default("text"),
      // text, pdf, docx, etc
      fileName: text("file_name"),
      // Original filename if uploaded
      fileSize: integer("file_size"),
      // File size in bytes
      uploadedBy: varchar("uploaded_by").references(() => adminUsers.id).notNull(),
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    aiRules = pgTable("ai_rules", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      category: text("category").notNull(),
      // 'global', 'question_type', 'bloom_level'
      subcategory: text("subcategory"),
      // specific type like 'multiple_choice', 'remembering', etc.
      rules: text("rules").notNull(),
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    bloomSampleItems = pgTable("bloom_sample_items", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      bloomLevel: text("bloom_level").notNull(),
      // 'remembering', 'understanding', 'applying', 'analyzing', 'evaluating', 'creating'
      sampleQuestion: text("sample_question").notNull(),
      grade: integer("grade").notNull().default(5),
      // Grade level (1-12)
      subject: text("subject").notNull().default("Science"),
      // Subject name
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    questionSets = pgTable("question_sets", {
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
      createdAt: timestamp("created_at").defaultNow()
    });
    trainingFiles = pgTable("training_files", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      filename: text("filename").notNull(),
      originalName: text("original_name").notNull(),
      fileType: text("file_type").notNull(),
      fileSize: integer("file_size").notNull(),
      grade: text("grade"),
      subject: text("subject"),
      topic: text("topic"),
      uploadedAt: timestamp("uploaded_at").defaultNow()
    });
    insertUserSchema = createInsertSchema(users).pick({
      name: true,
      email: true,
      password: true,
      phone: true,
      googleId: true,
      profilePicture: true,
      isEmailVerified: true,
      emailVerificationToken: true
    });
    insertAdminUserSchema = createInsertSchema(adminUsers).pick({
      email: true,
      password: true
    });
    insertWalletTransactionSchema = createInsertSchema(walletTransactions).omit({
      id: true,
      createdAt: true
    });
    insertBoardSchema = createInsertSchema(boards).omit({
      id: true,
      createdAt: true
    });
    insertSubjectSchema = createInsertSchema(subjects).omit({
      id: true,
      createdAt: true
    });
    insertTopicSchema = createInsertSchema(topics).omit({
      id: true,
      createdAt: true
    });
    insertTopicContentSchema = createInsertSchema(topicContent).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertAiRuleSchema = createInsertSchema(aiRules).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertQuestionSetSchema = createInsertSchema(questionSets).omit({
      id: true,
      createdAt: true
    });
    insertTrainingFileSchema = createInsertSchema(trainingFiles).omit({
      id: true,
      uploadedAt: true
    });
    insertBloomSampleItemSchema = createInsertSchema(bloomSampleItems).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    questionGenerationSchema = z.object({
      board: z.string().min(1, "Board is required"),
      grade: z.number().int().min(1).max(12),
      subject: z.string().min(1, "Subject is required"),
      topic: z.string().min(1, "Topic is required"),
      itemType: z.enum(["multiple_choice", "multiple_select", "fill_blanks", "inline_choice", "matching", "true_false"]),
      bloomLevel: z.enum(["remembering", "understanding", "applying", "analyzing", "evaluating", "creating"]),
      questionCount: z.number().int().min(1).max(20),
      learningOutcome: z.string().optional()
    });
    loginSchema = z.object({
      email: z.string().email("Invalid email format"),
      password: z.string().min(6, "Password must be at least 6 characters")
    });
    signupSchema = z.object({
      name: z.string().min(2, "Name must be at least 2 characters"),
      email: z.string().email("Invalid email format"),
      password: z.string().min(6, "Password must be at least 6 characters"),
      phone: z.string().min(10, "Phone number must be at least 10 digits").optional()
    });
    emailVerificationSchema = z.object({
      token: z.string().min(1, "Verification token is required")
    });
    googleOAuthSchema = z.object({
      email: z.string().email("Invalid email format"),
      name: z.string().min(1, "Name is required"),
      googleId: z.string().min(1, "Google ID is required"),
      profilePicture: z.string().optional()
    });
    adminLoginSchema = z.object({
      email: z.string().email("Invalid email format"),
      password: z.string().min(1, "Password is required")
    });
    rechargeSchema = z.object({
      amount: z.number().int().min(100, "Minimum recharge is \u20B9100").refine(
        (val) => val % 100 === 0,
        "Amount must be in multiples of \u20B9100"
      )
    });
  }
});

// server/services/curriculum.ts
var curriculum_exports = {};
__export(curriculum_exports, {
  curriculumData: () => curriculumData,
  getSubjectsForBoardAndGrade: () => getSubjectsForBoardAndGrade,
  getTopicsForSubjectAndGrade: () => getTopicsForSubjectAndGrade
});
function getSubjectsForBoardAndGrade(board, grade) {
  const gradeRange = getGradeRange(grade);
  const boardKey = getBoardKey(board);
  const subjects2 = curriculumData.subjects[boardKey]?.[gradeRange] || [];
  return subjects2;
}
function getTopicsForSubjectAndGrade(board, subject, grade) {
  const gradeRange = getGradeRange(grade);
  const boardKey = getBoardKey(board);
  const boardTopics = curriculumData.topics[boardKey];
  if (!boardTopics) {
    return [];
  }
  const subjectTopics = boardTopics[subject];
  if (!subjectTopics) {
    return [];
  }
  return subjectTopics[grade.toString()] || subjectTopics[gradeRange] || [];
}
function getBoardKey(board) {
  let boardKey = board.toLowerCase().replace(/[^a-z]/g, "");
  if (boardKey === "cbse" || boardKey === "ncert" || boardKey === "cbsencert") {
    return "cbse/ncert";
  } else if (boardKey === "icse" || boardKey === "cisce" || boardKey === "icsecisce") {
    return "icse/cisce";
  }
  return boardKey;
}
function getGradeRange(grade) {
  if (grade >= 1 && grade <= 5) return "1-5";
  if (grade >= 6 && grade <= 8) return "6-8";
  if (grade >= 9 && grade <= 10) return "9-10";
  if (grade >= 11 && grade <= 12) return "11-12";
  return "6-8";
}
var curriculumData;
var init_curriculum = __esm({
  "server/services/curriculum.ts"() {
    "use strict";
    curriculumData = {
      subjects: {
        "cbse/ncert": {
          "1-5": ["Mathematics", "English", "Environmental Studies", "Hindi", "Computer Science"],
          "6-8": ["Mathematics", "Science", "English", "Hindi", "Social Science", "Computer Science"],
          "9-10": ["Mathematics", "Science", "English", "Hindi", "Social Science", "Computer Science", "Sanskrit"],
          "11-12": ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Hindi", "Computer Science", "Economics", "Business Studies", "Accountancy", "Political Science", "History", "Geography", "Psychology"]
        },
        "icse/cisce": {
          "1-5": ["Mathematics", "English", "Environmental Studies (EVS)", "Hindi", "Art & Craft", "Physical Education"],
          "6-8": ["Mathematics", "Science", "English", "History & Civics", "Geography", "Computer Applications", "Hindi", "Art & Craft", "Physical Education"],
          "9-10": ["English Language", "Literature in English", "Mathematics", "Physics", "Chemistry", "Biology", "History & Civics", "Geography", "Computer Applications", "Hindi", "Economics", "Commercial Studies", "Home Science", "Art & Craft"],
          "11-12": ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Hindi", "Computer Science", "Economics", "Commerce", "History", "Geography", "Psychology", "Sociology", "Political Science", "Philosophy"]
        }
      },
      topics: {
        "cbse/ncert": {
          "Mathematics": {
            "1-5": ["Numbers and Counting", "Addition and Subtraction", "Multiplication and Division", "Shapes and Patterns", "Measurement", "Time and Money", "Mental Mathematics", "Fractions (Class 4-5)"],
            "6-8": ["Patterns in Mathematics", "Numbers", "Fractions and Decimals", "Simple Equations", "Lines and Angles", "Geometry", "Mensuration", "Data Handling", "Algebra", "Ratio and Proportion", "Symmetry"],
            "9-10": ["Number Systems", "Polynomials", "Linear Equations in Two Variables", "Coordinate Geometry", "Introduction to Euclid's Geometry", "Lines and Angles", "Triangles", "Quadrilaterals", "Circles", "Constructions", "Heron's Formula", "Surface Areas and Volumes", "Statistics", "Probability"],
            "11-12": ["Sets", "Relations and Functions", "Trigonometric Functions", "Complex Numbers and Quadratic Equations", "Linear Inequalities", "Permutations and Combinations", "Binomial Theorem", "Sequences and Series", "Straight Lines", "Conic Sections", "Introduction to Three Dimensional Geometry", "Limits and Derivatives", "Mathematical Reasoning", "Statistics", "Probability", "Matrices", "Determinants", "Continuity and Differentiability", "Applications of Derivatives", "Integrals", "Applications of Integrals", "Differential Equations", "Vector Algebra", "Three Dimensional Geometry", "Linear Programming"]
          },
          "Science": {
            "6": ["The Wonderful World of Science", "Diversity in the Living World", "Mindful Eating: A Path to a Healthy Body", "Exploring Magnets", "Measurement of Length and Motion", "Materials Around Us", "Temperature and its Measurement", "A Journey through States of Water", "Methods of Separation in Everyday Life", "Living Creatures: Exploring their Characteristics", "Nature's Treasures", "Beyond Earth"],
            "7": ["Nutrition in Plants", "Nutrition in Animals", "Heat", "Acids, Bases and Salts", "Physical and Chemical Changes", "Weather, Climate and Adaptations", "Winds, Storms and Cyclones", "Soil", "Respiration in Organisms", "Transportation in Animals and Plants", "Reproduction in Plants", "Motion and Time", "Electric Current and its Effects", "Light", "Water: A Precious Resource", "Forests: Our Lifeline", "Wastewater Story"],
            "8": ["Crop Production and Management", "Microorganisms: Friend and Foe", "Synthetic Fibres and Plastics", "Materials: Metals and Non-Metals", "Coal and Petroleum", "Combustion and Flame", "Conservation of Plants and Animals", "Cell \u2014 Structure and Functions", "Reproduction in Animals", "Reaching the Age of Adolescence", "Force and Pressure", "Friction", "Sound"],
            "9-10": ["Matter in Our Surroundings", "Is Matter Around Us Pure?", "Atoms and Molecules", "Structure of Atom", "The Fundamental Unit of Life", "Tissues", "Diversity in Living Organisms", "Motion", "Force and Laws of Motion", "Gravitation", "Work and Energy", "Sound", "Why Do We Fall Ill?", "Natural Resources Management", "Improvement in Food Resources", "Chemical Reactions and Equations", "Acids, Bases and Salts", "Metals and Non-metals", "Carbon and its Compounds", "Periodic Classification of Elements", "Life Processes", "Control and Coordination", "How do Organisms Reproduce?", "Heredity and Evolution", "Light \u2013 Reflection and Refraction", "Human Eye and Colourful World", "Electricity", "Magnetic Effects of Electric Current"],
            "11-12": ["Physical World", "Units and Measurement", "Motion in a Straight Line", "Motion in a Plane", "Laws of Motion", "Work, Energy and Power", "System of Particles", "Gravitation", "Mechanical Properties", "Thermal Properties", "Thermodynamics", "Kinetic Theory", "Oscillations", "Waves", "Electric Charges", "Electrostatic Potential", "Current Electricity", "Magnetic Effects", "Magnetism", "Electromagnetic Induction", "Alternating Current", "Electromagnetic Waves", "Ray Optics", "Wave Optics", "Dual Nature", "Atoms", "Nuclei", "Semiconductor Electronics"]
          },
          "Physics": {
            "9-10": ["Motion", "Force and Laws of Motion", "Gravitation", "Work and Energy", "Sound", "Light \u2013 Reflection and Refraction", "Human Eye and Colourful World", "Electricity", "Magnetic Effects of Electric Current", "Sources of Energy"],
            "11-12": ["Physical World", "Units and Measurement", "Motion in a Straight Line", "Motion in a Plane", "Laws of Motion", "Work, Energy and Power", "System of Particles", "Gravitation", "Mechanical Properties", "Thermal Properties", "Thermodynamics", "Kinetic Theory", "Oscillations", "Waves", "Electric Charges", "Electrostatic Potential", "Current Electricity", "Magnetic Effects", "Magnetism", "Electromagnetic Induction", "Alternating Current", "Electromagnetic Waves", "Ray Optics", "Wave Optics", "Dual Nature", "Atoms", "Nuclei", "Semiconductor Electronics"]
          },
          "Chemistry": {
            "9-10": ["Matter in Our Surroundings", "Is Matter Around Us Pure?", "Atoms and Molecules", "Structure of Atom", "Chemical Reactions and Equations", "Acids, Bases and Salts", "Metals and Non-metals", "Carbon and its Compounds", "Periodic Classification of Elements"],
            "11-12": ["Basic Concepts", "Structure of Atom", "Classification of Elements", "Chemical Bonding", "States of Matter", "Thermodynamics", "Equilibrium", "Redox Reactions", "Hydrogen", "s-Block Elements", "p-Block Elements", "Organic Chemistry", "Hydrocarbons", "Environmental Chemistry", "Solid State", "Solutions", "Electrochemistry", "Chemical Kinetics", "Surface Chemistry", "Isolation of Elements", "d and f Block Elements", "Coordination Compounds", "Haloalkanes", "Alcohols", "Aldehydes", "Carboxylic Acids", "Amines", "Biomolecules", "Polymers", "Chemistry in Everyday Life"]
          },
          "Biology": {
            "9-10": ["Life Processes", "Control and Coordination", "How do Organisms Reproduce?", "Heredity and Evolution", "Our Environment", "Natural Resource Management"],
            "11-12": ["Living World", "Biological Classification", "Plant Kingdom", "Animal Kingdom", "Morphology of Plants", "Anatomy of Plants", "Structural Organisation in Animals", "Cell", "Biomolecules", "Cell Cycle", "Transport in Plants", "Mineral Nutrition", "Photosynthesis", "Respiration in Plants", "Plant Growth", "Digestion and Absorption", "Breathing and Exchange of Gases", "Body Fluids and Circulation", "Excretory Products", "Locomotion and Movement", "Neural Control", "Chemical Coordination", "Reproduction", "Sexual Reproduction", "Human Reproduction", "Reproductive Health", "Principles of Inheritance", "Molecular Basis of Inheritance", "Evolution", "Human Health and Disease", "Strategies for Enhancement", "Microbes in Human Welfare", "Biotechnology", "Biotechnology Applications", "Organisms and Populations", "Ecosystem", "Biodiversity", "Environmental Issues"]
          },
          "English": {
            "1-5": ["Reading Comprehension", "Grammar Basics", "Vocabulary Building", "Writing Skills", "Listening and Speaking", "Stories and Poems", "Phonics"],
            "6-8": ["Reading Comprehension", "Grammar", "Vocabulary", "Writing Skills", "Literature", "Poetry", "Drama", "Language Use"],
            "9-10": ["Reading Comprehension", "Grammar", "Writing Skills", "Literature", "Poetry", "Drama", "Prose Writing", "Language Study"],
            "11-12": ["Reading Comprehension", "Advanced Grammar", "Writing Skills", "Literature", "Poetry", "Drama", "Language Studies", "Communication Skills", "Project Work"]
          },
          "Hindi": {
            "1-5": ["\u0939\u093F\u0902\u0926\u0940 \u0935\u0930\u094D\u0923\u092E\u093E\u0932\u093E", "\u092E\u093E\u0924\u094D\u0930\u093E", "\u0936\u092C\u094D\u0926 \u0928\u093F\u0930\u094D\u092E\u093E\u0923", "\u0935\u093E\u0915\u094D\u092F \u0930\u091A\u0928\u093E", "\u0915\u0939\u093E\u0928\u0940", "\u0915\u0935\u093F\u0924\u093E", "\u0935\u094D\u092F\u093E\u0915\u0930\u0923"],
            "6-8": ["\u0917\u0926\u094D\u092F", "\u092A\u0926\u094D\u092F", "\u0935\u094D\u092F\u093E\u0915\u0930\u0923", "\u0930\u091A\u0928\u093E", "\u092A\u0924\u094D\u0930 \u0932\u0947\u0916\u0928", "\u0928\u093F\u092C\u0902\u0927", "\u0915\u0939\u093E\u0928\u0940 \u0932\u0947\u0916\u0928"],
            "9-10": ["\u0917\u0926\u094D\u092F \u0916\u0902\u0921", "\u0915\u093E\u0935\u094D\u092F \u0916\u0902\u0921", "\u0935\u094D\u092F\u093E\u0915\u0930\u0923", "\u0930\u091A\u0928\u093E", "\u092A\u0924\u094D\u0930 \u0932\u0947\u0916\u0928", "\u0928\u093F\u092C\u0902\u0927 \u0932\u0947\u0916\u0928", "\u0938\u0902\u0935\u093E\u0926 \u0932\u0947\u0916\u0928"],
            "11-12": ["\u0917\u0926\u094D\u092F \u0938\u0902\u0915\u0932\u0928", "\u0915\u093E\u0935\u094D\u092F \u0938\u0902\u0915\u0932\u0928", "\u0935\u094D\u092F\u093E\u0915\u0930\u0923", "\u0930\u091A\u0928\u093E", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u0915\u093E \u0907\u0924\u093F\u0939\u093E\u0938", "\u092D\u093E\u0937\u093E \u0935\u093F\u091C\u094D\u091E\u093E\u0928"]
          },
          "Social Science": {
            "6-8": ["Timeline and Sources of History", "India, that is Bharat", "The beginnings of Indian civilization", "India's Cultural Roots", "Locating places on the Earth", "Oceans and continents", "Landforms and life", "Unity in Diversity", "Family and Community", "Grassroots Democracy", "Our Pasts", "The Earth - Our Habitat", "Social and Political Life"],
            "9-10": ["The French Revolution", "Socialism in Europe and the Russian Revolution", "Nazism and the Rise of Hitler", "Forest Society and Colonialism", "Pastoralists in the Modern World", "India - Size and Location", "Physical Features of India", "Drainage", "Climate", "Natural Vegetation and Wildlife", "Population", "Democracy in the Contemporary World", "What is Democracy? Why Democracy?", "Constitutional Design", "Electoral Politics", "Working of Institutions", "The Story of Village Palampur", "People as Resource", "Poverty as a Challenge", "Food Security in India"]
          },
          "History": {
            "6-8": ["Timeline and Sources of History", "India, that is Bharat", "The beginnings of Indian civilization", "India's Cultural Roots", "What, Where, How and When?", "From Hunting-Gathering to Growing Food", "In the Earliest Cities", "What Books and Burials Tell Us", "Kingdoms, Kings and an Early Republic", "New Questions and Ideas", "Ashoka, The Emperor Who Gave Up War", "Vital Villages, Thriving Towns", "Traders, Kings and Pilgrims", "New Empires and Kingdoms", "Buildings, Paintings and Books"],
            "9-10": ["The French Revolution", "Socialism in Europe and the Russian Revolution", "Nazism and the Rise of Hitler", "Forest Society and Colonialism", "Pastoralists in the Modern World"],
            "11-12": ["Themes in World History", "The Rise of Nationalism in Europe", "The Making of a Global World", "The Industrial Revolution", "Print Culture and the Modern World", "Themes in Indian History", "Bricks, Beads and Bones", "Kings, Farmers and Towns", "Kinship, Caste and Class", "Thinking, Believing and Knowing", "Through the Eyes of Travellers", "Bhakti-Sufi Traditions", "An Imperial Capital: Vijayanagara", "Peasants, Zamindars and the State", "Kings and Chronicles", "Colonial Cities", "Rebels and the Raj", "Colonial Arts", "Framing the Constitution", "The Making of the National Movement", "India after Independence"]
          },
          "Geography": {
            "6-8": ["The Earth and the Universe", "Latitudes and Longitudes", "Motions of the Earth", "Maps and Diagrams", "Major Landforms of the Earth", "Our Country India", "The Northern Mountains", "The Northern Plains", "The Peninsular Plateau", "The Indian Desert", "The Coastal Plains", "The Islands", "Climate", "Natural Vegetation", "Wildlife", "Mineral and Power Resources", "Agriculture", "Industries", "Human Resources", "Transport", "Communication"],
            "9-10": ["India Location, Relief and Drainage", "India Climate, Natural Vegetation and Wildlife", "India Agriculture and Water Resources", "India Mineral and Power Resources", "India Industries and Transport", "India Population", "For Pleasure and Leisure", "Asia Location and Political Divisions", "Asia Physical Features", "Asia Climate and Natural Vegetation", "Asia Agriculture, Mineral and Power Resources", "Asia Industries Transport and Communication"],
            "11-12": ["Introduction to Geography", "The Earth", "Landforms", "Climate", "Natural Vegetation", "Soils", "Population", "Human Settlements", "Economic Geography", "Transport and Communication", "International Trade", "India Physical Features", "India Drainage System", "India Climate", "India Natural Vegetation", "India Population", "India Agriculture", "India Water Resources", "India Mineral and Energy Resources", "India Manufacturing Industries", "India Planning and Sustainable Development"]
          },
          "Political Science": {
            "9-10": ["Democracy in the Contemporary World", "What is Democracy? Why Democracy?", "Constitutional Design", "Electoral Politics", "Working of Institutions", "Democratic Rights"],
            "11-12": ["Constitution as a Living Document", "Rights in the Indian Constitution", "Election and Representation", "The Executive", "The Legislature", "The Judiciary", "Federalism", "Local Governments", "Constitution as a Living Document", "The Philosophy of the Constitution", "Political Parties", "Pressure Groups and Movements", "Challenges to Democracy", "Recent Developments in Indian Politics"]
          },
          "Economics": {
            "9-10": ["Economics as a Social Science", "Consumer Behaviour", "Producer Behaviour", "Forms of Market and Price Determination", "National Income and Related Aggregates", "Money and Banking", "Government Budget and the Economy", "Balance of Payments", "Development", "Sectors of the Indian Economy", "Money and Credit", "Globalisation and the Indian Economy"],
            "11-12": ["Introduction to Economics", "Consumer Equilibrium and Demand", "Producer Behaviour and Supply", "Forms of Market and Price Determination", "National Income and Related Aggregates", "Money and Banking", "Determination of Income and Employment", "Government Budget and the Economy", "Balance of Payments", "Development", "Indian Economy on the Eve of Independence", "Indian Economy 1950-1990", "Economic Reforms since 1991", "Poverty", "Human Capital Formation in India", "Rural Development", "Employment Growth Informalisation and Related Issues", "Infrastructure", "Environment and Sustainable Development", "Development Experience of India"]
          },
          "Computer Science": {
            "1-5": ["Introduction to Computers", "Parts of a Computer", "Operating a Computer", "Basic Applications", "Drawing and Painting", "Fun with Computers"],
            "6-8": ["Computer System", "Operating System Basics", "Word Processing", "Spreadsheets", "Presentations", "Internet Basics", "Email Communication", "Introduction to Programming"],
            "9-10": ["Computer Fundamentals", "Operating Systems", "Programming Methodology", "Programming in Python", "Database Concepts", "Web Technologies", "Boolean Logic", "Number Systems"],
            "11-12": ["Problem Solving Using Computer", "Programming Methodology", "Introduction to Programming", "Programming in Python", "Arrays", "Functions", "Objects and Classes", "Constructors and Destructors", "Inheritance", "Stack", "Queue", "Boolean Algebra", "Communication and Network Concepts", "Database and SQL", "Practical Work"]
          },
          "Environmental Studies (EVS)": {
            "1-5": ["My Family and Me", "Plants Around Us", "Animals Around Us", "Food We Eat", "Water", "Air", "Weather and Climate", "Festivals and Celebrations", "Means of Transport", "Communication"],
            "6-8": ["Our Environment", "Natural Resources", "Pollution and Conservation", "Forests and Wildlife", "Agriculture and Food Production", "Health and Hygiene", "Disaster Management"]
          },
          "Literature in English": {
            "9-10": ["Drama", "Short Stories", "Poetry", "Prose", "Novel Study", "Language Study", "Writing Skills"],
            "11-12": ["Drama Analysis", "Poetry Appreciation", "Prose Study", "Novel Analysis", "Literary Criticism", "Creative Writing", "Language Skills"]
          },
          "English Language": {
            "9-10": ["Composition Writing", "Letter Writing", "Comprehension", "Grammar", "Vocabulary", "Pr\xE9cis Writing", "Notice and Report Writing"],
            "11-12": ["Advanced Composition", "Directed Writing", "Comprehension Skills", "Advanced Grammar", "Language Functions", "Reading Skills"]
          },
          "History & Civics": {
            "6-8": ["Early Civilizations", "Early Humans", "The First Cities", "What Books and Burials Tell Us", "Kingdoms Kings and an Early Republic", "New Questions and Ideas", "Ashoka The Emperor Who Gave Up War", "Vital Villages Thriving Towns", "Traders Kings and Pilgrims", "New Empires and Kingdoms", "Building Painting and Books", "The Mughal Empire", "The Sultans of Delhi", "Architecture", "A Changing World", "The British Power in India", "Our Constitution", "How the State Government Works", "How the Central Government Works", "Understanding Laws", "Understanding Media", "Understanding Advertising", "Markets Around Us", "A Shirt in the Market"],
            "9-10": ["The French Revolution", "The Industrial Revolution", "Rise of Nationalism in Europe", "The Making of a Global World", "Print Culture and the Modern World", "History and Sport", "Clothing: A Social History", "The Harappan Civilization", "The Vedic Age", "Rise of Jainism and Buddhism", "The Mauryan Empire", "The Age of the Guptas", "Medieval India", "The Mughal Empire", "The Company Rule in India", "India's Struggle for Independence", "Electoral Politics", "Working of Institutions", "Political Parties", "Outcomes of Democracy", "Challenges to Democracy"],
            "11-12": ["Ancient Indian History", "Medieval Indian History", "Modern Indian History", "Constitutional Development", "Political Processes", "Governance", "Indian National Movement", "Post Independence India", "Constitutional Framework", "Political System", "Electoral Process", "Local Government", "Constitutional Values"]
          },
          "Art & Craft": {
            "1-5": ["Drawing", "Coloring", "Paper Craft", "Clay Modeling", "Nature Art", "Festival Crafts"],
            "6-8": ["Fine Arts", "Applied Arts", "Traditional Art Forms", "Modern Art Techniques", "Craft Work", "Art History"],
            "9-10": ["Drawing and Painting", "Sculpture", "Applied Art", "Art History", "Creative Expression", "Art Appreciation"]
          },
          "Physical Education": {
            "1-5": ["Basic Movements", "Simple Games", "Health and Hygiene", "Safety Rules", "Sports Activities"],
            "6-8": ["Physical Fitness", "Games and Sports", "Health Education", "First Aid", "Sports Rules", "Olympic Education"],
            "9-10": ["Sports and Games", "Physical Fitness", "Sports Psychology", "Sports Medicine", "Training Methods", "Sports Management"]
          },
          "Home Science": {
            "9-10": ["Food and Nutrition", "Clothing and Textiles", "Home Management", "Child Development", "Health and First Aid", "Consumer Education"],
            "11-12": ["Advanced Nutrition", "Food Science", "Textile Science", "Interior Decoration", "Family Resource Management", "Entrepreneurship"]
          },
          "Commercial Studies": {
            "9-10": ["Business Studies", "Banking", "Marketing", "Insurance", "Transport", "Communication", "Warehousing", "Advertising", "Consumer Protection"],
            "11-12": ["Business Organization", "Company Formation", "Business Finance", "Marketing Management", "Human Resource Management", "International Business"]
          },
          "Commerce": {
            "11-12": ["Financial Accounting", "Partnership Accounts", "Company Accounts", "Analysis of Financial Statements", "Cash Flow Statement", "Business Studies", "Nature and Significance of Management", "Principles of Management", "Business Environment", "Planning", "Organising", "Staffing", "Directing", "Controlling", "Financial Management", "Financial Markets", "Marketing", "Consumer Protection", "Entrepreneurship Development"]
          },
          "Computer Science": {
            "1-5": ["Introduction to Computers", "Parts of a Computer", "Operating a Computer", "Basic Applications", "Drawing and Painting", "Fun with Computers"],
            "6-8": ["Computer System", "Operating System Basics", "Word Processing", "Spreadsheets", "Presentations", "Internet Basics", "Email Communication", "Introduction to Programming"],
            "9-10": ["Computer Fundamentals", "Operating Systems", "Programming Methodology", "Programming in Python", "Database Concepts", "Web Technologies", "Boolean Logic", "Number Systems"],
            "11-12": ["Problem Solving Using Computer", "Programming Methodology", "Introduction to Programming", "Programming in C++", "Arrays", "Functions", "Objects and Classes", "Constructors and Destructors", "Inheritance", "Stack", "Queue", "Boolean Algebra", "Communication and Network Concepts", "Database and SQL", "Practical Work"]
          },
          "Psychology": {
            "11-12": ["Introduction to Psychology", "Methods of Psychology", "The Bases of Human Behaviour", "Human Development", "Sensory Attentional and Perceptual Processes", "Learning", "Human Memory", "Thinking", "Motivation and Emotion", "Intelligence and Aptitude", "Personality", "Attitude and Social Cognition", "Psychological Disorders", "Therapeutic Approaches", "Psychology and Life"]
          },
          "Sociology": {
            "11-12": ["Introducing Sociology", "Social Institutions", "Social Inequality and Exclusion", "The Challenges of Unity in Diversity", "Process of Social Change and Development", "Structural Change", "Cultural Change", "Change and Development in Rural Society", "Change and Development in Industrial Society", "Globalisation and Social Change", "Mass Media and Communications", "Social Movements"]
          },
          "Political Science": {
            "11-12": ["Political Theory Introduction", "What is Politics", "Freedom", "Equality", "Social Justice", "Rights", "Citizenship", "Nationalism", "Secularism", "Peace", "Development", "Constitution as a Living Document", "Rights in the Indian Constitution", "Election and Representation", "The Executive", "The Legislature", "The Judiciary", "Federalism", "Local Governments", "Political Parties", "Pressure Groups and Movements", "Challenges to Democracy"]
          },
          "Social Science": {
            "6-8": ["Timeline and Sources of History", "India, that is Bharat", "The beginnings of Indian civilization", "India's Cultural Roots", "Locating places on the Earth", "Oceans and continents", "Landforms and life", "Unity in Diversity", "Family and Community", "Grassroots Democracy", "Our Pasts", "The Earth - Our Habitat", "Social and Political Life"],
            "9-10": ["The French Revolution", "Socialism in Europe and the Russian Revolution", "Nazism and the Rise of Hitler", "Forest Society and Colonialism", "Pastoralists in the Modern World", "India - Size and Location", "Physical Features of India", "Drainage", "Climate", "Natural Vegetation and Wildlife", "Population", "Democracy in the Contemporary World", "What is Democracy? Why Democracy?", "Constitutional Design", "Electoral Politics", "Working of Institutions", "The Story of Village Palampur", "People as Resource", "Poverty as a Challenge", "Food Security in India"]
          },
          "Hindi": {
            "1-5": ["\u0935\u094D\u092F\u093E\u0915\u0930\u0923", "\u0936\u092C\u094D\u0926 \u092D\u0902\u0921\u093E\u0930", "\u092A\u0920\u0928 \u0915\u094C\u0936\u0932", "\u0932\u0947\u0916\u0928 \u0915\u094C\u0936\u0932", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F"],
            "6-8": ["\u0935\u094D\u092F\u093E\u0915\u0930\u0923", "\u0936\u092C\u094D\u0926 \u092D\u0902\u0921\u093E\u0930", "\u092A\u0920\u0928 \u0915\u094C\u0936\u0932", "\u0932\u0947\u0916\u0928 \u0915\u094C\u0936\u0932", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F", "\u0915\u0935\u093F\u0924\u093E"],
            "9-10": ["\u0935\u094D\u092F\u093E\u0915\u0930\u0923", "\u0932\u0947\u0916\u0928 \u0915\u094C\u0936\u0932", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F", "\u0915\u0935\u093F\u0924\u093E", "\u0928\u093E\u091F\u0915", "\u0928\u093F\u092C\u0902\u0927"],
            "11-12": ["\u0909\u091A\u094D\u091A \u0935\u094D\u092F\u093E\u0915\u0930\u0923", "\u0932\u0947\u0916\u0928 \u0915\u094C\u0936\u0932", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F", "\u0915\u0935\u093F\u0924\u093E", "\u0928\u093E\u091F\u0915", "\u092D\u093E\u0937\u093E \u0905\u0927\u094D\u092F\u092F\u0928"]
          }
        },
        "icse/cisce": {
          "Mathematics": {
            "1-5": ["Numbers up to 100000", "Addition and Subtraction", "Multiplication and Division", "Fractions", "Decimals", "Measurement", "Geometry", "Time and Calendar", "Money", "Data Handling", "Patterns"],
            "6-8": ["Integers", "Fractions and Decimals", "Rational Numbers", "Simple Equations", "Lines and Angles", "Triangles", "Congruence of Triangles", "Comparing Quantities", "Practical Geometry", "Perimeter and Area", "Algebraic Expressions", "Exponents and Powers", "Direct and Inverse Proportions", "Factorisation", "Introduction to Graphs", "Playing with Numbers"],
            "9-10": ["Number Systems", "Polynomials", "Coordinate Geometry", "Linear Equations in Two Variables", "Introduction to Euclid's Geometry", "Lines and Angles", "Triangles", "Quadrilaterals", "Areas of Parallelograms and Triangles", "Circles", "Constructions", "Heron's Formula", "Surface Areas and Volumes", "Statistics", "Probability"],
            "11-12": ["Relations and Functions", "Inverse Trigonometric Functions", "Matrices", "Determinants", "Continuity and Differentiability", "Applications of Derivatives", "Integrals", "Applications of Integrals", "Differential Equations", "Vector Algebra", "Three Dimensional Geometry", "Linear Programming", "Probability", "Statistics"]
          },
          "Science": {
            "1-5": ["Plants Around Us", "Animals Around Us", "My Body", "Food and Health", "Water", "Air Around Us", "Weather", "Light and Shadow", "Sound", "Simple Machines", "Materials and Their Properties", "Safety and First Aid"],
            "6-8": ["Matter and Materials", "Physical and Chemical Changes", "Elements, Compounds and Mixtures", "Atomic Structure", "Water and Solutions", "Air and Atmosphere", "Light and Vision", "Heat and Temperature", "Sound and Hearing", "Force and Motion", "Simple Machines", "Energy", "Magnetism", "Electricity", "Cell Structure and Function", "Plant and Animal Tissues", "Nutrition in Plants and Animals", "Respiration", "Circulation", "Excretion", "Growth and Reproduction", "Health and Disease", "Ecosystems and Environment"],
            "9-10": ["Study of Matter", "Atomic Structure and Chemical Bonding", "Study of Acids, Bases and Salts", "Practical Chemistry", "Language of Chemistry", "Chemical Changes and Reactions", "Metals and Non-Metals", "Study of Compounds", "Organic Chemistry", "Practical Work", "Force and Pressure", "Work, Energy and Power", "Sound", "Light", "Current Electricity", "Magnetism", "Motion", "Heat and Energy"],
            "11-12": ["Modern Physics", "Atomic Physics", "Nuclear Physics", "Electronics", "Optics", "Waves", "Electricity and Magnetism", "Mechanics", "Thermodynamics", "Chemistry Practicals", "Physics Practicals"]
          },
          "English": {
            "1-5": ["Reading and Comprehension", "Phonics and Spelling", "Grammar Fundamentals", "Creative Writing", "Poetry and Rhymes", "Story Telling", "Vocabulary Building", "Handwriting Practice"],
            "6-8": ["Prose and Comprehension", "Poetry Appreciation", "Grammar and Usage", "Composition Writing", "Creative Expression", "Vocabulary Development", "Language Skills", "Literary Forms"],
            "9-10": ["Prose Studies", "Poetry Analysis", "Drama", "Grammar and Language Study", "Composition and Essay Writing", "Letter Writing", "Comprehension Skills", "Vocabulary Enhancement"],
            "11-12": ["Advanced Prose", "Poetry Criticism", "Drama Studies", "Language Work", "Composition Skills", "Project Work", "Communication Arts", "Literary Appreciation"]
          },
          "Geography": {
            "6-8": ["The Earth and the Universe", "Latitudes and Longitudes", "Motions of the Earth", "Maps and Diagrams", "Major Landforms of the Earth", "Our Country India", "The Northern Mountains", "The Northern Plains", "The Peninsular Plateau", "The Indian Desert", "The Coastal Plains", "The Islands", "Climate", "Natural Vegetation", "Wildlife", "Mineral and Power Resources", "Agriculture", "Industries", "Human Resources", "Transport", "Communication"],
            "9-10": ["India Location, Relief and Drainage", "India Climate, Natural Vegetation and Wildlife", "India Agriculture and Water Resources", "India Mineral and Power Resources", "India Industries and Transport", "India Population", "For Pleasure and Leisure", "Asia Location and Political Divisions", "Asia Physical Features", "Asia Climate and Natural Vegetation", "Asia Agriculture, Mineral and Power Resources", "Asia Industries Transport and Communication"],
            "11-12": ["Introduction to Geography", "The Earth", "Landforms", "Climate", "Natural Vegetation", "Soils", "Population", "Human Settlements", "Economic Geography", "Transport and Communication", "International Trade", "India Physical Features", "India Drainage System", "India Climate", "India Natural Vegetation", "India Population", "India Agriculture", "India Water Resources", "India Mineral and Energy Resources", "India Manufacturing Industries", "India Planning and Sustainable Development"]
          },
          "History & Civics": {
            "6-8": ["Early Civilizations", "Early Humans", "The First Cities", "What Books and Burials Tell Us", "Kingdoms Kings and an Early Republic", "New Questions and Ideas", "Ashoka The Emperor Who Gave Up War", "Vital Villages Thriving Towns", "Traders Kings and Pilgrims", "New Empires and Kingdoms", "Building Painting and Books", "The Mughal Empire", "The Sultans of Delhi", "Architecture", "A Changing World", "The British Power in India", "Our Constitution", "How the State Government Works", "How the Central Government Works", "Understanding Laws", "Understanding Media", "Understanding Advertising", "Markets Around Us", "A Shirt in the Market"],
            "9-10": ["The French Revolution", "The Industrial Revolution", "Rise of Nationalism in Europe", "The Making of a Global World", "Print Culture and the Modern World", "History and Sport", "Clothing: A Social History", "The Harappan Civilization", "The Vedic Age", "Rise of Jainism and Buddhism", "The Mauryan Empire", "The Age of the Guptas", "Medieval India", "The Mughal Empire", "The Company Rule in India", "India's Struggle for Independence", "Electoral Politics", "Working of Institutions", "Political Parties", "Outcomes of Democracy", "Challenges to Democracy"],
            "11-12": ["Ancient Indian History", "Medieval Indian History", "Modern Indian History", "Constitutional Development", "Political Processes", "Governance", "Indian National Movement", "Post Independence India", "Constitutional Framework", "Political System", "Electoral Process", "Local Government", "Constitutional Values"]
          },
          "Computer Applications": {
            "1-5": ["Introduction to Computers", "Parts of a Computer", "Operating a Computer", "Basic Applications", "Drawing and Painting", "Fun with Computers"],
            "6-8": ["Computer System", "Operating System Basics", "Word Processing", "Spreadsheets", "Presentations", "Internet Basics", "Email Communication", "Introduction to Programming"],
            "9-10": ["Computer Fundamentals", "Operating Systems", "Programming Methodology", "Programming in Java", "HTML", "Cascading Style Sheets", "Database Management Systems", "Boolean Logic", "Number Systems", "Communication and Open Source Concepts"]
          },
          "Hindi": {
            "1-5": ["\u0939\u093F\u0902\u0926\u0940 \u0935\u0930\u094D\u0923\u092E\u093E\u0932\u093E", "\u092E\u093E\u0924\u094D\u0930\u093E", "\u0936\u092C\u094D\u0926 \u0928\u093F\u0930\u094D\u092E\u093E\u0923", "\u0935\u093E\u0915\u094D\u092F \u0930\u091A\u0928\u093E", "\u0915\u0939\u093E\u0928\u0940", "\u0915\u0935\u093F\u0924\u093E", "\u0935\u094D\u092F\u093E\u0915\u0930\u0923"],
            "6-8": ["\u0917\u0926\u094D\u092F", "\u092A\u0926\u094D\u092F", "\u0935\u094D\u092F\u093E\u0915\u0930\u0923", "\u0930\u091A\u0928\u093E", "\u092A\u0924\u094D\u0930 \u0932\u0947\u0916\u0928", "\u0928\u093F\u092C\u0902\u0927", "\u0915\u0939\u093E\u0928\u0940 \u0932\u0947\u0916\u0928"],
            "9-10": ["\u0917\u0926\u094D\u092F \u0916\u0902\u0921", "\u0915\u093E\u0935\u094D\u092F \u0916\u0902\u0921", "\u0935\u094D\u092F\u093E\u0915\u0930\u0923", "\u0930\u091A\u0928\u093E", "\u092A\u0924\u094D\u0930 \u0932\u0947\u0916\u0928", "\u0928\u093F\u092C\u0902\u0927 \u0932\u0947\u0916\u0928", "\u0938\u0902\u0935\u093E\u0926 \u0932\u0947\u0916\u0928"],
            "11-12": ["\u0917\u0926\u094D\u092F \u0938\u0902\u0915\u0932\u0928", "\u0915\u093E\u0935\u094D\u092F \u0938\u0902\u0915\u0932\u0928", "\u0935\u094D\u092F\u093E\u0915\u0930\u0923", "\u0930\u091A\u0928\u093E", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u0915\u093E \u0907\u0924\u093F\u0939\u093E\u0938", "\u092D\u093E\u0937\u093E \u0935\u093F\u091C\u094D\u091E\u093E\u0928"]
          },
          "Physics": {
            "9-10": ["Measurements and Experimentation", "Motion in One Dimension", "Laws of Motion", "Pressure in Fluids and Atmospheric Pressure", "Upthrust in Fluids, Archimedes' Principle and Floatation", "Heat and Energy", "Reflection of Light", "Propagation of Sound Waves", "Current Electricity", "Magnetism"],
            "11-12": ["Physical World and Measurement", "Kinematics", "Laws of Motion", "Work Energy and Power", "Rotational Motion", "Gravitation", "Properties of Matter", "Heat and Thermodynamics", "Kinetic Theory of Gases", "Oscillations and Waves"]
          },
          "Chemistry": {
            "9-10": ["Matter", "Physical and Chemical Changes", "Elements Compounds and Mixtures", "Atomic Structure and Chemical Bonding", "The Periodic Table", "Chemical Arithmetic and Chemical Equations", "Acids Bases and Salts", "Oxidation and Reduction", "Ammonia", "Nitric Acid", "Sulphuric Acid", "Organic Chemistry", "Practical Chemistry"],
            "11-12": ["Atomic Structure", "Chemical Bonding", "Study of Acids, Bases and Salts", "Analytical Chemistry", "Mole Concept and Stoichiometry", "Electrolysis", "Metallurgy", "Study of Compounds", "Organic Chemistry", "Practical Work"]
          },
          "Biology": {
            "9-10": ["Cell The Unit of Life", "Tissues", "Photosynthesis", "Transpiration", "Excretion", "Circulatory System", "The Nervous System", "The Sense Organs", "The Endocrine System", "Reproductive System", "Genetics", "Pollution"]
          },
          "Economics": {
            "9-10": ["Economics as a Social Science", "Consumer Behaviour", "Producer Behaviour", "Forms of Market and Price Determination", "National Income and Related Aggregates", "Money and Banking", "Government Budget and the Economy", "Balance of Payments", "Development", "Sectors of the Indian Economy", "Money and Credit", "Globalisation and the Indian Economy"],
            "11-12": ["Introduction to Economics", "Consumer Equilibrium and Demand", "Producer Behaviour and Supply", "Forms of Market and Price Determination", "National Income and Related Aggregates", "Money and Banking", "Determination of Income and Employment", "Government Budget and the Economy", "Balance of Payments", "Development", "Indian Economy on the Eve of Independence", "Indian Economy 1950-1990", "Economic Reforms since 1991", "Poverty", "Human Capital Formation in India", "Rural Development", "Employment Growth Informalisation and Related Issues", "Infrastructure", "Environment and Sustainable Development", "Development Experience of India"]
          },
          "Commercial Studies": {
            "9-10": ["Business Studies", "Banking", "Marketing", "Insurance", "Transport", "Communication", "Warehousing", "Advertising", "Consumer Protection"],
            "11-12": ["Business Organization", "Company Formation", "Business Finance", "Marketing Management", "Human Resource Management", "International Business"]
          },
          "Computer Applications": {
            "6-8": ["Computer System", "Operating System Basics", "Word Processing", "Spreadsheets", "Presentations", "Internet Basics", "Email Communication", "Introduction to Programming"],
            "9-10": ["Computer Fundamentals", "Operating Systems", "Programming Methodology", "Programming in Java", "HTML", "Cascading Style Sheets", "Database Management Systems", "Boolean Logic", "Number Systems", "Communication and Open Source Concepts"]
          },
          "Philosophy": {
            "11-12": ["Introduction to Philosophy", "Logic and Reasoning", "Ethics and Moral Philosophy", "Political Philosophy", "Metaphysics", "Epistemology", "Philosophy of Religion", "Indian Philosophy", "Contemporary Philosophy"]
          },
          "Sociology": {
            "11-12": ["Introducing Sociology", "Social Institutions", "Social Inequality and Exclusion", "The Challenges of Unity in Diversity", "Process of Social Change and Development", "Structural Change", "Cultural Change", "Change and Development in Rural Society", "Change and Development in Industrial Society", "Globalisation and Social Change", "Mass Media and Communications", "Social Movements"]
          },
          "Political Science": {
            "11-12": ["Political Theory Introduction", "What is Politics", "Freedom", "Equality", "Social Justice", "Rights", "Citizenship", "Nationalism", "Secularism", "Peace", "Development", "Constitution as a Living Document", "Rights in the Indian Constitution", "Election and Representation", "The Executive", "The Legislature", "The Judiciary", "Federalism", "Local Governments", "Political Parties", "Pressure Groups and Movements", "Challenges to Democracy"]
          },
          "Art & Craft": {
            "1-5": ["Drawing", "Coloring", "Paper Craft", "Clay Modeling", "Nature Art", "Festival Crafts"],
            "6-8": ["Fine Arts", "Applied Arts", "Traditional Art Forms", "Modern Art Techniques", "Craft Work", "Art History"],
            "9-10": ["Drawing and Painting", "Sculpture", "Applied Art", "Art History", "Creative Expression", "Art Appreciation"],
            "11-12": ["Advanced Drawing", "Painting Techniques", "Sculpture and Modeling", "Graphic Design", "Art Criticism", "Portfolio Development"]
          },
          "Physical Education": {
            "1-5": ["Basic Movements", "Simple Games", "Health and Hygiene", "Safety Rules", "Sports Activities"],
            "6-8": ["Physical Fitness", "Games and Sports", "Health Education", "First Aid", "Sports Rules", "Olympic Education"],
            "9-10": ["Sports and Games", "Physical Fitness", "Sports Psychology", "Sports Medicine", "Training Methods", "Sports Management"],
            "11-12": ["Advanced Sports Training", "Sports Psychology", "Exercise Physiology", "Sports Management", "Health and Fitness", "Yoga and Meditation"]
          },
          "History": {
            "11-12": ["Ancient Indian History", "Medieval Indian History", "Modern Indian History", "Constitutional Development", "Political Processes", "Governance", "Indian National Movement", "Post Independence India"]
          },
          "Commerce": {
            "11-12": ["Financial Accounting", "Partnership Accounts", "Company Accounts", "Analysis of Financial Statements", "Cash Flow Statement", "Business Studies", "Nature and Significance of Management", "Principles of Management", "Business Environment", "Planning", "Organising", "Staffing", "Directing", "Controlling", "Financial Management", "Financial Markets", "Marketing", "Consumer Protection", "Entrepreneurship Development"]
          },
          "Art & Craft": {
            "1-5": ["Drawing", "Coloring", "Paper Craft", "Clay Modeling", "Nature Art", "Festival Crafts"],
            "6-8": ["Fine Arts", "Applied Arts", "Traditional Art Forms", "Modern Art Techniques", "Craft Work", "Art History"],
            "9-10": ["Drawing and Painting", "Sculpture", "Applied Art", "Art History", "Creative Expression", "Art Appreciation"],
            "11-12": ["Advanced Drawing", "Painting Techniques", "Sculpture and Modeling", "Graphic Design", "Art Criticism", "Portfolio Development"]
          },
          "Physical Education": {
            "1-5": ["Basic Movements", "Simple Games", "Health and Hygiene", "Safety Rules", "Sports Activities"],
            "6-8": ["Physical Fitness", "Games and Sports", "Health Education", "First Aid", "Sports Rules", "Olympic Education"],
            "9-10": ["Sports and Games", "Physical Fitness", "Sports Psychology", "Sports Medicine", "Training Methods", "Sports Management"],
            "11-12": ["Advanced Sports Training", "Sports Psychology", "Exercise Physiology", "Sports Management", "Health and Fitness", "Yoga and Meditation"]
          },
          "Home Science": {
            "9-10": ["Food and Nutrition", "Clothing and Textiles", "Home Management", "Child Development", "Health and First Aid", "Consumer Education"],
            "11-12": ["Advanced Nutrition", "Food Science", "Textile Science", "Interior Decoration", "Family Resource Management", "Entrepreneurship"]
          },
          "Literature in English": {
            "9-10": ["Drama", "Short Stories", "Poetry", "Prose", "Novel Study", "Language Study", "Writing Skills"],
            "11-12": ["Drama Analysis", "Poetry Appreciation", "Prose Study", "Novel Analysis", "Literary Criticism", "Creative Writing", "Language Skills"]
          },
          "English Language": {
            "9-10": ["Composition Writing", "Letter Writing", "Comprehension", "Grammar", "Vocabulary", "Pr\xE9cis Writing", "Notice and Report Writing"],
            "11-12": ["Advanced Composition", "Directed Writing", "Comprehension Skills", "Advanced Grammar", "Language Functions", "Reading Skills"]
          },
          "Environmental Studies (EVS)": {
            "1-5": ["My Family and Me", "Plants Around Us", "Animals Around Us", "Food We Eat", "Water", "Air", "Weather and Climate", "Festivals and Celebrations", "Means of Transport", "Communication"]
          },
          "Biology": {
            "11-12": ["Living World", "Biological Classification", "Plant Kingdom", "Animal Kingdom", "Morphology of Plants", "Anatomy of Plants", "Structural Organisation in Animals", "Cell", "Biomolecules", "Cell Cycle", "Transport in Plants", "Mineral Nutrition", "Photosynthesis", "Respiration in Plants", "Plant Growth", "Digestion and Absorption", "Breathing and Exchange of Gases", "Body Fluids and Circulation", "Excretory Products", "Locomotion and Movement", "Neural Control", "Chemical Coordination", "Reproduction", "Sexual Reproduction", "Human Reproduction", "Reproductive Health", "Principles of Inheritance", "Molecular Basis of Inheritance", "Evolution", "Human Health and Disease", "Strategies for Enhancement", "Microbes in Human Welfare", "Biotechnology", "Biotechnology Applications", "Organisms and Populations", "Ecosystem", "Biodiversity", "Environmental Issues"]
          },
          "Computer Science": {
            "11-12": ["Problem Solving Using Computer", "Programming Methodology", "Introduction to Programming", "Programming in C++", "Arrays", "Functions", "Objects and Classes", "Constructors and Destructors", "Inheritance", "Stack", "Queue", "Boolean Algebra", "Communication and Network Concepts", "Database and SQL", "Practical Work"]
          }
        }
      }
    };
  }
});

// server/cloud-sql.ts
var cloud_sql_exports = {};
__export(cloud_sql_exports, {
  getDatabase: () => getDatabase,
  initializeDatabase: () => initializeDatabase
});
import { Pool as Pool2 } from "@neondatabase/serverless";
import { drizzle as drizzle2 } from "drizzle-orm/neon-serverless";
var getCloudSQLConnection, db2, initializeDatabase, getDatabase;
var init_cloud_sql = __esm({
  "server/cloud-sql.ts"() {
    "use strict";
    init_schema();
    getCloudSQLConnection = () => {
      const host = "34.131.103.137";
      const port = 5432;
      const database = "postgres";
      const user = "postgres";
      const password = process.env.DATABASE_PASSWORD || "your_password_here";
      const connectionString = `postgresql://${user}:${password}@${host}:${port}/${database}`;
      return connectionString;
    };
    initializeDatabase = () => {
      if (!db2) {
        const connectionString = getCloudSQLConnection();
        const pool2 = new Pool2({ connectionString });
        db2 = drizzle2({ client: pool2, schema: schema_exports });
        console.log("\u2705 Cloud SQL database connection initialized");
      }
      return db2;
    };
    getDatabase = () => {
      if (!db2) {
        throw new Error("Database not initialized. Call initializeDatabase() first.");
      }
      return db2;
    };
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import multer2 from "multer";

// server/storage.ts
import { randomUUID } from "crypto";

// server/storage/database.ts
import { eq, desc, and, sql as sql2 } from "drizzle-orm";

// server/db.ts
init_schema();
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage/database.ts
init_schema();
init_schema();
init_schema();
import bcrypt from "bcryptjs";
var DatabaseStorage = class {
  constructor() {
    this.initializeDefaults();
  }
  async initializeDefaults() {
    try {
      const existingAdmin = await db.select().from(adminUsers).where(eq(adminUsers.email, "hassan.jobs07@gmail.com")).limit(1);
      if (existingAdmin.length === 0) {
        const hashedPassword = await bcrypt.hash("Abutaleb@35", 10);
        await db.insert(adminUsers).values({
          email: "hassan.jobs07@gmail.com",
          password: hashedPassword
        });
      }
      const existingRules = await db.select().from(aiRules).limit(1);
      if (existingRules.length === 0) {
        await this.initializeAiRules();
      }
      const existingBoards = await db.select().from(boards).limit(1);
      if (existingBoards.length === 0) {
        await this.initializeIndianEducationData();
      }
    } catch (error) {
      console.error("Error initializing defaults:", error);
    }
  }
  async initializeAiRules() {
    const defaultRules = [
      { category: "global", subcategory: null, rules: "Generate questions that are educationally appropriate, clear, and unambiguous. Ensure all options are plausible but only correct answers are truly accurate." },
      { category: "question_type", subcategory: "multiple_choice", rules: "Create 4 options (A-D) with only one correct answer. Ensure distractors are plausible but clearly incorrect." },
      { category: "question_type", subcategory: "multiple_select", rules: "Create 6 options (A-F) with 2-4 correct answers. Ensure good mix of correct and incorrect options." },
      { category: "question_type", subcategory: "fill_blanks", rules: "Create meaningful blanks that test key concepts. Provide exact answers expected." },
      { category: "question_type", subcategory: "true_false", rules: "Create clear, factual statements that are definitively true or false. Avoid ambiguous statements." },
      { category: "question_type", subcategory: "matching", rules: "Create 4-5 clear pairs with unambiguous relationships between items." },
      { category: "question_type", subcategory: "inline_choice", rules: "Embed 2-3 meaningful choices within sentences that test understanding." },
      { category: "bloom_level", subcategory: "remembering", rules: "Focus on recall of facts, terms, and basic concepts. Use verbs like define, list, identify." },
      {
        category: "bloom_level",
        subcategory: "understanding",
        rules: "UNDERSTANDING (DOK 2): Test ability to explain ideas, concepts, or principles in own words. Use action verbs: explain, describe, interpret, summarize, paraphrase, classify, compare, exemplify. Questions must include brief scenarios or examples. Students should demonstrate comprehension beyond mere recall by explaining relationships or providing examples."
      },
      {
        category: "bloom_level",
        subcategory: "applying",
        rules: "APPLYING (DOK 2-3): Test ability to use learned information in new, concrete situations. Use action verbs: apply, demonstrate, solve, use, implement, execute, carry out. Must include realistic scenarios or problems where students apply procedures, methods, or principles. Context should be different from instructional examples but use same underlying concepts."
      },
      {
        category: "bloom_level",
        subcategory: "analyzing",
        rules: "ANALYZING (DOK 3-4): Test ability to break down information into component parts and examine relationships. Use action verbs: analyze, compare, contrast, examine, categorize, differentiate, distinguish, organize. Must provide complex scenarios, data sets, or multi-part stimuli for analysis. Students should identify patterns, relationships, or underlying structures."
      },
      {
        category: "bloom_level",
        subcategory: "evaluating",
        rules: "EVALUATING (DOK 4): Test ability to make informed judgments based on criteria and standards. Use action verbs: evaluate, critique, judge, justify, assess, appraise, defend, support. Must present scenarios requiring students to weigh evidence, assess validity, or make reasoned judgments. Include criteria or standards for evaluation within the question context."
      },
      {
        category: "bloom_level",
        subcategory: "creating",
        rules: "CREATING (DOK 4): Test ability to synthesize elements into coherent new patterns or structures. Use action verbs: create, design, construct, develop, formulate, plan, produce, generate. Present open-ended scenarios requiring original thinking or novel solutions. Students should combine elements in new ways or propose alternative solutions to problems."
      }
      // Removed difficulty level rules - difficulty feature removed
    ];
    await db.insert(aiRules).values(
      defaultRules.map((rule) => ({
        category: rule.category,
        subcategory: rule.subcategory,
        rules: rule.rules,
        isActive: true
      }))
    );
  }
  async initializeIndianEducationData() {
    const boardsData = [
      { name: "NCERT", fullName: "National Council of Educational Research and Training", description: "National curriculum framework" },
      { name: "CBSE", fullName: "Central Board of Secondary Education", description: "Central board for secondary education in India" },
      { name: "ICSE", fullName: "Indian Certificate of Secondary Education", description: "Council for the Indian School Certificate Examinations" },
      { name: "State Boards", fullName: "Various State Education Boards", description: "State-specific education boards across India" }
    ];
    const insertedBoards = await db.insert(boards).values(
      boardsData.map((board) => ({
        name: board.name,
        fullName: board.fullName,
        description: board.description,
        isActive: true
      }))
    ).returning();
    const subjectsData = [
      // Primary Education (1-5)
      { name: "Hindi", board: "NCERT", grades: [1, 2, 3, 4, 5] },
      { name: "English", board: "NCERT", grades: [1, 2, 3, 4, 5] },
      { name: "Mathematics", board: "NCERT", grades: [1, 2, 3, 4, 5] },
      { name: "Environmental Studies", board: "NCERT", grades: [3, 4, 5] },
      // Middle School (6-8)
      { name: "Science", board: "NCERT", grades: [6, 7, 8, 9, 10] },
      { name: "Social Science", board: "NCERT", grades: [6, 7, 8, 9, 10] },
      { name: "Sanskrit", board: "NCERT", grades: [6, 7, 8, 9, 10] },
      // Secondary Education (9-10)
      { name: "Physics", board: "CBSE", grades: [11, 12] },
      { name: "Chemistry", board: "CBSE", grades: [11, 12] },
      { name: "Biology", board: "CBSE", grades: [11, 12] },
      { name: "Economics", board: "CBSE", grades: [9, 10, 11, 12] },
      { name: "History", board: "CBSE", grades: [9, 10, 11, 12] },
      { name: "Geography", board: "CBSE", grades: [9, 10, 11, 12] },
      { name: "Political Science", board: "CBSE", grades: [11, 12] },
      { name: "Computer Science", board: "CBSE", grades: [9, 10, 11, 12] },
      { name: "Business Studies", board: "CBSE", grades: [11, 12] },
      { name: "Accountancy", board: "CBSE", grades: [11, 12] }
    ];
    const allSubjects = [];
    subjectsData.forEach((subjectData) => {
      const boardData = insertedBoards.find((b) => b.name === subjectData.board);
      subjectData.grades.forEach((grade) => {
        allSubjects.push({
          name: subjectData.name,
          board: subjectData.board,
          boardId: boardData?.id || null,
          grade,
          description: `${subjectData.name} for Grade ${grade} - ${subjectData.board}`,
          isActive: true
        });
      });
    });
    const insertedSubjects = await db.insert(subjects).values(allSubjects).returning();
    const topicsMap = {
      "Mathematics": ["Algebra", "Geometry", "Trigonometry", "Statistics", "Probability"],
      "Physics": ["Mechanics", "Thermodynamics", "Optics", "Electromagnetism", "Modern Physics"],
      "Chemistry": ["Atomic Structure", "Chemical Bonding", "Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry"],
      "Biology": ["Cell Biology", "Genetics", "Evolution", "Ecology", "Human Physiology"],
      "English": ["Grammar", "Literature", "Writing Skills", "Reading Comprehension", "Poetry"],
      "Hindi": ["\u0935\u094D\u092F\u093E\u0915\u0930\u0923", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F", "\u0932\u0947\u0916\u0928 \u0915\u094C\u0936\u0932", "\u0917\u0926\u094D\u092F", "\u0915\u093E\u0935\u094D\u092F"],
      "Science": ["Plants and Animals", "Matter and Materials", "Natural Phenomena", "Environment"],
      "Social Science": ["History", "Geography", "Civics", "Economics"],
      "Computer Science": ["Programming", "Data Structures", "Algorithms", "Database", "Networking"]
    };
    const allTopics = [];
    insertedSubjects.forEach((subject) => {
      const topicNames = topicsMap[subject.name] || ["Introduction", "Basic Concepts", "Advanced Topics"];
      topicNames.forEach((topicName) => {
        allTopics.push({
          name: topicName,
          subjectId: subject.id,
          pdfFilename: null
        });
      });
    });
    await db.insert(topics).values(allTopics);
  }
  // User management
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async updateUserCoins(id, coins) {
    const [user] = await db.update(users).set({ coins }).where(eq(users.id, id)).returning();
    return user || void 0;
  }
  async getAllUsers() {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }
  async updateUser(id, updates) {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user || void 0;
  }
  async updateUserStatus(id, isActive) {
    return this.updateUser(id, { isActive });
  }
  async getUserByGoogleId(googleId) {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user || void 0;
  }
  async verifyUserEmail(token) {
    console.log(`[verifyUserEmail] Attempting to verify token: ${token}`);
    const existingUser = await db.select().from(users).where(eq(users.emailVerificationToken, token)).limit(1);
    console.log(`[verifyUserEmail] Found ${existingUser.length} users with token`);
    if (existingUser.length === 0) {
      console.log(`[verifyUserEmail] No user found with token: ${token}`);
      return void 0;
    }
    console.log(`[verifyUserEmail] Found user: ${existingUser[0].email}, verified: ${existingUser[0].isEmailVerified}`);
    const [user] = await db.update(users).set({
      isEmailVerified: true,
      emailVerificationToken: null
    }).where(eq(users.emailVerificationToken, token)).returning();
    console.log(`[verifyUserEmail] Verification result: ${user ? "Success" : "Failed"}`);
    return user || void 0;
  }
  async updateUserEmailVerificationToken(id, token) {
    const [user] = await db.update(users).set({ emailVerificationToken: token }).where(eq(users.id, id)).returning();
    return user || void 0;
  }
  async setPasswordResetToken(userId, token, expiresAt) {
    const [user] = await db.update(users).set({
      passwordResetToken: token,
      passwordResetExpires: expiresAt
    }).where(eq(users.id, userId)).returning();
    return user || void 0;
  }
  async getUserByPasswordResetToken(token) {
    const [user] = await db.select().from(users).where(and(
      eq(users.passwordResetToken, token),
      gt(users.passwordResetExpires, /* @__PURE__ */ new Date())
    ));
    return user || void 0;
  }
  async clearPasswordResetToken(userId) {
    const [user] = await db.update(users).set({
      passwordResetToken: null,
      passwordResetExpires: null
    }).where(eq(users.id, userId)).returning();
    return user || void 0;
  }
  async resetUserPassword(userId, newPasswordHash) {
    const [user] = await db.update(users).set({
      password: newPasswordHash,
      passwordResetToken: null,
      passwordResetExpires: null
    }).where(eq(users.id, userId)).returning();
    return user || void 0;
  }
  async deleteUser(id) {
    try {
      await db.delete(walletTransactions).where(eq(walletTransactions.userId, id));
      await db.delete(questionSets).where(eq(questionSets.userId, id));
      const result = await db.delete(users).where(eq(users.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }
  // Admin management
  async getAdmin(id) {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return admin || void 0;
  }
  async getAdminByEmail(email) {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
    return admin || void 0;
  }
  async createAdmin(insertAdmin) {
    const [admin] = await db.insert(adminUsers).values(insertAdmin).returning();
    return admin;
  }
  // Board management
  async getAllBoards() {
    return await db.select().from(boards).where(eq(boards.isActive, true)).orderBy(boards.name);
  }
  async createBoard(insertBoard) {
    const [board] = await db.insert(boards).values(insertBoard).returning();
    return board;
  }
  async updateBoard(id, updates) {
    const [board] = await db.update(boards).set(updates).where(eq(boards.id, id)).returning();
    return board || void 0;
  }
  async getBoardByName(name) {
    const [board] = await db.select().from(boards).where(eq(boards.name, name));
    return board || void 0;
  }
  async deleteBoard(id) {
    const result = await db.delete(boards).where(eq(boards.id, id));
    return result.rowCount > 0;
  }
  // Wallet transactions
  async createWalletTransaction(insertTransaction) {
    const [transaction] = await db.insert(walletTransactions).values(insertTransaction).returning();
    return transaction;
  }
  async getUserTransactions(userId) {
    return await db.select().from(walletTransactions).where(eq(walletTransactions.userId, userId)).orderBy(desc(walletTransactions.createdAt));
  }
  async getTotalUserCount() {
    const result = await db.select({ count: sql2`cast(count(*) as int)` }).from(users);
    return result[0]?.count || 0;
  }
  async markUserIntroOfferUsed(userId) {
    const [user] = await db.update(users).set({ hasUsedIntroOffer: true }).where(eq(users.id, userId)).returning();
    return user || void 0;
  }
  // Subject and topic management
  async getSubjects(board, grade) {
    return await db.select().from(subjects).where(and(eq(subjects.board, board), eq(subjects.grade, grade)));
  }
  async getAllSubjects() {
    return await db.select().from(subjects).orderBy(subjects.board, subjects.grade, subjects.name);
  }
  async getSubjectsByBoard(boardId) {
    return await db.select().from(subjects).where(eq(subjects.boardId, boardId)).orderBy(subjects.grade, subjects.name);
  }
  async createSubject(insertSubject) {
    const [subject] = await db.insert(subjects).values(insertSubject).returning();
    return subject;
  }
  async updateSubject(id, updates) {
    const [subject] = await db.update(subjects).set(updates).where(eq(subjects.id, id)).returning();
    return subject || void 0;
  }
  async getSubjectByDetails(board, name, grade) {
    const [subject] = await db.select().from(subjects).where(
      and(eq(subjects.board, board), eq(subjects.name, name), eq(subjects.grade, grade))
    );
    return subject || void 0;
  }
  async deleteSubject(id) {
    const result = await db.delete(subjects).where(eq(subjects.id, id));
    return result.rowCount > 0;
  }
  async getTopicsBySubject(subjectId) {
    return await db.select().from(topics).where(eq(topics.subjectId, subjectId));
  }
  async getAllTopics() {
    return await db.select().from(topics);
  }
  async getTopicById(id) {
    const [topic] = await db.select().from(topics).where(eq(topics.id, id));
    return topic || void 0;
  }
  async createTopic(insertTopic) {
    console.log("Creating topic with data:", insertTopic);
    const [topic] = await db.insert(topics).values(insertTopic).returning();
    console.log("Database returned topic:", topic);
    return topic;
  }
  async updateTopic(id, updates) {
    const [topic] = await db.update(topics).set(updates).where(eq(topics.id, id)).returning();
    return topic || void 0;
  }
  async deleteTopic(id) {
    const result = await db.delete(topics).where(eq(topics.id, id));
    return result.rowCount > 0;
  }
  // AI Rules management
  async getAiRules() {
    return await db.select().from(aiRules).where(eq(aiRules.isActive, true));
  }
  async getAllAiRules() {
    return await db.select().from(aiRules).orderBy(aiRules.category, aiRules.subcategory);
  }
  async getAiRulesByCategory(category, subcategory) {
    if (subcategory) {
      return await db.select().from(aiRules).where(and(eq(aiRules.category, category), eq(aiRules.subcategory, subcategory), eq(aiRules.isActive, true)));
    }
    return await db.select().from(aiRules).where(and(eq(aiRules.category, category), eq(aiRules.isActive, true)));
  }
  async createAiRule(insertRule) {
    const [rule] = await db.insert(aiRules).values(insertRule).returning();
    return rule;
  }
  async updateAiRule(id, updates) {
    const [rule] = await db.update(aiRules).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(aiRules.id, id)).returning();
    return rule || void 0;
  }
  async updateAiRuleStatus(id, isActive) {
    return this.updateAiRule(id, { isActive });
  }
  async deleteAiRule(id) {
    const result = await db.delete(aiRules).where(eq(aiRules.id, id));
    return result.rowCount > 0;
  }
  // ===== TOPIC CONTENT METHODS =====
  async getAllTopicContent() {
    return await db.select().from(topicContent);
  }
  async getTopicContentByTopicId(topicId) {
    return await db.select().from(topicContent).where(eq(topicContent.topicId, topicId));
  }
  async getTopicContent(id) {
    const [content] = await db.select().from(topicContent).where(eq(topicContent.id, id));
    return content;
  }
  async createTopicContent(insertTopicContent) {
    const [content] = await db.insert(topicContent).values(insertTopicContent).returning();
    return content;
  }
  async updateTopicContent(id, data) {
    const [content] = await db.update(topicContent).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(topicContent.id, id)).returning();
    return content;
  }
  async deleteTopicContent(id) {
    const result = await db.delete(topicContent).where(eq(topicContent.id, id));
    return result.rowCount > 0;
  }
  async toggleTopicContentStatus(id, isActive) {
    const [content] = await db.update(topicContent).set({ isActive, updatedAt: /* @__PURE__ */ new Date() }).where(eq(topicContent.id, id)).returning();
    return content;
  }
  // Question sets (existing)
  async createQuestionSet(insertQuestionSet) {
    const [questionSet] = await db.insert(questionSets).values(insertQuestionSet).returning();
    return questionSet;
  }
  async getQuestionSet(id) {
    const [questionSet] = await db.select().from(questionSets).where(eq(questionSets.id, id));
    return questionSet || void 0;
  }
  async getQuestionSets(limit) {
    if (limit) {
      return await db.select().from(questionSets).orderBy(desc(questionSets.createdAt)).limit(limit);
    }
    return await db.select().from(questionSets).orderBy(desc(questionSets.createdAt));
  }
  async getUserQuestionSets(userId) {
    return await db.select().from(questionSets).where(eq(questionSets.userId, userId)).orderBy(desc(questionSets.createdAt));
  }
  // Training files (existing)
  async createTrainingFile(insertFile) {
    const [file] = await db.insert(trainingFiles).values(insertFile).returning();
    return file;
  }
  async getTrainingFiles() {
    return await db.select().from(trainingFiles).orderBy(desc(trainingFiles.uploadedAt));
  }
  async deleteTrainingFile(id) {
    const result = await db.delete(trainingFiles).where(eq(trainingFiles.id, id));
    return result.rowCount > 0;
  }
  // Bloom Sample Items management
  async getBloomSampleItems(filters) {
    let query = db.select().from(bloomSampleItems);
    if (filters?.bloomLevel) {
      query = query.where(eq(bloomSampleItems.bloomLevel, filters.bloomLevel));
    }
    return await query.orderBy(desc(bloomSampleItems.createdAt));
  }
  async getBloomSampleItem(id) {
    const [item] = await db.select().from(bloomSampleItems).where(eq(bloomSampleItems.id, id));
    return item || void 0;
  }
  async createBloomSampleItem(item) {
    const [created] = await db.insert(bloomSampleItems).values({
      ...item,
      isActive: true
      // Always enabled by default for AI reference
    }).returning();
    return created;
  }
  async updateBloomSampleItem(id, updates) {
    const [updated] = await db.update(bloomSampleItems).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(bloomSampleItems.id, id)).returning();
    if (!updated) {
      throw new Error(`Bloom sample item with id ${id} not found`);
    }
    return updated;
  }
  async deleteBloomSampleItem(id) {
    await db.delete(bloomSampleItems).where(eq(bloomSampleItems.id, id));
  }
  async toggleBloomSampleItemStatus(id, isActive) {
    const [updated] = await db.update(bloomSampleItems).set({ isActive, updatedAt: /* @__PURE__ */ new Date() }).where(eq(bloomSampleItems.id, id)).returning();
    if (!updated) {
      throw new Error(`Bloom sample item with id ${id} not found`);
    }
    return updated;
  }
};

// server/storage.ts
var MemStorage = class {
  users;
  adminUsers;
  walletTransactions;
  boards;
  subjects;
  topics;
  aiRules;
  bloomSampleItems;
  questionSets;
  trainingFiles;
  topicContent;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.adminUsers = /* @__PURE__ */ new Map();
    this.walletTransactions = /* @__PURE__ */ new Map();
    this.boards = /* @__PURE__ */ new Map();
    this.subjects = /* @__PURE__ */ new Map();
    this.topics = /* @__PURE__ */ new Map();
    this.aiRules = /* @__PURE__ */ new Map();
    this.bloomSampleItems = /* @__PURE__ */ new Map();
    this.questionSets = /* @__PURE__ */ new Map();
    this.trainingFiles = /* @__PURE__ */ new Map();
    this.topicContent = /* @__PURE__ */ new Map();
    this.initializeAdmin();
    this.initializeAiRules();
    this.initializeIndianEducationData();
  }
  async initializeAdmin() {
    const bcrypt3 = await import("bcryptjs");
    const hashedPassword = await bcrypt3.hash("Abutaleb@35", 10);
    const adminId = randomUUID();
    const admin = {
      id: adminId,
      email: "hassan.jobs07@gmail.com",
      password: hashedPassword,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.adminUsers.set(adminId, admin);
  }
  initializeAiRules() {
    const defaultRules = [
      {
        category: "global",
        subcategory: null,
        rules: `MANDATORY GLOBAL RULES: 1. Clarity & Brevity: Keep stems under 25 words; avoid double-negatives, jargon, or convoluted phrasing. 2. Alignment & Scope: Each item must align to a specific standard or learning objective; specify the standard code in metadata. 3. Grade-Appropriateness: Language, context, and stimulus complexity should match the intended grade band's reading level. 4. Unambiguous Wording: Avoid pronouns without clear antecedents; limit "all of the following except" structures. 5. Distractor Quality: All incorrect answer choices must be plausible misconceptions or common errors, equal in length and complexity to the correct answer. 6. Answer Choice Arrangement: For all question types, arrange answer options by character length (shortest to longest). Single-word or numerical options: sort alphabetically or numerically ascending. Phrase options (multiple words): use sentence case with lowercase initial letters; complete sentences must end with a period. 7. Scenario & Visual Requirement: Except for Recall (DOK 1) and Easy-level items, all questions must include a brief scenario/context and embed a relevant visual element (image, chart, table, or data snippet) in the stem.`
      },
      {
        category: "question_type",
        subcategory: "multiple_choice",
        rules: 'MULTIPLE CHOICE STANDARDS: Create exactly 4 options (A-D) with only one correct answer. Question stem must be a complete sentence ending with a question mark. All distractors must be plausible misconceptions representing common student errors. Arrange options by character length (shortest to longest). For numerical answers, sort in ascending order. Avoid "all of the above" or "none of the above" options. Ensure grammatical consistency between stem and all options.'
      },
      {
        category: "question_type",
        subcategory: "multiple_select",
        rules: 'MULTIPLE SELECT STANDARDS: Create exactly 6 options (A-F) with 2-4 correct answers (never just 1 or all 6). Clearly indicate in instructions that students must "Select all that apply." Each option should be grammatically parallel and of similar length. Correct answers should represent different aspects of the concept being tested. Incorrect options must be plausible but clearly wrong to knowledgeable students.'
      },
      {
        category: "question_type",
        subcategory: "fill_blanks",
        rules: "FILL-IN-THE-BLANK STANDARDS: Create 1-3 meaningful blanks that test key concepts, not trivial details. Each blank should have only one clearly correct answer. Provide sufficient context so the answer is unambiguous. Arrange multiple blanks logically within the sentence structure. Avoid blanks at the beginning of sentences. All blanks should be the same length (10-15 characters) regardless of answer length."
      },
      {
        category: "question_type",
        subcategory: "true_false",
        rules: 'TRUE/FALSE STANDARDS: Create clear, factual statements that are definitively true or false with no ambiguity. Avoid absolute terms like "always," "never," "all," unless factually accurate. Focus on significant concepts, not trivial details. Statement should be a single, complete sentence. Provide clear explanations for why the statement is true or false, addressing common misconceptions.'
      },
      {
        category: "question_type",
        subcategory: "matching",
        rules: "MATCHING STANDARDS: Create 4-5 clear pairs with unambiguous one-to-one relationships. All items in both columns should be grammatically parallel. Include one extra option in the second column to eliminate guessing. Arrange items in the first column logically (chronologically, alphabetically, or by complexity). Ensure all matches are clearly correct and defensible."
      },
      {
        category: "question_type",
        subcategory: "inline_choice",
        rules: "INLINE CHOICE STANDARDS: Embed 2-3 meaningful dropdown choices within sentences that test conceptual understanding. Each dropdown should have only one clearly correct answer. Options should be grammatically consistent with the sentence structure. Avoid making the sentence awkward or unnatural. Focus on key terminology or conceptual relationships."
      },
      {
        category: "bloom_level",
        subcategory: "remembering",
        rules: "REMEMBERING (DOK 1): Focus on direct recall of facts, terms, definitions, and basic concepts. Use action verbs: define, identify, list, name, state, recall, recognize. Questions should test memorized information without requiring analysis or application. Acceptable to use simple, direct questions without complex scenarios for this level only."
      },
      {
        category: "bloom_level",
        subcategory: "understanding",
        rules: "UNDERSTANDING (DOK 2): Test ability to explain ideas, concepts, or principles in own words. Use action verbs: explain, describe, interpret, summarize, paraphrase, classify, compare, exemplify. Questions must include brief scenarios or examples. Students should demonstrate comprehension beyond mere recall by explaining relationships or providing examples."
      },
      {
        category: "bloom_level",
        subcategory: "applying",
        rules: "APPLYING (DOK 2-3): Test ability to use learned information in new, concrete situations. Use action verbs: apply, demonstrate, solve, use, implement, execute, carry out. Must include realistic scenarios or problems where students apply procedures, methods, or principles. Context should be different from instructional examples but use same underlying concepts."
      },
      {
        category: "bloom_level",
        subcategory: "analyzing",
        rules: "ANALYZING (DOK 3-4): Test ability to break down information into component parts and examine relationships. Use action verbs: analyze, compare, contrast, examine, categorize, differentiate, distinguish, organize. Must provide complex scenarios, data sets, or multi-part stimuli for analysis. Students should identify patterns, relationships, or underlying structures."
      },
      {
        category: "bloom_level",
        subcategory: "evaluating",
        rules: "EVALUATING (DOK 4): Test ability to make informed judgments based on criteria and standards. Use action verbs: evaluate, critique, judge, justify, assess, appraise, defend, support. Must present scenarios requiring students to weigh evidence, assess validity, or make reasoned judgments. Include criteria or standards for evaluation within the question context."
      },
      {
        category: "bloom_level",
        subcategory: "creating",
        rules: "CREATING (DOK 4): Test ability to synthesize elements into coherent new patterns or structures. Use action verbs: create, design, construct, develop, formulate, plan, produce, generate. Present open-ended scenarios requiring original thinking or novel solutions. Students should combine elements in new ways or propose alternative solutions to problems."
      }
      // Removed difficulty level rules - difficulty feature removed
    ];
    defaultRules.forEach((rule) => {
      const id = randomUUID();
      const aiRule = {
        id,
        category: rule.category,
        subcategory: rule.subcategory,
        rules: rule.rules,
        isActive: true,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      this.aiRules.set(id, aiRule);
    });
  }
  initializeIndianEducationData() {
    const boards2 = [
      { name: "NCERT", fullName: "National Council of Educational Research and Training", description: "National curriculum framework" },
      { name: "CBSE", fullName: "Central Board of Secondary Education", description: "Central board for secondary education in India" },
      { name: "ICSE", fullName: "Indian Certificate of Secondary Education", description: "Council for the Indian School Certificate Examinations" },
      { name: "State Boards", fullName: "Various State Education Boards", description: "State-specific education boards across India" }
    ];
    boards2.forEach((board) => {
      const id = randomUUID();
      const boardData = {
        id,
        name: board.name,
        fullName: board.fullName,
        description: board.description,
        isActive: true,
        createdAt: /* @__PURE__ */ new Date()
      };
      this.boards.set(id, boardData);
    });
    const subjectsData = [
      // Primary Education (1-5)
      { name: "Hindi", board: "NCERT", grades: [1, 2, 3, 4, 5] },
      { name: "English", board: "NCERT", grades: [1, 2, 3, 4, 5] },
      { name: "Mathematics", board: "NCERT", grades: [1, 2, 3, 4, 5] },
      { name: "Environmental Studies", board: "NCERT", grades: [3, 4, 5] },
      // Middle School (6-8)
      { name: "Science", board: "NCERT", grades: [6, 7, 8, 9, 10] },
      { name: "Social Science", board: "NCERT", grades: [6, 7, 8, 9, 10] },
      { name: "Sanskrit", board: "NCERT", grades: [6, 7, 8, 9, 10] },
      // Secondary Education (9-10)
      { name: "Physics", board: "CBSE", grades: [11, 12] },
      { name: "Chemistry", board: "CBSE", grades: [11, 12] },
      { name: "Biology", board: "CBSE", grades: [11, 12] },
      { name: "Economics", board: "CBSE", grades: [9, 10, 11, 12] },
      { name: "History", board: "CBSE", grades: [9, 10, 11, 12] },
      { name: "Geography", board: "CBSE", grades: [9, 10, 11, 12] },
      { name: "Political Science", board: "CBSE", grades: [11, 12] },
      { name: "Computer Science", board: "CBSE", grades: [9, 10, 11, 12] },
      { name: "Business Studies", board: "CBSE", grades: [11, 12] },
      { name: "Accountancy", board: "CBSE", grades: [11, 12] }
    ];
    subjectsData.forEach((subjectData) => {
      subjectData.grades.forEach((grade) => {
        const id = randomUUID();
        const subject = {
          id,
          name: subjectData.name,
          board: subjectData.board,
          boardId: null,
          // Will be set later when we link to boards
          grade,
          description: `${subjectData.name} for Grade ${grade} - ${subjectData.board}`,
          isActive: true,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.subjects.set(id, subject);
        this.initializeTopicsForSubject(id, subjectData.name, grade);
      });
    });
  }
  initializeTopicsForSubject(subjectId, subjectName, grade) {
    const topicsMap = {
      "Mathematics": ["Algebra", "Geometry", "Trigonometry", "Statistics", "Probability"],
      "Physics": ["Mechanics", "Thermodynamics", "Optics", "Electromagnetism", "Modern Physics"],
      "Chemistry": ["Atomic Structure", "Chemical Bonding", "Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry"],
      "Biology": ["Cell Biology", "Genetics", "Evolution", "Ecology", "Human Physiology"],
      "English": ["Grammar", "Literature", "Writing Skills", "Reading Comprehension", "Poetry"],
      "Hindi": ["\u0935\u094D\u092F\u093E\u0915\u0930\u0923", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F", "\u0932\u0947\u0916\u0928 \u0915\u094C\u0936\u0932", "\u0917\u0926\u094D\u092F", "\u0915\u093E\u0935\u094D\u092F"],
      "Science": ["Plants and Animals", "Matter and Materials", "Natural Phenomena", "Environment"],
      "Social Science": ["History", "Geography", "Civics", "Economics"],
      "Computer Science": ["Programming", "Data Structures", "Algorithms", "Database", "Networking"]
    };
    const topics2 = topicsMap[subjectName] || ["Introduction", "Basic Concepts", "Advanced Topics"];
    topics2.forEach((topicName) => {
      const topicId = randomUUID();
      const topic = {
        id: topicId,
        name: topicName,
        subjectId,
        pdfFilename: null,
        createdAt: /* @__PURE__ */ new Date()
      };
      this.topics.set(topicId, topic);
    });
  }
  // Board management methods
  async getAllBoards() {
    return Array.from(this.boards.values());
  }
  async createBoard(insertBoard) {
    const id = randomUUID();
    const board = {
      ...insertBoard,
      id,
      isActive: insertBoard.isActive ?? true,
      description: insertBoard.description ?? null,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.boards.set(id, board);
    return board;
  }
  async updateBoard(id, updates) {
    const board = this.boards.get(id);
    if (!board) return void 0;
    const updatedBoard = { ...board, ...updates };
    this.boards.set(id, updatedBoard);
    return updatedBoard;
  }
  async deleteBoard(id) {
    return this.boards.delete(id);
  }
  async getBoardByName(name) {
    return Array.from(this.boards.values()).find((board) => board.name === name);
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByEmail(email) {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }
  async updateUserCoins(id, coins) {
    const user = this.users.get(id);
    if (!user) return void 0;
    const updatedUser = { ...user, coins };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  async getAllUsers() {
    return Array.from(this.users.values());
  }
  async updateUser(id, updates) {
    const user = this.users.get(id);
    if (!user) return void 0;
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  async updateUserStatus(id, isActive) {
    return this.updateUser(id, { isActive });
  }
  async deleteUser(id) {
    const exists = this.users.has(id);
    if (exists) {
      this.users.delete(id);
      for (const [txId, transaction] of Array.from(this.walletTransactions.entries())) {
        if (transaction.userId === id) {
          this.walletTransactions.delete(txId);
        }
      }
      for (const [qsId, questionSet] of Array.from(this.questionSets.entries())) {
        if (questionSet.userId === id) {
          this.questionSets.delete(qsId);
        }
      }
    }
    return exists;
  }
  // Admin management
  async getAdmin(id) {
    return this.adminUsers.get(id);
  }
  async getAdminByEmail(email) {
    return Array.from(this.adminUsers.values()).find(
      (admin) => admin.email === email
    );
  }
  async createAdmin(insertAdmin) {
    const id = randomUUID();
    const admin = {
      ...insertAdmin,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.adminUsers.set(id, admin);
    return admin;
  }
  // Wallet transactions
  async createWalletTransaction(insertTransaction) {
    const id = randomUUID();
    const transaction = {
      ...insertTransaction,
      id,
      razorpayPaymentId: insertTransaction.razorpayPaymentId ?? null,
      razorpayOrderId: insertTransaction.razorpayOrderId ?? null,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.walletTransactions.set(id, transaction);
    return transaction;
  }
  async getUserTransactions(userId) {
    return Array.from(this.walletTransactions.values()).filter((t) => t.userId === userId).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }
  async getTotalUserCount() {
    return this.users.size;
  }
  async markUserIntroOfferUsed(userId) {
    const user = this.users.get(userId);
    if (!user) return void 0;
    const updatedUser = { ...user, hasUsedIntroOffer: true };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  // Subject and topic management
  async getSubjects(board, grade) {
    return Array.from(this.subjects.values()).filter((s) => s.board === board && s.grade === grade);
  }
  async getAllSubjects() {
    return Array.from(this.subjects.values());
  }
  async getSubjectsByBoard(boardId) {
    return Array.from(this.subjects.values()).filter((subject) => subject.boardId === boardId);
  }
  async getSubjectByDetails(board, name, grade) {
    return Array.from(this.subjects.values()).find((s) => s.board === board && s.name === name && s.grade === grade);
  }
  async createSubject(insertSubject) {
    const id = randomUUID();
    const subject = {
      ...insertSubject,
      id,
      isActive: insertSubject.isActive ?? true,
      boardId: insertSubject.boardId ?? null,
      description: insertSubject.description ?? null,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.subjects.set(id, subject);
    return subject;
  }
  async updateSubject(id, updates) {
    const subject = this.subjects.get(id);
    if (!subject) return void 0;
    const updatedSubject = { ...subject, ...updates };
    this.subjects.set(id, updatedSubject);
    return updatedSubject;
  }
  async deleteSubject(id) {
    return this.subjects.delete(id);
  }
  async getTopicsBySubject(subjectId) {
    return Array.from(this.topics.values()).filter((t) => t.subjectId === subjectId);
  }
  async getAllTopics() {
    return Array.from(this.topics.values());
  }
  async getTopicById(id) {
    return this.topics.get(id);
  }
  async createTopic(insertTopic) {
    const id = randomUUID();
    const topic = {
      ...insertTopic,
      id,
      pdfFilename: insertTopic.pdfFilename ?? null,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.topics.set(id, topic);
    return topic;
  }
  async updateTopic(id, updates) {
    const topic = this.topics.get(id);
    if (!topic) return void 0;
    const updatedTopic = { ...topic, ...updates };
    this.topics.set(id, updatedTopic);
    return updatedTopic;
  }
  async deleteTopic(id) {
    return this.topics.delete(id);
  }
  // AI Rules management
  async getAiRules() {
    return Array.from(this.aiRules.values());
  }
  async getAllAiRules() {
    return Array.from(this.aiRules.values());
  }
  async getAiRulesByCategory(category, subcategory) {
    return Array.from(this.aiRules.values()).filter(
      (rule) => rule.category === category && (!subcategory || rule.subcategory === subcategory) && rule.isActive
    );
  }
  async createAiRule(insertRule) {
    const id = randomUUID();
    const rule = {
      ...insertRule,
      id,
      subcategory: insertRule.subcategory ?? null,
      isActive: insertRule.isActive ?? true,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.aiRules.set(id, rule);
    return rule;
  }
  async updateAiRule(id, updates) {
    const rule = this.aiRules.get(id);
    if (!rule) return void 0;
    const updatedRule = {
      ...rule,
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.aiRules.set(id, updatedRule);
    return updatedRule;
  }
  async updateAiRuleStatus(id, isActive) {
    return this.updateAiRule(id, { isActive });
  }
  async deleteAiRule(id) {
    return this.aiRules.delete(id);
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const user = {
      ...insertUser,
      id,
      coins: 500,
      // Free 500 coins on signup
      isActive: true,
      hasUsedIntroOffer: false,
      isEmailVerified: insertUser.isEmailVerified ?? false,
      emailVerificationToken: insertUser.emailVerificationToken ?? null,
      googleId: insertUser.googleId ?? null,
      profilePicture: insertUser.profilePicture ?? null,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.users.set(id, user);
    return user;
  }
  async getUserByGoogleId(googleId) {
    for (const user of this.users.values()) {
      if (user.googleId === googleId) {
        return user;
      }
    }
    return void 0;
  }
  async verifyUserEmail(token) {
    for (const user of this.users.values()) {
      if (user.emailVerificationToken === token) {
        user.isEmailVerified = true;
        user.emailVerificationToken = null;
        return user;
      }
    }
    return void 0;
  }
  async updateUserEmailVerificationToken(id, token) {
    const user = this.users.get(id);
    if (user) {
      user.emailVerificationToken = token;
      return user;
    }
    return void 0;
  }
  async setPasswordResetToken(email, token) {
    const user = Array.from(this.users.values()).find((u) => u.email === email);
    if (user) {
      user.passwordResetToken = token;
      user.passwordResetExpires = new Date(Date.now() + 24 * 60 * 60 * 1e3);
      return user;
    }
    return void 0;
  }
  async getUserByPasswordResetToken(token) {
    return Array.from(this.users.values()).find(
      (user) => user.passwordResetToken === token && user.passwordResetExpires && user.passwordResetExpires > /* @__PURE__ */ new Date()
    );
  }
  async resetUserPassword(id, newPassword) {
    const user = this.users.get(id);
    if (user) {
      user.password = newPassword;
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      return user;
    }
    return void 0;
  }
  async createQuestionSet(insertQuestionSet) {
    const id = randomUUID();
    const questionSet = {
      ...insertQuestionSet,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.questionSets.set(id, questionSet);
    return questionSet;
  }
  async getQuestionSet(id) {
    return this.questionSets.get(id);
  }
  async getQuestionSets(limit) {
    const sets = Array.from(this.questionSets.values()).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
    return limit ? sets.slice(0, limit) : sets;
  }
  async getUserQuestionSets(userId) {
    return Array.from(this.questionSets.values()).filter((q) => q.userId === userId).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }
  async createTrainingFile(insertFile) {
    const id = randomUUID();
    const file = {
      ...insertFile,
      id,
      grade: insertFile.grade ?? null,
      subject: insertFile.subject ?? null,
      topic: insertFile.topic ?? null,
      uploadedAt: /* @__PURE__ */ new Date()
    };
    this.trainingFiles.set(id, file);
    return file;
  }
  async getTrainingFiles() {
    return Array.from(this.trainingFiles.values()).sort((a, b) => (b.uploadedAt?.getTime() || 0) - (a.uploadedAt?.getTime() || 0));
  }
  async deleteTrainingFile(id) {
    return this.trainingFiles.delete(id);
  }
  // Topic Content methods
  async getAllTopicContent() {
    return Array.from(this.topicContent.values());
  }
  async getTopicContentByTopicId(topicId) {
    return Array.from(this.topicContent.values()).filter((content) => content.topicId === topicId);
  }
  async getTopicContent(id) {
    return this.topicContent.get(id);
  }
  async createTopicContent(content) {
    const id = randomUUID();
    const newContent = {
      id,
      ...content,
      isActive: content.isActive ?? true,
      fileSize: content.fileSize ?? null,
      contentType: content.contentType ?? "text/plain",
      fileName: content.fileName ?? null,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.topicContent.set(id, newContent);
    return newContent;
  }
  async updateTopicContent(id, data) {
    const existing = this.topicContent.get(id);
    if (!existing) {
      throw new Error(`Topic content with id ${id} not found`);
    }
    const updated = {
      ...existing,
      ...data,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.topicContent.set(id, updated);
    return updated;
  }
  async deleteTopicContent(id) {
    return this.topicContent.delete(id);
  }
  async toggleTopicContentStatus(id, isActive) {
    const existing = this.topicContent.get(id);
    if (!existing) {
      throw new Error(`Topic content with id ${id} not found`);
    }
    const updated = {
      ...existing,
      isActive,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.topicContent.set(id, updated);
    return updated;
  }
  // Bloom Sample Items management
  async getBloomSampleItems(filters) {
    const items = Array.from(this.bloomSampleItems.values());
    if (!filters) return items;
    return items.filter((item) => {
      if (filters.bloomLevel && item.bloomLevel !== filters.bloomLevel) return false;
      return true;
    });
  }
  async getBloomSampleItem(id) {
    return this.bloomSampleItems.get(id);
  }
  async createBloomSampleItem(item) {
    const id = randomUUID();
    const bloomSampleItem = {
      ...item,
      id,
      grade: item.grade || 1,
      // Default to grade 1 if not specified
      subject: item.subject || "General",
      // Default subject
      isActive: true,
      // Always enabled by default for AI reference
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.bloomSampleItems.set(id, bloomSampleItem);
    return bloomSampleItem;
  }
  async updateBloomSampleItem(id, updates) {
    const existing = this.bloomSampleItems.get(id);
    if (!existing) {
      throw new Error(`Bloom sample item with id ${id} not found`);
    }
    const updated = {
      ...existing,
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.bloomSampleItems.set(id, updated);
    return updated;
  }
  async deleteBloomSampleItem(id) {
    this.bloomSampleItems.delete(id);
  }
  async toggleBloomSampleItemStatus(id, isActive) {
    const existing = this.bloomSampleItems.get(id);
    if (!existing) {
      throw new Error(`Bloom sample item with id ${id} not found`);
    }
    const updated = {
      ...existing,
      isActive,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.bloomSampleItems.set(id, updated);
    return updated;
  }
};
var storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();

// server/services/openrouter.ts
import OpenAI from "openai";
function getOpenRouterClient() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  console.log(`OpenRouter API Key format: ${apiKey?.substring(0, 10)}...`);
  console.log(`API Key length: ${apiKey?.length}`);
  if (!apiKey) {
    throw new Error("OpenRouter API key is missing. Please provide a valid API key.");
  }
  return new OpenAI({
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": "https://eduassess-ai.replit.app",
      // Your site URL
      "X-Title": "EduAssess AI"
      // Your app name
    }
  });
}
async function generateQuestions(request) {
  const openai = getOpenRouterClient();
  let attempts = 0;
  const maxAttempts = 1;
  const validatedQuestions = [];
  while (validatedQuestions.length < request.questionCount && attempts < maxAttempts) {
    attempts++;
    console.log(`Generation attempt ${attempts} for ${request.questionCount - validatedQuestions.length} questions`);
    try {
      const prompt = await createQuestionPrompt({
        ...request,
        questionCount: request.questionCount - validatedQuestions.length
      });
      const response = await openai.chat.completions.create({
        model: "openai/gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert educational assessment creator specializing in Indian curriculum standards. Generate high-quality, curriculum-aligned questions based on the specified parameters. CRITICAL REQUIREMENT: Unless the cognitive level is 'Remembering', ALL questions MUST include a brief scenario/context and mention visual elements (charts, images, tables, diagrams). Follow all formatting and structural rules precisely. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      });
      const result = JSON.parse(response.choices[0].message.content || "{}");
      const generatedQuestions = result.questions || [];
      for (const question of generatedQuestions) {
        validatedQuestions.push(question);
        if (validatedQuestions.length >= request.questionCount) break;
      }
    } catch (error) {
      console.error(`Generation attempt ${attempts} failed:`, error);
      if (attempts >= maxAttempts) {
        throw new Error("Failed to generate questions. Please check your OpenRouter API key and try again.");
      }
    }
  }
  return validatedQuestions;
}
function generateGradeCognitiveGuidance(requestedGrade) {
  const gradeRanges = [
    { range: "1-2", description: "Elementary foundation level - Use simple, concrete concepts with basic vocabulary and single-step reasoning" },
    { range: "3-4", description: "Elementary intermediate level - Introduce multi-step thinking with familiar contexts and age-appropriate complexity" },
    { range: "5-6", description: "Elementary advanced level - Incorporate abstract thinking with structured reasoning and moderate complexity" },
    { range: "7-8", description: "Middle school level - Develop analytical thinking with increased complexity and cross-curricular connections" },
    { range: "9-10", description: "High school intermediate level - Apply sophisticated reasoning with real-world applications and nuanced understanding" },
    { range: "11-12", description: "High school advanced level - Demonstrate expert-level thinking with complex analysis and synthesis" }
  ];
  let guidance = `For Grade ${requestedGrade} students:
`;
  let currentRange = "";
  if (requestedGrade <= 2) currentRange = gradeRanges[0].description;
  else if (requestedGrade <= 4) currentRange = gradeRanges[1].description;
  else if (requestedGrade <= 6) currentRange = gradeRanges[2].description;
  else if (requestedGrade <= 8) currentRange = gradeRanges[3].description;
  else if (requestedGrade <= 10) currentRange = gradeRanges[4].description;
  else currentRange = gradeRanges[5].description;
  guidance += `\u2022 Current Grade Expectation: ${currentRange}
`;
  if (requestedGrade > 1) {
    guidance += `\u2022 If referencing lower grade samples: Increase vocabulary sophistication, add complexity layers, and expand reasoning depth
`;
  }
  if (requestedGrade < 12) {
    guidance += `\u2022 If referencing higher grade samples: Simplify language, reduce complexity steps, and use more concrete examples
`;
  }
  guidance += `\u2022 Cognitive Load Balance: Maintain the Bloom's level complexity while adjusting presentation difficulty for Grade ${requestedGrade}
`;
  guidance += `\u2022 Reading Level: Ensure vocabulary and sentence structure match Grade ${requestedGrade} comprehension level`;
  return guidance;
}
async function createQuestionPrompt(request) {
  const questionTypeInstructions = getQuestionTypeInstructions(request.itemType);
  const bloomLevelInstructions = getBloomLevelInstructions(request.bloomLevel);
  let aiRulesContent = "";
  let aiRulesContext = "";
  try {
    const aiRules2 = await storage.getAiRules();
    if (aiRules2 && aiRules2.length > 0) {
      const questionTypeRules = aiRules2.filter(
        (rule) => rule.category === "question_type" && rule.subcategory === request.itemType
      );
      const bloomLevelRules = aiRules2.filter(
        (rule) => rule.category === "bloom_level" && rule.subcategory === request.bloomLevel
      );
      const subjectRules = aiRules2.filter(
        (rule) => rule.category === "subject" && rule.subcategory.toLowerCase() === request.subject.toLowerCase()
      );
      const gradeRules = aiRules2.filter(
        (rule) => rule.category === "grade" && rule.subcategory === request.grade.toString()
      );
      const applicableRules = [
        ...questionTypeRules,
        ...bloomLevelRules,
        ...subjectRules,
        ...gradeRules
      ];
      if (applicableRules.length > 0) {
        const rulesText = applicableRules.map((rule) => `${rule.category}/${rule.subcategory}: ${rule.rules}`).join("\n");
        aiRulesContent = `

**MANDATORY AI RULES - Follow these rules strictly:**

${rulesText}

These rules must be followed exactly when generating questions.`;
        aiRulesContext = "\n- Questions must strictly follow the AI rules defined above";
      }
    }
  } catch (error) {
    console.log("AI Rules not found or error loading them:", error);
  }
  let bloomSamplesContent = "";
  let bloomSamplesContext = "";
  try {
    const bloomSamples = await storage.getBloomSampleItems({ bloomLevel: request.bloomLevel });
    if (bloomSamples && bloomSamples.length > 0) {
      const activeSamples = bloomSamples.filter((sample) => sample.isActive);
      if (activeSamples.length > 0) {
        const sortedSamples = activeSamples.sort((a, b) => {
          const aGrade = a.grade || 5;
          const bGrade = b.grade || 5;
          const aDistance = Math.abs(aGrade - request.grade);
          const bDistance = Math.abs(bGrade - request.grade);
          return aDistance - bDistance;
        });
        const selectedSamples = sortedSamples.slice(0, 3);
        const samplesText = selectedSamples.map((sample) => `- Grade ${sample.grade || 5} (${sample.subject || "Science"}): ${sample.sampleQuestion}`).join("\n");
        const gradeGuidance = generateGradeCognitiveGuidance(request.grade);
        bloomSamplesContent = `

**BLOOM'S COGNITIVE LEVEL REFERENCE - Study these examples to match the cognitive complexity and structure:**

${request.bloomLevel.toUpperCase()} Level Reference Examples:
${samplesText}

**GRADE-BASED COGNITIVE LOAD CONSIDERATION:**
${gradeGuidance}

IMPORTANT: Use these samples to understand:
1. The appropriate cognitive complexity for "${request.bloomLevel}" level at Grade ${request.grade}
2. The structural patterns (scenario + visual + question + options)
3. The depth of thinking required for Grade ${request.grade} students
4. How to adjust complexity based on the grade level while maintaining the Bloom's taxonomy level

Generate your questions in the requested format (${request.itemType}) while maintaining the same cognitive level but adjusting complexity appropriately for Grade ${request.grade} students.`;
        bloomSamplesContext = "\n- Use bloom sample items as cognitive level references with grade-appropriate complexity adjustment";
      }
    }
  } catch (error) {
    console.log("Bloom samples not found or error loading them:", error);
  }
  let topicContent2 = "";
  let topicContext = "";
  try {
    const topics2 = await storage.getAllTopics();
    const matchedTopic = topics2.find(
      (topic) => topic.name.toLowerCase() === request.topic.toLowerCase()
    );
    if (matchedTopic) {
      const topicContentData = await storage.getTopicContentByTopicId(matchedTopic.id);
      if (topicContentData && topicContentData.length > 0) {
        const contentTexts = topicContentData.filter((content) => content.isActive).map((content) => `${content.title}: ${content.content}`).join("\n\n");
        if (contentTexts.trim()) {
          topicContent2 = `

**ADMIN-CURATED CONTENT: Use this content as primary source:**

${contentTexts}

Prefer generating questions from this content when possible.`;
          topicContext = "\n- Prefer questions derived from the admin content provided above";
        }
      }
    }
  } catch (error) {
    console.log("No topic-specific content found, will use curriculum data or general knowledge");
  }
  let curriculumContent = "";
  let curriculumContext = "";
  if (!topicContent2.trim()) {
    try {
      const { curriculumData: curriculumData2 } = await Promise.resolve().then(() => (init_curriculum(), curriculum_exports));
      const subjectTopics = curriculumData2.topics[request.subject];
      if (subjectTopics) {
        const gradeRange = getGradeRange2(request.grade);
        const topicsForGrade = subjectTopics[gradeRange];
        if (topicsForGrade && topicsForGrade.includes(request.topic)) {
          curriculumContent = `

**CURRICULUM CONTENT: Base questions on standard curriculum for:**

Board: ${request.board}
Subject: ${request.subject}
Grade: ${request.grade}
Topic: ${request.topic}

Use standard curriculum knowledge for this topic.`;
          curriculumContext = "\n- Generate questions based on standard curriculum knowledge";
        }
      }
    } catch (error) {
      console.log("Curriculum data not available, will use AI general knowledge");
    }
  }
  let learningOutcomeSection = "";
  let learningOutcomeContext = "";
  if (request.learningOutcome && request.learningOutcome.trim()) {
    const actionVerbs = extractActionVerbs(request.learningOutcome);
    const verbInstruction = actionVerbs.length > 0 ? `The questions must focus primarily on the following action verbs from the learning outcome: ${actionVerbs.join(", ")}. Design questions that specifically test students' ability to perform these actions.` : `Focus on the key learning objective and ensure questions test the specific skill or knowledge described.`;
    learningOutcomeSection = `

**LEARNING OUTCOME/STANDARD - HIGHEST PRIORITY:**
${request.learningOutcome}

${verbInstruction}

All questions and answer choices must directly relate to demonstrating this learning outcome.`;
    learningOutcomeContext = "\n- Questions MUST align with and test the specific learning outcome provided";
  }
  let fallbackContent = "";
  if (!topicContent2.trim() && !curriculumContent.trim()) {
    fallbackContent = `

**GENERAL KNOWLEDGE MODE: Use AI knowledge as last resort:**

Generate questions using your general knowledge about the topic "${request.topic}" for ${request.subject} at Grade ${request.grade} level.`;
  }
  return `
Generate ${request.questionCount} assessment questions for the following parameters:

Board: ${request.board.toUpperCase()}
Grade: ${request.grade}
Subject: ${request.subject}
Topic: ${request.topic}
Question Type: ${request.itemType}
Bloom's Taxonomy Level: ${request.bloomLevel}${learningOutcomeSection}${aiRulesContent}${bloomSamplesContent}${topicContent2}${curriculumContent}${fallbackContent}

${questionTypeInstructions}

${bloomLevelInstructions}

**MANDATORY QUESTION GENERATION RULES - Follow these rules strictly:**

1. **Clarity & Brevity**: Avoid double-negatives, jargon, or convoluted phrasing
2. **Alignment & Scope**: Each question must align to Grade ${request.grade} ${request.board.toUpperCase()} curriculum standards
3. **Grade-Appropriateness**: Language, context, and stimulus complexity must match Grade ${request.grade} reading level
4. **Unambiguous Wording**: Avoid pronouns without clear antecedents; avoid "all of the following except" structures
5. **Distractor Quality**: All incorrect answer choices must be plausible misconceptions or common errors, equal in length and complexity to the correct answer
6. **Answer Choice Arrangement**: For ALL question types, arrange answer options by character length (shortest to longest)
   - Single-word or numerical options: sort alphabetically or numerically ascending
   - Phrase options (multiple words): use sentence case with lowercase initial letters; complete sentences must end with a period
7. **SCENARIO & VISUAL REQUIREMENT - MANDATORY**: Except for Remembering level items, ALL questions MUST include:
   - A brief scenario/context that sets up the question
   - Explicit mention of a visual element (image, chart, table, diagram, or data snippet) in the question stem
   - The visual element should be integral to answering the question, not decorative
8. **Figure Reference Restriction**: ABSOLUTELY FORBIDDEN - Do not refer to any numbered figures, tables, or diagrams from content (e.g., "Figure 1", "Fig. 12.4", "Table 5.1", "Diagram 3.2"); instead use descriptive references (e.g., "the diagram showing", "the chart that displays", "the data table containing")
9. **Character Naming Rules - MANDATORY**: NEVER use specific character names from books, stories, or cultural references. Instead, use generic, gender-neutral terms such as:
   - "Student X and Student Y"
   - "A researcher and their colleague"
   - "Two scholars"
   - "The learner"
   - "A scientist"
   - "The observer"
   - "Student A, Student B, Student C" (for multiple characters)
   - "A team of students"
   - "The investigator"
   Use these neutral references consistently throughout the question.
10. **STRICTLY PROHIBITED OPTIONS**: NEVER use any of these option types as answer choices for any question type:
   - 'All of the above' / 'All of these' / 'All correct' / 'All are true'
   - 'None of the above' / 'None of these' / 'None correct' / 'All are false'
   - 'Both A and B' / 'Both A and C' / 'All except A' / 'All but one'
   - Any variation that refers to other options instead of providing substantive content
   - Each option must stand alone with specific, meaningful content
11. **Positive Phrasing**: Avoid making negative questions with NOT in the question stem

**CONTENT REQUIREMENTS:**
- **PRIORITY ORDER**: Follow Learning Outcome > AI Rules > Admin Content > Bloom Samples (with grade adjustment) > Curriculum Data > General Knowledge
- Questions must test the "${request.bloomLevel}" cognitive level exactly while adjusting complexity for Grade ${request.grade}
- **GRADE-BASED COGNITIVE LOAD**: When referencing Bloom samples from different grades, adjust complexity appropriately:
  - If sample is from lower grade: Increase vocabulary sophistication and reasoning depth
  - If sample is from higher grade: Simplify language and reduce complexity steps
  - Always maintain the Bloom's taxonomy level while adapting to Grade ${request.grade} comprehension
- Content must align with ${request.board.toUpperCase()} curriculum standards
- Provide accurate and educationally sound content
- Each question should be appropriate for Grade ${request.grade} students
- Provide confidence score (0-100) for question quality${learningOutcomeContext}${aiRulesContext}${bloomSamplesContext}${topicContext}${curriculumContext}

Respond with JSON in this exact format:

For Multiple Choice and Multiple Select questions, include both options and individual explanations:

{
  "questions": [
    {
      "id": "unique_id",
      "type": "${request.itemType}",
      "question": "Question text here",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"], // For multiple choice (4 options) or multiple select (6 options A-F)
      "correctAnswer": "A", // String for single answer, array like ["A","B","C"] for multiple select
      "optionExplanations": {
        "A": "Correct. Brief explanation of why this option is right",
        "B": "Incorrect. Brief explanation of why this option is wrong", 
        "C": "Incorrect. Brief explanation of why this option is wrong",
        "D": "Incorrect. Brief explanation of why this option is wrong"
      }, // Include explanations for each option letter starting with Correct./Incorrect.
      "explanation": "Brief overall explanation (optional)",
      "bloomLevel": "${request.bloomLevel}",
      "confidence": 85
    }
  ]
}
`;
}
function getQuestionTypeInstructions(itemType) {
  const instructions = {
    multiple_choice: "**MULTIPLE CHOICE RULES:** Four options (A\u2013D) with correct answer randomly positioned. Create at least one distractor numerically close (math) or textually similar (ELA). Stem must be complete and independent - avoid 'Which of the following...' without context. Never use absolutes ('always,' 'never') as correct answers. **MANDATORY FOR NON-REMEMBERING LEVELS: Include scenario paragraph that references a specific visual element (chart, image, table, diagram) that students must analyze to answer the question.** Arrange options by character length (shortest to longest). Provide explanations starting with 'Correct.' or 'Incorrect.'",
    multiple_select: "**MULTIPLE SELECT RULES:** Six options (A\u2013F) with exactly 2\u20134 correct answers. Correct answers should not be clustered together. Incorrect choices must be clearly wrong under scrutiny. Specify 'Select all that apply' in instructions. **MANDATORY FOR NON-REMEMBERING LEVELS: Embed scenario that explicitly references a data table, graphic, or visual element that students must interpret.** Arrange options by character length (shortest to longest). Provide explanations starting with 'Correct.' or 'Incorrect.'",
    fill_blanks: "**FILL BLANKS RULES:** Target critical vocabulary or numerical values in blanks. Avoid blanks at sentence start or end. Limit each blank to one concept. Provide exact strings and list alternate valid spellings. **MANDATORY FOR NON-REMEMBERING LEVELS: Include brief scenario that references a data table, annotated diagram, or visual element in the stem.**",
    inline_choice: "**INLINE CHOICE RULES:** Exactly 3 options per blank, labeled (A), (B), (C). All choices must grammatically and contextually fit the sentence. Each choice tests a distinct nuance. **MANDATORY FOR NON-REMEMBERING LEVELS: Embed scenario that references a chart, image, or visual element alongside the sentence.**",
    matching: "**MATCHING RULES:** 4\u20135 pairs with left/right columns equal in difficulty. One-to-one mapping with no duplicate matches. All items must be in same domain (vocab \u2192 definition). **MANDATORY FOR NON-REMEMBERING LEVELS: Provide scenario that references a labeled diagram, data table, or visual element to match against.** Arrange items by character length within each column.",
    true_false: "**TRUE/FALSE RULES:** Each statement must be 100% true or false - no mixed logic or compound statements. Use qualifiers only when accurate. In a set, aim for equal true/false balance. **MANDATORY FOR NON-REMEMBERING LEVELS: Present scenario that references a chart, image, or visual element and ask T/F statements about it.** Provide explanations for both A (True) and B (False) starting with 'Correct.' or 'Incorrect.'"
  };
  return instructions[itemType] || instructions.multiple_choice;
}
function getBloomLevelInstructions(bloomLevel) {
  const instructions = {
    remembering: "**REMEMBERING RULES:** Focus on key vocabulary, dates, formulas, definitions. Use verbs like define, list, identify. Provide minimal stimulus\u2014single term or very short context. No complex visuals required.",
    understanding: "**UNDERSTANDING RULES:** Focus on conceptual explanation, paraphrasing, or explaining relationships. Use verbs like explain, describe, summarize. **MANDATORY: Include brief scenario that references diagrams, charts, images, or visual elements for students to interpret.** Present short passages or scenarios that require visual analysis.",
    applying: "**APPLYING RULES:** Create real-world context scenarios where learners apply principles to new situations. Use verbs like apply, solve, demonstrate. Specify needed procedures or calculations clearly. **MANDATORY: Include scenario that explicitly references diagrams, charts, tables, or data excerpts that represent the problem situation.**",
    analyzing: "**ANALYZING RULES:** Provide complex stimulus like short passages, data tables, or graphic organizers requiring breakdown. Use verbs like analyze, compare, deconstruct. Ask students to cite parts of the stimulus as evidence. **MANDATORY: Include scenario with annotated graphs, diagrams, data tables, or visual elements that illustrate relationships and require analysis.**",
    evaluating: "**EVALUATING RULES:** Create comparison scenarios with two distinct options/sites/methods that students must judge and select the better choice. Structure: 1) Brief scenario setup, 2) [Image Description: ...] showing contrasting visual elements for each option, 3) Question asking which is better and why, 4) Four options where correct answer explains why the better choice works and incorrect options contain plausible misconceptions. Use verbs like evaluate, critique, justify, compare effectiveness. **MANDATORY: Include detailed image description in brackets showing contrasting visual elements that students must analyze to make judgments.**",
    creating: "**CREATING RULES:** Design open-ended tasks generating original responses\u2014designs, plans, compositions. Use verbs like create, design, formulate. Provide success criteria/rubrics for originality and alignment. **MANDATORY: Include scenario that references prototype images, sample data, charts, or visual elements that inform the creation task.**"
  };
  return instructions[bloomLevel] || instructions.understanding;
}
function extractActionVerbs(learningOutcome) {
  const educationalVerbs = [
    "analyze",
    "apply",
    "argue",
    "assess",
    "classify",
    "compare",
    "contrast",
    "create",
    "define",
    "demonstrate",
    "describe",
    "design",
    "determine",
    "develop",
    "differentiate",
    "discuss",
    "distinguish",
    "evaluate",
    "examine",
    "explain",
    "identify",
    "illustrate",
    "implement",
    "interpret",
    "investigate",
    "justify",
    "list",
    "organize",
    "plan",
    "predict",
    "prove",
    "recognize",
    "recommend",
    "solve",
    "summarize",
    "support",
    "synthesize",
    "understand",
    "use",
    "validate",
    "verify"
  ];
  const words = learningOutcome.toLowerCase().split(/\s+/);
  const foundVerbs = [];
  for (const word of words) {
    const cleanWord = word.replace(/[^\w]/g, "");
    if (educationalVerbs.includes(cleanWord)) {
      foundVerbs.push(cleanWord);
    }
  }
  return Array.from(new Set(foundVerbs));
}
function getGradeRange2(grade) {
  if (grade >= 1 && grade <= 5) return "1-5";
  if (grade >= 6 && grade <= 8) return "6-8";
  if (grade >= 9 && grade <= 10) return "9-10";
  if (grade >= 11 && grade <= 12) return "11-12";
  return "6-8";
}

// server/routes.ts
init_curriculum();
init_schema();

// server/middleware/auth.ts
import jwt from "jsonwebtoken";
var JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
function authenticateUser(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
function authenticateAdmin(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "Admin access token required" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid admin token" });
  }
}
function generateUserToken(user) {
  return jwt.sign({
    id: user.id,
    email: user.email,
    name: user.name,
    coins: user.coins,
    type: "user"
  }, JWT_SECRET, { expiresIn: "7d" });
}
function generateAdminToken(admin) {
  return jwt.sign({
    id: admin.id,
    email: admin.email,
    type: "admin"
  }, JWT_SECRET, { expiresIn: "7d" });
}

// server/routes/auth.ts
import { Router } from "express";
import bcrypt2 from "bcryptjs";
init_schema();

// server/services/emailService.ts
import nodemailer from "nodemailer";
var EmailService = class {
  transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_PORT === "465",
      // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  getBaseUrl() {
    return "https://xed21.com";
  }
  async sendVerificationEmail(email, verificationToken) {
    try {
      console.log(`[sendVerificationEmail] Sending verification for ${email} with token: ${verificationToken}`);
      const baseUrl = this.getBaseUrl();
      const verificationUrl = `${baseUrl}/api/auth/verify-email/${verificationToken}`;
      const mailOptions = {
        from: `"Xed21 - Education Platform" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verify Your Email Address - Xed21",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification - Xed21</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2563eb; font-size: 28px; margin: 0; font-weight: bold;">Xed21</h1>
                <p style="color: #6b7280; font-size: 16px; margin: 5px 0 0 0;">AI-Powered Education Platform</p>
              </div>

              <!-- Main Content -->
              <div style="text-align: center;">
                <h2 style="color: #1f2937; font-size: 24px; margin-bottom: 20px;">Verify Your Email Address</h2>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                  Thank you for signing up with Xed21! To complete your registration and start generating AI-powered educational questions, please verify your email address by clicking the button below.
                </p>

                <!-- Verification Button -->
                <div style="margin: 30px 0;">
                  <a href="${verificationUrl}" 
                     style="display: inline-block; background-color: #2563eb; color: white; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    Verify Email Address
                  </a>
                </div>

                <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
                  If the button doesn't work, you can copy and paste this link into your browser:
                </p>
                
                <p style="color: #2563eb; font-size: 14px; word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px; margin-bottom: 30px;">
                  ${verificationUrl}
                </p>

                <!-- Welcome Benefits -->
                <div style="background-color: #f0f9ff; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
                  <h3 style="color: #1e40af; font-size: 18px; margin: 0 0 10px 0;">\u{1F389} Welcome Bonus!</h3>
                  <p style="color: #1e40af; font-size: 14px; margin: 0;">
                    After verification, you'll receive <strong>500 free coins</strong> to start generating questions!
                  </p>
                </div>
              </div>

              <!-- Footer -->
              <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
                <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0;">
                  This verification link will expire in 24 hours for security reasons.
                </p>
                <p style="color: #6b7280; font-size: 12px; margin: 0;">
                  If you didn't create an account with Xed21, please ignore this email.
                </p>
                <div style="margin-top: 15px;">
                  <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                    \xA9 2025 Xed21. All rights reserved. | 
                    <a href="mailto:contact@xed21.com" style="color: #2563eb; text-decoration: none;">contact@xed21.com</a> | 
                    +91 9435358512
                  </p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
Welcome to Xed21!

Please verify your email address to complete your registration.

Verification Link: ${verificationUrl}

After verification, you'll receive 500 free coins to start generating AI-powered educational questions!

This link will expire in 24 hours.

If you didn't create an account with Xed21, please ignore this email.

Contact us: contact@xed21.com | +91 9435358512
\xA9 2025 Xed21. All rights reserved.
        `
      };
      await this.transporter.sendMail(mailOptions);
      console.log(`Verification email sent to: ${email}`);
      return true;
    } catch (error) {
      console.error("Error sending verification email:", error);
      return false;
    }
  }
  async sendPasswordResetEmail(email, resetToken) {
    try {
      const baseUrl = this.getBaseUrl();
      const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
      const mailOptions = {
        from: `"Xed21 - Education Platform" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Reset Your Password - Xed21",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset - Xed21</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2563eb; font-size: 28px; margin: 0; font-weight: bold;">Xed21</h1>
                <p style="color: #6b7280; font-size: 16px; margin: 5px 0 0 0;">AI-Powered Education Platform</p>
              </div>

              <!-- Main Content -->
              <div style="text-align: center;">
                <h2 style="color: #1f2937; font-size: 24px; margin-bottom: 20px;">Reset Your Password</h2>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                  We received a request to reset your password. Click the button below to create a new password for your Xed21 account. This link will expire in 1 hour for security reasons.
                </p>

                <!-- Reset Button -->
                <div style="margin: 30px 0;">
                  <a href="${resetUrl}" 
                     style="display: inline-block; background-color: #dc2626; color: white; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    Reset My Password
                  </a>
                </div>

                <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0; text-align: left;">
                  <p style="color: #92400e; margin: 0; font-size: 14px;">
                    <strong>Security Note:</strong> If you didn't request this password reset, please ignore this email. Your account remains secure and no changes have been made.
                  </p>
                </div>

                <!-- Alternative Link -->
                <div style="margin: 30px 0;">
                  <p style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">Or copy and paste this link into your browser:</p>
                  <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; padding: 12px; word-break: break-all;">
                    <span style="color: #374151; font-size: 12px;">${resetUrl}</span>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 40px; text-align: center;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  This password reset link expires in 1 hour.<br>
                  If you have any questions, contact our support team.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Reset Your Password - Xed21

We received a request to reset your password. Click the link below to create a new password for your Xed21 account:

${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email. Your account remains secure and no changes have been made.

---
Xed21 - AI-Powered Education Platform`
      };
      await this.transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to: ${email}`);
      return true;
    } catch (error) {
      console.error("Error sending password reset email:", error);
      return false;
    }
  }
  async sendWelcomeEmail(email, firstName) {
    try {
      const baseUrl = this.getBaseUrl();
      const mailOptions = {
        from: `"Xed21 - Education Platform" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Welcome to Xed21 - Your AI Learning Journey Begins! \u{1F393}",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Xed21</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2563eb; font-size: 28px; margin: 0; font-weight: bold;">Xed21</h1>
                <p style="color: #6b7280; font-size: 16px; margin: 5px 0 0 0;">AI-Powered Education Platform</p>
              </div>

              <!-- Main Content -->
              <div style="text-align: center;">
                <h2 style="color: #1f2937; font-size: 24px; margin-bottom: 20px;">
                  Welcome${firstName ? ` ${firstName}` : ""}! \u{1F389}
                </h2>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                  Your email has been successfully verified and your account is now active! You've received <strong>500 coins</strong> to start your AI-powered learning journey.
                </p>

                <!-- Features -->
                <div style="text-align: left; margin: 30px 0;">
                  <h3 style="color: #1f2937; font-size: 18px; margin-bottom: 20px; text-align: center;">What you can do with Xed21:</h3>
                  
                  <div style="margin-bottom: 15px;">
                    <strong style="color: #2563eb;">\u{1F4DD} Generate Questions:</strong>
                    <span style="color: #4b5563;"> Create AI-powered educational questions across all Indian education boards (CBSE, ICSE)</span>
                  </div>
                  
                  <div style="margin-bottom: 15px;">
                    <strong style="color: #2563eb;">\u{1F3AF} Bloom's Taxonomy:</strong>
                    <span style="color: #4b5563;"> Target specific cognitive levels from Remembering to Creating</span>
                  </div>
                  
                  <div style="margin-bottom: 15px;">
                    <strong style="color: #2563eb;">\u{1F4DA} 6 Question Types:</strong>
                    <span style="color: #4b5563;"> Multiple Choice, Multiple Select, Fill Blanks, True/False, Matching, and Inline Choice</span>
                  </div>
                  
                  <div style="margin-bottom: 15px;">
                    <strong style="color: #2563eb;">\u{1F4B0} Coin System:</strong>
                    <span style="color: #4b5563;"> Affordable pricing starting from 5 coins per question</span>
                  </div>
                </div>

                <!-- CTA Button -->
                <div style="margin: 30px 0;">
                  <a href="${baseUrl}/dashboard" 
                     style="display: inline-block; background-color: #2563eb; color: white; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    Start Generating Questions
                  </a>
                </div>
              </div>

              <!-- Footer -->
              <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
                <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0;">
                  Need help? Contact our support team at contact@xed21.com
                </p>
                <div style="margin-top: 15px;">
                  <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                    \xA9 2025 Xed21. All rights reserved. | 
                    <a href="mailto:contact@xed21.com" style="color: #2563eb; text-decoration: none;">contact@xed21.com</a> | 
                    +91 9435358512
                  </p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
Welcome${firstName ? ` ${firstName}` : ""} to Xed21!

Your email has been successfully verified and your account is now active! You've received 500 coins to start your AI-powered learning journey.

What you can do with Xed21:
- Generate AI-powered educational questions across all Indian education boards
- Target specific cognitive levels using Bloom's Taxonomy
- Create 6 different question types
- Affordable pricing starting from 5 coins per question

Start generating questions: ${baseUrl}/dashboard

Need help? Contact us at contact@xed21.com | +91 9435358512
\xA9 2025 Xed21. All rights reserved.
        `
      };
      await this.transporter.sendMail(mailOptions);
      console.log(`Welcome email sent to: ${email}`);
      return true;
    } catch (error) {
      console.error("Error sending welcome email:", error);
      return false;
    }
  }
};
var emailService = new EmailService();

// server/services/googleAuth.ts
import { OAuth2Client } from "google-auth-library";
var GoogleAuthService = class {
  client;
  constructor() {
    this.client = new OAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI || "https://xed21.com/api/auth/google/callback"
    });
  }
  getAuthUrl() {
    return this.client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile"
      ]
    });
  }
  async verifyIdToken(idToken) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      const payload = ticket.getPayload();
      if (!payload) return null;
      return {
        id: payload.sub,
        email: payload.email || "",
        name: payload.name || "",
        picture: payload.picture
      };
    } catch (error) {
      console.error("Error verifying Google ID token:", error);
      return null;
    }
  }
  async exchangeCodeForTokens(code) {
    try {
      const { tokens } = await this.client.getToken(code);
      this.client.setCredentials(tokens);
      if (!tokens.id_token) {
        throw new Error("No ID token received");
      }
      return await this.verifyIdToken(tokens.id_token);
    } catch (error) {
      console.error("Error exchanging code for tokens:", error);
      return null;
    }
  }
  isConfigured() {
    return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  }
};
var googleAuthService = new GoogleAuthService();

// server/routes/auth.ts
var router = Router();
router.post("/signup", async (req, res) => {
  console.log("[SIGNUP] Signup request received:", req.body);
  try {
    const validation = signupSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid input data",
        details: validation.error.errors
      });
    }
    const { name, email, password, phone } = validation.data;
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      if (existingUser.isEmailVerified) {
        return res.status(409).json({
          success: false,
          error: "Account with this email already exists",
          existingUser: true,
          emailVerified: true,
          showPasswordReset: true
        });
      } else {
        return res.status(409).json({
          success: false,
          error: "Account with this email exists but is not verified",
          existingUser: true,
          emailVerified: false,
          showResendVerification: true
        });
      }
    }
    const hashedPassword = await bcrypt2.hash(password, 10);
    const verificationToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    console.log(`[signup] Generated verification token for ${email}: ${verificationToken}`);
    const user = await storage.createUser({
      name,
      email,
      password: hashedPassword,
      phone,
      isEmailVerified: false,
      // Email needs verification
      emailVerificationToken: verificationToken,
      googleId: null,
      profilePicture: null
    });
    const emailSent = await emailService.sendVerificationEmail(email, verificationToken);
    if (!emailSent) {
      console.error("Failed to send verification email to:", email);
      return res.status(500).json({
        success: false,
        error: "Failed to send verification email. Please try again later."
      });
    }
    console.log(`Verification email sent to: ${email}`);
    res.json({
      success: true,
      message: "Account created successfully! Please check your email and click the verification link to activate your account.",
      requiresVerification: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        coins: user.coins,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});
router.post("/login", async (req, res) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid input data",
        details: validation.error.errors
      });
    }
    const { email, password } = validation.data;
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }
    if (!user.password) {
      return res.status(401).json({
        success: false,
        error: "Please sign in with Google or reset your password"
      });
    }
    const isValidPassword = await bcrypt2.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }
    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        error: "Please verify your email address before logging in"
      });
    }
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: "Account is suspended"
      });
    }
    const token = generateUserToken(user);
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});
router.get("/verify-email/:token", async (req, res) => {
  try {
    const { token } = req.params;
    console.log(`Verifying email with token: ${token}`);
    const user = await storage.verifyUserEmail(token);
    if (!user) {
      console.log(`Verification failed: No user found with token: ${token}`);
      return res.status(400).json({
        success: false,
        error: "Invalid or expired verification token"
      });
    }
    console.log(`Email verification successful for user: ${user.email}`);
    const updatedUser = await storage.updateUserCoins(user.id, 500);
    await emailService.sendWelcomeEmail(user.email, user.name);
    const authToken = generateUserToken(user);
    const redirectUrl = `${req.protocol}://${req.get("host")}/verification-success?token=${authToken}&verified=true&coins=500`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required"
      });
    }
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        error: "Email is already verified"
      });
    }
    const verificationToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    console.log(`[resend-verification] Generated new token for ${email}: ${verificationToken}`);
    await storage.updateUserEmailVerificationToken(user.id, verificationToken);
    console.log(`[resend-verification] Updated user token in database for ${email}`);
    const emailSent = await emailService.sendVerificationEmail(email, verificationToken);
    if (!emailSent) {
      console.error("Failed to resend verification email to:", email);
      return res.status(500).json({
        success: false,
        error: "Failed to send verification email. Please try again later."
      });
    }
    console.log(`Verification email resent to: ${email}`);
    res.json({
      success: true,
      message: "Verification email sent successfully! Please check your email and click the verification link."
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});
router.get("/profile", authenticateUser, async (req, res) => {
  try {
    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});
router.post("/admin/login", async (req, res) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid input data",
        details: validation.error.errors
      });
    }
    const { email, password } = validation.data;
    const admin = await storage.getAdminByEmail(email);
    if (!admin) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }
    const isValidPassword = await bcrypt2.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }
    const token = generateAdminToken(admin);
    const { password: _, ...adminWithoutPassword } = admin;
    res.json({
      success: true,
      token,
      admin: adminWithoutPassword
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});
router.get("/admin/profile", authenticateAdmin, async (req, res) => {
  try {
    const admin = await storage.getAdmin(req.user.id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        error: "Admin not found"
      });
    }
    const { password: _, ...adminWithoutPassword } = admin;
    res.json({
      success: true,
      admin: adminWithoutPassword
    });
  } catch (error) {
    console.error("Admin profile error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});
router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== "string") {
      const baseUrl2 = "https://xed21.com";
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: #dc2626;">Invalid Verification Link</h2>
            <p>The verification token is missing or invalid.</p>
            <a href="${baseUrl2}" style="color: #2563eb;">Return to Home</a>
          </body>
        </html>
      `);
    }
    const user = await storage.verifyUserEmail(token);
    if (!user) {
      const baseUrl2 = "https://xed21.com";
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: #dc2626;">Invalid or Expired Link</h2>
            <p>This verification link is invalid or has already been used.</p>
            <a href="${baseUrl2}" style="color: #2563eb;">Return to Home</a>
          </body>
        </html>
      `);
    }
    const updatedUser = await storage.updateUserCoins(user.id, 500);
    await emailService.sendWelcomeEmail(user.email, user.name);
    const baseUrl = "https://xed21.com";
    res.send(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: #059669;">Email Verified Successfully!</h2>
          <p>Your email has been verified and you've received 500 welcome coins! You can now log in to your account.</p>
          <a href="${baseUrl}" style="color: #2563eb; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px;">Go to Login</a>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Email verification error:", error);
    const baseUrl = "https://xed21.com";
    res.status(500).send(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: #dc2626;">Verification Failed</h2>
          <p>An error occurred during email verification. Please try again.</p>
          <a href="${baseUrl}" style="color: #2563eb;">Return to Home</a>
        </body>
      </html>
    `);
  }
});
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required"
      });
    }
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        error: "Email is already verified"
      });
    }
    const newToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    await storage.updateUserEmailVerificationToken(user.id, newToken);
    await emailService.sendVerificationEmail(user.email, newToken);
    res.json({
      success: true,
      message: "Verification email sent successfully"
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send verification email"
    });
  }
});
router.get("/google", (req, res) => {
  if (!googleAuthService.isConfigured()) {
    return res.status(501).json({
      success: false,
      error: "Google OAuth is not configured"
    });
  }
  const authUrl = googleAuthService.getAuthUrl();
  res.redirect(authUrl);
});
router.get("/google/callback", async (req, res) => {
  try {
    const { code } = req.query;
    if (!code || typeof code !== "string") {
      return res.redirect(`https://xed21.com?error=oauth_cancelled`);
    }
    const googleUser = await googleAuthService.exchangeCodeForTokens(code);
    if (!googleUser) {
      return res.redirect(`https://xed21.com?error=oauth_failed`);
    }
    let user = await storage.getUserByGoogleId(googleUser.id);
    if (!user) {
      const existingUser = await storage.getUserByEmail(googleUser.email);
      if (existingUser) {
        user = await storage.updateUser(existingUser.id, {
          googleId: googleUser.id,
          profilePicture: googleUser.picture,
          isEmailVerified: true
          // Google emails are pre-verified
        });
      } else {
        user = await storage.createUser({
          name: googleUser.name,
          email: googleUser.email,
          googleId: googleUser.id,
          profilePicture: googleUser.picture,
          isEmailVerified: true,
          password: null
          // No password for Google OAuth users
        });
      }
    }
    if (!user) {
      return res.redirect(`https://xed21.com?error=account_creation_failed`);
    }
    const token = generateUserToken(user);
    res.redirect(`https://xed21.com?token=${token}&google_auth=success`);
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    res.redirect(`https://xed21.com?error=oauth_error`);
  }
});
router.post("/google-signin", async (req, res) => {
  try {
    const validation = googleOAuthSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid Google user data",
        details: validation.error.errors
      });
    }
    const { email, name, googleId, profilePicture } = validation.data;
    let user = await storage.getUserByGoogleId(googleId);
    if (!user) {
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        user = await storage.updateUser(existingUser.id, {
          googleId,
          profilePicture,
          isEmailVerified: true
        });
      } else {
        user = await storage.createUser({
          name,
          email,
          googleId,
          profilePicture,
          isEmailVerified: true,
          password: null
        });
      }
    }
    if (!user) {
      return res.status(500).json({
        success: false,
        error: "Failed to create or update user account"
      });
    }
    const token = generateUserToken(user);
    const { password: _, emailVerificationToken: __, ...userWithoutPassword } = user;
    res.json({
      success: true,
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("Google sign-in error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});
router.get("/reset-password", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== "string") {
      const baseUrl2 = "https://xed21.com";
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: #dc2626;">Invalid Reset Link</h2>
            <p>The password reset token is missing or invalid.</p>
            <a href="${baseUrl2}" style="color: #2563eb;">Return to Home</a>
          </body>
        </html>
      `);
    }
    const user = await storage.getUserByPasswordResetToken(token);
    if (!user) {
      const baseUrl2 = "https://xed21.com";
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: #dc2626;">Invalid or Expired Link</h2>
            <p>This password reset link is invalid or has already been used.</p>
            <a href="${baseUrl2}" style="color: #2563eb;">Return to Home</a>
          </body>
        </html>
      `);
    }
    const baseUrl = "https://xed21.com";
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Password - Xed21</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0; 
            padding: 0; 
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            max-width: 400px;
            width: 100%;
            margin: 20px;
          }
          .logo { 
            text-align: center; 
            margin-bottom: 30px; 
          }
          .logo h1 { 
            color: #2563eb; 
            font-size: 32px; 
            margin: 0; 
            font-weight: bold; 
          }
          .logo p { 
            color: #6b7280; 
            font-size: 14px; 
            margin: 5px 0 0 0; 
          }
          h2 { 
            color: #1f2937; 
            text-align: center; 
            margin-bottom: 20px; 
          }
          .form-group { 
            margin-bottom: 20px; 
          }
          label { 
            display: block; 
            margin-bottom: 5px; 
            color: #374151; 
            font-weight: 500; 
          }
          input[type="password"] { 
            width: 100%; 
            padding: 12px; 
            border: 2px solid #e5e7eb; 
            border-radius: 6px; 
            font-size: 16px; 
            box-sizing: border-box;
            transition: border-color 0.3s;
          }
          input[type="password"]:focus { 
            outline: none; 
            border-color: #2563eb; 
          }
          .btn { 
            width: 100%; 
            padding: 12px; 
            background: linear-gradient(135deg, #2563eb, #7c3aed); 
            color: white; 
            border: none; 
            border-radius: 6px; 
            font-size: 16px; 
            font-weight: 600; 
            cursor: pointer; 
            transition: transform 0.2s;
          }
          .btn:hover { 
            transform: translateY(-1px); 
          }
          .btn:disabled { 
            opacity: 0.6; 
            cursor: not-allowed; 
            transform: none; 
          }
          .error { 
            color: #dc2626; 
            font-size: 14px; 
            margin-top: 5px; 
            display: none; 
          }
          .success { 
            color: #059669; 
            font-size: 14px; 
            margin-top: 10px; 
            display: none; 
          }
          .back-link { 
            text-align: center; 
            margin-top: 20px; 
          }
          .back-link a { 
            color: #2563eb; 
            text-decoration: none; 
            font-size: 14px; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <h1>Xed21</h1>
            <p>AI-Powered Education Platform</p>
          </div>
          
          <h2>Reset Your Password</h2>
          
          <form id="resetForm">
            <div class="form-group">
              <label for="newPassword">New Password</label>
              <input type="password" id="newPassword" name="newPassword" required minlength="6" 
                     placeholder="Enter your new password">
              <div class="error" id="passwordError"></div>
            </div>
            
            <div class="form-group">
              <label for="confirmPassword">Confirm Password</label>
              <input type="password" id="confirmPassword" name="confirmPassword" required 
                     placeholder="Confirm your new password">
              <div class="error" id="confirmError"></div>
            </div>
            
            <button type="submit" class="btn" id="submitBtn">Reset Password</button>
            
            <div class="error" id="formError"></div>
            <div class="success" id="formSuccess"></div>
          </form>
          
          <div class="back-link">
            <a href="${baseUrl}">\u2190 Back to Home</a>
          </div>
        </div>

        <script>
          const form = document.getElementById('resetForm');
          const submitBtn = document.getElementById('submitBtn');
          const passwordInput = document.getElementById('newPassword');
          const confirmInput = document.getElementById('confirmPassword');
          const passwordError = document.getElementById('passwordError');
          const confirmError = document.getElementById('confirmError');
          const formError = document.getElementById('formError');
          const formSuccess = document.getElementById('formSuccess');

          function hideErrors() {
            passwordError.style.display = 'none';
            confirmError.style.display = 'none';
            formError.style.display = 'none';
            formSuccess.style.display = 'none';
          }

          function showError(element, message) {
            element.textContent = message;
            element.style.display = 'block';
          }

          function validatePassword() {
            const password = passwordInput.value;
            if (password.length < 6) {
              showError(passwordError, 'Password must be at least 6 characters long');
              return false;
            }
            passwordError.style.display = 'none';
            return true;
          }

          function validateConfirm() {
            const password = passwordInput.value;
            const confirm = confirmInput.value;
            if (password !== confirm) {
              showError(confirmError, 'Passwords do not match');
              return false;
            }
            confirmError.style.display = 'none';
            return true;
          }

          passwordInput.addEventListener('input', validatePassword);
          confirmInput.addEventListener('input', validateConfirm);

          form.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideErrors();

            if (!validatePassword() || !validateConfirm()) {
              return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Resetting...';

            try {
              const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  token: '${token}',
                  newPassword: passwordInput.value
                })
              });

              const result = await response.json();

              if (result.success) {
                formSuccess.textContent = result.message;
                formSuccess.style.display = 'block';
                form.style.display = 'none';
                setTimeout(() => {
                  window.location.href = '${baseUrl}';
                }, 3000);
              } else {
                showError(formError, result.error || 'Password reset failed');
              }
            } catch (error) {
              showError(formError, 'Network error. Please try again.');
            } finally {
              submitBtn.disabled = false;
              submitBtn.textContent = 'Reset Password';
            }
          });
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Password reset page error:", error);
    const baseUrl = "https://xed21.com";
    res.status(500).send(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: #dc2626;">Reset Failed</h2>
          <p>An error occurred while loading the reset page. Please try again.</p>
          <a href="${baseUrl}" style="color: #2563eb;">Return to Home</a>
        </body>
      </html>
    `);
  }
});
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required"
      });
    }
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.json({
        success: true,
        message: "If an account exists with this email, a password reset link has been sent."
      });
    }
    const resetToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1e3);
    await storage.setPasswordResetToken(user.id, resetToken, expiresAt);
    const emailSent = await emailService.sendPasswordResetEmail(email, resetToken);
    if (emailSent) {
      res.json({
        success: true,
        message: "If an account exists with this email, a password reset link has been sent."
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to send reset email. Please try again."
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Reset token and new password are required"
      });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long"
      });
    }
    const user = await storage.getUserByPasswordResetToken(token);
    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired reset token"
      });
    }
    const hashedPassword = await bcrypt2.hash(newPassword, 12);
    const updatedUser = await storage.resetUserPassword(user.id, hashedPassword);
    if (updatedUser) {
      res.json({
        success: true,
        message: "Password reset successfully. You can now log in with your new password."
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to reset password. Please try again."
      });
    }
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});
router.post("/test-email", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required"
      });
    }
    const testToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const emailSent = await emailService.sendVerificationEmail(email, testToken);
    if (emailSent) {
      res.json({
        success: true,
        message: `Test verification email sent to ${email}`,
        testToken
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to send test email"
      });
    }
  } catch (error) {
    console.error("Test email error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});
var auth_default = router;

// server/routes/wallet.ts
import { Router as Router2 } from "express";

// server/services/payment.ts
import Razorpay from "razorpay";
var razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}
async function createRazorpayOrder(amount, userId) {
  try {
    if (!razorpay) {
      return {
        success: false,
        error: "Payment service not configured. Please contact support."
      };
    }
    const options = {
      amount: amount * 100,
      // Convert to paise
      currency: "INR",
      receipt: `ord_${userId.slice(-8)}_${Date.now().toString().slice(-8)}`,
      // Keep under 40 chars
      notes: {
        userId
      }
    };
    const order = await razorpay.orders.create(options);
    return {
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      }
    };
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return {
      success: false,
      error: "Failed to create payment order"
    };
  }
}
function verifyRazorpaySignature(payment) {
  try {
    const crypto = __require("crypto");
    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "").update(`${payment.razorpay_order_id}|${payment.razorpay_payment_id}`).digest("hex");
    return expectedSignature === payment.razorpay_signature;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}
async function calculateCoins(amount, userId, storage2) {
  const user = await storage2.getUser(userId);
  const totalUsers = await storage2.getTotalUserCount();
  const isIntroOfferEligible = totalUsers <= 1e3 && user && !user.hasUsedIntroOffer;
  const conversionRate = isIntroOfferEligible ? 2 : 1;
  let coins = amount * conversionRate;
  if (isIntroOfferEligible) {
    if (amount === 500) {
      coins += 100;
    } else if (amount === 1e3) {
      coins += 300;
    } else if (amount > 1e3) {
      const bonusCoins = Math.floor(coins * 0.18);
      coins += bonusCoins;
    }
  }
  return coins;
}

// server/routes/wallet.ts
init_schema();
var router2 = Router2();
router2.post("/create-order", authenticateUser, async (req, res) => {
  try {
    const validation = rechargeSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid amount",
        details: validation.error.errors
      });
    }
    const { amount } = validation.data;
    const userId = req.user.id;
    const orderResult = await createRazorpayOrder(amount, userId);
    if (!orderResult.success) {
      return res.status(400).json({
        success: false,
        error: orderResult.error
      });
    }
    res.json({
      success: true,
      order: orderResult.order
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create payment order"
    });
  }
});
router2.post("/verify-payment", authenticateUser, async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, amount } = req.body;
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !amount) {
      return res.status(400).json({
        success: false,
        error: "Missing payment details"
      });
    }
    const isValidSignature = verifyRazorpaySignature({
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature
    });
    if (!isValidSignature) {
      return res.status(400).json({
        success: false,
        error: "Invalid payment signature"
      });
    }
    const userId = req.user.id;
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }
    const totalCoins = await calculateCoins(amount, userId, storage);
    const totalUsers = await storage.getTotalUserCount();
    const isIntroOffer = totalUsers <= 1e3 && user && !user.hasUsedIntroOffer;
    const conversionRate = isIntroOffer ? 2 : 1;
    const baseCoins = amount * conversionRate;
    const bonusCoins = totalCoins - baseCoins;
    if (isIntroOffer) {
      await storage.markUserIntroOfferUsed(userId);
    }
    const newBalance = user.coins + totalCoins;
    await storage.updateUserCoins(userId, newBalance);
    await storage.createWalletTransaction({
      userId,
      type: "credit",
      amount: baseCoins,
      description: `Wallet recharge of \u20B9${amount}`,
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id
    });
    if (bonusCoins > 0) {
      await storage.createWalletTransaction({
        userId,
        type: "bonus",
        amount: bonusCoins,
        description: `Bonus coins for \u20B9${amount} recharge`,
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id
      });
    }
    res.json({
      success: true,
      newBalance,
      coinsAdded: totalCoins,
      bonusCoins
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to verify payment"
    });
  }
});
router2.get("/transactions", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const transactions = await storage.getUserTransactions(userId);
    res.json({
      success: true,
      transactions
    });
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch transactions"
    });
  }
});
var wallet_default = router2;

// server/routes/user.ts
import { Router as Router3 } from "express";
var router3 = Router3();
router3.get("/profile", authenticateUser, async (req, res) => {
  try {
    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});
router3.get("/question-history", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const questionSets2 = await storage.getUserQuestionSets(userId);
    res.json({
      success: true,
      questionSets: questionSets2
    });
  } catch (error) {
    console.error("Question history error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch question history"
    });
  }
});
var user_default = router3;

// server/routes/admin.ts
import { Router as Router4 } from "express";
import jwt2 from "jsonwebtoken";
import { z as z2 } from "zod";

// server/services/file-extractor.ts
import * as fs from "fs";
import * as path from "path";
import OpenAI2 from "openai";
var FileExtractorService = class {
  openai;
  constructor() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OpenRouter API key is missing");
    }
    this.openai = new OpenAI2({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://eduassess-ai.replit.app",
        "X-Title": "EduAssess AI"
      }
    });
  }
  async extractContentFromFile(filePath, fileName) {
    const fileExtension = path.extname(fileName).toLowerCase();
    let rawContent = "";
    try {
      switch (fileExtension) {
        case ".pdf":
          rawContent = await this.extractFromPDF(filePath);
          break;
        case ".docx":
          rawContent = await this.extractFromDOCX(filePath);
          break;
        case ".xlsx":
        case ".xls":
          rawContent = await this.extractFromExcel(filePath);
          break;
        case ".csv":
          rawContent = await this.extractFromCSV(filePath);
          break;
        case ".txt":
          rawContent = await this.extractFromTXT(filePath);
          break;
        default:
          throw new Error(`Unsupported file type: ${fileExtension}`);
      }
      const structuredContent = await this.structureContentWithAI(rawContent, fileName);
      return structuredContent;
    } catch (error) {
      console.error("File extraction error:", error);
      throw new Error(`Failed to extract content from ${fileName}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  async extractFromPDF(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfString = dataBuffer.toString("latin1");
      let extractedText = "";
      const textMatches = pdfString.match(/stream[\s\S]*?endstream/g);
      if (textMatches) {
        textMatches.forEach((match) => {
          const content = match.replace(/^stream\s*/, "").replace(/\s*endstream$/, "");
          const readable = content.replace(/[^\x20-\x7E\n\r\t]/g, " ").trim();
          if (readable.length > 10) {
            extractedText += readable + "\n";
          }
        });
      }
      if (!extractedText.trim()) {
        return `PDF file processed: ${path.basename(filePath)}. 
Content extraction limited - please provide text-based content or use AI to describe the PDF content based on filename and context.`;
      }
      return extractedText.substring(0, 5e3);
    } catch (error) {
      return `PDF file received: ${path.basename(filePath)}. Basic extraction failed. Please provide the key content manually or use AI to process this educational material.`;
    }
  }
  async extractFromDOCX(filePath) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }
  async extractFromExcel(filePath) {
    const XLSX = await import("xlsx");
    const workbook = XLSX.readFile(filePath);
    let content = "";
    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      content += `Sheet: ${sheetName}
`;
      jsonData.forEach((row) => {
        if (row && Array.isArray(row) && row.length > 0) {
          content += row.join("	") + "\n";
        }
      });
      content += "\n";
    });
    return content;
  }
  async extractFromCSV(filePath) {
    const csv = await import("csv-parser");
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(filePath).pipe(csv.default()).on("data", (data) => results.push(data)).on("end", () => {
        let content = "";
        if (results.length > 0) {
          content += Object.keys(results[0]).join("	") + "\n";
          results.forEach((row) => {
            content += Object.values(row).join("	") + "\n";
          });
        }
        resolve(content);
      }).on("error", reject);
    });
  }
  async extractFromTXT(filePath) {
    return fs.readFileSync(filePath, "utf8");
  }
  async structureContentWithAI(rawContent, fileName) {
    try {
      const prompt = `Please analyze and structure the following educational content extracted from "${fileName}". 

Your task is to:
1. Clean up any formatting issues or extraction artifacts
2. Organize the content in a clear, educational format
3. Remove irrelevant information (headers, footers, page numbers, etc.)
4. Preserve all important educational information
5. Structure it with clear headings and sections where appropriate
6. Ensure the content is suitable for educational question generation

Raw content:
${rawContent.substring(0, 8e3)} ${rawContent.length > 8e3 ? "...(truncated)" : ""}

Please provide clean, well-structured educational content:`;
      const response = await this.openai.chat.completions.create({
        model: "openai/gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert educational content processor. Your job is to clean, structure, and organize educational content extracted from various file formats. Focus on preserving all educational value while making the content clear and well-organized."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4e3
      });
      return response.choices[0]?.message?.content || rawContent;
    } catch (error) {
      console.error("AI structuring error:", error);
      return rawContent;
    }
  }
};

// server/scripts/sync-curriculum.ts
init_curriculum();
async function syncCurriculumToDatabase() {
  try {
    console.log("Starting comprehensive curriculum sync for all boards and grades...");
    const boards2 = ["cbse/ncert", "icse/cisce"];
    let totalSynced = 0;
    for (const boardKey of boards2) {
      console.log(`
=== Syncing ${boardKey.toUpperCase()} ===`);
      let board = await storage.getBoardByName(boardKey);
      if (!board) {
        console.log(`Creating board: ${boardKey}`);
        board = await storage.createBoard({
          name: boardKey,
          displayName: boardKey === "cbse/ncert" ? "CBSE/NCERT" : "ICSE/CISCE"
        });
      }
      for (let grade = 1; grade <= 12; grade++) {
        console.log(`
--- Syncing Grade ${grade} ---`);
        const subjects2 = getSubjectsForBoardAndGrade(boardKey, grade);
        console.log(`Found ${subjects2.length} subjects for Grade ${grade}`);
        for (const subjectName of subjects2) {
          console.log(`Syncing subject: ${subjectName}`);
          let subject = await storage.getSubjectByDetails(boardKey, subjectName, grade);
          if (!subject) {
            console.log(`Creating subject: ${subjectName} (Grade ${grade})`);
            subject = await storage.createSubject({
              name: subjectName,
              grade,
              boardId: board.id
            });
          }
          const curriculumTopics = getTopicsForSubjectAndGrade(boardKey, subjectName, grade);
          console.log(`Found ${curriculumTopics.length} topics for ${subjectName}`);
          const existingTopics = await storage.getTopicsBySubject(subject.id);
          for (const topicName of curriculumTopics) {
            const existingTopic = existingTopics.find((t) => t.name === topicName);
            if (!existingTopic) {
              console.log(`Creating topic: ${topicName}`);
              await storage.createTopic({
                name: topicName,
                subjectId: subject.id
              });
              totalSynced++;
            }
          }
        }
      }
    }
    console.log(`
\u2705 Comprehensive curriculum sync completed! Total items synced: ${totalSynced}`);
  } catch (error) {
    console.error("Error during curriculum sync:", error);
    throw error;
  }
}

// server/routes/admin.ts
init_schema();
import multer from "multer";
import path2 from "path";
import { promises as fs2 } from "fs";
var router4 = Router4();
var upload = multer({
  dest: "uploads/content/",
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
      "text/plain"
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOCX, XLSX, CSV, and TXT files are allowed"));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB limit
  }
});
var adminAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "Admin token required" });
  }
  try {
    const decoded = jwt2.verify(token, process.env.JWT_SECRET || "your-secret-key");
    if (decoded.type !== "admin") {
      return res.status(401).json({ error: "Invalid admin token" });
    }
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid admin token" });
  }
};
router4.use(adminAuth);
router4.get("/users", async (req, res) => {
  try {
    const users2 = await storage.getAllUsers();
    res.json(users2);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});
router4.patch("/users/:userId/coins", async (req, res) => {
  try {
    const { userId } = req.params;
    const { coins } = z2.object({ coins: z2.number().int().min(0) }).parse(req.body);
    await storage.updateUserCoins(userId, coins);
    res.json({ success: true });
  } catch (error) {
    console.error("Failed to update user coins:", error);
    res.status(500).json({ error: "Failed to update user coins" });
  }
});
router4.patch("/users/:userId/status", async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = z2.object({ isActive: z2.boolean() }).parse(req.body);
    await storage.updateUserStatus(userId, isActive);
    res.json({ success: true });
  } catch (error) {
    console.error("Failed to update user status:", error);
    res.status(500).json({ error: "Failed to update user status" });
  }
});
router4.delete("/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    await storage.deleteUser(userId);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Failed to delete user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});
router4.get("/boards", async (req, res) => {
  try {
    const boards2 = await storage.getAllBoards();
    res.json(boards2);
  } catch (error) {
    console.error("Failed to fetch boards:", error);
    res.status(500).json({ error: "Failed to fetch boards" });
  }
});
router4.post("/boards", async (req, res) => {
  try {
    const { name, fullName, description } = z2.object({
      name: z2.string().min(1),
      fullName: z2.string().min(1),
      description: z2.string().optional()
    }).parse(req.body);
    const board = await storage.createBoard({ name, fullName, description, isActive: true });
    res.json(board);
  } catch (error) {
    console.error("Failed to create board:", error);
    res.status(500).json({ error: "Failed to create board" });
  }
});
router4.patch("/boards/:boardId", async (req, res) => {
  try {
    const { boardId } = req.params;
    const updates = z2.object({
      name: z2.string().optional(),
      fullName: z2.string().optional(),
      description: z2.string().optional(),
      isActive: z2.boolean().optional()
    }).parse(req.body);
    const board = await storage.updateBoard(boardId, updates);
    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }
    res.json(board);
  } catch (error) {
    console.error("Failed to update board:", error);
    res.status(500).json({ error: "Failed to update board" });
  }
});
router4.get("/subjects", async (req, res) => {
  try {
    const subjects2 = await storage.getAllSubjects();
    res.json(subjects2);
  } catch (error) {
    console.error("Failed to fetch subjects:", error);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});
router4.get("/boards/:boardId/subjects", async (req, res) => {
  try {
    const { boardId } = req.params;
    const subjects2 = await storage.getSubjectsByBoard(boardId);
    res.json(subjects2);
  } catch (error) {
    console.error("Failed to fetch subjects by board:", error);
    res.status(500).json({ error: "Failed to fetch subjects by board" });
  }
});
router4.get("/boards/:boardName/grades/:grade/subjects", async (req, res) => {
  try {
    const { boardName, grade } = req.params;
    const subjects2 = await storage.getSubjects(boardName, parseInt(grade));
    res.json(subjects2);
  } catch (error) {
    console.error("Failed to fetch subjects:", error);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});
router4.post("/subjects", async (req, res) => {
  try {
    const data = z2.object({
      name: z2.string().min(1),
      board: z2.string().min(1),
      grade: z2.number().int().min(1).max(12)
    }).parse(req.body);
    const subject = await storage.createSubject(data);
    res.json(subject);
  } catch (error) {
    console.error("Failed to create subject:", error);
    res.status(500).json({ error: "Failed to create subject" });
  }
});
router4.patch("/subjects/:subjectId", async (req, res) => {
  try {
    const { subjectId } = req.params;
    const data = z2.object({
      name: z2.string().min(1),
      board: z2.string().min(1),
      grade: z2.number().int().min(1).max(12)
    }).parse(req.body);
    await storage.updateSubject(subjectId, data);
    res.json({ success: true });
  } catch (error) {
    console.error("Failed to update subject:", error);
    res.status(500).json({ error: "Failed to update subject" });
  }
});
router4.delete("/subjects/:subjectId", async (req, res) => {
  try {
    const { subjectId } = req.params;
    await storage.deleteSubject(subjectId);
    res.json({ success: true });
  } catch (error) {
    console.error("Failed to delete subject:", error);
    res.status(500).json({ error: "Failed to delete subject" });
  }
});
router4.get("/topics/:subjectId?", async (req, res) => {
  try {
    const { subjectId } = req.params;
    const topics2 = subjectId ? await storage.getTopicsBySubject(subjectId) : await storage.getAllTopics();
    res.json(topics2);
  } catch (error) {
    console.error("Failed to fetch topics:", error);
    res.status(500).json({ error: "Failed to fetch topics" });
  }
});
router4.post("/topics", upload.single("pdf"), async (req, res) => {
  try {
    const { name, subjectId } = req.body;
    if (!name || !subjectId) {
      return res.status(400).json({ error: "Name and subjectId are required" });
    }
    let pdfFilename = null;
    if (req.file) {
      const timestamp2 = Date.now();
      const originalName = req.file.originalname;
      pdfFilename = `${timestamp2}-${originalName}`;
      const destDir = path2.join("uploads", "pdfs");
      await fs2.mkdir(destDir, { recursive: true });
      const sourcePath = req.file.path;
      const destPath = path2.join(destDir, pdfFilename);
      await fs2.rename(sourcePath, destPath);
    }
    const topic = await storage.createTopic({
      name,
      subjectId,
      pdfFilename
    });
    console.log("Topic creation result:", topic);
    console.log("Topic stringified:", JSON.stringify(topic));
    if (!topic) {
      console.error("Topic creation returned empty/null result!");
      return res.status(500).json({ error: "Topic creation failed - no data returned" });
    }
    res.json(topic);
  } catch (error) {
    console.error("Failed to create topic:", error);
    res.status(500).json({ error: "Failed to create topic" });
  }
});
router4.delete("/topics/:topicId", async (req, res) => {
  try {
    const { topicId } = req.params;
    const topic = await storage.getTopicById(topicId);
    if (topic?.pdfFilename) {
      try {
        const pdfPath = path2.join("uploads", "pdfs", topic.pdfFilename);
        await fs2.unlink(pdfPath);
      } catch (error) {
        console.log("PDF file not found or already deleted");
      }
    }
    await storage.deleteTopic(topicId);
    res.json({ success: true });
  } catch (error) {
    console.error("Failed to delete topic:", error);
    res.status(500).json({ error: "Failed to delete topic" });
  }
});
router4.get("/topic-content", async (req, res) => {
  try {
    const content = await storage.getAllTopicContent();
    res.json(content);
  } catch (error) {
    console.error("Failed to fetch topic content:", error);
    res.status(500).json({ error: "Failed to fetch topic content" });
  }
});
router4.get("/topic-content/topic/:topicId", async (req, res) => {
  try {
    const { topicId } = req.params;
    const content = await storage.getTopicContentByTopicId(topicId);
    res.json(content);
  } catch (error) {
    console.error("Failed to fetch topic content:", error);
    res.status(500).json({ error: "Failed to fetch topic content" });
  }
});
router4.post("/topic-content", async (req, res) => {
  try {
    const { topicId, title, content, contentType, fileName, fileSize } = req.body;
    if (!topicId || !title || !content) {
      return res.status(400).json({ error: "Topic ID, title, and content are required" });
    }
    const newContent = await storage.createTopicContent({
      topicId,
      title,
      content,
      contentType: contentType || "text",
      fileName,
      fileSize,
      uploadedBy: req.admin.id,
      isActive: true
    });
    res.json({ success: true, content: newContent });
  } catch (error) {
    console.error("Failed to create topic content:", error);
    res.status(500).json({ error: "Failed to create topic content" });
  }
});
router4.put("/topic-content/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, contentType, fileName, fileSize, isActive } = req.body;
    const updatedContent = await storage.updateTopicContent(id, {
      title,
      content,
      contentType,
      fileName,
      fileSize,
      isActive
    });
    if (!updatedContent) {
      return res.status(404).json({ error: "Topic content not found" });
    }
    res.json({ success: true, content: updatedContent });
  } catch (error) {
    console.error("Failed to update topic content:", error);
    res.status(500).json({ error: "Failed to update topic content" });
  }
});
router4.patch("/topic-content/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") {
      return res.status(400).json({ error: "isActive must be a boolean" });
    }
    const updatedContent = await storage.toggleTopicContentStatus(id, isActive);
    res.json({ success: true, content: updatedContent });
  } catch (error) {
    console.error("Failed to toggle topic content status:", error);
    res.status(500).json({ error: "Failed to toggle topic content status" });
  }
});
router4.delete("/topic-content/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const success = await storage.deleteTopicContent(id);
    if (!success) {
      return res.status(404).json({ error: "Topic content not found" });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Failed to delete topic content:", error);
    res.status(500).json({ error: "Failed to delete topic content" });
  }
});
router4.post("/topic-content/upload/:topicId", upload.single("file"), async (req, res) => {
  try {
    const { topicId } = req.params;
    const { title } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    let content = "";
    const filePath = req.file.path;
    const fileType = req.file.mimetype;
    try {
      if (fileType === "text/plain") {
        content = await fs2.readFile(filePath, "utf-8");
      } else if (fileType === "application/pdf") {
        content = `PDF file uploaded: ${req.file.originalname}. Content extraction pending.`;
      } else {
        content = await fs2.readFile(filePath, "utf-8");
      }
    } catch (fileError) {
      console.error("Error reading file:", fileError);
      return res.status(500).json({ error: "Failed to read uploaded file" });
    }
    const newContent = await storage.createTopicContent({
      topicId,
      title,
      content,
      contentType: fileType,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      uploadedBy: req.admin.id,
      isActive: true
    });
    try {
      await fs2.unlink(filePath);
    } catch (cleanupError) {
      console.error("Failed to cleanup uploaded file:", cleanupError);
    }
    res.json({ success: true, content: newContent });
  } catch (error) {
    console.error("Failed to upload topic content:", error);
    res.status(500).json({ error: "Failed to upload topic content" });
  }
});
router4.get("/ai-rules", async (req, res) => {
  try {
    const rules = await storage.getAllAiRules();
    res.json(rules);
  } catch (error) {
    console.error("Failed to fetch AI rules:", error);
    res.status(500).json({ error: "Failed to fetch AI rules" });
  }
});
router4.post("/ai-rules", async (req, res) => {
  try {
    const validation = z2.object({
      category: z2.enum(["global", "question_type", "bloom_level"]),
      subcategory: z2.string().optional().nullable(),
      rules: z2.string().min(1),
      isActive: z2.boolean().default(true)
    }).safeParse(req.body);
    if (!validation.success) {
      console.error("AI rule validation failed:", validation.error.errors);
      return res.status(400).json({
        error: "Invalid input",
        details: validation.error.errors
      });
    }
    const { category, subcategory, rules, isActive } = validation.data;
    const rule = await storage.createAiRule({
      category,
      subcategory: subcategory || null,
      rules,
      isActive
    });
    res.json({ success: true, rule });
  } catch (error) {
    console.error("Failed to create AI rule:", error);
    res.status(500).json({ error: "Failed to create AI rule", details: error instanceof Error ? error.message : "Unknown error" });
  }
});
router4.patch("/ai-rules/:ruleId", async (req, res) => {
  try {
    const { ruleId } = req.params;
    const data = z2.object({
      category: z2.enum(["global", "question_type", "bloom_level"]),
      subcategory: z2.string().optional(),
      rules: z2.string().min(1)
    }).parse(req.body);
    await storage.updateAiRule(ruleId, data);
    res.json({ success: true });
  } catch (error) {
    console.error("Failed to update AI rule:", error);
    res.status(500).json({ error: "Failed to update AI rule" });
  }
});
router4.patch("/ai-rules/:ruleId/status", async (req, res) => {
  try {
    const { ruleId } = req.params;
    const { isActive } = z2.object({ isActive: z2.boolean() }).parse(req.body);
    await storage.updateAiRuleStatus(ruleId, isActive);
    res.json({ success: true });
  } catch (error) {
    console.error("Failed to update AI rule status:", error);
    res.status(500).json({ error: "Failed to update AI rule status" });
  }
});
router4.get("/topic-content/topic/:topicId", adminAuth, async (req, res) => {
  try {
    const { topicId } = req.params;
    const content = await storage.getTopicContentByTopicId(topicId);
    res.json(content);
  } catch (error) {
    console.error("Failed to fetch topic content:", error);
    res.status(500).json({ error: "Failed to fetch topic content" });
  }
});
router4.post("/topic-content", adminAuth, async (req, res) => {
  try {
    const validation = z2.object({
      topicId: z2.string(),
      title: z2.string().min(1),
      content: z2.string().min(1),
      isActive: z2.boolean().default(true)
    }).safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid input",
        details: validation.error.errors
      });
    }
    const contentData = await storage.createTopicContent({
      ...validation.data,
      uploadedBy: req.admin?.id || "admin"
    });
    res.json({ success: true, content: contentData });
  } catch (error) {
    console.error("Failed to create topic content:", error);
    res.status(500).json({ error: "Failed to create topic content" });
  }
});
router4.put("/topic-content/:contentId", adminAuth, async (req, res) => {
  try {
    const { contentId } = req.params;
    if (req.body.hasOwnProperty("isActive") && Object.keys(req.body).length === 1) {
      const { isActive } = z2.object({ isActive: z2.boolean() }).parse(req.body);
      const updatedContent2 = await storage.updateTopicContent(contentId, { isActive });
      return res.json({ success: true, content: updatedContent2 });
    }
    const validation = z2.object({
      title: z2.string().min(1),
      content: z2.string().min(1)
    }).safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid input",
        details: validation.error.errors
      });
    }
    const updatedContent = await storage.updateTopicContent(contentId, validation.data);
    res.json({ success: true, content: updatedContent });
  } catch (error) {
    console.error("Failed to update topic content:", error);
    res.status(500).json({ error: "Failed to update topic content" });
  }
});
router4.delete("/topic-content/:contentId", adminAuth, async (req, res) => {
  try {
    const { contentId } = req.params;
    const success = await storage.deleteTopicContent(contentId);
    if (!success) {
      return res.status(404).json({ error: "Content not found" });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Failed to delete topic content:", error);
    res.status(500).json({ error: "Failed to delete topic content" });
  }
});
router4.patch("/topic-content/:contentId/toggle", adminAuth, async (req, res) => {
  try {
    const { contentId } = req.params;
    const { isActive } = z2.object({ isActive: z2.boolean() }).parse(req.body);
    const updatedContent = await storage.toggleTopicContentStatus(contentId, isActive);
    res.json({ success: true, content: updatedContent });
  } catch (error) {
    console.error("Failed to toggle topic content status:", error);
    res.status(500).json({ error: "Failed to toggle topic content status" });
  }
});
router4.post("/topic-content/upload-extract", adminAuth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const { topicId } = req.body;
    if (!topicId) {
      return res.status(400).json({ error: "Topic ID is required" });
    }
    const fileExtractor = new FileExtractorService();
    const extractedContent = await fileExtractor.extractContentFromFile(
      req.file.path,
      req.file.originalname
    );
    const existingContent = await storage.getTopicContentByTopicId(topicId);
    for (const content of existingContent) {
      await storage.deleteTopicContent(content.id);
    }
    const newContent = await storage.createTopicContent({
      topicId,
      title: `Content from ${req.file.originalname}`,
      content: extractedContent,
      uploadedBy: req.admin?.id || "1631c764-00fd-4afe-afdd-01dc2c33a390",
      // Use admin ID instead of email
      fileName: req.file.originalname,
      fileSize: req.file.size,
      contentType: req.file.mimetype,
      isActive: true
    });
    try {
      await fs2.unlink(req.file.path);
    } catch (cleanupError) {
      console.warn("Failed to cleanup uploaded file:", cleanupError);
    }
    res.json({
      success: true,
      content: newContent,
      message: "File uploaded and content extracted successfully"
    });
  } catch (error) {
    console.error("Failed to upload and extract file content:", error);
    if (req.file) {
      try {
        await fs2.unlink(req.file.path);
      } catch (cleanupError) {
        console.warn("Failed to cleanup uploaded file on error:", cleanupError);
      }
    }
    res.status(500).json({
      error: "Failed to process file",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router4.post("/sync-curriculum", adminAuth, async (req, res) => {
  try {
    await syncCurriculumToDatabase();
    res.json({ success: true, message: "Curriculum synced successfully" });
  } catch (error) {
    console.error("Failed to sync curriculum:", error);
    res.status(500).json({ error: "Failed to sync curriculum" });
  }
});
router4.get("/bloom-samples", adminAuth, async (req, res) => {
  try {
    const { bloomLevel } = req.query;
    const filters = bloomLevel ? { bloomLevel } : void 0;
    const items = await storage.getBloomSampleItems(filters);
    res.json(items);
  } catch (error) {
    console.error("Error fetching bloom sample items:", error);
    res.status(500).json({ error: "Failed to fetch bloom sample items" });
  }
});
router4.get("/bloom-samples/:level", adminAuth, async (req, res) => {
  try {
    const { level } = req.params;
    const { questionType } = req.query;
    const items = await storage.getBloomSampleItems({ bloomLevel: level });
    res.json(items);
  } catch (error) {
    console.error("Error fetching bloom sample items by level:", error);
    res.status(500).json({ error: "Failed to fetch bloom sample items" });
  }
});
router4.post("/bloom-samples", adminAuth, async (req, res) => {
  try {
    const validationResult = insertBloomSampleItemSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validationResult.error.errors
      });
    }
    const item = await storage.createBloomSampleItem(validationResult.data);
    res.status(201).json(item);
  } catch (error) {
    console.error("Error creating bloom sample item:", error);
    res.status(500).json({ error: "Failed to create bloom sample item" });
  }
});
router4.put("/bloom-samples/:id", adminAuth, async (req, res) => {
  try {
    const validationResult = insertBloomSampleItemSchema.partial().safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validationResult.error.errors
      });
    }
    const item = await storage.updateBloomSampleItem(req.params.id, validationResult.data);
    if (!item) {
      return res.status(404).json({ error: "Bloom sample item not found" });
    }
    res.json(item);
  } catch (error) {
    console.error("Error updating bloom sample item:", error);
    res.status(500).json({ error: "Failed to update bloom sample item" });
  }
});
router4.patch("/bloom-samples/:id/status", adminAuth, async (req, res) => {
  try {
    const { isActive } = req.body;
    const item = await storage.toggleBloomSampleItemStatus(req.params.id, isActive);
    if (!item) {
      return res.status(404).json({ error: "Bloom sample item not found" });
    }
    res.json(item);
  } catch (error) {
    console.error("Error updating bloom sample item status:", error);
    res.status(500).json({ error: "Failed to update bloom sample item status" });
  }
});
router4.delete("/bloom-samples/:id", adminAuth, async (req, res) => {
  try {
    await storage.deleteBloomSampleItem(req.params.id);
    res.json({ message: "Bloom sample item deleted successfully" });
  } catch (error) {
    console.error("Error deleting bloom sample item:", error);
    res.status(500).json({ error: "Failed to delete bloom sample item" });
  }
});
var admin_default = router4;

// server/routes.ts
import { z as z3 } from "zod";
var BLOOM_COIN_PRICES = {
  remembering: 5,
  understanding: 7,
  applying: 10,
  analyzing: 15,
  evaluating: 25,
  creating: 25
};
var upload2 = multer2({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/csv", "text/plain"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, DOCX, CSV, and TXT files are allowed."));
    }
  }
});
async function registerRoutes(app2) {
  app2.use("/api/auth", auth_default);
  app2.use("/api/wallet", wallet_default);
  app2.use("/api/user", user_default);
  app2.use("/api/admin", admin_default);
  app2.get("/api/subjects/:board/:grade", async (req, res) => {
    try {
      const { board, grade } = req.params;
      const gradeNum = parseInt(grade);
      if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 12) {
        return res.status(400).json({ message: "Invalid grade. Must be between 1 and 12." });
      }
      const subjects2 = getSubjectsForBoardAndGrade(board, gradeNum);
      res.json({ subjects: subjects2 });
    } catch (error) {
      console.error("Error fetching subjects:", error);
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });
  app2.get("/api/boards", async (req, res) => {
    try {
      const boards2 = await storage.getAllBoards();
      res.json(boards2);
    } catch (error) {
      console.error("Error fetching boards:", error);
      res.status(500).json({ message: "Failed to fetch boards" });
    }
  });
  app2.get("/api/topics/:board/:subject/:grade", async (req, res) => {
    try {
      const { board, subject, grade } = req.params;
      const gradeNum = parseInt(grade);
      if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 12) {
        return res.status(400).json({ message: "Invalid grade. Must be between 1 and 12." });
      }
      const topics2 = getTopicsForSubjectAndGrade(board, subject, gradeNum);
      res.json({ topics: topics2 });
    } catch (error) {
      console.error("Error fetching topics:", error);
      res.status(500).json({ message: "Failed to fetch topics" });
    }
  });
  app2.get("/api/topics/:subject/:grade", async (req, res) => {
    try {
      const { subject, grade } = req.params;
      const gradeNum = parseInt(grade);
      if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 12) {
        return res.status(400).json({ message: "Invalid grade. Must be between 1 and 12." });
      }
      const topics2 = getTopicsForSubjectAndGrade("cbse/ncert", subject, gradeNum);
      res.json({ topics: topics2 });
    } catch (error) {
      console.error("Error fetching topics:", error);
      res.status(500).json({ message: "Failed to fetch topics" });
    }
  });
  app2.get("/api/debug/api-key", (req, res) => {
    const apiKey = process.env.OPENAI_API_KEY;
    res.json({
      hasKey: !!apiKey,
      keyFormat: apiKey ? `${apiKey.substring(0, 10)}...` : "none",
      keyLength: apiKey?.length || 0
    });
  });
  app2.post("/api/generate-questions", authenticateUser, async (req, res) => {
    try {
      const requestData = questionGenerationSchema.parse(req.body);
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
      }
      const coinPricePerQuestion = BLOOM_COIN_PRICES[requestData.bloomLevel] || 10;
      const coinsRequired = requestData.questionCount * coinPricePerQuestion;
      if (user.coins < coinsRequired) {
        return res.status(400).json({
          success: false,
          error: `Insufficient coins. Required: ${coinsRequired}, Available: ${user.coins}`
        });
      }
      const questions = await generateQuestions(requestData);
      const actualQuestionsGenerated = questions.length;
      const actualCoinsUsed = actualQuestionsGenerated * coinPricePerQuestion;
      const newBalance = user.coins - actualCoinsUsed;
      await storage.updateUserCoins(userId, newBalance);
      await storage.createWalletTransaction({
        userId,
        type: "debit",
        amount: actualCoinsUsed,
        description: `Generated ${actualQuestionsGenerated} ${requestData.bloomLevel} questions`
      });
      const questionSet = await storage.createQuestionSet({
        ...requestData,
        userId,
        // Associate with user
        questions
        // JSON field
      });
      res.json({
        success: true,
        questions,
        questionSetId: questionSet.id,
        coinsUsed: actualCoinsUsed,
        remainingCoins: newBalance,
        requestedQuestions: requestData.questionCount,
        generatedQuestions: actualQuestionsGenerated
      });
    } catch (error) {
      console.error("Error generating questions:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Invalid request data",
          details: error.errors
        });
      }
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate questions"
      });
    }
  });
  app2.get("/api/question-sets", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : void 0;
      const questionSets2 = await storage.getQuestionSets(limit);
      res.json({ questionSets: questionSets2 });
    } catch (error) {
      console.error("Error fetching question sets:", error);
      res.status(500).json({ message: "Failed to fetch question sets" });
    }
  });
  app2.get("/api/question-sets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const questionSet = await storage.getQuestionSet(id);
      if (!questionSet) {
        return res.status(404).json({ message: "Question set not found" });
      }
      res.json({ questionSet });
    } catch (error) {
      console.error("Error fetching question set:", error);
      res.status(500).json({ message: "Failed to fetch question set" });
    }
  });
  app2.post("/api/admin/upload", upload2.array("files", 10), async (req, res) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }
      const { grade, subject, topic } = req.body;
      const uploadedFiles = [];
      for (const file of req.files) {
        const fileData = {
          filename: file.filename,
          originalName: file.originalname,
          fileType: file.mimetype,
          fileSize: file.size,
          grade: grade || null,
          subject: subject || null,
          topic: topic || null
        };
        const validatedData = insertTrainingFileSchema.parse(fileData);
        const savedFile = await storage.createTrainingFile(validatedData);
        uploadedFiles.push(savedFile);
      }
      res.json({
        success: true,
        message: `${uploadedFiles.length} files uploaded successfully`,
        files: uploadedFiles
      });
    } catch (error) {
      console.error("Error uploading files:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({
          message: "Invalid file data",
          errors: error.errors
        });
      }
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to upload files"
      });
    }
  });
  app2.get("/api/admin/training-files", async (req, res) => {
    try {
      const files = await storage.getTrainingFiles();
      res.json({ files });
    } catch (error) {
      console.error("Error fetching training files:", error);
      res.status(500).json({ message: "Failed to fetch training files" });
    }
  });
  app2.delete("/api/admin/training-files/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteTrainingFile(id);
      if (!deleted) {
        return res.status(404).json({ message: "File not found" });
      }
      res.json({ success: true, message: "File deleted successfully" });
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ message: "Failed to delete file" });
    }
  });
  app2.get("/api/admin/curriculum-topics/:board/:subject/:grade", async (req, res) => {
    try {
      const { board, subject, grade } = req.params;
      const gradeNum = parseInt(grade);
      if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 12) {
        return res.status(400).json({ message: "Invalid grade. Must be between 1 and 12." });
      }
      const hardcodedTopics = getTopicsForSubjectAndGrade(board, subject, gradeNum);
      res.json({
        board,
        subject,
        grade: gradeNum,
        topics: hardcodedTopics.map((name) => ({ name, hasContent: false, contentCount: 0 }))
      });
    } catch (error) {
      console.error("Error fetching curriculum topics:", error);
      res.status(500).json({ message: "Failed to fetch curriculum topics" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs3 from "fs";
import path4 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path3 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path3.resolve(import.meta.dirname, "client", "src"),
      "@shared": path3.resolve(import.meta.dirname, "shared"),
      "@assets": path3.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path3.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path3.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path4.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs3.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path4.resolve(import.meta.dirname, "public");
  if (!fs3.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path4.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import cors from "cors";
var initializeDatabase2;
try {
  const cloudSql = await Promise.resolve().then(() => (init_cloud_sql(), cloud_sql_exports));
  initializeDatabase2 = cloudSql.initializeDatabase;
} catch (error) {
  initializeDatabase2 = () => console.log("Development mode: Using local database");
}
var app = express2();
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
if (process.env.NODE_ENV === "production") {
  try {
    initializeDatabase2();
    console.log("\u2705 Production database connection established");
  } catch (error) {
    console.error("\u274C Production database connection failed:", error);
  }
}
app.use((req, res, next) => {
  const start = Date.now();
  const path5 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path5.startsWith("/api")) {
      let logLine = `${req.method} ${path5} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
