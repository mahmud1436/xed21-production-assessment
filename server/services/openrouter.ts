import OpenAI from "openai";
import { type QuestionGenerationRequest, type GeneratedQuestion } from "@shared/schema";
import { storage } from "../storage";

// Using OpenRouter.ai which provides access to multiple AI models through OpenAI-compatible API
function getOpenRouterClient() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  console.log(`OpenRouter API Key format: ${apiKey?.substring(0, 10)}...`);
  console.log(`API Key length: ${apiKey?.length}`);
  
  if (!apiKey) {
    throw new Error('OpenRouter API key is missing. Please provide a valid API key.');
  }
  
  return new OpenAI({ 
    apiKey: apiKey,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": "https://eduassess-ai.replit.app", // Your site URL
      "X-Title": "EduAssess AI", // Your app name
    },
  });
}

export async function generateQuestions(request: QuestionGenerationRequest): Promise<GeneratedQuestion[]> {
  const openai = getOpenRouterClient();
  let attempts = 0;
  const maxAttempts = 1; // Reduced from 3 to 1 for faster generation
  const validatedQuestions: GeneratedQuestion[] = [];
  
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
        temperature: 0.7,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      const generatedQuestions = result.questions || [];
      
      // Directly add generated questions without extra verification
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
  
  // Return whatever questions were successfully generated
  return validatedQuestions;
}

// Helper function to generate grade-specific cognitive load guidance
function generateGradeCognitiveGuidance(requestedGrade: number): string {
  const gradeRanges = [
    { range: "1-2", description: "Elementary foundation level - Use simple, concrete concepts with basic vocabulary and single-step reasoning" },
    { range: "3-4", description: "Elementary intermediate level - Introduce multi-step thinking with familiar contexts and age-appropriate complexity" },
    { range: "5-6", description: "Elementary advanced level - Incorporate abstract thinking with structured reasoning and moderate complexity" },
    { range: "7-8", description: "Middle school level - Develop analytical thinking with increased complexity and cross-curricular connections" },
    { range: "9-10", description: "High school intermediate level - Apply sophisticated reasoning with real-world applications and nuanced understanding" },
    { range: "11-12", description: "High school advanced level - Demonstrate expert-level thinking with complex analysis and synthesis" }
  ];

  let guidance = `For Grade ${requestedGrade} students:\n`;
  
  // Find the appropriate range
  let currentRange = "";
  if (requestedGrade <= 2) currentRange = gradeRanges[0].description;
  else if (requestedGrade <= 4) currentRange = gradeRanges[1].description;
  else if (requestedGrade <= 6) currentRange = gradeRanges[2].description;
  else if (requestedGrade <= 8) currentRange = gradeRanges[3].description;
  else if (requestedGrade <= 10) currentRange = gradeRanges[4].description;
  else currentRange = gradeRanges[5].description;

  guidance += `• Current Grade Expectation: ${currentRange}\n`;

  // Add comparative guidance if referencing samples from different grades
  if (requestedGrade > 1) {
    guidance += `• If referencing lower grade samples: Increase vocabulary sophistication, add complexity layers, and expand reasoning depth\n`;
  }
  if (requestedGrade < 12) {
    guidance += `• If referencing higher grade samples: Simplify language, reduce complexity steps, and use more concrete examples\n`;
  }

  guidance += `• Cognitive Load Balance: Maintain the Bloom's level complexity while adjusting presentation difficulty for Grade ${requestedGrade}\n`;
  guidance += `• Reading Level: Ensure vocabulary and sentence structure match Grade ${requestedGrade} comprehension level`;

  return guidance;
}

async function createQuestionPrompt(request: QuestionGenerationRequest): Promise<string> {
  const questionTypeInstructions = getQuestionTypeInstructions(request.itemType);
  const bloomLevelInstructions = getBloomLevelInstructions(request.bloomLevel);
  
  // STEP 1: Check AI Rule Management first
  let aiRulesContent = "";
  let aiRulesContext = "";
  
  try {
    const aiRules = await storage.getAiRules();
    if (aiRules && aiRules.length > 0) {
      // Group rules by category for better organization
      const questionTypeRules = aiRules.filter((rule: any) => 
        rule.category === 'question_type' && rule.subcategory === request.itemType
      );
      const bloomLevelRules = aiRules.filter((rule: any) => 
        rule.category === 'bloom_level' && rule.subcategory === request.bloomLevel
      );
      const subjectRules = aiRules.filter((rule: any) => 
        rule.category === 'subject' && rule.subcategory.toLowerCase() === request.subject.toLowerCase()
      );
      const gradeRules = aiRules.filter((rule: any) => 
        rule.category === 'grade' && rule.subcategory === request.grade.toString()
      );
      // Removed difficulty rules - difficulty level feature removed
      
      // Combine all applicable rules
      const applicableRules = [
        ...questionTypeRules,
        ...bloomLevelRules, 
        ...subjectRules,
        ...gradeRules
      ];
      
      if (applicableRules.length > 0) {
        const rulesText = applicableRules
          .map(rule => `${rule.category}/${rule.subcategory}: ${rule.rules}`)
          .join('\n');
        aiRulesContent = `\n\n**MANDATORY AI RULES - Follow these rules strictly:**\n\n${rulesText}\n\nThese rules must be followed exactly when generating questions.`;
        aiRulesContext = "\n- Questions must strictly follow the AI rules defined above";
      }
    }
  } catch (error) {
    console.log("AI Rules not found or error loading them:", error);
  }

  // STEP 1.5: Get Bloom Sample Items for cognitive level reference with grade-based cognitive load consideration
  let bloomSamplesContent = "";
  let bloomSamplesContext = "";
  
  try {
    const bloomSamples = await storage.getBloomSampleItems({ bloomLevel: request.bloomLevel });
    if (bloomSamples && bloomSamples.length > 0) {
      const activeSamples = bloomSamples.filter(sample => sample.isActive);
      if (activeSamples.length > 0) {
        // Sort samples by grade proximity to requested grade for better cognitive load matching
        const sortedSamples = activeSamples.sort((a, b) => {
          const aGrade = a.grade || 5;
          const bGrade = b.grade || 5;
          const aDistance = Math.abs(aGrade - request.grade);
          const bDistance = Math.abs(bGrade - request.grade);
          return aDistance - bDistance;
        });

        // Take up to 3 closest samples for reference
        const selectedSamples = sortedSamples.slice(0, 3);
        const samplesText = selectedSamples
          .map(sample => `- Grade ${sample.grade || 5} (${sample.subject || 'Science'}): ${sample.sampleQuestion}`)
          .join('\n');

        // Generate grade-specific cognitive load guidance
        const gradeGuidance = generateGradeCognitiveGuidance(request.grade);
        
        bloomSamplesContent = `\n\n**BLOOM'S COGNITIVE LEVEL REFERENCE - Study these examples to match the cognitive complexity and structure:**\n\n${request.bloomLevel.toUpperCase()} Level Reference Examples:\n${samplesText}\n\n**GRADE-BASED COGNITIVE LOAD CONSIDERATION:**\n${gradeGuidance}\n\nIMPORTANT: Use these samples to understand:\n1. The appropriate cognitive complexity for "${request.bloomLevel}" level at Grade ${request.grade}\n2. The structural patterns (scenario + visual + question + options)\n3. The depth of thinking required for Grade ${request.grade} students\n4. How to adjust complexity based on the grade level while maintaining the Bloom's taxonomy level\n\nGenerate your questions in the requested format (${request.itemType}) while maintaining the same cognitive level but adjusting complexity appropriately for Grade ${request.grade} students.`;
        bloomSamplesContext = "\n- Use bloom sample items as cognitive level references with grade-appropriate complexity adjustment";
      }
    }
  } catch (error) {
    console.log("Bloom samples not found or error loading them:", error);
  }
  
  // STEP 2: Try to find topic-specific admin content (secondary priority)
  let topicContent = "";
  let topicContext = "";
  
  try {
    const topics = await storage.getAllTopics();
    const matchedTopic = topics.find(topic => 
      topic.name.toLowerCase() === request.topic.toLowerCase()
    );
    
    if (matchedTopic) {
      const topicContentData = await storage.getTopicContentByTopicId(matchedTopic.id);
      if (topicContentData && topicContentData.length > 0) {
        const contentTexts = topicContentData
          .filter((content: any) => content.isActive)
          .map((content: any) => `${content.title}: ${content.content}`)
          .join('\n\n');
        
        if (contentTexts.trim()) {
          topicContent = `\n\n**ADMIN-CURATED CONTENT: Use this content as primary source:**\n\n${contentTexts}\n\nPrefer generating questions from this content when possible.`;
          topicContext = "\n- Prefer questions derived from the admin content provided above";
        }
      }
    }
  } catch (error) {
    console.log("No topic-specific content found, will use curriculum data or general knowledge");
  }
  
  // STEP 3: If no admin content, check curriculum data (tertiary priority)  
  let curriculumContent = "";
  let curriculumContext = "";
  
  if (!topicContent.trim()) {
    try {
      // Import curriculum data and check if topic exists
      const { curriculumData } = await import('./curriculum');
      const subjectTopics = (curriculumData.topics as any)[request.subject];
      
      if (subjectTopics) {
        const gradeRange = getGradeRange(request.grade);
        const topicsForGrade = subjectTopics[gradeRange];
        
        if (topicsForGrade && topicsForGrade.includes(request.topic)) {
          curriculumContent = `\n\n**CURRICULUM CONTENT: Base questions on standard curriculum for:**\n\nBoard: ${request.board}\nSubject: ${request.subject}\nGrade: ${request.grade}\nTopic: ${request.topic}\n\nUse standard curriculum knowledge for this topic.`;
          curriculumContext = "\n- Generate questions based on standard curriculum knowledge";
        }
      }
    } catch (error) {
      console.log("Curriculum data not available, will use AI general knowledge");
    }
  }
  
  // STEP 4: Process Learning Outcome/Standard for verb-focused generation
  let learningOutcomeSection = "";
  let learningOutcomeContext = "";
  
  if (request.learningOutcome && request.learningOutcome.trim()) {
    // Extract key verbs from the learning outcome
    const actionVerbs = extractActionVerbs(request.learningOutcome);
    const verbInstruction = actionVerbs.length > 0 
      ? `The questions must focus primarily on the following action verbs from the learning outcome: ${actionVerbs.join(', ')}. Design questions that specifically test students' ability to perform these actions.`
      : `Focus on the key learning objective and ensure questions test the specific skill or knowledge described.`;
    
    learningOutcomeSection = `\n\n**LEARNING OUTCOME/STANDARD - HIGHEST PRIORITY:**
${request.learningOutcome}

${verbInstruction}

All questions and answer choices must directly relate to demonstrating this learning outcome.`;
    
    learningOutcomeContext = "\n- Questions MUST align with and test the specific learning outcome provided";
  }

  // STEP 5: Final fallback message (AI general knowledge)
  let fallbackContent = "";
  if (!topicContent.trim() && !curriculumContent.trim()) {
    fallbackContent = `\n\n**GENERAL KNOWLEDGE MODE: Use AI knowledge as last resort:**\n\nGenerate questions using your general knowledge about the topic "${request.topic}" for ${request.subject} at Grade ${request.grade} level.`;
  }

  return `
Generate ${request.questionCount} assessment questions for the following parameters:

Board: ${request.board.toUpperCase()}
Grade: ${request.grade}
Subject: ${request.subject}
Topic: ${request.topic}
Question Type: ${request.itemType}
Bloom's Taxonomy Level: ${request.bloomLevel}${learningOutcomeSection}${aiRulesContent}${bloomSamplesContent}${topicContent}${curriculumContent}${fallbackContent}

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

function getQuestionTypeInstructions(itemType: string): string {
  const instructions: Record<string, string> = {
    multiple_choice: "**MULTIPLE CHOICE RULES:** Four options (A–D) with correct answer randomly positioned. Create at least one distractor numerically close (math) or textually similar (ELA). Stem must be complete and independent - avoid 'Which of the following...' without context. Never use absolutes ('always,' 'never') as correct answers. **MANDATORY FOR NON-REMEMBERING LEVELS: Include scenario paragraph that references a specific visual element (chart, image, table, diagram) that students must analyze to answer the question.** Arrange options by character length (shortest to longest). Provide explanations starting with 'Correct.' or 'Incorrect.'",
    
    multiple_select: "**MULTIPLE SELECT RULES:** Six options (A–F) with exactly 2–4 correct answers. Correct answers should not be clustered together. Incorrect choices must be clearly wrong under scrutiny. Specify 'Select all that apply' in instructions. **MANDATORY FOR NON-REMEMBERING LEVELS: Embed scenario that explicitly references a data table, graphic, or visual element that students must interpret.** Arrange options by character length (shortest to longest). Provide explanations starting with 'Correct.' or 'Incorrect.'",
    
    fill_blanks: "**FILL BLANKS RULES:** Target critical vocabulary or numerical values in blanks. Avoid blanks at sentence start or end. Limit each blank to one concept. Provide exact strings and list alternate valid spellings. **MANDATORY FOR NON-REMEMBERING LEVELS: Include brief scenario that references a data table, annotated diagram, or visual element in the stem.**",
    
    inline_choice: "**INLINE CHOICE RULES:** Exactly 3 options per blank, labeled (A), (B), (C). All choices must grammatically and contextually fit the sentence. Each choice tests a distinct nuance. **MANDATORY FOR NON-REMEMBERING LEVELS: Embed scenario that references a chart, image, or visual element alongside the sentence.**",
    
    matching: "**MATCHING RULES:** 4–5 pairs with left/right columns equal in difficulty. One-to-one mapping with no duplicate matches. All items must be in same domain (vocab → definition). **MANDATORY FOR NON-REMEMBERING LEVELS: Provide scenario that references a labeled diagram, data table, or visual element to match against.** Arrange items by character length within each column.",
    
    true_false: "**TRUE/FALSE RULES:** Each statement must be 100% true or false - no mixed logic or compound statements. Use qualifiers only when accurate. In a set, aim for equal true/false balance. **MANDATORY FOR NON-REMEMBERING LEVELS: Present scenario that references a chart, image, or visual element and ask T/F statements about it.** Provide explanations for both A (True) and B (False) starting with 'Correct.' or 'Incorrect.'"
  };

  return instructions[itemType] || instructions.multiple_choice;
}

function getBloomLevelInstructions(bloomLevel: string): string {
  const instructions: Record<string, string> = {
    remembering: "**REMEMBERING RULES:** Focus on key vocabulary, dates, formulas, definitions. Use verbs like define, list, identify. Provide minimal stimulus—single term or very short context. No complex visuals required.",
    
    understanding: "**UNDERSTANDING RULES:** Focus on conceptual explanation, paraphrasing, or explaining relationships. Use verbs like explain, describe, summarize. **MANDATORY: Include brief scenario that references diagrams, charts, images, or visual elements for students to interpret.** Present short passages or scenarios that require visual analysis.",
    
    applying: "**APPLYING RULES:** Create real-world context scenarios where learners apply principles to new situations. Use verbs like apply, solve, demonstrate. Specify needed procedures or calculations clearly. **MANDATORY: Include scenario that explicitly references diagrams, charts, tables, or data excerpts that represent the problem situation.**",
    
    analyzing: "**ANALYZING RULES:** Provide complex stimulus like short passages, data tables, or graphic organizers requiring breakdown. Use verbs like analyze, compare, deconstruct. Ask students to cite parts of the stimulus as evidence. **MANDATORY: Include scenario with annotated graphs, diagrams, data tables, or visual elements that illustrate relationships and require analysis.**",
    
    evaluating: "**EVALUATING RULES:** Create comparison scenarios with two distinct options/sites/methods that students must judge and select the better choice. Structure: 1) Brief scenario setup, 2) [Image Description: ...] showing contrasting visual elements for each option, 3) Question asking which is better and why, 4) Four options where correct answer explains why the better choice works and incorrect options contain plausible misconceptions. Use verbs like evaluate, critique, justify, compare effectiveness. **MANDATORY: Include detailed image description in brackets showing contrasting visual elements that students must analyze to make judgments.**",
    
    creating: "**CREATING RULES:** Design open-ended tasks generating original responses—designs, plans, compositions. Use verbs like create, design, formulate. Provide success criteria/rubrics for originality and alignment. **MANDATORY: Include scenario that references prototype images, sample data, charts, or visual elements that inform the creation task.**"
  };

  return instructions[bloomLevel] || instructions.understanding;
}

// Helper function to extract action verbs from learning outcomes
function extractActionVerbs(learningOutcome: string): string[] {
  // Common educational action verbs
  const educationalVerbs = [
    'analyze', 'apply', 'argue', 'assess', 'classify', 'compare', 'contrast',
    'create', 'define', 'demonstrate', 'describe', 'design', 'determine',
    'develop', 'differentiate', 'discuss', 'distinguish', 'evaluate', 'examine',
    'explain', 'identify', 'illustrate', 'implement', 'interpret', 'investigate',
    'justify', 'list', 'organize', 'plan', 'predict', 'prove', 'recognize',
    'recommend', 'solve', 'summarize', 'support', 'synthesize', 'understand',
    'use', 'validate', 'verify'
  ];
  
  const words = learningOutcome.toLowerCase().split(/\s+/);
  const foundVerbs = [];
  
  for (const word of words) {
    // Remove punctuation and check if word is an educational verb
    const cleanWord = word.replace(/[^\w]/g, '');
    if (educationalVerbs.includes(cleanWord)) {
      foundVerbs.push(cleanWord);
    }
  }
  
  // Remove duplicates and return
  return Array.from(new Set(foundVerbs));
}





// Helper function to determine grade range for curriculum data
function getGradeRange(grade: number): string {
  if (grade >= 1 && grade <= 5) return "1-5";
  if (grade >= 6 && grade <= 8) return "6-8";
  if (grade >= 9 && grade <= 10) return "9-10";
  if (grade >= 11 && grade <= 12) return "11-12";
  return "6-8"; // fallback
}
