/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NudgeSystem, type Nudge } from './nudges';

export interface AnalysisResult {
  summary: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  nudges: Nudge[];
  quickStart: string[];
  qualityMetrics?: {
    isRealResume: boolean;
    textQuality: number;
    structureQuality: number;
    contentQuality: number;
  };
}

// Темы для глобальной дедупликации
type Topic = 
  | 'summary' 
  | 'metrics' 
  | 'achievements' 
  | 'structure' 
  | 'contacts' 
  | 'verbs' 
  | 'length' 
  | 'languages' 
  | 'portfolio' 
  | 'bullets'
  | 'dates'
  | 'linkedin';

export class ResumeAnalyzer {
  private nudgeSystem: NudgeSystem;
  private cache: Map<string, AnalysisResult>;
  
  constructor() {
    this.nudgeSystem = new NudgeSystem();
    this.cache = new Map();
  }

  // Определяем тему сообщения
  private detectTopic(message: string): Topic | null {
    const lower = message.toLowerCase();
    
    if (/summary|о себе|профиль|обо мне|начните с|первые строки/.test(lower)) return 'summary';
    if (/цифр|метрик|процент|%|числ|количеств/.test(lower)) return 'metrics';
    if (/достижен|результат|увеличил|сократил/.test(lower)) return 'achievements';
    if (/структур|секци|раздел/.test(lower)) return 'structure';
    if (/контакт|email|телефон|почт/.test(lower)) return 'contacts';
    if (/глагол|актив|пассив|действ/.test(lower)) return 'verbs';
    if (/длин|коротк|сократ|объём|страниц/.test(lower)) return 'length';
    if (/язык|english|английск|b1|b2|c1/.test(lower)) return 'languages';
    if (/portfolio|github|behance|портфолио/.test(lower)) return 'portfolio';
    if (/bullet|список|маркир|•/.test(lower)) return 'bullets';
    if (/дат|год|период|20\d{2}/.test(lower)) return 'dates';
    if (/linkedin/.test(lower)) return 'linkedin';
    
    return null;
  }

  // Фильтрация массива с учётом уже использованных тем
  private filterByUsedTopics(items: string[], usedTopics: Set<Topic>): string[] {
    const result: string[] = [];
    
    for (const item of items) {
      const topic = this.detectTopic(item);
      
      if (topic === null || !usedTopics.has(topic)) {
        result.push(item);
        if (topic) {
          usedTopics.add(topic);
        }
      }
    }
    
    return result;
  }
  
  private validateResumeQuality(text: string): { isValid: boolean; quality: number; reason?: string } {
    const length = text.length;
    
    const spaces = (text.match(/\s/g) || []).length;
    const spaceRatio = spaces / length;
    
    if (spaceRatio < 0.10) {
      return { 
        isValid: false, 
        quality: 0,
        reason: 'Текст не содержит достаточно пробелов — похоже на случайный набор символов' 
      };
    }
    
    const repeatingPattern = /(.)\1{10,}/g;
    if (repeatingPattern.test(text)) {
      return { 
        isValid: false, 
        quality: 0,
        reason: 'Обнаружены длинные последовательности повторяющихся символов' 
      };
    }
    
    const words = text.split(/\s+/);
    const longWords = words.filter(w => w.length > 3);
    
    if (longWords.length === 0) {
      return { 
        isValid: false, 
        quality: 0,
        reason: 'Текст не содержит осмысленных слов' 
      };
    }
    
    const avgWordLength = longWords.reduce((sum, w) => sum + w.length, 0) / longWords.length;
    
    if (avgWordLength < 3 || avgWordLength > 15) {
      return { 
        isValid: false, 
        quality: 1,
        reason: 'Неестественная средняя длина слов' 
      };
    }
    
    const resumeKeywords = [
      'опыт', 'работа', 'образование', 'навык', 'должность', 'компания',
      'university', 'experience', 'education', 'skills', 'position', 'работал',
      'окончил', 'graduated', 'управлял', 'разработал', 'проект', 'project'
    ];
    
    const foundKeywords = resumeKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword)
    ).length;
    
    if (foundKeywords < 2) {
      return { 
        isValid: false, 
        quality: 2,
        reason: 'Текст не содержит ключевых слов резюме — не похоже на резюме' 
      };
    }
    
    const hasDates = /\d{4}/.test(text);
    const hasEmail = /@/.test(text);
    const hasPhone = /\+?\d{10,}/.test(text);
    
    const professionalScore = [hasDates, hasEmail, hasPhone].filter(Boolean).length;
    
    if (professionalScore === 0) {
      return { 
        isValid: false, 
        quality: 2,
        reason: 'Отсутствует базовая профессиональная информация (даты, контакты)' 
      };
    }
    
    let quality = 5;
    
    if (spaceRatio >= 0.15 && spaceRatio <= 0.22) quality += 1;
    if (avgWordLength >= 5 && avgWordLength <= 8) quality += 1;
    if (foundKeywords >= 5) quality += 1;
    if (foundKeywords >= 8) quality += 1;
    if (professionalScore >= 2) quality += 1;
    
    return { isValid: true, quality: Math.min(10, quality) };
  }
  
  private analyzeWithRules(resumeText: string): any {
    const text = resumeText.toLowerCase();
    const textLength = resumeText.length;
    
    const validation = this.validateResumeQuality(resumeText);
    
    if (!validation.isValid) {
      return {
        summary: `Это не похоже на резюме. ${validation.reason}`,
        score: validation.quality,
        strengths: [],
        weaknesses: [
          validation.reason || 'Текст не соответствует формату резюме',
          'Добавьте информацию о вашем опыте',
          'Укажите образование и навыки'
        ],
        recommendations: [
          'Используйте структуру: Summary → Опыт → Образование → Навыки',
          'Добавьте email и телефон'
        ],
        qualityMetrics: {
          isRealResume: false,
          textQuality: validation.quality,
          structureQuality: 0,
          contentQuality: 0
        }
      };
    }
    
    const analysis = {
      hasSummary: this.checkPattern(text, ['о себе', 'summary', 'обо мне', 'профиль']) && 
                  text.split('\n').some(line => line.length > 100 && line.length < 500),
      
      hasExperience: this.checkPattern(text, ['опыт работы', 'work experience', 'experience']) &&
                     (text.match(/\d{4}/g) || []).length >= 2,
      
      hasEducation: this.checkPattern(text, ['образование', 'education', 'университет', 'институт']),
      
      hasSkills: this.checkPattern(text, ['навыки', 'skills', 'компетенции']) &&
                 (text.match(/,/g) || []).length >= 3,
      
      hasContacts: (text.match(/@/g) || []).length > 0 || /\+?\d{10,}/.test(text),
      
      hasAchievements: this.checkMultiplePatterns(text, [
        ['достиж', 'увелич'],
        ['сократ', 'оптимиз'],
        ['внедр', 'создал'],
        ['разработал', 'запустил']
      ]),
      
      numbersCount: (text.match(/\d+/g) || []).length,
      percentageCount: (text.match(/\d+\s*%/g) || []).length,
      currencyCount: (text.match(/\d+\s*(руб|₽|тыс|млн|\$|€|к|k)/gi) || []).length,
      
      yearsCount: this.extractYears(text),
      companiesCount: this.countCompanies(text),
      projectsCount: (text.match(/проект|project/gi) || []).length,
      
      hasActionVerbs: this.countActionVerbs(text),
      hasBulletPoints: resumeText.includes('•') || resumeText.includes('–') || 
                       resumeText.split('\n').filter(l => l.trim().match(/^[-*•►→]/)).length > 3,
      
      isOptimalLength: textLength >= 1200 && textLength <= 3500,
      isGoodLength: textLength >= 800 && textLength <= 5000,
      isTooShort: textLength < 800,
      isTooLong: textLength > 5000,
      
      hasTechSkills: this.countSkills(text, [
        'python', 'java', 'javascript', 'react', 'sql', 'excel', 
        'photoshop', 'figma', 'autocad', '1c', 'crm', 'erp', 'typescript',
        'node', 'vue', 'angular', 'docker', 'kubernetes', 'aws', 'git'
      ]),
      
      hasSoftSkills: this.countSkills(text, [
        'коммуникаб', 'команд', 'лидер', 'ответствен', 
        'организов', 'аналитич', 'стрессоустойчив', 'инициатив'
      ]),
      
      hasLanguages: this.checkPattern(text, [
        'английск', 'немецк', 'китайск', 'spanish', 'english', 
        'french', 'b1', 'b2', 'c1', 'c2', 'intermediate', 'advanced', 'fluent'
      ]),
      
      hasGoodStructure: this.checkGoodStructure(text),
      hasDuplicates: this.checkDuplicates(text),
      
      hasLinkedIn: text.includes('linkedin'),
      hasPortfolio: text.includes('portfolio') || text.includes('github') || text.includes('behance'),
    };
    
    // Расчёт оценки
    let score = 3.0;
    
    if (analysis.hasExperience && analysis.yearsCount > 0) {
      score += 1.0;
    } else if (analysis.hasExperience) {
      score += 0.3;
    } else {
      score -= 1.0;
    }
    
    if (analysis.hasEducation) score += 0.6;
    else score -= 0.5;
    
    if (analysis.hasSkills && (text.match(/,/g) || []).length >= 5) {
      score += 0.7;
    } else if (analysis.hasSkills) {
      score += 0.3;
    } else {
      score -= 0.5;
    }
    
    if (analysis.hasSummary) score += 0.6;
    if (analysis.hasContacts) score += 0.4;
    
    if (analysis.numbersCount >= 15 && analysis.percentageCount >= 3) {
      score += 1.2;
    } else if (analysis.numbersCount >= 10 && analysis.percentageCount >= 2) {
      score += 0.8;
    } else if (analysis.numbersCount >= 5) {
      score += 0.4;
    } else {
      score -= 0.5;
    }
    
    if (analysis.hasAchievements && analysis.percentageCount >= 2) {
      score += 0.8;
    } else if (analysis.hasAchievements) {
      score += 0.4;
    } else {
      score -= 0.4;
    }
    
    if (analysis.hasActionVerbs >= 8) {
      score += 0.6;
    } else if (analysis.hasActionVerbs >= 4) {
      score += 0.3;
    } else {
      score -= 0.3;
    }
    
    if (analysis.yearsCount >= 5) score += 0.5;
    else if (analysis.yearsCount >= 3) score += 0.3;
    else if (analysis.yearsCount >= 1) score += 0.1;
    
    if (analysis.companiesCount >= 3) score += 0.4;
    else if (analysis.companiesCount >= 2) score += 0.2;
    
    if (analysis.projectsCount >= 3) score += 0.3;
    
    if (analysis.hasTechSkills >= 5) score += 0.5;
    else if (analysis.hasTechSkills >= 3) score += 0.3;
    
    if (analysis.hasSoftSkills >= 3) score += 0.3;
    if (analysis.hasLanguages) score += 0.3;
    
    if (analysis.hasGoodStructure) score += 0.6;
    else score -= 0.4;
    
    if (analysis.hasBulletPoints) score += 0.4;
    
    if (analysis.isOptimalLength) {
      score += 0.5;
    } else if (analysis.isGoodLength) {
      score += 0.2;
    }
    
    if (analysis.hasLinkedIn) score += 0.2;
    if (analysis.hasPortfolio) score += 0.3;
    
    if (analysis.isTooShort) score -= 1.5;
    if (analysis.isTooLong) score -= 0.8;
    if (analysis.hasDuplicates) score -= 0.6;
    if (!analysis.hasContacts) score -= 0.5;
    
    score = Math.min(10, Math.max(1, Math.round(score * 10) / 10));
    
    // Сильные стороны (без тем для дедупликации - это позитив)
    const strengths = [];
    
    if (analysis.yearsCount >= 5 && analysis.companiesCount >= 2) {
      strengths.push(`Солидный опыт: ${analysis.yearsCount}+ лет в ${analysis.companiesCount} компаниях`);
    } else if (analysis.yearsCount >= 3) {
      strengths.push(`Опыт работы ${analysis.yearsCount} ${this.getYearWord(analysis.yearsCount)}`);
    }
    
    if (analysis.numbersCount >= 15 && analysis.percentageCount >= 3) {
      strengths.push("Отличная количественная аргументация");
    } else if (analysis.numbersCount >= 8) {
      strengths.push("Есть конкретные показатели");
    }
    
    if (analysis.hasAchievements && (analysis.percentageCount >= 2 || analysis.currencyCount >= 1)) {
      strengths.push("Достижения с измеримыми результатами");
    }
    
    if (analysis.hasTechSkills >= 5 && analysis.hasSoftSkills >= 3) {
      strengths.push("Баланс технических и личностных компетенций");
    } else if (analysis.hasTechSkills >= 3) {
      strengths.push("Указаны профессиональные навыки");
    }
    
    if (analysis.hasGoodStructure && analysis.hasBulletPoints) {
      strengths.push("Чёткая структура и форматирование");
    }
    
    if (analysis.hasPortfolio || analysis.hasLinkedIn) {
      strengths.push("Есть ссылки на профессиональные ресурсы");
    }
    
    if (analysis.isOptimalLength) {
      strengths.push("Оптимальный объём");
    }
    
    // Слабые стороны - будут дедуплицироваться
    const weaknesses = [];
    
    if (!analysis.hasSummary) {
      weaknesses.push("Нет вводного Summary — рекрутер не понимает вашу ценность");
    }
    
    if (analysis.numbersCount < 5) {
      weaknesses.push("Мало цифр — сложно оценить масштаб работы");
    }
    
    if (!analysis.hasAchievements) {
      weaknesses.push("Описаны обязанности, а не результаты");
    }
    
    if (analysis.hasActionVerbs < 4) {
      weaknesses.push("Мало глаголов действия — текст пассивный");
    }
    
    if (analysis.isTooShort) {
      weaknesses.push("Резюме слишком короткое");
    } else if (analysis.isTooLong) {
      weaknesses.push("Резюме слишком длинное");
    }
    
    if (!analysis.hasGoodStructure) {
      weaknesses.push("Нечёткая структура документа");
    }
    
    if (!analysis.hasBulletPoints) {
      weaknesses.push("Нет маркированных списков");
    }
    
    if (!analysis.hasLanguages) {
      weaknesses.push("Не указаны иностранные языки");
    }
    
    // Рекомендации - будут дедуплицироваться
    const recommendations = [];
    
    if (!analysis.hasSummary) {
      recommendations.push("Добавьте 2-3 строки о себе: роль + опыт + ключевое достижение");
    }
    
    if (analysis.numbersCount < 10) {
      recommendations.push("Добавьте больше цифр: бюджеты, размер команды, % роста");
    }
    
    if (!analysis.hasAchievements) {
      recommendations.push("Перепишите опыт в формате: Действие → Результат");
    }
    
    if (analysis.isTooLong) {
      recommendations.push("Сократите до 2 страниц — последние 5-7 лет опыта");
    }
    
    if (!analysis.hasBulletPoints) {
      recommendations.push("Используйте маркированные списки (•) для читаемости");
    }
    
    if (!analysis.hasPortfolio && (text.includes('дизайн') || text.includes('разработ'))) {
      recommendations.push("Добавьте ссылку на GitHub или портфолио");
    }
    
    // Summary
    let summary = "";
    
    if (score >= 9) {
      summary = "Топовое резюме. Вы в топ-5% кандидатов.";
    } else if (score >= 8) {
      summary = "Отличное резюме. Небольшие правки — и идеально.";
    } else if (score >= 7) {
      summary = "Хорошее резюме. Добавьте больше конкретики.";
    } else if (score >= 6) {
      summary = "Базовое резюме. Есть информация, но подача слабая.";
    } else if (score >= 5) {
      summary = "Резюме требует доработки.";
    } else if (score >= 3) {
      summary = "Слабое резюме. Нужна переработка.";
    } else {
      summary = "Резюме не соответствует стандартам.";
    }
    
    return {
      summary,
      score,
      strengths: strengths.slice(0, 5),
      weaknesses,
      recommendations,
      qualityMetrics: {
        isRealResume: true,
        textQuality: validation.quality,
        structureQuality: analysis.hasGoodStructure ? 8 : 4,
        contentQuality: Math.min(10, Math.round((analysis.numbersCount / 2) + (analysis.hasAchievements ? 3 : 0)))
      },
      // Передаём данные для генерации quickStart
      analysisData: analysis
    };
  }
  
  private checkPattern(text: string, patterns: string[]): boolean {
    return patterns.some(pattern => text.includes(pattern));
  }
  
  private checkMultiplePatterns(text: string, patternGroups: string[][]): boolean {
    return patternGroups.some(group => 
      group.some(pattern => text.includes(pattern))
    );
  }
  
  private countActionVerbs(text: string): number {
    const actionVerbs = [
      'руководил', 'управлял', 'организовал', 'разработал', 'внедрил',
      'оптимизировал', 'увеличил', 'сократил', 'создал', 'запустил',
      'масштабировал', 'построил', 'возглавил', 'координировал',
      'автоматизировал', 'реализовал', 'привлёк', 'обучил', 'превысил',
      'managed', 'led', 'developed', 'implemented', 'optimized',
      'increased', 'reduced', 'created', 'launched', 'built'
    ];
    
    return actionVerbs.filter(verb => text.includes(verb)).length;
  }
  
  private countSkills(text: string, skills: string[]): number {
    return skills.filter(skill => text.includes(skill)).length;
  }
  
  private countCompanies(text: string): number {
    const companyMarkers = text.match(/(ооо|оао|ип|llc|ltd|inc|gmbh|компания|company)/gi) || [];
    return Math.min(companyMarkers.length, 5);
  }
  
  private extractYears(text: string): number {
    const yearMatches = text.match(/(\d+)\s*(лет|год|year|г\.|г)/gi);
    if (yearMatches && yearMatches.length > 0) {
      const numbers = yearMatches[0].match(/\d+/);
      return numbers ? parseInt(numbers[0]) : 0;
    }
    
    const dateMatches = text.match(/20\d{2}|19\d{2}/g);
    if (dateMatches && dateMatches.length >= 2) {
      const years = dateMatches.map(d => parseInt(d));
      const experience = Math.max(...years) - Math.min(...years);
      return Math.min(experience, 40);
    }
    
    return 0;
  }
  
  private checkGoodStructure(text: string): boolean {
    const hasMultipleSections = [
      /опыт работы|work experience|experience/i.test(text),
      /образование|education/i.test(text),
      /навыки|skills|компетенции/i.test(text),
    ].filter(Boolean).length >= 2;
    
    const hasDateStructure = (text.match(/20\d{2}/g) || []).length >= 2;
    const hasLineBreaks = text.split('\n').length > 10;
    
    return hasMultipleSections && hasDateStructure && hasLineBreaks;
  }
  
  private checkDuplicates(text: string): boolean {
    const sentences = text.split(/[.!?]\s+/).filter(s => s.length > 20);
    const uniqueSentences = new Set(sentences.map(s => s.toLowerCase().trim()));
    return uniqueSentences.size < sentences.length * 0.9;
  }
  
  private getYearWord(count: number): string {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'лет';
    if (lastDigit === 1) return 'год';
    if (lastDigit >= 2 && lastDigit <= 4) return 'года';
    return 'лет';
  }
  
  private createHash(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
    }
    return hash.toString();
  }

  // Генерация quickStart с учётом уже использованных тем
  private generateQuickStart(score: number, usedTopics: Set<Topic>, analysisData: any): string[] {
    const allTips: Array<{ tip: string; topic: Topic; forScore: 'low' | 'medium' | 'high' }> = [
      // Для низких оценок (< 4)
      { tip: "Создайте секции: Опыт → Образование → Навыки (10 мин)", topic: 'structure', forScore: 'low' },
      { tip: "Добавьте email и телефон (1 мин)", topic: 'contacts', forScore: 'low' },
      { tip: "Укажите даты работы в каждом месте (5 мин)", topic: 'dates', forScore: 'low' },
      
      // Для средних оценок (4-7)
      { tip: "Напишите 2-3 предложения о себе в начало (3 мин)", topic: 'summary', forScore: 'medium' },
      { tip: "К каждому опыту добавьте 2 достижения с % (10 мин)", topic: 'achievements', forScore: 'medium' },
      { tip: "Используйте глаголы: увеличил, создал, запустил (5 мин)", topic: 'verbs', forScore: 'medium' },
      { tip: "Разбейте текст на буллеты • (5 мин)", topic: 'bullets', forScore: 'medium' },
      
      // Для высоких оценок (7+)
      { tip: "Усильте цифры: добавьте %, суммы, объёмы (5 мин)", topic: 'metrics', forScore: 'high' },
      { tip: "Добавьте ссылку на LinkedIn (1 мин)", topic: 'linkedin', forScore: 'high' },
      { tip: "Проверьте: у каждого пункта есть результат? (3 мин)", topic: 'achievements', forScore: 'high' },
    ];
    
    // Определяем уровень
    let level: 'low' | 'medium' | 'high';
    if (score < 4) level = 'low';
    else if (score < 7) level = 'medium';
    else level = 'high';
    
    // Фильтруем по уровню и неиспользованным темам
    const availableTips = allTips.filter(t => 
      t.forScore === level && !usedTopics.has(t.topic)
    );
    
    // Если не хватает - добавляем из других уровней
    if (availableTips.length < 3) {
      const otherTips = allTips.filter(t => 
        t.forScore !== level && !usedTopics.has(t.topic)
      );
      availableTips.push(...otherTips);
    }
    
    return availableTips.slice(0, 3).map(t => t.tip);
  }
  
  async analyze(resumeText: string): Promise<AnalysisResult> {
    const hash = this.createHash(resumeText);
    
    if (this.cache.has(hash)) {
      return this.cache.get(hash)!;
    }
    
    const analysis = this.analyzeWithRules(resumeText);
    const nudges = this.nudgeSystem.generateNudges(resumeText);
    
    // === ГЛОБАЛЬНАЯ ДЕДУПЛИКАЦИЯ ===
    const usedTopics = new Set<Topic>();
    
    // 1. Сначала обрабатываем наджи (самый высокий приоритет)
    for (const nudge of nudges) {
      const topic = this.detectTopic(nudge.message);
      if (topic) usedTopics.add(topic);
    }
    
    // 2. Фильтруем weaknesses
    const filteredWeaknesses = this.filterByUsedTopics(analysis.weaknesses, usedTopics);
    
    // 3. Фильтруем recommendations
    const filteredRecommendations = this.filterByUsedTopics(analysis.recommendations, usedTopics);
    
    // 4. Генерируем quickStart с учётом уже использованных тем
    const quickStart = this.generateQuickStart(analysis.score, usedTopics, analysis.analysisData);
    
    const result: AnalysisResult = {
      summary: analysis.summary,
      score: analysis.score,
      strengths: analysis.strengths,
      weaknesses: filteredWeaknesses.slice(0, 4),
      recommendations: filteredRecommendations.slice(0, 3),
      nudges: nudges,
      quickStart: quickStart,
      qualityMetrics: analysis.qualityMetrics
    };
    
    this.cache.set(hash, result);
    return result;
  }
}