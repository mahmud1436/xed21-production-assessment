import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { generateQuestions } from "./services/openrouter";
import { getSubjectsForBoardAndGrade, getTopicsForSubjectAndGrade } from "./services/curriculum";
import { questionGenerationSchema, insertTrainingFileSchema } from "@shared/schema";
import { AuthRequest, authenticateUser } from "./middleware/auth";
import authRoutes from "./routes/auth";
import walletRoutes from "./routes/wallet";
import userRoutes from "./routes/user";
import adminRoutes from "./routes/admin";
import { z } from "zod";

// Bloom's taxonomy coin pricing
const BLOOM_COIN_PRICES = {
  remembering: 5,
  understanding: 7,
  applying: 10,
  analyzing: 15,
  evaluating: 25,
  creating: 25,
};

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/csv', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, CSV, and TXT files are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Register authentication routes
  app.use("/api/auth", authRoutes);
  app.use("/api/wallet", walletRoutes);
  app.use("/api/user", userRoutes);
  app.use("/api/admin", adminRoutes);
  // Get subjects based on board and grade
  app.get("/api/subjects/:board/:grade", async (req, res) => {
    try {
      const { board, grade } = req.params;
      const gradeNum = parseInt(grade);
      
      if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 12) {
        return res.status(400).json({ message: "Invalid grade. Must be between 1 and 12." });
      }

      const subjects = getSubjectsForBoardAndGrade(board, gradeNum);
      res.json({ subjects });
    } catch (error) {
      console.error("Error fetching subjects:", error);
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  // Get available boards
  app.get("/api/boards", async (req, res) => {
    try {
      const boards = await storage.getAllBoards();
      res.json(boards);
    } catch (error) {
      console.error("Error fetching boards:", error);
      res.status(500).json({ message: "Failed to fetch boards" });
    }
  });

  // Get topics based on board, subject and grade
  app.get("/api/topics/:board/:subject/:grade", async (req, res) => {
    try {
      const { board, subject, grade } = req.params;
      const gradeNum = parseInt(grade);
      
      if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 12) {
        return res.status(400).json({ message: "Invalid grade. Must be between 1 and 12." });
      }

      const topics = getTopicsForSubjectAndGrade(board, subject, gradeNum);
      res.json({ topics });
    } catch (error) {
      console.error("Error fetching topics:", error);
      res.status(500).json({ message: "Failed to fetch topics" });
    }
  });

  // Legacy endpoint for backward compatibility
  app.get("/api/topics/:subject/:grade", async (req, res) => {
    try {
      const { subject, grade } = req.params;
      const gradeNum = parseInt(grade);
      
      if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 12) {
        return res.status(400).json({ message: "Invalid grade. Must be between 1 and 12." });
      }

      const topics = getTopicsForSubjectAndGrade('cbse/ncert', subject, gradeNum);
      res.json({ topics });
    } catch (error) {
      console.error("Error fetching topics:", error);
      res.status(500).json({ message: "Failed to fetch topics" });
    }
  });

  // Debug endpoint for API key format
  app.get("/api/debug/api-key", (req, res) => {
    const apiKey = process.env.OPENAI_API_KEY;
    res.json({ 
      hasKey: !!apiKey,
      keyFormat: apiKey ? `${apiKey.substring(0, 10)}...` : 'none',
      keyLength: apiKey?.length || 0
    });
  });

  // Generate questions (now requires authentication and deducts coins)
  app.post("/api/generate-questions", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const requestData = questionGenerationSchema.parse(req.body);
      const userId = req.user!.id;
      
      // Get user and check coin balance
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
      }
      
      const coinPricePerQuestion = BLOOM_COIN_PRICES[requestData.bloomLevel as keyof typeof BLOOM_COIN_PRICES] || 10;
      const coinsRequired = requestData.questionCount * coinPricePerQuestion;
      if (user.coins < coinsRequired) {
        return res.status(400).json({ 
          success: false, 
          error: `Insufficient coins. Required: ${coinsRequired}, Available: ${user.coins}` 
        });
      }
      
      const questions = await generateQuestions(requestData);
      
      // Calculate coins for actually generated questions (not requested amount)
      const actualQuestionsGenerated = questions.length;
      const actualCoinsUsed = actualQuestionsGenerated * coinPricePerQuestion;
      
      // Deduct coins only for actually generated questions
      const newBalance = user.coins - actualCoinsUsed;
      await storage.updateUserCoins(userId, newBalance);
      
      // Record the debit transaction with actual numbers
      await storage.createWalletTransaction({
        userId,
        type: 'debit',
        amount: actualCoinsUsed,
        description: `Generated ${actualQuestionsGenerated} ${requestData.bloomLevel} questions`
      });
      
      // Store the question set with user association
      const questionSet = await storage.createQuestionSet({
        ...requestData,
        userId: userId, // Associate with user
        questions: questions as any, // JSON field
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
      
      if (error instanceof z.ZodError) {
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

  // Get question sets history
  app.get("/api/question-sets", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const questionSets = await storage.getQuestionSets(limit);
      res.json({ questionSets });
    } catch (error) {
      console.error("Error fetching question sets:", error);
      res.status(500).json({ message: "Failed to fetch question sets" });
    }
  });

  // Get specific question set
  app.get("/api/question-sets/:id", async (req, res) => {
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

  // Upload training files (Admin endpoint)
  app.post("/api/admin/upload", upload.array('files', 10), async (req, res) => {
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
          topic: topic || null,
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
      
      if (error instanceof z.ZodError) {
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

  // Get training files
  app.get("/api/admin/training-files", async (req, res) => {
    try {
      const files = await storage.getTrainingFiles();
      res.json({ files });
    } catch (error) {
      console.error("Error fetching training files:", error);
      res.status(500).json({ message: "Failed to fetch training files" });
    }
  });

  // Delete training file
  app.delete("/api/admin/training-files/:id", async (req, res) => {
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

  // Admin endpoint to get hardcoded curriculum topics for content management
  app.get("/api/admin/curriculum-topics/:board/:subject/:grade", async (req, res) => {
    try {
      const { board, subject, grade } = req.params;
      const gradeNum = parseInt(grade);
      
      if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 12) {
        return res.status(400).json({ message: "Invalid grade. Must be between 1 and 12." });
      }

      // Get hardcoded curriculum topics
      const hardcodedTopics = getTopicsForSubjectAndGrade(board, subject, gradeNum);
      
      res.json({ 
        board, 
        subject, 
        grade: gradeNum,
        topics: hardcodedTopics.map(name => ({ name, hasContent: false, contentCount: 0 }))
      });
    } catch (error) {
      console.error("Error fetching curriculum topics:", error);
      res.status(500).json({ message: "Failed to fetch curriculum topics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
