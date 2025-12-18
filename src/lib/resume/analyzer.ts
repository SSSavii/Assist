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

// Все возможные темы
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

// Элемент с явной темой
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
      return { isValid: false, quality: 0, reason: 'Похоже на случайный набор символов' };
    }
    
    if (/(.)\1{10,}/g.test(text)) {
      return { isValid: false, quality: 0, reason: 'Обнаружены повторяющиеся символы' };
    }
    
    const words = text.split(/\s+/);
    const longWords = words.filter(w => w.length > 3);
    
    if (longWords.length === 0) {
      return { isValid: false, quality: 0, reason: 'Нет осмысленных слов' };
    }
    
    const avgWordLength = longWords.reduce((sum, w) => sum + w.length, 0) / longWords.length;
    
    if (avgWordLength < 3 || avgWordLength > 15) {
      return { isValid: false, quality: 1, reason: 'Неестественная длина слов' };
    }
    
    const resumeKeywords = [
      'опыт', 'работа', 'образование', 'навык', 'должность', 'компания',
      'experience', 'education', 'skills', 'работал', 'проект'
    ];
    
    const foundKeywords = resumeKeywords.filter(kw => text.toLowerCase().includes(kw)).length;
    
    if (foundKeywords < 2) {
      return { isValid: false, quality: 2, reason: 'Не похоже на резюме' };
    }
    
    const hasDates = /\d{4}/.test(text);
    const hasEmail = /@/.test(text);
    const hasPhone = /\+?\d{10,}/.test(text);
    
    if (!hasDates && !hasEmail && !hasPhone) {
      return { isValid: false, quality: 2, reason: 'Нет дат и контактов' };
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
        summary: `Это не похоже на резюме. ${validation.reason}`,
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
      yearsCount: this.extractYears(text),
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
    
    if (analysis.hasExperience && analysis.yearsCount > 0) score += 1.0;
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
    
    if (analysis.yearsCount >= 5) score += 0.5;
    else if (analysis.yearsCount >= 3) score += 0.3;
    
    if (analysis.hasGoodStructure) score += 0.6; else score -= 0.4;
    if (analysis.hasBulletPoints) score += 0.4;
    if (analysis.isOptimalLength) score += 0.5;
    if (analysis.hasLinkedIn) score += 0.2;
    if (analysis.hasPortfolio) score += 0.3;
    
    if (analysis.isTooShort) score -= 1.5;
    if (analysis.isTooLong) score -= 0.8;
    
    score = Math.min(10, Math.max(1, Math.round(score * 10) / 10));
    
    // Сильные стороны (без тем - это позитив)
    const strengths: string[] = [];
    
    if (analysis.yearsCount >= 5) {
      strengths.push(`Опыт ${analysis.yearsCount}+ лет`);
    } else if (analysis.yearsCount >= 3) {
      strengths.push(`Опыт ${analysis.yearsCount} года`);
    }
    
    if (analysis.numbersCount >= 10 && analysis.percentageCount >= 2) {
      strengths.push("Хорошая количественная аргументация");
    }
    
    if (analysis.hasAchievements && analysis.percentageCount >= 2) {
      strengths.push("Достижения с измеримыми результатами");
    }
    
    if (analysis.hasTechSkills >= 3) {
      strengths.push("Указаны профессиональные навыки");
    }
    
    if (analysis.hasGoodStructure) {
      strengths.push("Чёткая структура");
    }
    
    if (analysis.isOptimalLength) {
      strengths.push("Оптимальный объём");
    }
    
    // Слабые стороны С ТЕМАМИ
    const weaknessItems: TopicItem[] = [];
    
    if (!analysis.hasSummary) {
      weaknessItems.push({ text: "Нет вводного блока о себе", topic: "summary" });
    }
    if (analysis.numbersCount < 5) {
      weaknessItems.push({ text: "Мало конкретных цифр", topic: "metrics" });
    }
    if (!analysis.hasAchievements) {
      weaknessItems.push({ text: "Описаны обязанности, а не результаты", topic: "achievements" });
    }
    if (analysis.hasActionVerbs < 4) {
      weaknessItems.push({ text: "Мало глаголов действия", topic: "verbs" });
    }
    if (analysis.isTooShort) {
      weaknessItems.push({ text: "Резюме слишком короткое", topic: "length" });
    }
    if (analysis.isTooLong) {
      weaknessItems.push({ text: "Резюме слишком длинное", topic: "length" });
    }
    if (!analysis.hasGoodStructure) {
      weaknessItems.push({ text: "Нечёткая структура", topic: "structure" });
    }
    if (!analysis.hasBulletPoints) {
      weaknessItems.push({ text: "Нет маркированных списков", topic: "bullets" });
    }
    if (!analysis.hasLanguages) {
      weaknessItems.push({ text: "Не указаны иностранные языки", topic: "languages" });
    }
    
    // Рекомендации С ТЕМАМИ
    const recommendationItems: TopicItem[] = [];
    
    if (!analysis.hasSummary) {
      recommendationItems.push({ text: "Напишите 2-3 предложения о себе в начало", topic: "summary" });
    }
    if (analysis.numbersCount < 10) {
      recommendationItems.push({ text: "Добавьте цифры: бюджеты, команда, % роста", topic: "metrics" });
    }
    if (!analysis.hasAchievements) {
      recommendationItems.push({ text: "Перепишите опыт: Действие → Результат", topic: "achievements" });
    }
    if (analysis.isTooLong) {
      recommendationItems.push({ text: "Сократите до 2 страниц", topic: "length" });
    }
    if (!analysis.hasBulletPoints) {
      recommendationItems.push({ text: "Используйте маркированные списки (•)", topic: "bullets" });
    }
    if (!analysis.hasPortfolio && /дизайн|разработ/i.test(text)) {
      recommendationItems.push({ text: "Добавьте ссылку на GitHub/портфолио", topic: "portfolio" });
    }
    
    // Summary текст
    let summary = "";
    if (score >= 9) summary = "Топовое резюме. Вы в топ-5% кандидатов.";
    else if (score >= 8) summary = "Отличное резюме. Небольшие правки — и идеально.";
    else if (score >= 7) summary = "Хорошее резюме. Добавьте больше конкретики.";
    else if (score >= 6) summary = "Базовое резюме. Подача слабовата.";
    else if (score >= 5) summary = "Резюме требует доработки.";
    else summary = "Слабое резюме. Нужна переработка.";
    
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
  
  private extractYears(text: string): number {
    const match = text.match(/(\d+)\s*(лет|год|year)/i);
    if (match) return parseInt(match[1]);
    
    const dates = text.match(/20\d{2}|19\d{2}/g);
    if (dates && dates.length >= 2) {
      const years = dates.map(d => parseInt(d));
      return Math.min(Math.max(...years) - Math.min(...years), 40);
    }
    return 0;
  }
  
  private checkGoodStructure(text: string): boolean {
    const sections = [/опыт|experience/i.test(text), /образование|education/i.test(text), /навыки|skills/i.test(text)];
    return sections.filter(Boolean).length >= 2 && (text.match(/20\d{2}/g) || []).length >= 2;
  }
  
  private createHash(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
    }
    return hash.toString();
  }

  // Генерация quickStart
  private generateQuickStart(score: number, usedTopics: Set<string>, analysisData: any): string[] {
    const allTips: Array<{ text: string; topic: Topic; minScore: number; maxScore: number }> = [
      // Низкие оценки (0-4)
      { text: "Создайте секции: Опыт → Образование → Навыки (10 мин)", topic: "structure", minScore: 0, maxScore: 4 },
      { text: "Добавьте email и телефон (1 мин)", topic: "contacts", minScore: 0, maxScore: 4 },
      { text: "Укажите даты работы (5 мин)", topic: "dates", minScore: 0, maxScore: 4 },
      
      // Средние оценки (4-7)
      { text: "Напишите 2-3 предложения о себе в начало (3 мин)", topic: "summary", minScore: 4, maxScore: 7 },
      { text: "К каждому опыту добавьте результат с % (10 мин)", topic: "achievements", minScore: 4, maxScore: 7 },
      { text: "Замените «работал» на «увеличил», «создал» (5 мин)", topic: "verbs", minScore: 4, maxScore: 7 },
      { text: "Разбейте текст на буллеты • (5 мин)", topic: "bullets", minScore: 4, maxScore: 7 },
      
      // Высокие оценки (7+)
      { text: "Усильте цифры: %, суммы, объёмы (5 мин)", topic: "metrics", minScore: 7, maxScore: 10 },
      { text: "Добавьте ссылку на LinkedIn (1 мин)", topic: "linkedin", minScore: 7, maxScore: 10 },
      { text: "Проверьте: у каждого пункта есть результат? (3 мин)", topic: "achievements", minScore: 7, maxScore: 10 },
      { text: "Укажите уровень английского (1 мин)", topic: "languages", minScore: 7, maxScore: 10 },
    ];
    
    // Фильтруем по оценке и неиспользованным темам
    const relevantTips = allTips.filter(t => 
      score >= t.minScore && score < t.maxScore && !usedTopics.has(t.topic)
    );
    
    // Если мало - добавляем из других уровней
    if (relevantTips.length < 3) {
      const otherTips = allTips.filter(t => 
        !usedTopics.has(t.topic) && !relevantTips.includes(t)
      );
      relevantTips.push(...otherTips);
    }
    
    // Отмечаем использованные
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
    
    // === ГЛОБАЛЬНАЯ ДЕДУПЛИКАЦИЯ ===
    const usedTopics = new Set<string>();
    
    // 1. Добавляем темы из наджей (высший приоритет)
    for (const nudge of nudges) {
      usedTopics.add(nudge.topic);
    }
    
    // 2. Фильтруем weaknesses
    const weaknesses: string[] = [];
    for (const item of analysis.weaknessItems || []) {
      if (!usedTopics.has(item.topic)) {
        weaknesses.push(item.text);
        usedTopics.add(item.topic);
      }
    }
    
    // 3. Фильтруем recommendations
    const recommendations: string[] = [];
    for (const item of analysis.recommendationItems || []) {
      if (!usedTopics.has(item.topic)) {
        recommendations.push(item.text);
        usedTopics.add(item.topic);
      }
    }
    
    // 4. Генерируем quickStart с учётом уже использованных тем
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