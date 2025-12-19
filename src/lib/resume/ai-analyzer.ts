import { AnalysisResult, ResumeAnalyzer } from './analyzer';
import { NudgeSystem } from './nudges';

interface OllamaResponse {
  response: string;
  done: boolean;
}

// Коллекция мотивирующих цитат по категориям
const QUOTES = {
  confidence: [
    'Уверенность — первый шаг к успеху.',
    'Тот, кто верит в себя, убеждает других.',
    'Ваша уверенность — ваш главный актив.',
  ],
  growth: [
    'Каждый эксперт когда-то был новичком.',
    'Путь в тысячу миль начинается с первого шага.',
    'Развитие — это процесс, а не событие.',
  ],
  action: [
    'Действие — ключ к результату.',
    'Лучшее время начать — сейчас.',
    'Маленькие шаги ведут к большим переменам.',
  ],
  quality: [
    'Качество важнее количества.',
    'Детали создают совершенство.',
    'Простота — высшая форма изысканности.',
  ],
  success: [
    'Успех любит подготовленных.',
    'Возможности приходят к тем, кто готов.',
    'Ваш потенциал не имеет границ.',
  ]
};

export class AIResumeAnalyzer {
  private ollamaUrl: string;
  private model: string;
  private fallbackAnalyzer: ResumeAnalyzer;
  private nudgeSystem: NudgeSystem;
  private timeout: number;

  constructor() {
    this.ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'qwen2.5:0.5b';
    this.timeout = 10000; // 10 секунд
    this.fallbackAnalyzer = new ResumeAnalyzer();
    this.nudgeSystem = new NudgeSystem();
  }

  private async checkOllamaAvailable(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      
      const response = await fetch(`${this.ollamaUrl}/api/tags`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }

  // Анализируем СТИЛЬ резюме, не содержание
  private analyzeStyle(text: string): {
    isConfident: boolean;
    isStructured: boolean;
    isCreative: boolean;
    isConcise: boolean;
    tone: 'formal' | 'friendly' | 'neutral';
  } {
    const lower = text.toLowerCase();
    
    // Уверенный тон: активные глаголы, достижения
    const confidentWords = (text.match(/достиг|создал|увеличил|руководил|реализовал|внедрил|оптимизировал/gi) || []).length;
    const isConfident = confidentWords >= 3;
    
    // Структурированность: секции, списки
    const hasSections = /опыт|образование|навыки|experience|skills/i.test(text);
    const hasBullets = /[•\-\*►]/g.test(text);
    const isStructured = hasSections && hasBullets;
    
    // Креативность: нестандартные формулировки
    const isCreative = /страст|люблю|увлека|интересу|мечта/i.test(lower);
    
    // Лаконичность
    const avgSentenceLength = text.length / (text.split(/[.!?]/).length || 1);
    const isConcise = avgSentenceLength < 100;
    
    // Тон
    let tone: 'formal' | 'friendly' | 'neutral' = 'neutral';
    if (/уважаем|рассмотр|предлага|позвол/i.test(lower)) tone = 'formal';
    if (/привет|рад|готов|открыт/i.test(lower)) tone = 'friendly';
    
    return { isConfident, isStructured, isCreative, isConcise, tone };
  }

  // Выбираем подходящую цитату
  private pickQuote(score: number, style: ReturnType<typeof this.analyzeStyle>): string {
    let category: keyof typeof QUOTES;
    
    if (score >= 8) {
      category = 'success';
    } else if (style.isConfident) {
      category = 'confidence';
    } else if (style.isStructured) {
      category = 'quality';
    } else if (score >= 5) {
      category = 'action';
    } else {
      category = 'growth';
    }
    
    const quotes = QUOTES[category];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  // Промпт про СТИЛЬ, не содержание
  private buildPrompt(resumeText: string, score: number): string {
    const style = this.analyzeStyle(resumeText);
    const quote = this.pickQuote(score, style);
    
    // Описание стиля для AI
    const styleDesc: string[] = [];
    if (style.isConfident) styleDesc.push('уверенный тон');
    if (style.isStructured) styleDesc.push('хорошая структура');
    if (style.isCreative) styleDesc.push('творческий подход');
    if (style.isConcise) styleDesc.push('лаконичность');
    if (style.tone === 'formal') styleDesc.push('деловой стиль');
    if (style.tone === 'friendly') styleDesc.push('дружелюбный тон');
    
    const styleStr = styleDesc.length > 0 ? styleDesc.join(', ') : 'нейтральный стиль';

    return `Напиши короткий отзыв о СТИЛЕ резюме (не о содержании). Обращайся на "вы".

Стиль резюме: ${styleStr}
Оценка: ${score}/10
Цитата для вдохновения: "${quote}"

Напиши 1 предложение про впечатление от стиля подачи + добавь цитату.
Пример: "Ваше резюме производит уверенное впечатление. ${quote}"

Ответ:`;
  }

  private parseResponse(content: string, fallbackQuote: string): string | null {
    if (!content || content.length < 10) return null;
    
    let cleaned = content
      .replace(/^[\s\n"'`\-•:]+/, '')
      .replace(/[\s\n"'`]+$/, '')
      .replace(/^(Ответ|Отзыв)[:\s]*/i, '')
      .trim();
    
    // Если ответ слишком короткий - добавляем цитату
    if (cleaned.length < 30 && cleaned.length > 0) {
      cleaned = cleaned + ' ' + fallbackQuote;
    }
    
    // Ограничиваем длину
    if (cleaned.length > 180) {
      // Ищем конец предложения
      const endMatch = cleaned.slice(0, 180).match(/.*[.!?]/);
      if (endMatch) {
        cleaned = endMatch[0];
      } else {
        cleaned = cleaned.slice(0, 177) + '...';
      }
    }
    
    // Добавляем точку если нет
    if (cleaned.length >= 20 && !/[.!?]$/.test(cleaned)) {
      cleaned += '.';
    }
    
    return cleaned.length >= 20 ? cleaned : null;
  }

  private isValidResponse(response: string): boolean {
    // Должно быть обращение на "вы"
    if (!/ваш|вы|вам|вас/i.test(response)) return false;
    
    // Не должно быть в 3 лице
    if (/\bон\b|\bона\b|\bкандидат\b|\bсоискатель\b/i.test(response)) return false;
    
    // Не должно быть советов (это делает алгоритм!)
    if (/добавьте|укажите|рекомендую|стоит добавить|нужно указать|следует|попробуйте/i.test(response)) return false;
    
    // Не должно быть про конкретные навыки/опыт (это делает алгоритм!)
    if (/python|java|excel|sql|опыт работы|образование|навыки в/i.test(response)) return false;
    
    return true;
  }

  async analyzeRulesOnly(resumeText: string): Promise<AnalysisResult> {
    return this.fallbackAnalyzer.analyze(resumeText);
  }

  async getAISummary(resumeText: string, score: number): Promise<string | null> {
    const ollamaAvailable = await this.checkOllamaAvailable();
    
    if (!ollamaAvailable) {
      console.log('[AI] Ollama недоступен');
      return null;
    }

    const style = this.analyzeStyle(resumeText);
    const fallbackQuote = this.pickQuote(score, style);

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
          prompt: this.buildPrompt(resumeText, score),
          stream: false,
          options: {
            temperature: 0.7,
            num_predict: 80,
            top_p: 0.9,
            repeat_penalty: 1.15,
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log(`[AI] Ответ за ${Date.now() - startTime}ms`);

      if (!response.ok) {
        console.error(`[AI] Ошибка: ${response.status}`);
        return null;
      }

      const data: OllamaResponse = await response.json();
      
      if (!data.response) {
        console.log('[AI] Пустой ответ');
        return null;
      }

      console.log('[AI] Сырой:', data.response);
      
      const parsed = this.parseResponse(data.response, fallbackQuote);
      
      if (!parsed) {
        console.log('[AI] Не удалось распарсить');
        return null;
      }
      
      if (!this.isValidResponse(parsed)) {
        console.log('[AI] Не прошёл валидацию');
        return null;
      }
      
      console.log('[AI] Финал:', parsed);
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

  async analyze(resumeText: string): Promise<AnalysisResult> {
    const result = await this.analyzeRulesOnly(resumeText);
    const aiSummary = await this.getAISummary(resumeText, result.score);
    
    if (aiSummary) {
      result.summary = aiSummary;
    }
    
    return result;
  }
}

let instance: AIResumeAnalyzer | null = null;

export function getAIAnalyzer(): AIResumeAnalyzer {
  if (!instance) {
    instance = new AIResumeAnalyzer();
  }
  return instance;
}