import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { assessmentId, answers } = await req.json();

    if (!assessmentId || !answers) {
      return NextResponse.json({ error: 'Assessment ID and answers required' }, { status: 400 });
    }

    const assessmentRef = db.collection('assessments').doc(assessmentId);
    const assessmentDoc = await assessmentRef.get();

    if (!assessmentDoc.exists) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    const assessment = assessmentDoc.data();
    if (!assessment) {
      return NextResponse.json({ error: 'Assessment data missing' }, { status: 404 });
    }

    const correctAnswers = assessment.answers; // array of { id: "q1", answer: 0 }
    let score = 0;

    for (const userAnswer of answers) {
      const correct = correctAnswers.find((c: any) => c.id === userAnswer.id);
      if (correct && correct.answer === userAnswer.answer) {
        score++;
      }
    }

    const passed = score === correctAnswers.length;

    // In a full implementation, if passed === true, we would mint the SBT here 
    // or trigger an API to generate the EvidenceReport and mint it on-chain via our private key.
    if (passed) {
      // Mock SBT generation logic
      await assessmentRef.update({
        status: 'VERIFIED',
        score
      });
    }

    return NextResponse.json({ 
      success: true, 
      passed,
      score,
      total: correctAnswers.length,
      explanation: passed ? "You successfully passed the quiz!" : "You failed. Try re-watching the video."
    }, { status: 200 });

  } catch (error) {
    console.error('Assess Submit Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
