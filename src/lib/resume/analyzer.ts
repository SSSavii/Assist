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
  | 'linkedin'
  | 'keywords'
  | 'framing'
  | 'experience'
  | 'unique';

interface TopicItem {
  text: string;
  topic: Topic;
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
      return { isValid: false, quality: 0, reason: 'Текст похож на случайный набор символов. Пожалуйста, загрузите корректное резюме.' };
    }
    
    if (/(.)\1{10,}/g.test(text)) {
      return { isValid: false, quality: 0, reason: 'Обнаружены повторяющиеся символы. Проверьте, что файл содержит текст резюме.' };
    }
    
    const words = text.split(/\s+/);
    const longWords = words.filter(w => w.length > 3);
    
    if (longWords.length === 0) {
      return { isValid: false, quality: 0, reason: 'Не удалось найти осмысленный текст. Убедитесь, что резюме содержит информацию.' };
    }
    
    const avgWordLength = longWords.reduce((sum, w) => sum + w.length, 0) / longWords.length;
    
    if (avgWordLength < 3 || avgWordLength > 15) {
      return { isValid: false, quality: 1, reason: 'Структура текста выглядит неестественно. Проверьте формат файла.' };
    }
    
    const resumeKeywords = [
      'опыт', 'работа', 'образование', 'навык', 'должность', 'компания',
      'experience', 'education', 'skills', 'работал', 'проект'
    ];
    
    const foundKeywords = resumeKeywords.filter(kw => text.toLowerCase().includes(kw)).length;
    
    if (foundKeywords < 2) {
      return { isValid: false, quality: 2, reason: 'Текст не содержит типичных разделов резюме (опыт, навыки, образование). Загрузите файл с резюме.' };
    }
    
    const hasDates = /\d{4}/.test(text);
    const hasEmail = /@/.test(text);
    const hasPhone = /\+?\d{10,}/.test(text);
    
    if (!hasDates && !hasEmail && !hasPhone) {
      return { isValid: false, quality: 2, reason: 'В тексте отсутствуют даты и контактные данные. Добавьте информацию о периодах работы.' };
    }
    
    let quality = 5;
    if (spaceRatio >= 0.15 && spaceRatio <= 0.22) quality += 1;
    if (avgWordLength >= 5 && avgWordLength <= 8) quality += 1;
    if (foundKeywords >= 5) quality += 1;
    if ([hasDates, hasEmail, hasPhone].filter(Boolean).length >= 2) quality += 1;
    
    return { isValid: true, quality: Math.min(10, quality) };
  }
  
  private analyzeWithRules(resumeText: string): any {
    const text = resumeText.toLowerCase();
    const textLength = resumeText.length;
    
    const validation = this.validateResumeQuality(resumeText);
    
    if (!validation.isValid) {
      return {
        summary: validation.reason || 'Не удалось распознать резюме',
        score: validation.quality,
        strengths: [],
        weaknessItems: [],
        recommendationItems: [],
        qualityMetrics: { isRealResume: false, textQuality: validation.quality, structureQuality: 0, contentQuality: 0 }
      };
    }
    
    // Анализ
    const analysis = {
      hasSummary: /о себе|summary|обо мне|профиль/i.test(text) && 
                  text.split('\n').some(line => line.length > 100 && line.length < 500),
      hasExperience: /опыт работы|experience/i.test(text) && (text.match(/\d{4}/g) || []).length >= 2,
      hasEducation: /образование|education|университет|институт/i.test(text),
      hasSkills: /навыки|skills|компетенции/i.test(text) && (text.match(/,/g) || []).length >= 3,
      hasContacts: /@/.test(text) || /\+?\d{10,}/.test(text),
      hasAchievements: /достиж|увелич|сократ|оптимиз|внедр|создал|разработал|запустил/i.test(text),
      numbersCount: (text.match(/\d+/g) || []).length,
      percentageCount: (text.match(/\d+\s*%/g) || []).length,
      yearsExperience: this.extractYearsOfExperience(text, resumeText),
      companiesCount: this.countCompanies(text),
      hasActionVerbs: this.countActionVerbs(text),
      hasBulletPoints: /[•–]/.test(resumeText) || resumeText.split('\n').filter(l => /^[-*•►→]/.test(l.trim())).length > 3,
      isTooShort: textLength < 800,
      isTooLong: textLength > 5000,
      isOptimalLength: textLength >= 1200 && textLength <= 3500,
      hasTechSkills: this.countSkills(text, ['python', 'java', 'javascript', 'react', 'sql', 'excel', 'figma', 'git']),
      hasSoftSkills: this.countSkills(text, ['коммуникаб', 'команд', 'лидер', 'ответствен']),
      hasLanguages: /английск|english|b1|b2|c1|c2|intermediate|advanced|fluent/i.test(text),
      hasGoodStructure: this.checkGoodStructure(text),
      hasLinkedIn: text.includes('linkedin'),
      hasPortfolio: /portfolio|github|behance/i.test(text),
    };
    
    // Расчёт оценки
    let score = 3.0;
    
    if (analysis.hasExperience && analysis.yearsExperience > 0) score += 1.0;
    else if (analysis.hasExperience) score += 0.3;
    else score -= 1.0;
    
    if (analysis.hasEducation) score += 0.6; else score -= 0.5;
    if (analysis.hasSkills) score += 0.5; else score -= 0.5;
    if (analysis.hasSummary) score += 0.6;
    if (analysis.hasContacts) score += 0.4; else score -= 0.5;
    
    if (analysis.numbersCount >= 15 && analysis.percentageCount >= 3) score += 1.2;
    else if (analysis.numbersCount >= 10) score += 0.8;
    else if (analysis.numbersCount >= 5) score += 0.4;
    else score -= 0.5;
    
    if (analysis.hasAchievements && analysis.percentageCount >= 2) score += 0.8;
    else if (analysis.hasAchievements) score += 0.4;
    else score -= 0.4;
    
    if (analysis.hasActionVerbs >= 8) score += 0.6;
    else if (analysis.hasActionVerbs >= 4) score += 0.3;
    else score -= 0.3;
    
    if (analysis.yearsExperience >= 5) score += 0.5;
    else if (analysis.yearsExperience >= 3) score += 0.3;
    
    if (analysis.hasGoodStructure) score += 0.6; else score -= 0.4;
    if (analysis.hasBulletPoints) score += 0.4;
    if (analysis.isOptimalLength) score += 0.5;
    if (analysis.hasLinkedIn) score += 0.2;
    if (analysis.hasPortfolio) score += 0.3;
    
    if (analysis.isTooShort) score -= 1.5;
    if (analysis.isTooLong) score -= 0.8;
    
    score = Math.min(10, Math.max(1, Math.round(score * 10) / 10));
    
    // Сильные стороны
    const strengths: string[] = [];
    
    if (analysis.yearsExperience >= 5) {
      strengths.push(`Солидный опыт работы: ${analysis.yearsExperience}+ лет`);
    } else if (analysis.yearsExperience >= 3) {
      strengths.push(`Хороший опыт работы: ${analysis.yearsExperience} года`);
    } else if (analysis.yearsExperience >= 1) {
      strengths.push(`Есть релевантный опыт работы`);
    }
    
    if (analysis.numbersCount >= 10 && analysis.percentageCount >= 2) {
      strengths.push("Хорошая количественная аргументация с цифрами");
    }
    
    if (analysis.hasAchievements && analysis.percentageCount >= 2) {
      strengths.push("Достижения подкреплены измеримыми результатами");
    }
    
    if (analysis.hasTechSkills >= 3) {
      strengths.push("Чётко указаны профессиональные навыки");
    }
    
    if (analysis.hasGoodStructure) {
      strengths.push("Логичная и понятная структура документа");
    }
    
    if (analysis.isOptimalLength) {
      strengths.push("Оптимальный объём резюме");
    }
    
    if (analysis.hasLanguages) {
      strengths.push("Указан уровень иностранных языков");
    }
    
    // Слабые стороны С ТЕМАМИ
    const weaknessItems: TopicItem[] = [];
    
    if (!analysis.hasSummary) {
      weaknessItems.push({ text: "Отсутствует вводный блок «О себе» или Summary", topic: "summary" });
    }
    if (analysis.numbersCount < 5) {
      weaknessItems.push({ text: "Недостаточно конкретных цифр и метрик", topic: "metrics" });
    }
    if (!analysis.hasAchievements) {
      weaknessItems.push({ text: "Описаны обязанности вместо достижений и результатов", topic: "achievements" });
    }
    if (analysis.hasActionVerbs < 4) {
      weaknessItems.push({ text: "Мало активных глаголов действия", topic: "verbs" });
    }
    if (analysis.isTooShort) {
      weaknessItems.push({ text: "Резюме слишком краткое, не хватает деталей", topic: "length" });
    }
    if (analysis.isTooLong) {
      weaknessItems.push({ text: "Резюме слишком длинное, сложно воспринимается", topic: "length" });
    }
    if (!analysis.hasGoodStructure) {
      weaknessItems.push({ text: "Структура документа требует улучшения", topic: "structure" });
    }
    if (!analysis.hasBulletPoints) {
      weaknessItems.push({ text: "Отсутствуют маркированные списки", topic: "bullets" });
    }
    if (!analysis.hasLanguages) {
      weaknessItems.push({ text: "Не указан уровень владения иностранными языками", topic: "languages" });
    }
    
    // Рекомендации С ТЕМАМИ
    const recommendationItems: TopicItem[] = [];
    
    if (!analysis.hasSummary) {
      recommendationItems.push({ text: "Добавьте блок «О себе»: 2-3 предложения о вашей экспертизе и целях", topic: "summary" });
    }
    if (analysis.numbersCount < 10) {
      recommendationItems.push({ text: "Усильте цифрами: бюджеты проектов, размер команды, % роста показателей", topic: "metrics" });
    }
    if (!analysis.hasAchievements) {
      recommendationItems.push({ text: "Переформулируйте опыт по схеме: Действие → Результат → Цифра", topic: "achievements" });
    }
    if (analysis.isTooLong) {
      recommendationItems.push({ text: "Сократите резюме до 1-2 страниц, оставив только релевантный опыт", topic: "length" });
    }
    if (!analysis.hasBulletPoints) {
      recommendationItems.push({ text: "Оформите опыт маркированными списками (•) для удобства чтения", topic: "bullets" });
    }
    if (!analysis.hasPortfolio && /дизайн|разработ/i.test(text)) {
      recommendationItems.push({ text: "Добавьте ссылку на GitHub, Behance или портфолио", topic: "portfolio" });
    }
    
    // Summary текст
    let summary = "";
    if (score >= 9) summary = "Отличное резюме! Вы в топ-5% кандидатов. Минимальные правки — и идеально.";
    else if (score >= 8) summary = "Сильное резюме с хорошей структурой. Небольшие улучшения сделают его ещё лучше.";
    else if (score >= 7) summary = "Хорошее резюме. Добавьте больше конкретики и цифр для усиления.";
    else if (score >= 6) summary = "Базовое резюме. Есть потенциал, но подача требует доработки.";
    else if (score >= 5) summary = "Резюме требует существенной доработки. Следуйте рекомендациям ниже.";
    else summary = "Резюме нуждается в серьёзной переработке. Начните с базовой структуры.";
    
    return {
      summary,
      score,
      strengths: strengths.slice(0, 5),
      weaknessItems,
      recommendationItems,
      qualityMetrics: {
        isRealResume: true,
        textQuality: validation.quality,
        structureQuality: analysis.hasGoodStructure ? 8 : 4,
        contentQuality: Math.min(10, Math.round(analysis.numbersCount / 2 + (analysis.hasAchievements ? 3 : 0)))
      },
      analysisData: analysis
    };
  }
  
  private countActionVerbs(text: string): number {
    const verbs = [
      'руководил', 'управлял', 'организовал', 'разработал', 'внедрил',
      'оптимизировал', 'увеличил', 'сократил', 'создал', 'запустил',
      'построил', 'возглавил', 'координировал', 'автоматизировал',
      'led', 'developed', 'implemented', 'increased', 'launched'
    ];
    return verbs.filter(v => text.includes(v)).length;
  }
  
  private countSkills(text: string, skills: string[]): number {
    return skills.filter(s => text.includes(s)).length;
  }
  
  private countCompanies(text: string): number {
    return Math.min((text.match(/(ооо|оао|ип|llc|ltd|inc|компания)/gi) || []).length, 5);
  }
  
  /**
   * ИСПРАВЛЕННАЯ ФУНКЦИЯ: Извлекает ТОЛЬКО годы опыта работы
   * Игнорирует год рождения и другие нерелевантные даты
   */
  private extractYearsOfExperience(text: string, originalText: string): number {
    // 1. Ищем явное указание опыта: "5 лет опыта", "опыт 3 года", "стаж 10 лет"
    const explicitPatterns = [
      /(\d+)\s*(?:\+)?\s*(?:лет|год|года)\s*(?:опыт|работ|стаж|в сфере|в области)/i,
      /(?:опыт|стаж)[:\s]*(\d+)\s*(?:\+)?\s*(?:лет|год|года)/i,
      /(?:более|больше|свыше)\s*(\d+)\s*(?:лет|года)/i
    ];
    
    for (const pattern of explicitPatterns) {
      const match = text.match(pattern);
      if (match) {
        const years = parseInt(match[1]);
        if (years > 0 && years <= 50) return years;
      }
    }
    
    // 2. Находим секцию "Опыт работы" и ищем даты только там
    const workSectionPatterns = [
      /(?:опыт работы|experience|карьера|места работы)[\s\S]*?(?=(?:образование|education|навыки|skills|сертификат|хобби|$))/gi,
    ];
    
    let workSection = '';
    for (const pattern of workSectionPatterns) {
      const match = originalText.match(pattern);
      if (match && match[0].length > workSection.length) {
        workSection = match[0];
      }
    }
    
    // Если не нашли секцию опыта, используем весь текст, но с осторожностью
    const searchText = workSection || originalText;
    
    // 3. Исключаем годы рождения
    const birthPatterns = [
      /(?:родил(?:ся|ась)|рождения|дата рождения|д\.р\.|г\.р\.)[:\s]*[\d./-]*(19\d{2}|200[0-9])/gi,
      /(19[5-9]\d|200[0-5])\s*(?:г\.р\.|года рождения)/gi,
      /(?:возраст|age)[:\s]*\d+/gi
    ];
    
    const birthYears = new Set<number>();
    for (const pattern of birthPatterns) {
      const matches = originalText.matchAll(pattern);
      for (const match of matches) {
        const yearMatch = match[0].match(/(19\d{2}|200[0-9])/);
        if (yearMatch) {
          birthYears.add(parseInt(yearMatch[1]));
        }
      }
    }
    
    // 4. Ищем диапазоны дат: "2018-2023", "2018 - 2023", "01.2018 - 12.2023"
    const dateRangePattern = /(?:с\s*)?(20[0-2]\d|19[9]\d)(?:\s*(?:г\.?|год[а]?))?[\s]*[-–—][\s]*(?:по\s*)?(20[0-2]\d|наст(?:\.|\s)?(?:время|вр\.?)?|present|н\.в\.?|сейчас|текущ)/gi;
    
    const ranges: Array<{start: number; end: number}> = [];
    const currentYear = new Date().getFullYear();
    
    let rangeMatch;
    while ((rangeMatch = dateRangePattern.exec(searchText)) !== null) {
      const startYear = parseInt(rangeMatch[1]);
      let endYear = currentYear;
      
      if (/^\d{4}$/.test(rangeMatch[2])) {
        endYear = parseInt(rangeMatch[2]);
      }
      
      // Пропускаем если это год рождения
      if (birthYears.has(startYear)) continue;
      
      // Валидация
      if (startYear >= 1990 && startYear <= currentYear && 
          endYear >= startYear && endYear <= currentYear + 1) {
        ranges.push({ start: startYear, end: endYear });
      }
    }
    
    // 5. Суммируем неперекрывающиеся периоды
    if (ranges.length > 0) {
      // Сортируем по началу
      ranges.sort((a, b) => a.start - b.start);
      
      // Объединяем перекрывающиеся периоды
      const merged: Array<{start: number; end: number}> = [ranges[0]];
      
      for (let i = 1; i < ranges.length; i++) {
        const last = merged[merged.length - 1];
        const curr = ranges[i];
        
        if (curr.start <= last.end) {
          last.end = Math.max(last.end, curr.end);
        } else {
          merged.push(curr);
        }
      }
      
      // Считаем общий опыт
      const totalYears = merged.reduce((sum, r) => sum + (r.end - r.start), 0);
      
      if (totalYears > 0 && totalYears <= 40) {
        return totalYears;
      }
    }
    
    // 6. Fallback: ищем отдельные годы в контексте работы
    const workContextPattern = /(?:работ|должност|компани|позици|менеджер|специалист|инженер|developer|manager|lead)/i;
    
    if (workContextPattern.test(searchText)) {
      const yearsInWork = (searchText.match(/20[0-2]\d/g) || [])
        .map(y => parseInt(y))
        .filter(y => !birthYears.has(y) && y >= 2000 && y <= currentYear);
      
      if (yearsInWork.length >= 2) {
        const experience = Math.max(...yearsInWork) - Math.min(...yearsInWork);
        if (experience > 0 && experience <= 30) {
          return experience;
        }
      }
    }
    
    return 0;
  }
  
  private checkGoodStructure(text: string): boolean {
    const sections = [
      /опыт|experience/i.test(text), 
      /образование|education/i.test(text), 
      /навыки|skills/i.test(text)
    ];
    return sections.filter(Boolean).length >= 2 && (text.match(/20\d{2}/g) || []).length >= 2;
  }
  
  private createHash(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
    }
    return hash.toString();
  }

  private generateQuickStart(score: number, usedTopics: Set<string>, analysisData: any): string[] {
    const allTips: Array<{ text: string; topic: Topic; minScore: number; maxScore: number }> = [
      // Низкие оценки (0-4)
      { text: "Создайте базовую структуру: Опыт → Образование → Навыки (10 мин)", topic: "structure", minScore: 0, maxScore: 4 },
      { text: "Добавьте контакты: email и телефон (1 мин)", topic: "contacts", minScore: 0, maxScore: 4 },
      { text: "Укажите периоды работы с датами (5 мин)", topic: "dates", minScore: 0, maxScore: 4 },
      
      // Средние оценки (4-7)
      { text: "Напишите блок «О себе»: 2-3 предложения о вашей экспертизе (3 мин)", topic: "summary", minScore: 4, maxScore: 7 },
      { text: "К каждому месту работы добавьте результат с цифрами (10 мин)", topic: "achievements", minScore: 4, maxScore: 7 },
      { text: "Замените «работал над» на «увеличил», «создал», «запустил» (5 мин)", topic: "verbs", minScore: 4, maxScore: 7 },
      { text: "Оформите опыт маркированными списками (•) (5 мин)", topic: "bullets", minScore: 4, maxScore: 7 },
      
      // Высокие оценки (7+)
      { text: "Усильте цифры: добавьте %, суммы, объёмы (5 мин)", topic: "metrics", minScore: 7, maxScore: 10 },
      { text: "Добавьте ссылку на LinkedIn профиль (1 мин)", topic: "linkedin", minScore: 7, maxScore: 10 },
      { text: "Проверьте: каждый пункт опыта содержит измеримый результат? (3 мин)", topic: "achievements", minScore: 7, maxScore: 10 },
      { text: "Укажите уровень английского языка (1 мин)", topic: "languages", minScore: 7, maxScore: 10 },
    ];
    
    const relevantTips = allTips.filter(t => 
      score >= t.minScore && score < t.maxScore && !usedTopics.has(t.topic)
    );
    
    if (relevantTips.length < 3) {
      const otherTips = allTips.filter(t => 
        !usedTopics.has(t.topic) && !relevantTips.includes(t)
      );
      relevantTips.push(...otherTips);
    }
    
    relevantTips.slice(0, 3).forEach(t => usedTopics.add(t.topic));
    
    return relevantTips.slice(0, 3).map(t => t.text);
  }
  
  async analyze(resumeText: string): Promise<AnalysisResult> {
    const hash = this.createHash(resumeText);
    
    if (this.cache.has(hash)) {
      return this.cache.get(hash)!;
    }
    
    const analysis = this.analyzeWithRules(resumeText);
    const nudges = this.nudgeSystem.generateNudges(resumeText);
    
    const usedTopics = new Set<string>();
    
    for (const nudge of nudges) {
      usedTopics.add(nudge.topic);
    }
    
    const weaknesses: string[] = [];
    for (const item of analysis.weaknessItems || []) {
      if (!usedTopics.has(item.topic)) {
        weaknesses.push(item.text);
        usedTopics.add(item.topic);
      }
    }
    
    const recommendations: string[] = [];
    for (const item of analysis.recommendationItems || []) {
      if (!usedTopics.has(item.topic)) {
        recommendations.push(item.text);
        usedTopics.add(item.topic);
      }
    }
    
    const quickStart = this.generateQuickStart(analysis.score, usedTopics, analysis.analysisData);
    
    const result: AnalysisResult = {
      summary: analysis.summary,
      score: analysis.score,
      strengths: analysis.strengths,
      weaknesses: weaknesses.slice(0, 4),
      recommendations: recommendations.slice(0, 3),
      nudges,
      quickStart,
      qualityMetrics: analysis.qualityMetrics
    };
    
    this.cache.set(hash, result);
    return result;
  }
}