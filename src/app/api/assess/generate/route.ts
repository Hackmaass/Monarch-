export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function POST(req: Request) {
  try {
    const { sessionId, videoId, videoTitle } = await req.json();

    if (!videoId || !videoTitle) {
      return NextResponse.json({ error: 'videoId and videoTitle required' }, { status: 400 });
    }

    // Call Gemini to generate a 3-question quiz about the video topic
    const prompt = `You are an expert technical assessor. 
The user has just watched a technical tutorial video titled: "${videoTitle}".

Generate a 3-question multiple-choice quiz to test their understanding of the general concepts likely covered in this video.
Output the quiz in strict JSON format like this:
{
  "questions": [
    {
      "id": "q1",
      "question": "What is the primary purpose of...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0
    }
  ]
}

Make the questions challenging but fair. The options should be an array of strings, and correctAnswer should be the index (0-3) of the correct option.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const resultText = response.text;
    
    if (!resultText) {
      throw new Error('Gemini returned empty response');
    }

    const result = JSON.parse(resultText);

    // Store the correct answers in Firestore so we can verify them later in /api/assess/submit
    // We create a temporary assessment doc
    const assessmentRef = await db.collection('assessments').add({
      videoId,
      videoTitle,
      createdAt: Date.now(),
      answers: result.questions.map((q: any) => ({ id: q.id, answer: q.correctAnswer }))
    });

    // Strip out the correct answers before sending to the client
    const clientQuiz = result.questions.map((q: any) => ({
      id: q.id,
      question: q.question,
      options: q.options
    }));

    return NextResponse.json({ 
      success: true, 
      assessmentId: assessmentRef.id,
      quiz: clientQuiz 
    }, { status: 200 });

  } catch (error) {
    console.error('Assess Generate Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
