// Direct database fix for ICSE missing grades
import { db } from '../db';
import { subjects } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { getSubjectsForBoardAndGrade } from '../services/curriculum';

async function directDatabaseFix() {
  try {
    console.log('🔧 Direct database fix for missing ICSE grades...');
    
    // Get existing subjects to understand current structure
    const allSubjects = await db.select().from(subjects);
    console.log(`📊 Current subjects: ${allSubjects.length}`);
    
    // Find ICSE board ID from existing subjects
    const icseSubjects = allSubjects.filter(s => s.board === 'ICSE' || s.board?.toLowerCase().includes('icse'));
    
    if (icseSubjects.length === 0) {
      console.log('❌ No ICSE subjects found in database');
      return;
    }
    
    const icseBoardId = icseSubjects[0].boardId;
    console.log(`📋 ICSE Board ID: ${icseBoardId}`);
    
    // Check current grade coverage
    const existingGrades = [...new Set(icseSubjects.map(s => s.grade))].sort((a, b) => a - b);
    console.log(`📊 Current ICSE grades: ${existingGrades.join(', ')}`);
    
    const missingGrades = [];
    for (let grade = 1; grade <= 12; grade++) {
      if (!existingGrades.includes(grade)) {
        missingGrades.push(grade);
      }
    }
    
    console.log(`🎯 Missing grades: ${missingGrades.join(', ')}`);
    
    let addedCount = 0;
    
    // Add subjects for missing grades
    for (const grade of missingGrades) {
      console.log(`\n📝 Adding Grade ${grade}...`);
      
      const expectedSubjects = getSubjectsForBoardAndGrade('icse/cisce', grade);
      console.log(`   Expected subjects: ${expectedSubjects.join(', ')}`);
      
      for (const subjectName of expectedSubjects) {
        await db.insert(subjects).values({
          name: subjectName,
          grade: grade,
          boardId: icseBoardId,
          board: 'ICSE',
          description: `${subjectName} for Grade ${grade} - ICSE`,
          isActive: true
        });
        
        addedCount++;
        console.log(`   ✅ Added: ${subjectName}`);
      }
    }
    
    console.log(`\n🎉 Added ${addedCount} new subject entries!`);
    
    // Final verification
    const updatedSubjects = await db.select().from(subjects).where(eq(subjects.boardId, icseBoardId));
    const finalGrades = [...new Set(updatedSubjects.map(s => s.grade))].sort((a, b) => a - b);
    
    console.log(`\n📊 Final ICSE structure:`);
    console.log(`   Grades: ${finalGrades.join(', ')}`);
    console.log(`   Total subjects: ${updatedSubjects.length}`);
    
    // Group by grade for detailed view
    const gradeGroups = {};
    updatedSubjects.forEach(s => {
      if (!gradeGroups[s.grade]) gradeGroups[s.grade] = [];
      gradeGroups[s.grade].push(s.name);
    });
    
    console.log('\n📋 Subjects by grade:');
    Object.keys(gradeGroups).sort((a, b) => parseInt(a) - parseInt(b)).forEach(grade => {
      console.log(`   Grade ${grade}: ${gradeGroups[grade].length} subjects`);
    });
    
    console.log('\n✅ Direct database fix completed!');
    
  } catch (error) {
    console.error('❌ Direct database fix failed:', error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  directDatabaseFix()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { directDatabaseFix };