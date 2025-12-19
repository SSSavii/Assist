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
    this.timeout = 20000; // 20 секунд - даём больше времени
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

  // УЛЬТРА-КОРОТКИЙ промпт
  private buildPrompt(resumeText: string): string {
    // Берём только первые 800 символов - самое важное
    const short = resumeText.slice(0, 800).replace(/\n+/g, ' ').trim();
    
    return `Резюме: "${short}"

Напиши 1 предложение оценки на русском:`;
  }

  private parseResponse(content: string): string | null {
    if (!content || content.length < 10) return null;
    
    // Берём первое предложение, убираем мусор
    let cleaned = content
      .replace(/```[\s\S]*?```/g, '')
      .replace(/\{[\s\S]*?\}/g, '')
      .replace(/^[\s\n"'`]+/, '')
      .replace(/[\s\n"'`]+$/, '')
      .trim();
    
    // Берём первое предложение
    const firstSentence = cleaned.split(/[.!?]/)[0];
    
    if (firstSentence && firstSentence.length >= 20 && firstSentence.length <= 200) {
      return firstSentence.trim() + '.';
    }
    
    // Если слишком длинное - обрезаем
    if (cleaned.length > 200) {
      return cleaned.slice(0, 197) + '...';
    }
    
    return cleaned.length >= 20 ? cleaned : null;
  }

  // Быстрый анализ только правилами (для мгновенного результата)
  async analyzeRulesOnly(resumeText: string): Promise<AnalysisResult> {
    return this.fallbackAnalyzer.analyze(resumeText);
  }

  // Попытка получить AI summary (может быть медленной)
  async getAISummary(resumeText: string): Promise<string | null> {
    const ollamaAvailable = await this.checkOllamaAvailable();
    
    if (!ollamaAvailable) {
      console.log('[AI] Ollama недоступен');
      return null;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      console.log(`[AI] Запрос к ${this.model}...`);
      const startTime = Date.now();

      const response = await fetch(`${this.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt: this.buildPrompt(resumeText),
          stream: false,
          options: {
            temperature: 0.5,
            num_predict: 50, // Максимум 50 токенов - очень мало
            top_p: 0.9,
            stop: ['\n', '.', '!', '?'] // Останавливаемся на первом предложении
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const elapsed = Date.now() - startTime;
      console.log(`[AI] Ответ за ${elapsed}ms`);

      if (!response.ok) {
        console.error(`[AI] Ошибка: ${response.status}`);
        return null;
      }

      const data: OllamaResponse = await response.json();
      
      if (!data.response) {
        console.log('[AI] Пустой ответ');
        return null;
      }

      console.log('[AI] Сырой ответ:', data.response);
      
      const parsed = this.parseResponse(data.response);
      console.log('[AI] Обработанный:', parsed);
      
      return parsed;

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('[AI] Таймаут');
      } else {
        console.error('[AI] Ошибка:', error);
      }
      return null;
    }
  }

  // Полный анализ с попыткой AI
  async analyze(resumeText: string): Promise<AnalysisResult> {
    // Сначала быстрый rule-based
    const result = await this.analyzeRulesOnly(resumeText);
    
    // Пробуем получить AI summary
    const aiSummary = await this.getAISummary(resumeText);
    
    if (aiSummary) {
      result.summary = aiSummary;
    }
    
    return result;
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