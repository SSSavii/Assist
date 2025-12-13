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
    const result = {
      summary: '',
      score: 5,
      strengths: [] as string[],
      weaknesses: [] as string[],
      recommendations: [] as string[]
    };
    
    // Быстрый анализ по ключевым словам
    const checks = {
      hasSummary: text.includes('о себе') || text.includes('summary'),
      hasExperience: text.includes('опыт') || text.includes('работа'),
      hasEducation: text.includes('образование'),
      hasSkills: text.includes('навыки'),
      hasNumbers: (text.match(/\d+/g) || []).length > 5,
      hasPercents: text.includes('%'),
      goodLength: resumeText.length > 500 && resumeText.length < 4000
    };
    
    // Подсчет оценки
    Object.values(checks).forEach(check => {
      if (check) result.score += 0.7;
    });
    result.score = Math.min(10, Math.round(result.score));
    
    // Сильные стороны
    if (checks.hasExperience) result.strengths.push("Описан опыт работы");
    if (checks.hasEducation) result.strengths.push("Указано образование");
    if (checks.hasNumbers) result.strengths.push("Используются конкретные цифры");
    if (checks.hasSkills) result.strengths.push("Перечислены навыки");
    
    // Слабые стороны
    if (!checks.hasSummary) result.weaknesses.push("Нет краткого summary");
    if (!checks.hasPercents) result.weaknesses.push("Мало метрик и процентов");
    if (!checks.goodLength) result.weaknesses.push("Неоптимальная длина резюме");
    
    // Рекомендации
    if (!checks.hasSummary) result.recommendations.push("Добавьте summary в начало");
    if (!checks.hasNumbers) result.recommendations.push("Используйте больше цифр");
    result.recommendations.push("Опишите достижения с результатами");
    
    // Summary
    result.summary = result.score >= 7 
      ? "Хорошее резюме. Небольшие улучшения сделают его отличным."
      : "Резюме требует доработки. Следуйте рекомендациям ниже.";
    
    return result;
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
      strengths: analysis.strengths.length > 0 ? analysis.strengths : ["Есть базовая информация"],
      weaknesses: analysis.weaknesses.length > 0 ? analysis.weaknesses : ["Можно улучшить структуру"],
      recommendations: analysis.recommendations.slice(0, 3),
      nudges: nudges,
      quickStart: [
        "Добавьте summary (2 мин)",
        "Добавьте цифры (5 мин)",
        "Оптимизируйте длину (3 мин)"
      ]
    };
    
    this.cache.set(hash, result);
    return result;
  }
}