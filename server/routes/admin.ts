import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { FileExtractorService } from "../services/file-extractor";
import { storage } from "../storage";
import { syncCurriculumToDatabase } from "../scripts/sync-curriculum";
import { insertBloomSampleItemSchema } from "@shared/schema";
import type { Request, Response } from "express";
import multer from "multer";
import path from "path";
import { promises as fs } from "fs";

// Extend Request interface to include admin property
interface AdminRequest extends Request {
  admin?: any;
}

const router = Router();

// Multer configuration for file uploads (PDF, DOCX, XLSX, CSV, TXT)
const upload = multer({
  dest: "uploads/content/",
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOCX, XLSX, CSV, and TXT files are allowed"));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Admin authentication middleware
const adminAuth = (req: AdminRequest, res: Response, next: any) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  
  if (!token) {
    return res.status(401).json({ error: "Admin token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any;
    if (decoded.type !== "admin") {
      return res.status(401).json({ error: "Invalid admin token" });
    }
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid admin token" });
  }
};



// Apply admin auth to all routes
router.use(adminAuth);

// ===== USER MANAGEMENT ROUTES =====

// Get all users
router.get("/users", async (req: AdminRequest, res: Response) => {
  try {
    const users = await storage.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Update user coins
router.patch("/users/:userId/coins", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { coins } = z.object({ coins: z.number().int().min(0) }).parse(req.body);
    
    await storage.updateUserCoins(userId, coins);
    res.json({ success: true });
  } catch (error) {
    console.error("Failed to update user coins:", error);
    res.status(500).json({ error: "Failed to update user coins" });
  }
});

// Update user status (suspend/activate)
router.patch("/users/:userId/status", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { isActive } = z.object({ isActive: z.boolean() }).parse(req.body);
    
    await storage.updateUserStatus(userId, isActive);
    res.json({ success: true });
  } catch (error) {
    console.error("Failed to update user status:", error);
    res.status(500).json({ error: "Failed to update user status" });
  }
});

// Delete user completely
router.delete("/users/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    await storage.deleteUser(userId);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Failed to delete user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// ===== CONTENT MANAGEMENT ROUTES =====

// Get all boards
router.get("/boards", async (req: Request, res: Response) => {
  try {
    const boards = await storage.getAllBoards();
    res.json(boards);
  } catch (error) {
    console.error("Failed to fetch boards:", error);
    res.status(500).json({ error: "Failed to fetch boards" });
  }
});

// Create new board
router.post("/boards", async (req: Request, res: Response) => {
  try {
    const { name, fullName, description } = z.object({
      name: z.string().min(1),
      fullName: z.string().min(1),
      description: z.string().optional(),
    }).parse(req.body);
    
    const board = await storage.createBoard({ name, fullName, description, isActive: true });
    res.json(board);
  } catch (error) {
    console.error("Failed to create board:", error);
    res.status(500).json({ error: "Failed to create board" });
  }
});

// Update board
router.patch("/boards/:boardId", async (req: Request, res: Response) => {
  try {
    const { boardId } = req.params;
    const updates = z.object({
      name: z.string().optional(),
      fullName: z.string().optional(),
      description: z.string().optional(),
      isActive: z.boolean().optional(),
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

// Get all subjects
router.get("/subjects", async (req: Request, res: Response) => {
  try {
    const subjects = await storage.getAllSubjects();
    res.json(subjects);
  } catch (error) {
    console.error("Failed to fetch subjects:", error);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

// Get subjects by board
router.get("/boards/:boardId/subjects", async (req: Request, res: Response) => {
  try {
    const { boardId } = req.params;
    const subjects = await storage.getSubjectsByBoard(boardId);
    res.json(subjects);
  } catch (error) {
    console.error("Failed to fetch subjects by board:", error);
    res.status(500).json({ error: "Failed to fetch subjects by board" });
  }
});

// Get subjects by board and grade
router.get("/boards/:boardName/grades/:grade/subjects", async (req: Request, res: Response) => {
  try {
    const { boardName, grade } = req.params;
    const subjects = await storage.getSubjects(boardName, parseInt(grade));
    res.json(subjects);
  } catch (error) {
    console.error("Failed to fetch subjects:", error);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

// Create subject
router.post("/subjects", async (req: Request, res: Response) => {
  try {
    const data = z.object({
      name: z.string().min(1),
      board: z.string().min(1),
      grade: z.number().int().min(1).max(12),
    }).parse(req.body);
    
    const subject = await storage.createSubject(data);
    res.json(subject);
  } catch (error) {
    console.error("Failed to create subject:", error);
    res.status(500).json({ error: "Failed to create subject" });
  }
});

// Update subject
router.patch("/subjects/:subjectId", async (req: Request, res: Response) => {
  try {
    const { subjectId } = req.params;
    const data = z.object({
      name: z.string().min(1),
      board: z.string().min(1),
      grade: z.number().int().min(1).max(12),
    }).parse(req.body);
    
    await storage.updateSubject(subjectId, data);
    res.json({ success: true });
  } catch (error) {
    console.error("Failed to update subject:", error);
    res.status(500).json({ error: "Failed to update subject" });
  }
});

// Delete subject
router.delete("/subjects/:subjectId", async (req: Request, res: Response) => {
  try {
    const { subjectId } = req.params;
    await storage.deleteSubject(subjectId);
    res.json({ success: true });
  } catch (error) {
    console.error("Failed to delete subject:", error);
    res.status(500).json({ error: "Failed to delete subject" });
  }
});

// Get topics for a subject
router.get("/topics/:subjectId?", async (req: Request, res: Response) => {
  try {
    const { subjectId } = req.params;
    const topics = subjectId 
      ? await storage.getTopicsBySubject(subjectId)
      : await storage.getAllTopics();
    res.json(topics);
  } catch (error) {
    console.error("Failed to fetch topics:", error);
    res.status(500).json({ error: "Failed to fetch topics" });
  }
});

// Create topic with optional PDF upload
router.post("/topics", upload.single("pdf"), async (req: Request, res: Response) => {
  try {
    const { name, subjectId } = req.body;
    
    if (!name || !subjectId) {
      return res.status(400).json({ error: "Name and subjectId are required" });
    }

    let pdfFilename = null;
    
    if (req.file) {
      // Create a unique filename for the PDF
      const timestamp = Date.now();
      const originalName = req.file.originalname;
      pdfFilename = `${timestamp}-${originalName}`;
      
      // Ensure the destination directory exists
      const destDir = path.join("uploads", "pdfs");
      await fs.mkdir(destDir, { recursive: true });
      
      // Move the file to a more organized location
      const sourcePath = req.file.path;
      const destPath = path.join(destDir, pdfFilename);
      await fs.rename(sourcePath, destPath);
    }

    const topic = await storage.createTopic({
      name,
      subjectId,
      pdfFilename,
    });
    
    console.log("Topic creation result:", topic); // Add logging to debug
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

// Delete topic
router.delete("/topics/:topicId", async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params;
    
    // Get topic info to delete associated PDF
    const topic = await storage.getTopicById(topicId);
    if (topic?.pdfFilename) {
      try {
        const pdfPath = path.join("uploads", "pdfs", topic.pdfFilename);
        await fs.unlink(pdfPath);
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

// ===== TOPIC CONTENT MANAGEMENT =====

// Get all topic content
router.get("/topic-content", async (req: AdminRequest, res: Response) => {
  try {
    const content = await storage.getAllTopicContent();
    res.json(content);
  } catch (error) {
    console.error("Failed to fetch topic content:", error);
    res.status(500).json({ error: "Failed to fetch topic content" });
  }
});

// Get topic content by topic ID
router.get("/topic-content/topic/:topicId", async (req: AdminRequest, res: Response) => {
  try {
    const { topicId } = req.params;
    const content = await storage.getTopicContentByTopicId(topicId);
    res.json(content);
  } catch (error) {
    console.error("Failed to fetch topic content:", error);
    res.status(500).json({ error: "Failed to fetch topic content" });
  }
});

// Create topic content
router.post("/topic-content", async (req: AdminRequest, res: Response) => {
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
      isActive: true,
    });

    res.json({ success: true, content: newContent });
  } catch (error) {
    console.error("Failed to create topic content:", error);
    res.status(500).json({ error: "Failed to create topic content" });
  }
});

// Update topic content
router.put("/topic-content/:id", async (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, contentType, fileName, fileSize, isActive } = req.body;

    const updatedContent = await storage.updateTopicContent(id, {
      title,
      content,
      contentType,
      fileName,
      fileSize,
      isActive,
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

// Toggle topic content status
router.patch("/topic-content/:id/status", async (req: AdminRequest, res: Response) => {
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

// Delete topic content
router.delete("/topic-content/:id", async (req: AdminRequest, res: Response) => {
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

// Upload topic content file
router.post("/topic-content/upload/:topicId", upload.single("file"), async (req: AdminRequest, res: Response) => {
  try {
    const { topicId } = req.params;
    const { title } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    // Read file content based on type
    let content = "";
    const filePath = req.file.path;
    const fileType = req.file.mimetype;

    try {
      if (fileType === "text/plain") {
        content = await fs.readFile(filePath, "utf-8");
      } else if (fileType === "application/pdf") {
        // For PDF files, store the file path as content for now
        // You can integrate a PDF parsing library later if needed
        content = `PDF file uploaded: ${req.file.originalname}. Content extraction pending.`;
      } else {
        content = await fs.readFile(filePath, "utf-8");
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
      isActive: true,
    });

    // Clean up uploaded file
    try {
      await fs.unlink(filePath);
    } catch (cleanupError) {
      console.error("Failed to cleanup uploaded file:", cleanupError);
    }

    res.json({ success: true, content: newContent });
  } catch (error) {
    console.error("Failed to upload topic content:", error);
    res.status(500).json({ error: "Failed to upload topic content" });
  }
});

// ===== AI RULE MANAGEMENT ROUTES =====

// Get all AI rules
router.get("/ai-rules", async (req: Request, res: Response) => {
  try {
    const rules = await storage.getAllAiRules();
    res.json(rules);
  } catch (error) {
    console.error("Failed to fetch AI rules:", error);
    res.status(500).json({ error: "Failed to fetch AI rules" });
  }
});

// Create AI rule
router.post("/ai-rules", async (req: Request, res: Response) => {
  try {
    const validation = z.object({
      category: z.enum(["global", "question_type", "bloom_level"]),
      subcategory: z.string().optional().nullable(),
      rules: z.string().min(1),
      isActive: z.boolean().default(true),
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

// Update AI rule
router.patch("/ai-rules/:ruleId", async (req: Request, res: Response) => {
  try {
    const { ruleId } = req.params;
    const data = z.object({
      category: z.enum(["global", "question_type", "bloom_level"]),
      subcategory: z.string().optional(),
      rules: z.string().min(1),
    }).parse(req.body);
    
    await storage.updateAiRule(ruleId, data);
    res.json({ success: true });
  } catch (error) {
    console.error("Failed to update AI rule:", error);
    res.status(500).json({ error: "Failed to update AI rule" });
  }
});

// Toggle AI rule status
router.patch("/ai-rules/:ruleId/status", async (req: Request, res: Response) => {
  try {
    const { ruleId } = req.params;
    const { isActive } = z.object({ isActive: z.boolean() }).parse(req.body);
    
    await storage.updateAiRuleStatus(ruleId, isActive);
    res.json({ success: true });
  } catch (error) {
    console.error("Failed to update AI rule status:", error);
    res.status(500).json({ error: "Failed to update AI rule status" });
  }
});

// ===== TOPIC CONTENT MANAGEMENT ROUTES =====

// Get all topic content for a specific topic
router.get("/topic-content/topic/:topicId", adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { topicId } = req.params;
    const content = await storage.getTopicContentByTopicId(topicId);
    res.json(content);
  } catch (error) {
    console.error("Failed to fetch topic content:", error);
    res.status(500).json({ error: "Failed to fetch topic content" });
  }
});

// Create topic content manually
router.post("/topic-content", adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const validation = z.object({
      topicId: z.string(),
      title: z.string().min(1),
      content: z.string().min(1),
      isActive: z.boolean().default(true),
    }).safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({ 
        error: "Invalid input", 
        details: validation.error.errors 
      });
    }

    const contentData = await storage.createTopicContent({
      ...validation.data,
      uploadedBy: req.admin?.id || 'admin'
    });
    res.json({ success: true, content: contentData });
  } catch (error) {
    console.error("Failed to create topic content:", error);
    res.status(500).json({ error: "Failed to create topic content" });
  }
});

// Update topic content
router.put("/topic-content/:contentId", adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { contentId } = req.params;
    
    // Check if this is a status toggle request
    if (req.body.hasOwnProperty('isActive') && Object.keys(req.body).length === 1) {
      const { isActive } = z.object({ isActive: z.boolean() }).parse(req.body);
      const updatedContent = await storage.updateTopicContent(contentId, { isActive });
      return res.json({ success: true, content: updatedContent });
    }
    
    // Otherwise it's a regular content update
    const validation = z.object({
      title: z.string().min(1),
      content: z.string().min(1),
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

// Delete topic content
router.delete("/topic-content/:contentId", adminAuth, async (req: AdminRequest, res: Response) => {
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

// Toggle topic content status
router.patch("/topic-content/:contentId/toggle", adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { contentId } = req.params;
    const { isActive } = z.object({ isActive: z.boolean() }).parse(req.body);
    
    const updatedContent = await storage.toggleTopicContentStatus(contentId, isActive);
    res.json({ success: true, content: updatedContent });
  } catch (error) {
    console.error("Failed to toggle topic content status:", error);
    res.status(500).json({ error: "Failed to toggle topic content status" });
  }
});

// Upload file and extract content with AI
router.post("/topic-content/upload-extract", adminAuth, upload.single('file'), async (req: AdminRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { topicId } = req.body;
    if (!topicId) {
      return res.status(400).json({ error: "Topic ID is required" });
    }

    // Initialize file extractor service
    const fileExtractor = new FileExtractorService();
    
    // Extract content from uploaded file
    const extractedContent = await fileExtractor.extractContentFromFile(
      req.file.path, 
      req.file.originalname
    );

    // Remove existing content for this topic (as requested)
    const existingContent = await storage.getTopicContentByTopicId(topicId);
    for (const content of existingContent) {
      await storage.deleteTopicContent(content.id);
    }

    // Create new content entry
    const newContent = await storage.createTopicContent({
      topicId,
      title: `Content from ${req.file.originalname}`,
      content: extractedContent,
      uploadedBy: req.admin?.id || '1631c764-00fd-4afe-afdd-01dc2c33a390', // Use admin ID instead of email
      fileName: req.file.originalname,
      fileSize: req.file.size,
      contentType: req.file.mimetype,
      isActive: true,
    });

    // Clean up uploaded file
    try {
      await fs.unlink(req.file.path);
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
    
    // Clean up uploaded file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
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

// Sync curriculum data with database
router.post("/sync-curriculum", adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    await syncCurriculumToDatabase();
    res.json({ success: true, message: "Curriculum synced successfully" });
  } catch (error) {
    console.error("Failed to sync curriculum:", error);
    res.status(500).json({ error: "Failed to sync curriculum" });
  }
});

// === Bloom Sample Items Management Routes ===

// Get all bloom sample items
router.get("/bloom-samples", adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { bloomLevel } = req.query;
    const filters = bloomLevel ? { bloomLevel: bloomLevel as string } : undefined;
    const items = await storage.getBloomSampleItems(filters);
    res.json(items);
  } catch (error) {
    console.error("Error fetching bloom sample items:", error);
    res.status(500).json({ error: "Failed to fetch bloom sample items" });
  }
});

// Get bloom sample items by level
router.get("/bloom-samples/:level", adminAuth, async (req: AdminRequest, res: Response) => {
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

// Create bloom sample item
router.post("/bloom-samples", adminAuth, async (req: AdminRequest, res: Response) => {
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

// Update bloom sample item
router.put("/bloom-samples/:id", adminAuth, async (req: AdminRequest, res: Response) => {
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

// Update bloom sample item status
router.patch("/bloom-samples/:id/status", adminAuth, async (req: AdminRequest, res: Response) => {
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

// Delete bloom sample item
router.delete("/bloom-samples/:id", adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    await storage.deleteBloomSampleItem(req.params.id);
    res.json({ message: "Bloom sample item deleted successfully" });
  } catch (error) {
    console.error("Error deleting bloom sample item:", error);
    res.status(500).json({ error: "Failed to delete bloom sample item" });
  }
});

export default router;