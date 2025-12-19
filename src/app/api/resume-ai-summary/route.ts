import { NextRequest, NextResponse } from 'next/server';
import { getAIAnalyzer } from '@/lib/resume/ai-analyzer';

// Отдельный endpoint для AI summary (вызывается в фоне)
export async function POST(request: NextRequest) {
  try {
    const { resumeText } = await request.json();

    if (!resumeText || typeof resumeText !== 'string' || resumeText.length < 100) {
      return NextResponse.json({ summary: null });
    }

    const analyzer = getAIAnalyzer();
    const summary = await analyzer.getAISummary(resumeText);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('AI summary error:', error);
    return NextResponse.json({ summary: null });
  }
}