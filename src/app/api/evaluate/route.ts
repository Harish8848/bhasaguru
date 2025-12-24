import { NextRequest, NextResponse } from "next/server";

// This is a placeholder for a real AI evaluation service.
async function evaluateWithAI(data: any) {
  // Simulate AI evaluation
  console.log("Evaluating with AI:", data);

  // Mocked response for a speaking evaluation
  if (data.type === 'speaking') {
    return {
      fluency: 8.5,
      pronunciation: 7.5,
      lexicalResource: 8.0,
      grammaticalRange: 7.0,
      overall: 7.8,
    };
  }

  // Mocked response for a writing evaluation
  if (data.type === 'writing') {
    return {
      taskAchievement: 7.5,
      coherenceAndCohesion: 8.0,
      lexicalResource: 8.5,
      grammaticalRangeAndAccuracy: 7.0,
      overall: 7.8,
    };
  }

  // Mocked response for an audio evaluation
  if (data.type === 'audio') {
    return {
      score: Math.random() * 100,
      clarity: Math.random(),
      relevance: Math.random(),
    };
  }

  // Default mocked response
  return {
    score: Math.random() * 100,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await evaluateWithAI(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to evaluate" },
      { status: 500 }
    );
  }
}
