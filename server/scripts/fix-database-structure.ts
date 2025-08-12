// Fix database structure for complete ICSE coverage
import { db } from '../db';
import { boards, subjects } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { getSubjectsForBoardAndGrade } from '../services/curriculum';

async function fixDatabaseStructure() {
  try {
    console.log('🔧 Fixing database structure for complete ICSE coverage...');
    
    // Ensure both boards exist
    const boardsToCreate = [
      { name: 'cbse/ncert', displayName: 'CBSE/NCERT' },
      { name: 'icse/cisce', displayName: 'ICSE/CISCE' }
    ];
    
    for (const boardData of boardsToCreate) {
      const [existing] = await db.select().from(boards).where(eq(boards.name, boardData.name));
      if (!existing) {
        console.log(`📚 Creating board: ${boardData.displayName}`);
        await db.insert(boards).values({
          name: boardData.name,
          displayName: boardData.displayName,
          isActive: true
        });
      } else {
        console.log(`✅ Board exists: ${boardData.displayName}`);
      }
    }
    
    // Get all boards
    const allBoards = await db.select().from(boards);
    const icseBoard = allBoards.find(b => b.name === 'icse/cisce');
    const cbseBoard = allBoards.find(b => b.name === 'cbse/ncert');
    
    if (!icseBoard || !cbseBoard) {
      throw new Error('Failed to find required boards');
    }
    
    console.log(`📋 ICSE Board ID: ${icseBoard.id}`);
    console.log(`📋 CBSE Board ID: ${cbseBoard.id}`);
    
    // Add all missing subjects for all grades
    let totalAdded = 0;
    
    for (const boardInfo of [
      { board: icseBoard, key: 'icse/cisce' },
      { board: cbseBoard, key: 'cbse/ncert' }
    ]) {
      console.log(`\n🔄 Processing ${boardInfo.key}...`);
      
      for (let grade = 1; grade <= 12; grade++) {
        const expectedSubjects = getSubjectsForBoardAndGrade(boardInfo.key, grade);
        console.log(`   Grade ${grade}: ${expectedSubjects.length} subjects expected`);
        
        for (const subjectName of expectedSubjects) {
          // Check if this exact combination exists
          const [existing] = await db.select().from(subjects).where(
            and(
              eq(subjects.boardId, boardInfo.board.id),
              eq(subjects.name, subjectName),
              eq(subjects.grade, grade)
            )
          );
          
          if (!existing) {
            await db.insert(subjects).values({
              name: subjectName,
              grade: grade,
              boardId: boardInfo.board.id,
              board: boardInfo.key,
              description: `${subjectName} for Grade ${grade} - ${boardInfo.board.displayName}`,
              isActive: true
            });
            totalAdded++;
            console.log(`     ✅ Added: ${subjectName}`);
          }
        }
      }
    }
    
    console.log(`\n🎉 Total subjects added: ${totalAdded}`);
    
    // Final verification
    const allSubjects = await db.select().from(subjects);
    const icseSubjects = allSubjects.filter(s => s.boardId === icseBoard.id);
    const cbseSubjects = allSubjects.filter(s => s.boardId === cbseBoard.id);
    
    const icseGrades = [...new Set(icseSubjects.map(s => s.grade))].sort((a, b) => a - b);
    const cbseGrades = [...new Set(cbseSubjects.map(s => s.grade))].sort((a, b) => a - b);
    
    console.log(`\n📊 Final structure:`);
    console.log(`   ICSE grades: ${icseGrades.join(', ')} (${icseSubjects.length} subjects)`);
    console.log(`   CBSE grades: ${cbseGrades.join(', ')} (${cbseSubjects.length} subjects)`);
    
    console.log('\n✅ Database structure fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing database structure:', error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  fixDatabaseStructure()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { fixDatabaseStructure };