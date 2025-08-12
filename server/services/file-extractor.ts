import * as fs from 'fs';
import * as path from 'path';
import OpenAI from "openai";

// File content extraction service
export class FileExtractorService {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OpenRouter API key is missing');
    }
    
    this.openai = new OpenAI({ 
      apiKey: apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://eduassess-ai.replit.app",
        "X-Title": "EduAssess AI",
      },
    });
  }

  async extractContentFromFile(filePath: string, fileName: string): Promise<string> {
    const fileExtension = path.extname(fileName).toLowerCase();
    let rawContent = '';

    try {
      switch (fileExtension) {
        case '.pdf':
          rawContent = await this.extractFromPDF(filePath);
          break;
        case '.docx':
          rawContent = await this.extractFromDOCX(filePath);
          break;
        case '.xlsx':
        case '.xls':
          rawContent = await this.extractFromExcel(filePath);
          break;
        case '.csv':
          rawContent = await this.extractFromCSV(filePath);
          break;
        case '.txt':
          rawContent = await this.extractFromTXT(filePath);
          break;
        default:
          throw new Error(`Unsupported file type: ${fileExtension}`);
      }

      // Use AI to clean and structure the extracted content
      const structuredContent = await this.structureContentWithAI(rawContent, fileName);
      return structuredContent;

    } catch (error) {
      console.error('File extraction error:', error);
      throw new Error(`Failed to extract content from ${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async extractFromPDF(filePath: string): Promise<string> {
    try {
      // Simple fallback approach to avoid library issues
      const dataBuffer = fs.readFileSync(filePath);
      
      // Basic PDF text extraction - look for text between stream markers
      const pdfString = dataBuffer.toString('latin1');
      let extractedText = '';
      
      // Simple regex to find text streams in PDF
      const textMatches = pdfString.match(/stream[\s\S]*?endstream/g);
      if (textMatches) {
        textMatches.forEach(match => {
          // Remove stream markers and extract readable text
          const content = match.replace(/^stream\s*/, '').replace(/\s*endstream$/, '');
          const readable = content.replace(/[^\x20-\x7E\n\r\t]/g, ' ').trim();
          if (readable.length > 10) {
            extractedText += readable + '\n';
          }
        });
      }
      
      // If no text found, return a message indicating PDF processing limitation
      if (!extractedText.trim()) {
        return `PDF file processed: ${path.basename(filePath)}. 
Content extraction limited - please provide text-based content or use AI to describe the PDF content based on filename and context.`;
      }
      
      return extractedText.substring(0, 5000); // Limit to 5k chars
      
    } catch (error) {
      return `PDF file received: ${path.basename(filePath)}. Basic extraction failed. Please provide the key content manually or use AI to process this educational material.`;
    }
  }

  private async extractFromDOCX(filePath: string): Promise<string> {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  private async extractFromExcel(filePath: string): Promise<string> {
    const XLSX = await import('xlsx');
    const workbook = XLSX.readFile(filePath);
    let content = '';
    
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      content += `Sheet: ${sheetName}\n`;
      (jsonData as any[]).forEach((row: any[]) => {
        if (row && Array.isArray(row) && row.length > 0) {
          content += row.join('\t') + '\n';
        }
      });
      content += '\n';
    });
    
    return content;
  }

  private async extractFromCSV(filePath: string): Promise<string> {
    const csv = await import('csv-parser');
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      fs.createReadStream(filePath)
        .pipe(csv.default())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          let content = '';
          if (results.length > 0) {
            // Add headers
            content += Object.keys(results[0]).join('\t') + '\n';
            // Add data
            results.forEach(row => {
              content += Object.values(row).join('\t') + '\n';
            });
          }
          resolve(content);
        })
        .on('error', reject);
    });
  }

  private async extractFromTXT(filePath: string): Promise<string> {
    return fs.readFileSync(filePath, 'utf8');
  }

  private async structureContentWithAI(rawContent: string, fileName: string): Promise<string> {
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
${rawContent.substring(0, 8000)} ${rawContent.length > 8000 ? '...(truncated)' : ''}

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
        max_tokens: 4000,
      });

      return response.choices[0]?.message?.content || rawContent;
    } catch (error) {
      console.error('AI structuring error:', error);
      // Return the raw content if AI processing fails
      return rawContent;
    }
  }
}