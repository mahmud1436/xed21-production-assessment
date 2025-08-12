import { storage } from '../storage';
import { getTopicsForSubjectAndGrade, getSubjectsForBoardAndGrade } from './curriculum';
import type { Topic, TopicContent } from '../../shared/schema';

/**
 * Service to synchronize hardcoded curriculum data with database content management
 */
export class ContentSyncService {
  
  /**
   * Find database topic ID that matches hardcoded curriculum topic
   */
  async findTopicId(board: string, subject: string, grade: number, topicName: string): Promise<string | null> {
    try {
      // Get all database topics for the board and subject
      // For now, use a simple approach - we'll enhance this later
      const allTopics = await storage.getAllTopics();
      const dbTopics = allTopics.filter(t => 
        // Simple filtering logic for now
        t.name.toLowerCase().includes(subject.toLowerCase())
      );
      
      // Find exact match by name
      const exactMatch = dbTopics.find((t: Topic) => t.name === topicName);
      if (exactMatch) return exactMatch.id;
      
      // Find fuzzy match (case-insensitive, partial)
      const fuzzyMatch = dbTopics.find((t: Topic) => 
        t.name.toLowerCase().includes(topicName.toLowerCase()) ||
        topicName.toLowerCase().includes(t.name.toLowerCase())
      );
      if (fuzzyMatch) return fuzzyMatch.id;
      
      return null;
    } catch (error) {
      console.error('Error finding topic ID:', error);
      return null;
    }
  }

  /**
   * Get content for a hardcoded curriculum topic by finding its database equivalent
   */
  async getContentForTopic(board: string, subject: string, grade: number, topicName: string) {
    const topicId = await this.findTopicId(board, subject, grade, topicName);
    if (!topicId) return null;
    
    try {
      return await storage.getTopicContentByTopicId(topicId);
    } catch (error) {
      console.error('Error getting topic content:', error);
      return null;
    }
  }

  /**
   * Get all available topics from hardcoded curriculum with their database content status
   */
  async getTopicsWithContentStatus(board: string, subject: string, grade: number) {
    // Get hardcoded topics
    const hardcodedTopics = getTopicsForSubjectAndGrade(board, subject, grade);
    
    // For each hardcoded topic, check if database content exists
    const topicsWithStatus = await Promise.all(
      hardcodedTopics.map(async (topicName) => {
        const topicId = await this.findTopicId(board, subject, grade, topicName);
        const hasContent = topicId ? await this.hasTopicContent(topicId) : false;
        
        return {
          name: topicName,
          id: topicId,
          hasContent,
          contentCount: hasContent ? await this.getContentCount(topicId) : 0
        };
      })
    );
    
    return topicsWithStatus;
  }

  /**
   * Check if a topic has any content in the database
   */
  private async hasTopicContent(topicId: string): Promise<boolean> {
    try {
      const content = await storage.getTopicContentByTopicId(topicId);
      return content && content.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get count of content items for a topic
   */
  private async getContentCount(topicId: string | null): Promise<number> {
    if (!topicId) return 0;
    try {
      const content = await storage.getTopicContentByTopicId(topicId);
      return content ? content.length : 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Create a mapping between hardcoded topics and database topics for admin interface
   */
  async createTopicMapping(board: string, subject: string, grade: number) {
    const hardcodedTopics = getTopicsForSubjectAndGrade(board, subject, grade);
    const mapping: { [hardcodedName: string]: string | null } = {};
    
    for (const topicName of hardcodedTopics) {
      mapping[topicName] = await this.findTopicId(board, subject, grade, topicName);
    }
    
    return mapping;
  }
}

export const contentSyncService = new ContentSyncService();