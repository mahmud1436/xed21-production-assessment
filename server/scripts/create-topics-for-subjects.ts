// Create topics for all subjects that don't have topics yet
import { db } from '../db';
import { subjects, topics } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { getTopicsForSubjectAndGrade } from '../services/curriculum';

async function createTopicsForSubjects() {
  try {
    console.log('🎯 Creating topics for subjects...');
    
    // Get all subjects
    const allSubjects = await db.select().from(subjects);
    console.log(`📊 Total subjects: ${allSubjects.length}`);
    
    // Get all existing topics
    const allTopics = await db.select().from(topics);
    console.log(`📊 Existing topics: ${allTopics.length}`);
    
    let addedTopics = 0;
    
    for (const subject of allSubjects) {
      // Check if this subject already has topics
      const existingTopics = allTopics.filter(t => t.subjectId === subject.id);
      
      if (existingTopics.length === 0) {
        console.log(`\n📝 Creating topics for: ${subject.name} Grade ${subject.grade} (${subject.board})`);
        
        // Get curriculum topics for this subject
        let boardKey = subject.board?.toLowerCase();
        if (boardKey === 'icse') {
          boardKey = 'icse/cisce';
        } else if (boardKey === 'cbse') {
          boardKey = 'cbse/ncert';
        }
        
        const curriculumTopics = getTopicsForSubjectAndGrade(boardKey, subject.name, subject.grade);
        
        if (curriculumTopics.length > 0) {
          console.log(`   📚 Adding ${curriculumTopics.length} curriculum topics`);
          
          for (const topicName of curriculumTopics) {
            await db.insert(topics).values({
              name: topicName,
              subjectId: subject.id,
              pdfFilename: null
            });
            addedTopics++;
          }
        } else {
          // Fallback topics if no curriculum topics found
          const fallbackTopics = [
            'Introduction',
            'Basic Concepts', 
            'Fundamentals',
            'Applications',
            'Advanced Topics'
          ];
          
          console.log(`   📚 Adding ${fallbackTopics.length} fallback topics`);
          
          for (const topicName of fallbackTopics) {
            await db.insert(topics).values({
              name: topicName,
              subjectId: subject.id,
              pdfFilename: null
            });
            addedTopics++;
          }
        }
      } else {
        console.log(`✅ ${subject.name} Grade ${subject.grade} already has ${existingTopics.length} topics`);
      }
    }
    
    console.log(`\n🎉 Successfully created ${addedTopics} new topics!`);
    
    // Final verification
    const finalTopics = await db.select().from(topics);
    console.log(`📊 Total topics now: ${finalTopics.length}`);
    
    console.log('\n✅ Topic creation completed!');
    
  } catch (error) {
    console.error('❌ Error creating topics:', error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  createTopicsForSubjects()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { createTopicsForSubjects };