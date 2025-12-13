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
}

export class ResumeAnalyzer {
  private nudgeSystem: NudgeSystem;
  private cache: Map<string, AnalysisResult>;
  
  constructor() {
    this.nudgeSystem = new NudgeSystem();
    this.cache = new Map();
  }
  
  private analyzeWithRules(resumeText: string): any {
    const text = resumeText.toLowerCase();
    const textLength = resumeText.length;
    
    // Расширенный анализ
    const analysis = {
      // Базовые секции
      hasSummary: this.checkPattern(text, ['о себе', 'summary', 'обо мне', 'профиль', 'цель']),
      hasExperience: this.checkPattern(text, ['опыт', 'работа', 'experience', 'должность', 'компания']),
      hasEducation: this.checkPattern(text, ['образование', 'education', 'университет', 'институт', 'курсы']),
      hasSkills: this.checkPattern(text, ['навыки', 'skills', 'умения', 'владею', 'знания']),
      hasContacts: this.checkPattern(text, ['телефон', 'email', '@', 'почта', 'связь']),
      hasAchievements: this.checkPattern(text, ['достиж', 'увелич', 'сократ', 'оптимиз', 'внедр', 'создал', 'разработал']),
      
      // Метрики
      numbersCount: (text.match(/\d+/g) || []).length,
      percentageCount: (text.match(/\d+\s*%/g) || []).length,
      currencyCount: (text.match(/\d+\s*(руб|₽|тыс|млн|\$|€)/gi) || []).length,
      
      // Опыт
      yearsCount: this.extractYears(text),
      companiesCount: (text.match(/(ооо|оао|ип|llc|ltd|inc|компания|company)/gi) || []).length,
      
      // Качество текста
      hasActionVerbs: this.checkPattern(text, ['руководил', 'управлял', 'организовал', 'разработал', 'внедрил', 'оптимизировал']),
      hasBulletPoints: resumeText.includes('•') || resumeText.includes('-') || resumeText.includes('*'),
      
      // Длина
      isGoodLength: textLength > 800 && textLength < 4000,
      isTooShort: textLength < 500,
      isTooLong: textLength > 5000,
      
      // Специфичные навыки
      hasTechSkills: this.checkPattern(text, ['python', 'java', 'excel', 'sql', 'photoshop', 'figma']),
      hasSoftSkills: this.checkPattern(text, ['коммуникаб', 'команд', 'лидер', 'ответствен', 'организов']),
      hasLanguages: this.checkPattern(text, ['английск', 'немецк', 'китайск', 'spanish', 'english']),
      
      // Форматирование
      hasStructure: this.checkMultiplePatterns(text, [['опыт', 'образование'], ['experience', 'education']]),
    };
    
    // Вычисляем динамическую оценку
    let score = 4; // Базовая оценка
    
    // Основные секции (по 1 баллу)
    if (analysis.hasExperience) score += 1.2;
    if (analysis.hasEducation) score += 0.8;
    if (analysis.hasSkills) score += 0.8;
    if (analysis.hasSummary) score += 0.7;
    if (analysis.hasContacts) score += 0.5;
    
    // Качество контента (по 0.5 балла)
    if (analysis.numbersCount > 5) score += 0.6;
    if (analysis.percentageCount > 2) score += 0.5;
    if (analysis.currencyCount > 0) score += 0.4;
    if (analysis.hasAchievements) score += 0.6;
    if (analysis.hasActionVerbs) score += 0.4;
    
    // Дополнительные факторы
    if (analysis.yearsCount > 2) score += 0.3;
    if (analysis.companiesCount > 1) score += 0.2;
    if (analysis.hasTechSkills) score += 0.3;
    if (analysis.hasLanguages) score += 0.2;
    
    // Штрафы
    if (analysis.isTooShort) score -= 1;
    if (analysis.isTooLong) score -= 0.5;
    if (!analysis.hasStructure) score -= 0.5;
    
    score = Math.min(10, Math.max(1, Math.round(score * 10) / 10));
    
    // Генерируем уникальные сильные стороны
    const strengths = [];
    if (analysis.hasExperience) {
      if (analysis.yearsCount > 5) {
        strengths.push(`Солидный опыт работы (${analysis.yearsCount}+ лет)`);
      } else if (analysis.yearsCount > 0) {
        strengths.push(`Есть практический опыт работы (${analysis.yearsCount} ${this.getYearWord(analysis.yearsCount)})`);
      } else {
        strengths.push("Описан профессиональный опыт");
      }
    }
    
    if (analysis.numbersCount > 10) {
      strengths.push("Отлично используются конкретные цифры и факты");
    } else if (analysis.numbersCount > 5) {
      strengths.push("Присутствуют количественные показатели");
    }
    
    if (analysis.hasAchievements && analysis.percentageCount > 0) {
      strengths.push("Достижения подкреплены метриками");
    } else if (analysis.hasAchievements) {
      strengths.push("Описаны профессиональные достижения");
    }
    
    if (analysis.hasTechSkills && analysis.hasSoftSkills) {
      strengths.push("Сбалансированное сочетание hard и soft skills");
    } else if (analysis.hasSkills) {
      strengths.push("Четко обозначены профессиональные навыки");
    }
    
    if (analysis.hasEducation && analysis.hasLanguages) {
      strengths.push("Хорошая образовательная база и знание языков");
    } else if (analysis.hasEducation) {
      strengths.push("Указано релевантное образование");
    }
    
    if (analysis.isGoodLength && analysis.hasStructure) {
      strengths.push("Оптимальная структура и объем резюме");
    }
    
    // Генерируем уникальные слабые стороны
    const weaknesses = [];
    if (!analysis.hasSummary) {
      weaknesses.push("Отсутствует краткое резюме (summary) в начале");
    }
    
    if (analysis.numbersCount < 3) {
      weaknesses.push("Недостаточно конкретных цифр и измеримых результатов");
    } else if (analysis.percentageCount === 0) {
      weaknesses.push("Нет процентных показателей эффективности");
    }
    
    if (!analysis.hasAchievements) {
      weaknesses.push("Не выделены ключевые достижения и результаты");
    }
    
    if (analysis.isTooLong) {
      weaknesses.push(`Резюме слишком объемное (${Math.round(textLength/1000)}k символов), рекомендуется сократить`);
    } else if (analysis.isTooShort) {
      weaknesses.push("Резюме слишком краткое, не хватает важных деталей");
    }
    
    if (!analysis.hasActionVerbs) {
      weaknesses.push("Мало активных глаголов действия (руководил, создал, увеличил)");
    }
    
    if (!analysis.hasStructure) {
      weaknesses.push("Нечеткая структура, сложно выделить ключевые разделы");
    }
    
    // Генерируем персонализированные рекомендации
    const recommendations = [];
    if (!analysis.hasSummary) {
      recommendations.push("Добавьте краткое summary (3-4 строки) в начало - опишите вашу экспертизу и ценность");
    }
    
    if (analysis.numbersCount < 5) {
      recommendations.push("Добавьте больше метрик: количество проектов, объем бюджета, размер команды, % роста показателей");
    }
    
    if (!analysis.hasAchievements || analysis.percentageCount === 0) {
      recommendations.push("Переформулируйте опыт через достижения: что конкретно сделали и какой получили результат");
    }
    
    if (analysis.isTooLong) {
      recommendations.push("Сократите резюме до 2 страниц, оставив только релевантный опыт за последние 5-7 лет");
    }
    
    if (!analysis.hasActionVerbs) {
      recommendations.push("Начинайте описание опыта с глаголов действия: организовал, запустил, увеличил, оптимизировал");
    }
    
    // Генерируем уникальное summary на основе оценки
    let summary = "";
    if (score >= 8.5) {
      summary = "Отличное резюме уровня senior-специалиста. Четкая структура, конкретные достижения с метриками, правильная подача опыта. Небольшие улучшения сделают его безупречным.";
    } else if (score >= 7.5) {
      summary = "Сильное резюме с хорошей базой. Есть опыт, навыки и достижения. Добавление конкретных метрик и результатов выведет его на топовый уровень.";
    } else if (score >= 6.5) {
      summary = "Хорошее резюме middle-уровня. Основная информация присутствует, но не хватает конкретики и измеримых результатов для усиления позиции.";
    } else if (score >= 5.5) {
      summary = "Базовое резюме junior-специалиста. Есть потенциал, но требуется серьезная доработка структуры и содержания для повышения конкурентоспособности.";
    } else {
      summary = "Резюме требует значительной переработки. Следуйте рекомендациям ниже, чтобы создать профессиональное резюме, которое заинтересует работодателей.";
    }
    
    return {
      summary,
      score,
      strengths: strengths.length > 0 ? strengths : ["Есть базовая информация о кандидате", "Указаны контактные данные"],
      weaknesses: weaknesses.length > 0 ? weaknesses : ["Можно усилить описание опыта", "Стоит добавить больше деталей"],
      recommendations: recommendations.slice(0, 3)
    };
  }
  
  private checkPattern(text: string, patterns: string[]): boolean {
    return patterns.some(pattern => text.includes(pattern));
  }
  
  private checkMultiplePatterns(text: string, patternGroups: string[][]): boolean {
    return patternGroups.some(group => 
      group.every(pattern => text.includes(pattern))
    );
  }
  
  private extractYears(text: string): number {
    const yearMatches = text.match(/(\d+)\s*(лет|год|year)/gi);
    if (yearMatches && yearMatches.length > 0) {
      const numbers = yearMatches[0].match(/\d+/);
      return numbers ? parseInt(numbers[0]) : 0;
    }
    
    // Попробуем посчитать по датам
    const dateMatches = text.match(/20\d{2}/g);
    if (dateMatches && dateMatches.length >= 2) {
      const years = dateMatches.map(d => parseInt(d));
      return Math.max(...years) - Math.min(...years);
    }
    
    return 0;
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
      strengths: analysis.strengths.slice(0, 5),
      weaknesses: analysis.weaknesses.slice(0, 4),
      recommendations: analysis.recommendations,
      nudges: nudges,
      quickStart: [
        "Добавьте summary в начало (2 мин)",
        "Укажите 3-5 достижений с цифрами (5 мин)",
        "Оптимизируйте длину до 1-2 страниц (3 мин)"
      ]
    };
    
    this.cache.set(hash, result);
    return result;
  }
}