/* eslint-disable prefer-const */
import { AnalysisResult, ResumeAnalyzer } from './analyzer';
import { NudgeSystem } from './nudges';

interface OllamaResponse {
  response: string;
  done: boolean;
}

export class AIResumeAnalyzer {
  private ollamaUrl: string;
  private model: string;
  private fallbackAnalyzer: ResumeAnalyzer;
  private nudgeSystem: NudgeSystem;
  private timeout: number;

  constructor() {
    this.ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'qwen2.5:0.5b';
    this.timeout = 5000; // 5 секунд таймаут
    this.fallbackAnalyzer = new ResumeAnalyzer();
    this.nudgeSystem = new NudgeSystem();
  }

  private async checkOllamaAvailable(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const response = await fetch(`${this.ollamaUrl}/api/tags`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }

  private buildPrompt(resumeText: string, ruleBasedScore: number): string {
    // Ограничиваем текст для маленькой модели
    const truncatedText = resumeText.slice(0, 1500);
    
    return `Ты HR-эксперт. Оцени резюме кратко.

РЕЗЮМЕ:
${truncatedText}

Алгоритм дал оценку: ${ruleBasedScore}/10

Напиши ТОЛЬКО JSON (без пояснений):
{
  "score": ${ruleBasedScore},
  "summary": "краткая оценка в 1-2 предложения на русском"
}`;
  }

  private parseResponse(content: string, fallbackScore: number): { score: number; summary: string } | null {
    try {
      // Убираем возможные артефакты
      let cleaned = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/[\r\n]+/g, ' ')
        .trim();
      
      // Ищем JSON
      const jsonMatch = cleaned.match(/\{[^{}]*"score"[^{}]*"summary"[^{}]*\}/);
      if (!jsonMatch) {
        // Пробуем найти summary напрямую
        const summaryMatch = cleaned.match(/"summary"\s*:\s*"([^"]+)"/);
        if (summaryMatch) {
          return {
            score: fallbackScore,
            summary: summaryMatch[1].slice(0, 200)
          };
        }
        return null;
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        score: typeof parsed.score === 'number' ? 
          Math.min(10, Math.max(1, Math.round(parsed.score * 10) / 10)) : 
          fallbackScore,
        summary: typeof parsed.summary === 'string' ? 
          parsed.summary.slice(0, 200) : 
          ''
      };
    } catch (e) {
      console.error('AI response parse error:', e);
      return null;
    }
  }

  async analyze(resumeText: string): Promise<AnalysisResult> {
    // Всегда сначала получаем rule-based анализ
    const ruleBasedResult = await this.fallbackAnalyzer.analyze(resumeText);
    
    // Проверяем доступность Ollama
    const ollamaAvailable = await this.checkOllamaAvailable();
    
    if (!ollamaAvailable) {
      console.log('[AI] Ollama не доступен, используем алгоритмический анализ');
      return ruleBasedResult;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      console.log(`[AI] Запрос к ${this.model}...`);

      const response = await fetch(`${this.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt: this.buildPrompt(resumeText, ruleBasedResult.score),
          stream: false,
          options: {
            temperature: 0.3,
            num_predict: 150, // Маленький лимит для скорости
            top_p: 0.9
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`[AI] Ollama ошибка: ${response.status}`);
        return ruleBasedResult;
      }

      const data: OllamaResponse = await response.json();
      
      if (!data.response) {
        console.log('[AI] Пустой ответ от модели');
        return ruleBasedResult;
      }

      console.log('[AI] Ответ получен:', data.response.slice(0, 100));

      const aiResult = this.parseResponse(data.response, ruleBasedResult.score);

      if (!aiResult || !aiResult.summary) {
        console.log('[AI] Не удалось распарсить ответ');
        return ruleBasedResult;
      }

      // Комбинируем: AI даёт summary, остальное из rule-based
      console.log('[AI] Успешно! Используем AI summary');
      
      return {
        ...ruleBasedResult,
        summary: aiResult.summary,
        score: aiResult.score
      };

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('[AI] Таймаут 5 секунд, используем алгоритмический анализ');
      } else {
        console.error('[AI] Ошибка:', error);
      }
      return ruleBasedResult;
    }
  }
}

// Singleton
let instance: AIResumeAnalyzer | null = null;

export function getAIAnalyzer(): AIResumeAnalyzer {
  if (!instance) {
    instance = new AIResumeAnalyzer();
  }
  return instance;
}