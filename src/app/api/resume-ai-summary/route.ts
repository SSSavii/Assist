import { NextRequest, NextResponse } from 'next/server';
import { getAIAnalyzer } from '@/lib/resume/ai-analyzer';

export async function POST(request: NextRequest) {
  try {
    const { resumeText, score } = await request.json();

    if (!resumeText || typeof resumeText !== 'string' || resumeText.length < 100) {
      return NextResponse.json({ summary: null });
    }

    const analyzer = getAIAnalyzer();
    
    // Если score не передан, быстро вычисляем
    let finalScore = score;
    if (typeof finalScore !== 'number') {
      const quickResult = await analyzer.analyzeRulesOnly(resumeText);
      finalScore = quickResult.score;
    }
    
    const summary = await analyzer.getAISummary(resumeText, finalScore);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('AI summary error:', error);
    return NextResponse.json({ summary: null });
  }
}