// Direct script to populate missing ICSE grades in the database
import { db } from '../db';
import { boards, subjects } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { getSubjectsForBoardAndGrade } from '../services/curriculum';

async function populateMissingICSEGrades() {
  try {
    console.log('🔍 Checking current ICSE structure...');
    
    // Get ICSE board
    const [icseBoard] = await db.select().from(boards).where(eq(boards.name, 'icse/cisce'));
    
    if (!icseBoard) {
      console.log('❌ ICSE board not found in database');
      return;
    }
    
    console.log(`✅ Found ICSE board: ${icseBoard.id}`);
    
    // Check what grades currently exist
    const existingSubjects = await db.select().from(subjects).where(eq(subjects.boardId, icseBoard.id));
    const existingGrades = [...new Set(existingSubjects.map(s => s.grade))].sort((a, b) => a - b);
    
    console.log(`📊 Current grades in database: ${existingGrades.join(', ')}`);
    console.log(`📊 Total subjects: ${existingSubjects.length}`);
    
    const missingGrades = [];
    for (let grade = 1; grade <= 12; grade++) {
      if (!existingGrades.includes(grade)) {
        missingGrades.push(grade);
      }
    }
    
    console.log(`🎯 Missing grades: ${missingGrades.join(', ')}`);
    
    if (missingGrades.length === 0) {
      console.log('✅ All grades already exist!');
      return;
    }
    
    // Add missing grades with their subjects
    let addedCount = 0;
    
    for (const grade of missingGrades) {
      console.log(`\n📝 Adding Grade ${grade}...`);
      
      const subjectsForGrade = getSubjectsForBoardAndGrade('icse/cisce', grade);
      console.log(`   📚 Subjects: ${subjectsForGrade.join(', ')}`);
      
      for (const subjectName of subjectsForGrade) {
        // Check if this exact combination exists
        const [existing] = await db.select().from(subjects).where(
          and(
            eq(subjects.boardId, icseBoard.id),
            eq(subjects.name, subjectName),
            eq(subjects.grade, grade)
          )
        );
        
        if (!existing) {
          await db.insert(subjects).values({
            name: subjectName,
            grade: grade,
            boardId: icseBoard.id,
            board: 'icse/cisce',
            description: `${subjectName} for Grade ${grade} - ICSE/CISCE`,
            isActive: true
          });
          
          addedCount++;
          console.log(`   ✅ Added: ${subjectName}`);
        } else {
          console.log(`   ⏭️  Exists: ${subjectName}`);
        }
      }
    }
    
    console.log(`\n🎉 Successfully added ${addedCount} new subject entries!`);
    
    // Verify final structure
    const finalSubjects = await db.select().from(subjects).where(eq(subjects.boardId, icseBoard.id));
    const finalGrades = [...new Set(finalSubjects.map(s => s.grade))].sort((a, b) => a - b);
    
    console.log(`\n📊 Final grades: ${finalGrades.join(', ')}`);
    console.log(`📊 Total subjects: ${finalSubjects.length}`);
    
  } catch (error) {
    console.error('❌ Error populating missing grades:', error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  populateMissingICSEGrades()
    .then(() => {
      console.log('\n✅ Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

export { populateMissingICSEGrades };