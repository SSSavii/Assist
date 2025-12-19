import { NextRequest, NextResponse } from 'next/server';
import { getAIAnalyzer } from '@/lib/resume/ai-analyzer';

export async function POST(request: NextRequest) {
  try {
    const { resumeText, aiSummary } = await request.json();

    if (!resumeText || typeof resumeText !== 'string') {
      return NextResponse.json(
        { error: 'Текст резюме обязателен' },
        { status: 400 }
      );
    }

    if (resumeText.length < 100) {
      return NextResponse.json(
        { error: 'Резюме слишком короткое (минимум 100 символов)' },
        { status: 400 }
      );
    }

    const analyzer = getAIAnalyzer();
    
    // Быстрый анализ правилами
    const result = await analyzer.analyzeRulesOnly(resumeText);
    
    // Если клиент уже получил AI summary - используем его
    if (aiSummary && typeof aiSummary === 'string' && aiSummary.length > 20) {
      result.summary = aiSummary;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Resume analysis error:', error);
    return NextResponse.json(
      { error: 'Ошибка анализа резюме' },
      { status: 500 }
    );
  }
}