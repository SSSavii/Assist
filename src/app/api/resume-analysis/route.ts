import { NextRequest, NextResponse } from 'next/server';
import { ResumeAnalyzer } from '@/lib/resume/analyzer';

const analyzer = new ResumeAnalyzer();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeText } = body;
    
    if (!resumeText || typeof resumeText !== 'string') {
      return NextResponse.json(
        { error: 'Текст резюме не предоставлен' },
        { status: 400 }
      );
    }
    
    // Ограничение на размер текста
    if (resumeText.length > 10000) {
      return NextResponse.json(
        { error: 'Резюме слишком длинное (максимум 10000 символов)' },
        { status: 400 }
      );
    }
    
    // Анализируем резюме
    const result = await analyzer.analyze(resumeText);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Resume analysis error:', error);
    return NextResponse.json(
      { error: 'Ошибка при анализе резюме' },
      { status: 500 }
    );
  }
}

// Опционально: GET метод для проверки статуса
export async function GET() {
  return NextResponse.json({
    status: 'Resume analysis API is running',
    version: '1.0.0'
  });
}