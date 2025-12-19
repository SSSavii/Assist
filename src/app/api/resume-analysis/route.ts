import { NextRequest, NextResponse } from 'next/server';
import { getAIAnalyzer } from '@/lib/resume/ai-analyzer';

export async function POST(request: NextRequest) {
  try {
    const { resumeText } = await request.json();

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

    if (resumeText.length > 50000) {
      return NextResponse.json(
        { error: 'Резюме слишком длинное (максимум 50000 символов)' },
        { status: 400 }
      );
    }

    const analyzer = getAIAnalyzer();
    const result = await analyzer.analyze(resumeText);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Resume analysis error:', error);
    return NextResponse.json(
      { error: 'Ошибка анализа резюме. Попробуйте ещё раз.' },
      { status: 500 }
    );
  }
}