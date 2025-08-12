// Complete curriculum sync script
import { storage } from '../storage';
import { getSubjectsForBoardAndGrade, getTopicsForSubjectAndGrade } from '../services/curriculum';

async function syncAllCurriculumToDatabase() {
  try {
    console.log('Starting complete curriculum sync...');
    
    // Get all boards from database
    const boards = await storage.getAllBoards();
    console.log(`Found ${boards.length} boards in database`);
    
    for (const board of boards) {
      console.log(`\nProcessing board: ${board.name}`);
      
      // Sync subjects for each grade
      for (let grade = 1; grade <= 12; grade++) {
        const curriculumSubjects = getSubjectsForBoardAndGrade(board.name.toLowerCase(), grade);
        
        if (curriculumSubjects.length === 0) continue;
        
        console.log(`  Grade ${grade}: ${curriculumSubjects.join(', ')}`);
        
        // Get existing subjects for this board and grade
        const existingSubjects = await storage.getAllSubjects();
        const boardSubjects = existingSubjects.filter((s: any) => 
          s.board?.toLowerCase() === board.name.toLowerCase() && s.grade === grade
        );
        
        for (const subjectName of curriculumSubjects) {
          // Check if subject already exists
          let subject = boardSubjects.find((s: any) => s.name === subjectName);
          
          if (!subject) {
            console.log(`    Creating subject: ${subjectName}`);
            try {
              subject = await storage.createSubject({
                name: subjectName,
                board: board.name,
                grade: grade,
                description: `${subjectName} curriculum for ${board.name} grade ${grade}`,
                isActive: true,
                boardId: board.id
              });
            } catch (error) {
              console.error(`    Failed to create subject ${subjectName}:`, error);
              continue;
            }
          }
          
          // Sync topics for this subject
          const curriculumTopics = getTopicsForSubjectAndGrade(subjectName, grade);
          if (curriculumTopics.length === 0) continue;
          
          const existingTopics = await storage.getTopicsBySubject(subject.id);
          
          // Add missing topics
          for (const topicName of curriculumTopics) {
            const existingTopic = existingTopics.find(t => t.name === topicName);
            if (!existingTopic) {
              console.log(`      Creating topic: ${topicName}`);
              try {
                await storage.createTopic({
                  name: topicName,
                  subjectId: subject.id
                });
              } catch (error) {
                console.error(`      Failed to create topic ${topicName}:`, error);
              }
            }
          }
          
          // Remove topics not in curriculum (only for specific cases we want to clean up)
          if (subjectName === 'Science' && grade === 6 && board.name.toLowerCase() === 'ncert') {
            for (const existingTopic of existingTopics) {
              if (!curriculumTopics.includes(existingTopic.name)) {
                console.log(`      Removing outdated topic: ${existingTopic.name}`);
                await storage.deleteTopic(existingTopic.id);
              }
            }
          }
        }
      }
    }
    
    console.log('\nComplete curriculum sync finished successfully!');
  } catch (error) {
    console.error('Error during complete curriculum sync:', error);
    throw error;
  }
}

export { syncAllCurriculumToDatabase };