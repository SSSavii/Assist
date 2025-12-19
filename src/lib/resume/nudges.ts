export interface Nudge {
  message: string;
  type: 'social_proof' | 'framing' | 'loss_aversion' | 'anchoring' | 'simplification' | 'default_effect' | 'commitment' | 'scarcity';
  priority: 'high' | 'medium' | 'low';
  actionTime?: string;
  topic: string;
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

  private nudgeTemplates: Record<string, NudgeTemplate> = {
    
    // === SOCIAL PROOF (Проверено на практике) ===
    no_summary: {
      check: (_, metrics) => !metrics?.hasSummary,
      nudge: {
        message: "87% успешных кандидатов начинают с краткого Summary. Добавьте 2-3 предложения о себе.",
        type: "social_proof",
        priority: "high",
        actionTime: "3 мин",
        topic: "summary"
      }
    },

    low_metrics: {
      check: (_, metrics) => (metrics?.percentageCount || 0) < 2 && (metrics?.numbersCount || 0) < 8,
      nudge: {
        message: "Резюме с цифрами получают в 3 раза больше откликов. Добавьте проценты и суммы.",
        type: "social_proof",
        priority: "high",
        actionTime: "7 мин",
        topic: "metrics"
      }
    },

    no_linkedin: {
      check: (text) => !text.toLowerCase().includes('linkedin'),
      nudge: {
        message: "73% рекрутеров проверяют LinkedIn. Добавьте ссылку на профиль.",
        type: "social_proof",
        priority: "medium",
        actionTime: "1 мин",
        topic: "linkedin"
      }
    },

    weak_action_verbs: {
      check: (_, metrics) => (metrics?.actionVerbsCount || 0) < 4,
      nudge: {
        message: "Используйте глаголы действия: «запустил», «увеличил», «оптимизировал» – они усиливают восприятие опыта.",
        type: "social_proof",
        priority: "high",
        actionTime: "5 мин",
        topic: "verbs"
      }
    },

    // === LOSS AVERSION (Критично для откликов) ===
    no_contacts: {
      check: (_, metrics) => !metrics?.hasEmail && !metrics?.hasPhone,
      nudge: {
        message: "Без контактов вы теряете 100% откликов. Добавьте email и телефон.",
        type: "loss_aversion",
        priority: "high",
        actionTime: "1 мин",
        topic: "contacts"
      }
    },

    too_long: {
      check: (text) => text.length > 5000,
      nudge: {
        message: "Рекрутер тратит 6 секунд на просмотр. Сократите до 2 страниц.",
        type: "loss_aversion",
        priority: "medium",
        actionTime: "10 мин",
        topic: "length"
      }
    },

    no_achievements: {
      check: (_, metrics) => !metrics?.hasAchievements,
      nudge: {
        message: "Резюме без достижений проигрывает. Добавьте 3-5 результатов с цифрами.",
        type: "loss_aversion",
        priority: "high",
        actionTime: "10 мин",
        topic: "achievements"
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
        actionTime: "5 мин",
        topic: "keywords"
      }
    },

    // === FRAMING (Акцент на результате) ===
    passive_voice: {
      check: (text) => {
        const passive = (text.match(/работал с|занимался|отвечал за|выполнял|участвовал в/gi) || []).length;
        return passive >= 3;
      },
      nudge: {
        message: "«Работал с клиентами» → «Привлёк 50+ клиентов». Активная форма сильнее.",
        type: "framing",
        priority: "high",
        actionTime: "5 мин",
        topic: "verbs"
      }
    },

    duties_not_results: {
      check: (text) => {
        const duties = (text.match(/обязанности|должностные|функции|в мои задачи входило/gi) || []).length;
        return duties >= 2;
      },
      nudge: {
        message: "Пишите результаты, не обязанности. «Увеличил продажи на 30%».",
        type: "framing",
        priority: "high",
        actionTime: "7 мин",
        topic: "achievements"
      }
    },

    negative_framing: {
      check: (text) => {
        const negative = (text.match(/не имею|без опыта|к сожалению|пока не|ещё не/gi) || []).length;
        return negative >= 1;
      },
      nudge: {
        message: "Уберите негатив. «Без опыта» → «Быстро осваиваю новое».",
        type: "framing",
        priority: "medium",
        actionTime: "3 мин",
        topic: "framing"
      }
    },

    // === ANCHORING (Эффект первого впечатления) ===
    weak_start: {
      check: (text) => {
        const firstLines = text.split('\n').slice(0, 3).join(' ');
        const hasNumbers = /\d/.test(firstLines);
        const hasRole = /senior|lead|руководитель|менеджер|специалист|developer|manager/i.test(firstLines);
        return !hasNumbers || !hasRole;
      },
      nudge: {
        message: "Первые строки решают. Начните: «Senior PM | 7 лет | 15+ проектов».",
        type: "anchoring",
        priority: "medium",
        actionTime: "3 мин",
        topic: "summary"
      }
    },

    no_top_achievement: {
      check: (text) => !/№1|лучший|топ-|первое место|рекорд|максимальн|награ|премия/i.test(text),
      nudge: {
        message: "Добавьте топ-достижение: «лучший менеджер Q4», «рекорд продаж».",
        type: "anchoring",
        priority: "medium",
        actionTime: "2 мин",
        topic: "achievements"
      }
    },

    // === SIMPLIFICATION (Лёгкость восприятия) ===
    no_structure: {
      check: (_, metrics) => (metrics?.sectionsCount || 0) < 3,
      nudge: {
        message: "Рекомендуемая структура: Summary → Опыт → Навыки → Образование.",
        type: "simplification",
        priority: "high",
        actionTime: "5 мин",
        topic: "structure"
      }
    },

    no_bullets: {
      check: (_, metrics) => !metrics?.hasBullets,
      nudge: {
        message: "Используйте буллеты (•). Списки читаются в 2 раза быстрее.",
        type: "simplification",
        priority: "medium",
        actionTime: "5 мин",
        topic: "bullets"
      }
    },

    too_short: {
      check: (text) => text.length < 800,
      nudge: {
        message: "Резюме слишком краткое. Добавьте проекты и технологии.",
        type: "simplification",
        priority: "high",
        actionTime: "15 мин",
        topic: "length"
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
        actionTime: "5 мин",
        topic: "bullets"
      }
    },

    // === DEFAULT EFFECT (Стандартное требование) ===
    no_languages: {
      check: (text) => !/английск|english|b1|b2|c1|c2|intermediate|upper-intermediate|advanced|fluent|native/i.test(text),
      nudge: {
        message: "Укажите уровень английского — это стандартное требование.",
        type: "default_effect",
        priority: "medium",
        actionTime: "1 мин",
        topic: "languages"
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
        actionTime: "2 мин",
        topic: "dates"
      }
    },

    // === COMMITMENT (Важно для доверия) ===
    no_dates: {
      check: (text) => (text.match(/20\d{2}|19\d{2}/g) || []).length < 2,
      nudge: {
        message: "Добавьте даты работы: «2019 — 2023».",
        type: "commitment",
        priority: "high",
        actionTime: "3 мин",
        topic: "dates"
      }
    },

    job_hopping_signal: {
      check: (text) => {
        const years = text.match(/20\d{2}/g) || [];
        const uniqueYears = new Set(years);
        return uniqueYears.size > 6 && text.length < 3000;
      },
      nudge: {
        message: "При частой смене работы объясните причины: «повышение», «новый проект».",
        type: "commitment",
        priority: "medium",
        actionTime: "5 мин",
        topic: "experience"
      }
    },

    // === SCARCITY (Повышает доверие) ===
    no_unique_value: {
      check: (text) => {
        const uniqueMarkers = ['сертифик', 'лицензи', 'патент', 'публикац', 'награ', 'грант', 
                               'спикер', 'автор', 'основатель', 'co-founder', 'certificate'];
        return !uniqueMarkers.some(m => text.toLowerCase().includes(m));
      },
      nudge: {
        message: "Добавьте уникальное: сертификаты, награды, публикации.",
        type: "scarcity",
        priority: "low",
        actionTime: "5 мин",
        topic: "unique"
      }
    },

    no_portfolio: {
      check: (text) => {
        const isCreativeOrTech = /дизайн|разработ|developer|designer|программист|frontend|backend|fullstack/i.test(text);
        const hasPortfolio = /portfolio|github|behance|dribbble|gitlab|bitbucket/i.test(text);
        return isCreativeOrTech && !hasPortfolio;
      },
      nudge: {
        message: "Для технических ролей добавьте GitHub или Behance.",
        type: "scarcity",
        priority: "high",
        actionTime: "2 мин",
        topic: "portfolio"
      }
    }
  };

  generateNudges(resumeText: string): Nudge[] {
    const metrics = this.extractMetrics(resumeText);
    const nudges: Nudge[] = [];
    const usedTopics = new Set<string>();
    
    Object.values(this.nudgeTemplates).forEach((template) => {
      if (template.check(resumeText, metrics)) {
        if (usedTopics.has(template.nudge.topic)) {
          return;
        }
        
        nudges.push(template.nudge);
        usedTopics.add(template.nudge.topic);
      }
    });
    
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    nudges.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    
    return nudges.slice(0, 5);
  }
  
  static getNudgeTypeLabel(type: Nudge['type']): string {
    const labels: Record<Nudge['type'], string> = {
      'social_proof': 'Проверено на практике',
      'framing': 'Акцент на результате',
      'loss_aversion': 'Критично для откликов',
      'anchoring': 'Эффект первого впечатления',
      'simplification': 'Лёгкость восприятия',
      'default_effect': 'Стандартное требование',
      'commitment': 'Важно для доверия',
      'scarcity': 'Повышает доверие'
    };
    return labels[type] || type;
  }
}