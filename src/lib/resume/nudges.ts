export interface Nudge {
  message: string;
  type: 'social_proof' | 'framing' | 'loss_aversion' | 'anchoring' | 'simplification' | 'default_effect' | 'commitment' | 'scarcity';
  priority: 'high' | 'medium' | 'low';
  actionTime?: string;
}

interface NudgeTemplate {
  check: (text: string, metrics?: TextMetrics) => boolean;
  nudge: Nudge;
}

interface TextMetrics {
  length: number;
  numbersCount: number;
  percentageCount: number;
  hasEmail: boolean;
  hasPhone: boolean;
  actionVerbsCount: number;
  sectionsCount: number;
  hasSummary: boolean;
  hasAchievements: boolean;
  hasBullets: boolean;
  yearsExperience: number;
}

export class NudgeSystem {
  
  private extractMetrics(text: string): TextMetrics {
    const lower = text.toLowerCase();
    
    const actionVerbs = [
      'руководил', 'управлял', 'создал', 'запустил', 'увеличил', 'сократил', 
      'оптимизировал', 'внедрил', 'разработал', 'построил', 'привлёк', 'обучил',
      'организовал', 'координировал', 'масштабировал', 'автоматизировал',
      'реализовал', 'достиг', 'превысил', 'улучшил'
    ];
    const actionVerbsCount = actionVerbs.filter(v => lower.includes(v)).length;

    const sections = ['опыт', 'образование', 'навыки', 'о себе', 'summary', 'достижения', 'проекты', 'skills', 'experience'];
    const sectionsCount = sections.filter(s => lower.includes(s)).length;

    const dateMatches = text.match(/20\d{2}|19\d{2}/g) || [];
    const years = dateMatches.map(d => parseInt(d));
    const yearsExperience = years.length >= 2 ? Math.max(...years) - Math.min(...years) : 0;

    const achievementWords = ['достиг', 'увелич', 'сократ', 'оптимизир', 'запустил', 'создал', 'внедрил'];
    const hasAchievements = achievementWords.some(w => lower.includes(w));

    return {
      length: text.length,
      numbersCount: (text.match(/\d+/g) || []).length,
      percentageCount: (text.match(/\d+\s*%/g) || []).length,
      hasEmail: /@/.test(text),
      hasPhone: /\+?\d{10,}/.test(text),
      actionVerbsCount,
      sectionsCount,
      hasSummary: /summary|о себе|обо мне|профиль|profile/i.test(text),
      hasAchievements,
      hasBullets: (text.match(/^[\s]*[-•*►→]/gm) || []).length >= 3,
      yearsExperience: Math.min(yearsExperience, 40)
    };
  }

  // Темы для дедупликации - каждый надж относится к одной теме
  private nudgeTopics: Record<string, string> = {
    no_summary: 'summary',
    low_metrics: 'metrics',
    no_linkedin: 'linkedin',
    weak_action_verbs: 'verbs',
    no_contacts: 'contacts',
    too_long: 'length',
    no_achievements: 'achievements',
    no_keywords_ats: 'keywords',
    passive_voice: 'verbs',
    duties_not_results: 'achievements',
    negative_framing: 'framing',
    weak_start: 'summary',
    no_top_achievement: 'achievements',
    no_structure: 'structure',
    no_bullets: 'structure',
    too_short: 'length',
    wall_of_text: 'structure',
    no_languages: 'languages',
    no_education_dates: 'dates',
    no_dates: 'dates',
    job_hopping_signal: 'experience',
    no_unique_value: 'unique',
    no_portfolio: 'portfolio'
  };

  private nudgeTemplates: Record<string, NudgeTemplate> = {
    
    // === SOCIAL PROOF ===
    no_summary: {
      check: (_, metrics) => !metrics?.hasSummary,
      nudge: {
        message: "87% успешных кандидатов начинают резюме с краткого Summary. Добавьте 2-3 предложения о себе.",
        type: "social_proof",
        priority: "high",
        actionTime: "3 мин"
      }
    },

    low_metrics: {
      check: (_, metrics) => (metrics?.percentageCount || 0) < 2 && (metrics?.numbersCount || 0) < 8,
      nudge: {
        message: "Резюме с цифрами получают в 3 раза больше откликов. Добавьте проценты, суммы, объёмы.",
        type: "social_proof",
        priority: "high",
        actionTime: "7 мин"
      }
    },

    no_linkedin: {
      check: (text) => !text.toLowerCase().includes('linkedin'),
      nudge: {
        message: "73% рекрутеров проверяют LinkedIn. Добавьте ссылку на профиль.",
        type: "social_proof",
        priority: "medium",
        actionTime: "1 мин"
      }
    },

    weak_action_verbs: {
      check: (_, metrics) => (metrics?.actionVerbsCount || 0) < 4,
      nudge: {
        message: "Используйте глаголы действия: «запустил», «увеличил», «оптимизировал» вместо «работал».",
        type: "social_proof",
        priority: "high",
        actionTime: "5 мин"
      }
    },

    // === LOSS AVERSION ===
    no_contacts: {
      check: (_, metrics) => !metrics?.hasEmail && !metrics?.hasPhone,
      nudge: {
        message: "Без контактов вы теряете 100% откликов. Добавьте email и телефон.",
        type: "loss_aversion",
        priority: "high",
        actionTime: "1 мин"
      }
    },

    too_long: {
      check: (text) => text.length > 5000,
      nudge: {
        message: "Рекрутер тратит 6 секунд на просмотр. Сократите резюме до 2 страниц.",
        type: "loss_aversion",
        priority: "medium",
        actionTime: "10 мин"
      }
    },

    no_achievements: {
      check: (_, metrics) => !metrics?.hasAchievements,
      nudge: {
        message: "Резюме без достижений проигрывает конкурентам. Добавьте 3-5 результатов с цифрами.",
        type: "loss_aversion",
        priority: "high",
        actionTime: "10 мин"
      }
    },

    no_keywords_ats: {
      check: (text) => {
        const keywords = ['опыт', 'навыки', 'результат', 'проект', 'команда', 'skills', 'experience'];
        return keywords.filter(k => text.toLowerCase().includes(k)).length < 3;
      },
      nudge: {
        message: "70% компаний используют ATS-фильтры. Добавьте ключевые слова из вакансии.",
        type: "loss_aversion",
        priority: "high",
        actionTime: "5 мин"
      }
    },

    // === FRAMING ===
    passive_voice: {
      check: (text) => {
        const passive = (text.match(/работал с|занимался|отвечал за|выполнял|участвовал в/gi) || []).length;
        return passive >= 3;
      },
      nudge: {
        message: "Замените «работал с клиентами» → «привлёк 50+ клиентов». Активная форма сильнее.",
        type: "framing",
        priority: "high",
        actionTime: "5 мин"
      }
    },

    duties_not_results: {
      check: (text) => {
        const duties = (text.match(/обязанности|должностные|функции|в мои задачи входило/gi) || []).length;
        return duties >= 2;
      },
      nudge: {
        message: "Пишите результаты, не обязанности. «Увеличил продажи на 30%» вместо «занимался продажами».",
        type: "framing",
        priority: "high",
        actionTime: "7 мин"
      }
    },

    negative_framing: {
      check: (text) => {
        const negative = (text.match(/не имею|без опыта|к сожалению|пока не|ещё не/gi) || []).length;
        return negative >= 1;
      },
      nudge: {
        message: "Уберите негатив. «Без опыта в X» → «Быстро осваиваю новые технологии».",
        type: "framing",
        priority: "medium",
        actionTime: "3 мин"
      }
    },

    // === ANCHORING ===
    weak_start: {
      check: (text) => {
        const firstLines = text.split('\n').slice(0, 3).join(' ');
        const hasNumbers = /\d/.test(firstLines);
        const hasRole = /senior|lead|руководитель|менеджер|специалист|developer|manager/i.test(firstLines);
        return !hasNumbers || !hasRole;
      },
      nudge: {
        message: "Первые строки решают всё. Начните с: «Senior PM | 7 лет | 15+ проектов».",
        type: "anchoring",
        priority: "medium",
        actionTime: "3 мин"
      }
    },

    no_top_achievement: {
      check: (text) => !/№1|лучший|топ-|первое место|рекорд|максимальн|награ|премия/i.test(text),
      nudge: {
        message: "Добавьте топ-достижение: «лучший менеджер Q4», «рекорд продаж отдела».",
        type: "anchoring",
        priority: "medium",
        actionTime: "2 мин"
      }
    },

    // === SIMPLIFICATION ===
    no_structure: {
      check: (_, metrics) => (metrics?.sectionsCount || 0) < 3,
      nudge: {
        message: "Добавьте секции: Summary → Опыт → Навыки → Образование.",
        type: "simplification",
        priority: "high",
        actionTime: "5 мин"
      }
    },

    no_bullets: {
      check: (_, metrics) => !metrics?.hasBullets,
      nudge: {
        message: "Используйте буллеты (•). Списки читаются в 2 раза быстрее.",
        type: "simplification",
        priority: "medium",
        actionTime: "5 мин"
      }
    },

    too_short: {
      check: (text) => text.length < 800,
      nudge: {
        message: "Резюме слишком краткое. Добавьте проекты, технологии, масштаб задач.",
        type: "simplification",
        priority: "high",
        actionTime: "15 мин"
      }
    },

    wall_of_text: {
      check: (text) => {
        const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
        const longParagraphs = paragraphs.filter(p => p.length > 500);
        return longParagraphs.length >= 2;
      },
      nudge: {
        message: "Разбейте длинные абзацы. Идеал: 2-3 строки на пункт.",
        type: "simplification",
        priority: "medium",
        actionTime: "5 мин"
      }
    },

    // === DEFAULT EFFECT ===
    no_languages: {
      check: (text) => !/английск|english|b1|b2|c1|c2|intermediate|upper-intermediate|advanced|fluent|native/i.test(text),
      nudge: {
        message: "Укажите уровень английского — это стандартное требование.",
        type: "default_effect",
        priority: "medium",
        actionTime: "1 мин"
      }
    },

    no_education_dates: {
      check: (text) => {
        const hasEducation = /образование|university|университет|институт/i.test(text);
        const hasYears = /19\d{2}|20[0-2]\d/.test(text);
        return hasEducation && !hasYears;
      },
      nudge: {
        message: "Добавьте годы обучения: «МГУ, Экономика, 2015-2019».",
        type: "default_effect",
        priority: "low",
        actionTime: "2 мин"
      }
    },

    // === COMMITMENT ===
    no_dates: {
      check: (text) => (text.match(/20\d{2}|19\d{2}/g) || []).length < 2,
      nudge: {
        message: "Добавьте даты работы: «2019 — 2023». Это показывает стабильность.",
        type: "commitment",
        priority: "high",
        actionTime: "3 мин"
      }
    },

    job_hopping_signal: {
      check: (text) => {
        const years = text.match(/20\d{2}/g) || [];
        const uniqueYears = new Set(years);
        return uniqueYears.size > 6 && text.length < 3000;
      },
      nudge: {
        message: "При частой смене работы объясните причины: «повышение», «приглашение в проект».",
        type: "commitment",
        priority: "medium",
        actionTime: "5 мин"
      }
    },

    // === SCARCITY ===
    no_unique_value: {
      check: (text) => {
        const uniqueMarkers = ['сертифик', 'лицензи', 'патент', 'публикац', 'награ', 'грант', 
                               'спикер', 'автор', 'основатель', 'co-founder', 'certificate'];
        return !uniqueMarkers.some(m => text.toLowerCase().includes(m));
      },
      nudge: {
        message: "Добавьте уникальное: сертификаты, награды, публикации. Выделитесь среди 100+ кандидатов.",
        type: "scarcity",
        priority: "low",
        actionTime: "5 мин"
      }
    },

    no_portfolio: {
      check: (text) => {
        const isCreativeOrTech = /дизайн|разработ|developer|designer|программист|frontend|backend|fullstack/i.test(text);
        const hasPortfolio = /portfolio|github|behance|dribbble|gitlab|bitbucket/i.test(text);
        return isCreativeOrTech && !hasPortfolio;
      },
      nudge: {
        message: "Для технических ролей добавьте GitHub/Behance — это конкурентное преимущество.",
        type: "scarcity",
        priority: "high",
        actionTime: "2 мин"
      }
    }
  };

  generateNudges(resumeText: string): Nudge[] {
    const metrics = this.extractMetrics(resumeText);
    const nudges: Nudge[] = [];
    const usedTopics = new Set<string>();
    
    Object.entries(this.nudgeTemplates).forEach(([key, template]) => {
      if (template.check(resumeText, metrics)) {
        const topic = this.nudgeTopics[key];
        
        // Пропускаем, если тема уже использована
        if (topic && usedTopics.has(topic)) {
          return;
        }
        
        nudges.push(template.nudge);
        
        if (topic) {
          usedTopics.add(topic);
        }
      }
    });
    
    // Сортировка по приоритету
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    nudges.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    
    return nudges.slice(0, 5);
  }
  
  static getNudgeTypeLabel(type: Nudge['type']): string {
    const labels: Record<Nudge['type'], string> = {
      'social_proof': 'Социальное доказательство',
      'framing': 'Фрейминг',
      'loss_aversion': 'Неприятие потерь',
      'anchoring': 'Эффект якоря',
      'simplification': 'Упрощение',
      'default_effect': 'Эффект умолчания',
      'commitment': 'Обязательство',
      'scarcity': 'Дефицит'
    };
    return labels[type] || type;
  }
}