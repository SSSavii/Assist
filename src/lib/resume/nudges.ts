export interface Nudge {
  message: string;
  type: 'social_proof' | 'framing' | 'simplification' | 'default_effect';
  priority: 'high' | 'medium' | 'low';
}

export class NudgeSystem {
  private nudgeTemplates = {
    no_summary: {
      check: (text: string) => {
        const hasSummary = text.toLowerCase().includes('summary') || 
                          text.toLowerCase().includes('о себе') ||
                          text.toLowerCase().includes('обо мне');
        return !hasSummary;
      },
      nudge: {
        message: "💡 87% успешных кандидатов начинают резюме с краткого summary (2-3 строки). Это займёт 2 минуты, но увеличит отклик на 35%",
        type: "social_proof" as const,
        priority: "high" as const
      }
    },
    
    no_metrics: {
      check: (text: string) => {
        const hasMetrics = /\d+%|\d+\s*(человек|проектов|клиентов|руб|₽|\$)/i.test(text);
        return !hasMetrics;
      },
      nudge: {
        message: "📊 Добавьте цифры в достижения: вместо 'работал с клиентами' → 'обработал 50+ клиентов, конверсия 15%'. Резюме с метриками получают в 3 раза больше откликов",
        type: "framing" as const,
        priority: "high" as const
      }
    },
    
    too_long: {
      check: (text: string) => text.length > 4000,
      nudge: {
        message: "✂️ Сократите до 1-2 страниц. Рекрутер тратит 6 секунд на первичный просмотр — сделайте эти секунды продуктивными",
        type: "simplification" as const,
        priority: "medium" as const
      }
    },
    
    no_keywords: {
      check: (text: string) => {
        const keywords = ['опыт', 'навыки', 'образование', 'достижения'];
        return !keywords.some(keyword => text.toLowerCase().includes(keyword));
      },
      nudge: {
        message: "🔑 Добавьте ключевые слова из вакансии. 70% компаний используют ATS-системы для фильтрации — это ваш билет на собеседование",
        type: "default_effect" as const,
        priority: "high" as const
      }
    },
    
    weak_achievements: {
      check: (text: string) => {
        const achievementWords = ['достиг', 'увеличил', 'сократил', 'оптимизировал', 'создал', 'запустил'];
        const count = achievementWords.filter(word => 
          text.toLowerCase().includes(word)
        ).length;
        return count < 3;
      },
      nudge: {
        message: "🎯 Усильте достижения action-глаголами: 'инициировал', 'оптимизировал', 'масштабировал'. Такие резюме проходят скрининг на 40% чаще",
        type: "social_proof" as const,
        priority: "medium" as const
      }
    }
  };

  generateNudges(resumeText: string): Nudge[] {
    const nudges: Nudge[] = [];
    
    // Проверяем каждое условие
    Object.values(this.nudgeTemplates).forEach(template => {
      if (template.check(resumeText)) {
        nudges.push(template.nudge);
      }
    });
    
    // Сортируем по приоритету
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    nudges.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    
    // Возвращаем топ-3 наджа
    return nudges.slice(0, 3);
  }
}