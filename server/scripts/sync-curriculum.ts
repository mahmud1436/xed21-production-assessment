// Script to sync comprehensive curriculum data with admin database
import { storage } from '../storage';
import { getTopicsForSubjectAndGrade, getSubjectsForBoardAndGrade } from '../services/curriculum';

async function syncCurriculumToDatabase() {
  try {
    console.log('Starting comprehensive curriculum sync for all boards and grades...');
    
    const boards = ['cbse/ncert', 'icse/cisce'];
    let totalSynced = 0;
    
    for (const boardKey of boards) {
      console.log(`\n=== Syncing ${boardKey.toUpperCase()} ===`);
      
      // Ensure board exists in database
      let board = await storage.getBoardByName(boardKey);
      if (!board) {
        console.log(`Creating board: ${boardKey}`);
        board = await storage.createBoard({
          name: boardKey,
          displayName: boardKey === 'cbse/ncert' ? 'CBSE/NCERT' : 'ICSE/CISCE'
        });
      }
      
      // Sync all grades 1-12
      for (let grade = 1; grade <= 12; grade++) {
        console.log(`\n--- Syncing Grade ${grade} ---`);
        
        const subjects = getSubjectsForBoardAndGrade(boardKey, grade);
        console.log(`Found ${subjects.length} subjects for Grade ${grade}`);
        
        for (const subjectName of subjects) {
          console.log(`Syncing subject: ${subjectName}`);
          
          // Ensure subject exists in database
          let subject = await storage.getSubjectByDetails(boardKey, subjectName, grade);
          if (!subject) {
            console.log(`Creating subject: ${subjectName} (Grade ${grade})`);
            subject = await storage.createSubject({
              name: subjectName,
              grade: grade,
              boardId: board.id
            });
          }
          
          // Get curriculum topics for this subject and grade
          const curriculumTopics = getTopicsForSubjectAndGrade(boardKey, subjectName, grade);
          console.log(`Found ${curriculumTopics.length} topics for ${subjectName}`);
          
          // Get existing topics from database
          const existingTopics = await storage.getTopicsBySubject(subject.id);
          
          // Add new topics that don't exist in database
          for (const topicName of curriculumTopics) {
            const existingTopic = existingTopics.find(t => t.name === topicName);
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
    
    console.log(`\n✅ Comprehensive curriculum sync completed! Total items synced: ${totalSynced}`);
  } catch (error) {
    console.error('Error during curriculum sync:', error);
    throw error;
  }
}

export { syncCurriculumToDatabase };