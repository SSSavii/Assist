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

export class ResumeAnalyzer {
  private nudgeSystem: NudgeSystem;
  private cache: Map<string, AnalysisResult>;
  
  constructor() {
    this.nudgeSystem = new NudgeSystem();
    this.cache = new Map();
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

  // Дедупликация по ключевым словам
  private deduplicateByKeywords(items: string[]): string[] {
    const keywords = [
      'summary', 'о себе', 'профиль',
      'цифр', 'метрик', 'процент', '%',
      'достижен', 'результат',
      'контакт', 'email', 'телефон',
      'структур', 'секци',
      'глагол', 'актив',
      'bullet', 'список', 'маркир',
      'язык', 'english', 'английск',
      'сократ', 'длин', 'коротк', 'объём',
      'опыт', 'дат', 'год'
    ];
    
    const result: string[] = [];
    const usedKeywords = new Set<string>();
    
    for (const item of items) {
      const itemLower = item.toLowerCase();
      const itemKeywords = keywords.filter(kw => itemLower.includes(kw));
      
      const hasOverlap = itemKeywords.some(kw => usedKeywords.has(kw));
      
      if (!hasOverlap || itemKeywords.length === 0) {
        result.push(item);
        itemKeywords.forEach(kw => usedKeywords.add(kw));
      }
    }
    
    return result;
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
          'Добавьте структурированную информацию о вашем опыте',
          'Укажите образование, навыки и достижения'
        ],
        recommendations: [
          'Используйте структуру: Summary → Опыт → Образование → Навыки',
          'Добавьте контактную информацию (email, телефон)',
          'Опишите опыт работы с датами и достижениями'
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
    
    // Сильные стороны
    const strengths = [];
    
    if (analysis.yearsCount >= 5 && analysis.companiesCount >= 2) {
      strengths.push(`Солидный опыт: ${analysis.yearsCount}+ лет в ${analysis.companiesCount} компаниях`);
    } else if (analysis.yearsCount >= 3) {
      strengths.push(`Опыт работы ${analysis.yearsCount} ${this.getYearWord(analysis.yearsCount)}`);
    }
    
    if (analysis.numbersCount >= 15 && analysis.percentageCount >= 3) {
      strengths.push("Отличная количественная аргументация");
    } else if (analysis.numbersCount >= 8) {
      strengths.push("Есть конкретные количественные показатели");
    }
    
    if (analysis.hasAchievements && (analysis.percentageCount >= 2 || analysis.currencyCount >= 1)) {
      strengths.push("Достижения подкреплены измеримыми результатами");
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
      strengths.push("Оптимальный объём резюме");
    }
    
    // Слабые стороны
    const weaknesses = [];
    
    if (!analysis.hasSummary) {
      weaknesses.push("Нет вводного Summary — рекрутер не понимает вашу ценность за 10 секунд");
    }
    
    if (analysis.numbersCount < 5) {
      weaknesses.push("Мало конкретных цифр — сложно оценить масштаб работы");
    } else if (analysis.percentageCount === 0) {
      weaknesses.push("Нет процентных показателей результативности");
    }
    
    if (!analysis.hasAchievements) {
      weaknesses.push("Не выделены достижения — описаны обязанности, а не результаты");
    }
    
    if (analysis.hasActionVerbs < 4) {
      weaknesses.push("Мало активных глаголов — текст звучит пассивно");
    }
    
    if (analysis.isTooShort) {
      weaknesses.push(`Резюме слишком короткое (${Math.round(textLength/100)/10}k символов)`);
    } else if (analysis.isTooLong) {
      weaknesses.push(`Резюме избыточное (${Math.round(textLength/1000)}k символов)`);
    }
    
    if (!analysis.hasGoodStructure) {
      weaknesses.push("Нечёткая структура — сложно быстро найти информацию");
    }
    
    if (!analysis.hasBulletPoints) {
      weaknesses.push("Нет маркированных списков — текст монолитный");
    }
    
    if (!analysis.hasLanguages) {
      weaknesses.push("Не указан уровень иностранных языков");
    }
    
    if (analysis.hasDuplicates) {
      weaknesses.push("Есть повторяющиеся фразы");
    }
    
    // Рекомендации
    const recommendations = [];
    
    if (!analysis.hasSummary) {
      recommendations.push("Добавьте Summary: роль + опыт + 2-3 навыка + главное достижение (2-3 строки)");
    }
    
    if (analysis.numbersCount < 10 || analysis.percentageCount < 2) {
      recommendations.push("Добавьте метрики: объём бюджета, размер команды, % роста");
    }
    
    if (!analysis.hasAchievements || analysis.hasActionVerbs < 5) {
      recommendations.push("Перепишите в формате: Действие → Результат → Метрика");
    }
    
    if (analysis.isTooLong) {
      recommendations.push("Сократите до 1-2 страниц: оставьте последние 5-7 лет");
    }
    
    if (!analysis.hasGoodStructure || !analysis.hasBulletPoints) {
      recommendations.push("Используйте структуру: Summary → Опыт → Образование → Навыки");
    }
    
    if (!analysis.hasPortfolio && (text.includes('дизайн') || text.includes('разработ'))) {
      recommendations.push("Добавьте ссылки на портфолио/GitHub/Behance");
    }
    
    // Summary
    let summary = "";
    
    if (score >= 9) {
      summary = "Топовое резюме уровня senior-специалиста. Вы в топ-5% кандидатов.";
    } else if (score >= 8) {
      summary = "Отличное резюме. Небольшие правки — и идеально.";
    } else if (score >= 7) {
      summary = "Хорошее резюме. Добавьте больше цифр и метрик.";
    } else if (score >= 6) {
      summary = "Базовое резюме. Информация есть, но подача слабая.";
    } else if (score >= 5) {
      summary = "Резюме требует доработки. Много текста, мало результатов.";
    } else if (score >= 3) {
      summary = "Слабое резюме. Нужна серьёзная переработка.";
    } else {
      summary = "Резюме не соответствует стандартам.";
    }
    
    // Дедупликация
    const uniqueWeaknesses = this.deduplicateByKeywords(weaknesses);
    const uniqueRecommendations = this.deduplicateByKeywords(recommendations);
    
    return {
      summary,
      score,
      strengths: strengths.slice(0, 5),
      weaknesses: uniqueWeaknesses.slice(0, 5),
      recommendations: uniqueRecommendations.slice(0, 4),
      qualityMetrics: {
        isRealResume: true,
        textQuality: validation.quality,
        structureQuality: analysis.hasGoodStructure ? 8 : 4,
        contentQuality: Math.min(10, Math.round((analysis.numbersCount / 2) + (analysis.hasAchievements ? 3 : 0)))
      }
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
  
  async analyze(resumeText: string): Promise<AnalysisResult> {
    const hash = this.createHash(resumeText);
    
    if (this.cache.has(hash)) {
      return this.cache.get(hash)!;
    }
    
    const analysis = this.analyzeWithRules(resumeText);
    const nudges = this.nudgeSystem.generateNudges(resumeText);
    
    const result: AnalysisResult = {
      summary: analysis.summary,
      score: analysis.score,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      recommendations: analysis.recommendations,
      nudges: nudges,
      quickStart: this.generateQuickStart(analysis.score),
      qualityMetrics: analysis.qualityMetrics
    };
    
    this.cache.set(hash, result);
    return result;
  }
  
  private generateQuickStart(score: number): string[] {
    if (score < 4) {
      return [
        "Создайте структуру: Summary → Опыт → Образование → Навыки (15 мин)",
        "Добавьте даты и названия компаний (5 мин)",
        "Укажите минимум 5 конкретных навыков (3 мин)"
      ];
    } else if (score < 7) {
      return [
        "Добавьте Summary из 2-3 строк в начало (5 мин)",
        "К каждому опыту — 2-3 достижения с цифрами (10 мин)",
        "Замените пассивные фразы на активные глаголы (5 мин)"
      ];
    } else {
      return [
        "Усильте метрики: добавьте % роста и объёмы (5 мин)",
        "Проверьте, что каждое достижение имеет цифру (3 мин)",
        "Добавьте ссылку на LinkedIn/портфолио (2 мин)"
      ];
    }
  }
}