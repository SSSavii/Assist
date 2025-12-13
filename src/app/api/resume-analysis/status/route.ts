/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Проверяем доступность Ollama
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    const response = await fetch(ollamaUrl);
    
    if (response.ok) {
      // Получаем список моделей
      const modelsResponse = await fetch(`${ollamaUrl}/api/tags`);
      const models = await modelsResponse.json();
      
      return NextResponse.json({
        status: 'ready',
        ollama: 'connected',
        models: models.models?.map((m: any) => m.name) || [],
        currentModel: process.env.OLLAMA_MODEL || 'llama2:7b'
      });
    }
    
    return NextResponse.json({
      status: 'error',
      message: 'Ollama not available'
    }, { status: 503 });
    
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to check Ollama status'
    }, { status: 500 });
  }
}