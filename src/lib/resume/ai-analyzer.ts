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
    this.timeout = 15000; // 15 секунд для качественного ответа
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

  // Извлекаем ключевые факты из резюме для промпта
  private extractKeyFacts(text: string): {
    hasExperience: boolean;
    yearsHint: string | null;
    skills: string[];
    hasAchievements: boolean;
    field: string | null;
  } {
    const lower = text.toLowerCase();
    
    // Опыт
    const yearsMatch = text.match(/(\d+)\s*(?:\+)?\s*(?:лет|год|года)\s*(?:опыт|работ|стаж)/i);
    const yearsHint = yearsMatch ? `${yearsMatch[1]} лет опыта` : null;
    
    // Навыки (берём первые 3)
    const skillPatterns = [
      /python|java|javascript|react|sql|excel|figma|git|node|typescript|vue|angular/gi,
      /менеджмент|управлени|продаж|маркетинг|аналитик|дизайн|разработ/gi
    ];
    
    const skills: string[] = [];
    for (const pattern of skillPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        skills.push(...matches.slice(0, 2));
      }
    }
    
    // Достижения
    const hasAchievements = /увеличил|сократил|достиг|запустил|создал|внедрил|\d+%/i.test(text);
    
    // Сфера
    let field: string | null = null;
    if (/разработ|developer|программист|frontend|backend/i.test(lower)) field = 'IT/разработка';
    else if (/менеджер|manager|руководител/i.test(lower)) field = 'менеджмент';
    else if (/дизайн|designer/i.test(lower)) field = 'дизайн';
    else if (/маркетолог|marketing|smm/i.test(lower)) field = 'маркетинг';
    else if (/продаж|sales/i.test(lower)) field = 'продажи';
    else if (/аналитик|analyst|data/i.test(lower)) field = 'аналитика';
    
    return {
      hasExperience: /опыт|experience|работал|работала/i.test(text),
      yearsHint,
      skills: [...new Set(skills)].slice(0, 3),
      hasAchievements,
      field
    };
  }

  // Улучшенный промпт с few-shot примерами
  private buildPrompt(resumeText: string, score: number): string {
    const facts = this.extractKeyFacts(resumeText);
    const shortText = resumeText.slice(0, 600).replace(/\n+/g, ' ').trim();
    
    // Контекст на основе оценки
    let scoreContext = '';
    if (score >= 8) {
      scoreContext = 'Резюме отличное (8-10 баллов). Похвалите конкретное достоинство.';
    } else if (score >= 6) {
      scoreContext = 'Резюме хорошее (6-7 баллов). Отметьте сильную сторону и дайте один совет.';
    } else if (score >= 4) {
      scoreContext = 'Резюме среднее (4-5 баллов). Найдите позитив и дайте конкретный совет.';
    } else {
      scoreContext = 'Резюме слабое (1-3 балла). Мягко укажите главную проблему и путь решения.';
    }
    
    // Факты для персонализации
    const factsStr = [
      facts.yearsHint,
      facts.field ? `сфера: ${facts.field}` : null,
      facts.skills.length > 0 ? `навыки: ${facts.skills.join(', ')}` : null,
      facts.hasAchievements ? 'есть достижения' : null
    ].filter(Boolean).join('; ');

    return `Ты HR-эксперт. Напиши краткий отзыв о резюме для кандидата.

ПРАВИЛА:
- Обращайся на "вы" напрямую к кандидату
- 1-2 предложения максимум
- Упомяни что-то конкретное из резюме (навык, опыт, сферу)
- ${scoreContext}

ПРИМЕРЫ ХОРОШИХ ОТВЕТОВ:
- "Ваш опыт в Python и аналитике данных впечатляет. Добавьте конкретные метрики проектов — это усилит резюме."
- "Вы чётко описали свои достижения в продажах. Отличная структура резюме!"
- "У вас есть потенциал в дизайне. Рекомендую добавить ссылку на портфолио — это критично для вашей сферы."
- "Ваш управленческий опыт виден. Усильте раздел достижений конкретными цифрами."

ПЛОХИЕ ОТВЕТЫ (не делай так):
- "Это хорошее резюме" (слишком общее)
- "Бочко Артемий - мужчина..." (не обращайся в 3 лице)
- "Резюме демонстрирует..." (слишком формально)

РЕЗЮМЕ (оценка ${score}/10):
${shortText}

ФАКТЫ: ${factsStr || 'стандартное резюме'}

Твой отзыв (1-2 предложения, обращение на "вы"):`;
  }

  private parseResponse(content: string): string | null {
    if (!content || content.length < 15) return null;
    
    let cleaned = content
      .replace(/```[\s\S]*?```/g, '')
      .replace(/\{[\s\S]*?\}/g, '')
      .replace(/^[\s\n"'`\-•]+/, '')
      .replace(/[\s\n"'`]+$/, '')
      .replace(/^(Ответ|Отзыв|Summary|Response)[:\s]*/i, '')
      .trim();
    
    // Берём первые 2 предложения
    const sentences = cleaned.match(/[^.!?]+[.!?]+/g);
    if (sentences && sentences.length > 0) {
      const result = sentences.slice(0, 2).join(' ').trim();
      if (result.length >= 30 && result.length <= 250) {
        return result;
      }
    }
    
    // Если не получилось разбить на предложения
    if (cleaned.length > 250) {
      cleaned = cleaned.slice(0, 247) + '...';
    }
    
    return cleaned.length >= 30 ? cleaned : null;
  }

  // Валидация ответа - проверяем что он соответствует требованиям
  private validateResponse(response: string): boolean {
    const lower = response.toLowerCase();
    
    // Должно быть обращение на "вы" или "ваш"
    const hasYouForm = /\bвы\b|\bваш|\bвам\b|\bвас\b/i.test(response);
    
    // Не должно быть обращения в 3 лице
    const hasThirdPerson = /\bон\b|\bона\b|\bэтот человек|\bкандидат\b|\bсоискатель\b/i.test(lower);
    
    // Не должно быть слишком общим
    const tooGeneric = /^(это |резюме |данное )/i.test(response);
    
    // Не должно содержать имя в 3 лице (паттерн "Имя Фамилия - это/является")
    const hasNameThirdPerson = /[А-ЯЁ][а-яё]+\s+[А-ЯЁ][а-яё]+\s*[-–—]\s*(это|является|мужчина|женщина)/i.test(response);
    
    return hasYouForm && !hasThirdPerson && !tooGeneric && !hasNameThirdPerson;
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

    // Делаем до 2 попыток получить хороший ответ
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        console.log(`[AI] Попытка ${attempt}, запрос к ${this.model}...`);
        const startTime = Date.now();

        const response = await fetch(`${this.ollamaUrl}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: this.model,
            prompt: this.buildPrompt(resumeText, score),
            stream: false,
            options: {
              temperature: 0.7, // Немного выше для разнообразия
              num_predict: 100, // Больше токенов для полного ответа
              top_p: 0.9,
              repeat_penalty: 1.2, // Избегаем повторений
            }
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        const elapsed = Date.now() - startTime;
        console.log(`[AI] Ответ за ${elapsed}ms`);

        if (!response.ok) {
          console.error(`[AI] Ошибка: ${response.status}`);
          continue;
        }

        const data: OllamaResponse = await response.json();
        
        if (!data.response) {
          console.log('[AI] Пустой ответ');
          continue;
        }

        console.log('[AI] Сырой ответ:', data.response);
        
        const parsed = this.parseResponse(data.response);
        
        if (!parsed) {
          console.log('[AI] Не удалось распарсить ответ');
          continue;
        }
        
        // Валидируем ответ
        if (!this.validateResponse(parsed)) {
          console.log('[AI] Ответ не прошёл валидацию, пробуем ещё раз');
          continue;
        }
        
        console.log('[AI] Финальный ответ:', parsed);
        return parsed;

      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.log(`[AI] Таймаут на попытке ${attempt}`);
        } else {
          console.error('[AI] Ошибка:', error);
        }
      }
    }
    
    return null;
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