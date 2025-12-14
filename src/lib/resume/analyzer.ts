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
  
  /**
   * Проверка, является ли текст реальным резюме или мусором
   */
  private validateResumeQuality(text: string): { isValid: boolean; quality: number; reason?: string } {
    const length = text.length;
    
    // 1. Проверка соотношения пробелов (нормальный текст: 15-25%)
    const spaces = (text.match(/\s/g) || []).length;
    const spaceRatio = spaces / length;
    
    if (spaceRatio < 0.10) {
      return { 
        isValid: false, 
        quality: 0,
        reason: 'Текст не содержит достаточно пробелов - похоже на случайный набор символов' 
      };
    }
    
    // 2. Проверка на повторяющиеся символы (aaaaaaa, 111111)
    const repeatingPattern = /(.)\1{10,}/g;
    if (repeatingPattern.test(text)) {
      return { 
        isValid: false, 
        quality: 0,
        reason: 'Обнаружены длинные последовательности повторяющихся символов' 
      };
    }
    
    // 3. Проверка на бессмысленные последовательности
    const words = text.split(/\s+/);
    const longWords = words.filter(w => w.length > 3);
    
    if (longWords.length === 0) {
      return { 
        isValid: false, 
        quality: 0,
        reason: 'Текст не содержит осмысленных слов' 
      };
    }
    
    // 4. Средняя длина слова (норма: 5-8 символов)
    const avgWordLength = longWords.reduce((sum, w) => sum + w.length, 0) / longWords.length;
    
    if (avgWordLength < 3 || avgWordLength > 15) {
      return { 
        isValid: false, 
        quality: 1,
        reason: 'Неестественная средняя длина слов' 
      };
    }
    
    // 5. Проверка наличия ключевых слов резюме (хотя бы 2 из списка)
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
        reason: 'Текст не содержит ключевых слов резюме - не похоже на резюме' 
      };
    }
    
    // 6. Проверка на наличие профессиональной информации
    const hasDates = /\d{4}/.test(text); // Годы
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
    
    // Вычисляем общее качество текста (0-10)
    let quality = 5; // Базовое качество
    
    // Бонусы за качество
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
    
    // Проверяем качество текста
    const validation = this.validateResumeQuality(resumeText);
    
    if (!validation.isValid) {
      return {
        summary: `❌ Это не похоже на резюме. ${validation.reason}`,
        score: validation.quality,
        strengths: [],
        weaknesses: [
          validation.reason || 'Текст не соответствует формату резюме',
          'Добавьте структурированную информацию о вашем опыте',
          'Укажите образование, навыки и достижения'
        ],
        recommendations: [
          'Используйте стандартную структуру резюме: Summary → Опыт → Образование → Навыки',
          'Добавьте контактную информацию (email, телефон)',
          'Опишите ваш опыт работы с датами и достижениями'
        ],
        qualityMetrics: {
          isRealResume: false,
          textQuality: validation.quality,
          structureQuality: 0,
          contentQuality: 0
        }
      };
    }
    
    // Расширенный анализ для валидного резюме
    const analysis = {
      // Базовые секции (более строгая проверка)
      hasSummary: this.checkPattern(text, ['о себе', 'summary', 'обо мне', 'профиль']) && 
                  text.split('\n').some(line => line.length > 100 && line.length < 500),
      
      hasExperience: this.checkPattern(text, ['опыт работы', 'work experience', 'experience']) &&
                     (text.match(/\d{4}/g) || []).length >= 2, // Должны быть даты
      
      hasEducation: this.checkPattern(text, ['образование', 'education', 'университет', 'институт']),
      
      hasSkills: this.checkPattern(text, ['навыки', 'skills', 'компетенции']) &&
                 (text.match(/,/g) || []).length >= 3, // Должен быть список
      
      hasContacts: (text.match(/@/g) || []).length > 0 || /\+?\d{10,}/.test(text),
      
      hasAchievements: this.checkMultiplePatterns(text, [
        ['достиж', 'увелич'],
        ['сократ', 'оптимиз'],
        ['внедр', 'создал'],
        ['разработал', 'запустил']
      ]),
      
      // Метрики (более строгие требования)
      numbersCount: (text.match(/\d+/g) || []).length,
      percentageCount: (text.match(/\d+\s*%/g) || []).length,
      currencyCount: (text.match(/\d+\s*(руб|₽|тыс|млн|\$|€|к|k)/gi) || []).length,
      
      // Опыт работы
      yearsCount: this.extractYears(text),
      companiesCount: this.countCompanies(text),
      projectsCount: (text.match(/проект|project/gi) || []).length,
      
      // Качество описания
      hasActionVerbs: this.countActionVerbs(text),
      hasBulletPoints: resumeText.includes('•') || resumeText.includes('–') || 
                       resumeText.split('\n').filter(l => l.trim().match(/^[-*•]/)).length > 3,
      
      // Длина (более строгие критерии)
      isOptimalLength: textLength >= 1200 && textLength <= 3500,
      isGoodLength: textLength >= 800 && textLength <= 5000,
      isTooShort: textLength < 800,
      isTooLong: textLength > 5000,
      
      // Специфичные навыки
      hasTechSkills: this.countSkills(text, [
        'python', 'java', 'javascript', 'react', 'sql', 'excel', 
        'photoshop', 'figma', 'autocad', '1c', 'crm', 'erp'
      ]),
      
      hasSoftSkills: this.countSkills(text, [
        'коммуникаб', 'команд', 'лидер', 'ответствен', 
        'организов', 'аналитич', 'стрессоустойчив'
      ]),
      
      hasLanguages: this.checkPattern(text, [
        'английск', 'немецк', 'китайск', 'spanish', 'english', 
        'french', 'b2', 'c1', 'intermediate', 'advanced'
      ]),
      
      // Форматирование и структура
      hasGoodStructure: this.checkGoodStructure(text),
      hasDuplicates: this.checkDuplicates(text),
      
      // Профессионализм
      hasLinkedIn: text.includes('linkedin'),
      hasPortfolio: text.includes('portfolio') || text.includes('github') || text.includes('behance'),
    };
    
    // СТРОГАЯ система оценки (базовая оценка 3, а не 4)
    let score = 3.0;
    
    // === ОСНОВНЫЕ СЕКЦИИ (обязательные) ===
    if (analysis.hasExperience && analysis.yearsCount > 0) {
      score += 1.0; // Опыт с датами
    } else if (analysis.hasExperience) {
      score += 0.3; // Опыт без дат
    } else {
      score -= 1.0; // Нет опыта - большой штраф
    }
    
    if (analysis.hasEducation) score += 0.6;
    else score -= 0.5;
    
    if (analysis.hasSkills && (text.match(/,/g) || []).length >= 5) {
      score += 0.7; // Хороший список навыков
    } else if (analysis.hasSkills) {
      score += 0.3; // Минимальные навыки
    } else {
      score -= 0.5;
    }
    
    if (analysis.hasSummary) score += 0.6;
    if (analysis.hasContacts) score += 0.4;
    
    // === КАЧЕСТВО КОНТЕНТА ===
    // Метрики и цифры (важно!)
    if (analysis.numbersCount >= 15 && analysis.percentageCount >= 3) {
      score += 1.2; // Отлично
    } else if (analysis.numbersCount >= 10 && analysis.percentageCount >= 2) {
      score += 0.8; // Хорошо
    } else if (analysis.numbersCount >= 5) {
      score += 0.4; // Удовлетворительно
    } else {
      score -= 0.5; // Мало цифр - штраф
    }
    
    // Достижения
    if (analysis.hasAchievements && analysis.percentageCount >= 2) {
      score += 0.8; // Достижения с метриками
    } else if (analysis.hasAchievements) {
      score += 0.4;
    } else {
      score -= 0.4; // Нет достижений - штраф
    }
    
    // Глаголы действия
    if (analysis.hasActionVerbs >= 8) {
      score += 0.6;
    } else if (analysis.hasActionVerbs >= 4) {
      score += 0.3;
    } else {
      score -= 0.3;
    }
    
    // === ОПЫТ И ПРОФЕССИОНАЛИЗМ ===
    if (analysis.yearsCount >= 5) score += 0.5;
    else if (analysis.yearsCount >= 3) score += 0.3;
    else if (analysis.yearsCount >= 1) score += 0.1;
    
    if (analysis.companiesCount >= 3) score += 0.4;
    else if (analysis.companiesCount >= 2) score += 0.2;
    
    if (analysis.projectsCount >= 3) score += 0.3;
    
    // === НАВЫКИ ===
    if (analysis.hasTechSkills >= 5) score += 0.5;
    else if (analysis.hasTechSkills >= 3) score += 0.3;
    
    if (analysis.hasSoftSkills >= 3) score += 0.3;
    
    if (analysis.hasLanguages) score += 0.3;
    
    // === СТРУКТУРА И ФОРМАТИРОВАНИЕ ===
    if (analysis.hasGoodStructure) score += 0.6;
    else score -= 0.4;
    
    if (analysis.hasBulletPoints) score += 0.4;
    
    if (analysis.isOptimalLength) {
      score += 0.5;
    } else if (analysis.isGoodLength) {
      score += 0.2;
    }
    
    // === ДОПОЛНИТЕЛЬНЫЕ БОНУСЫ ===
    if (analysis.hasLinkedIn) score += 0.2;
    if (analysis.hasPortfolio) score += 0.3;
    
    // === ШТРАФЫ ===
    if (analysis.isTooShort) score -= 1.5; // Большой штраф
    if (analysis.isTooLong) score -= 0.8;
    if (analysis.hasDuplicates) score -= 0.6;
    if (!analysis.hasContacts) score -= 0.5;
    
    // Ограничиваем оценку 1-10
    score = Math.min(10, Math.max(1, Math.round(score * 10) / 10));
    
    // === ГЕНЕРАЦИЯ СИЛЬНЫХ СТОРОН ===
    const strengths = [];
    
    if (analysis.yearsCount >= 5 && analysis.companiesCount >= 2) {
      strengths.push(`💼 Солидный опыт работы: ${analysis.yearsCount}+ лет в ${analysis.companiesCount} компаниях`);
    } else if (analysis.yearsCount >= 3) {
      strengths.push(`Практический опыт работы ${analysis.yearsCount} ${this.getYearWord(analysis.yearsCount)}`);
    }
    
    if (analysis.numbersCount >= 15 && analysis.percentageCount >= 3) {
      strengths.push("📊 Отличная количественная аргументация (цифры, проценты, метрики)");
    } else if (analysis.numbersCount >= 8) {
      strengths.push("Присутствуют конкретные количественные показатели");
    }
    
    if (analysis.hasAchievements && (analysis.percentageCount >= 2 || analysis.currencyCount >= 1)) {
      strengths.push("🏆 Достижения подкреплены измеримыми результатами");
    }
    
    if (analysis.hasTechSkills >= 5 && analysis.hasSoftSkills >= 3) {
      strengths.push("⚡ Отличный баланс технических и личностных компетенций");
    } else if (analysis.hasTechSkills >= 3) {
      strengths.push("Указаны релевантные профессиональные навыки");
    }
    
    if (analysis.hasGoodStructure && analysis.hasBulletPoints) {
      strengths.push("📝 Четкая структура с удобным форматированием");
    }
    
    if (analysis.hasPortfolio || analysis.hasLinkedIn) {
      strengths.push("🔗 Указаны дополнительные профессиональные ресурсы");
    }
    
    if (analysis.isOptimalLength) {
      strengths.push("✅ Оптимальный объем резюме (легко читается)");
    }
    
    // === ГЕНЕРАЦИЯ СЛАБЫХ СТОРОН ===
    const weaknesses = [];
    
    if (!analysis.hasSummary) {
      weaknesses.push("❌ Отсутствует вводный Summary — рекрутер не понимает вашу ценность за 10 секунд");
    }
    
    if (analysis.numbersCount < 5) {
      weaknesses.push("📉 Критически мало конкретных цифр — невозможно оценить масштаб вашей работы");
    } else if (analysis.percentageCount === 0) {
      weaknesses.push("Нет процентных показателей результативности");
    }
    
    if (!analysis.hasAchievements) {
      weaknesses.push("⚠️ Не выделены достижения — описаны обязанности, а не результаты");
    }
    
    if (analysis.hasActionVerbs < 4) {
      weaknesses.push("Мало активных глаголов (управлял, запустил, увеличил) — текст пассивный");
    }
    
    if (analysis.isTooShort) {
      weaknesses.push(`📄 Резюме слишком короткое (${Math.round(textLength/100)/10}k символов) — недостаточно информации для оценки`);
    } else if (analysis.isTooLong) {
      weaknesses.push(`Резюме избыточное (${Math.round(textLength/1000)}k символов) — рекрутер не дочитает до конца`);
    }
    
    if (!analysis.hasGoodStructure) {
      weaknesses.push("🔍 Нечеткая структура — сложно быстро найти ключевую информацию");
    }
    
    if (!analysis.hasBulletPoints) {
      weaknesses.push("Нет маркированных списков — текст выглядит монолитным и сложным для чтения");
    }
    
    if (analysis.hasTechSkills === 0 && !text.includes('менеджер')) {
      weaknesses.push("Не указаны конкретные инструменты и технологии");
    }
    
    if (!analysis.hasLanguages && !text.includes('только русский')) {
      weaknesses.push("Не указан уровень владения иностранными языками");
    }
    
    if (analysis.hasDuplicates) {
      weaknesses.push("⚠️ Обнаружены повторяющиеся фразы — выглядит непрофессионально");
    }
    
    // === РЕКОМЕНДАЦИИ ===
    const recommendations = [];
    
    if (!analysis.hasSummary) {
      recommendations.push("Добавьте Summary в начало: Ваша роль + опыт (лет) + 2-3 ключевых навыка + главное достижение. Пример: 'Senior Project Manager с 7+ годами опыта в IT. Запустил 15+ проектов, бюджет до $2M. Сократил time-to-market на 30%.'");
    }
    
    if (analysis.numbersCount < 10 || analysis.percentageCount < 2) {
      recommendations.push("Добавьте метрики к каждому пункту опыта: объем бюджета, размер команды, количество проектов, % роста показателей, сэкономленное время. Цифры = доказательство компетентности.");
    }
    
    if (!analysis.hasAchievements || analysis.hasActionVerbs < 5) {
      recommendations.push("Перепишите обязанности в формате STAR: Действие → Результат → Метрика. Вместо 'занимался продажами' → 'Увеличил выручку на 45% (с $200K до $290K) за 6 месяцев через внедрение CRM и обучение команды (8 человек)'.");
    }
    
    if (analysis.isTooLong) {
      recommendations.push("Сократите до 1-2 страниц: оставьте только последние 5-7 лет опыта, уберите неактуальные навыки и древние проекты. Рекрутер не читает больше 2 страниц.");
    }
    
    if (!analysis.hasGoodStructure || !analysis.hasBulletPoints) {
      recommendations.push("Используйте четкую структуру: Summary → Опыт работы (обратная хронология) → Образование → Навыки → Дополнительно. Каждый блок опыта разбивайте на bullet points.");
    }
    
    if (!analysis.hasPortfolio && (text.includes('дизайн') || text.includes('разработ') || text.includes('developer'))) {
      recommendations.push("Добавьте ссылки на портфолио/GitHub/Behance — для креативных и технических специальностей это критично.");
    }
    
    // === SUMMARY НА ОСНОВЕ ОЦЕНКИ ===
    let summary = "";
    
    if (score >= 9) {
      summary = "🏆 Топовое резюме уровня senior/lead-специалиста. Идеальная структура, конкретные достижения с метриками, профессиональная подача. Вы в топ-5% кандидатов.";
    } else if (score >= 8) {
      summary = "⭐ Отличное резюме. Четкая структура, есть цифры и достижения. Небольшая доработка — и вы в топе.";
    } else if (score >= 7) {
      summary = "✅ Хорошее резюме middle-уровня. Основа сильная, но не хватает конкретики и метрик для перехода на senior-позиции.";
    } else if (score >= 6) {
      summary = "📝 Базовое резюме уровня middle-специалиста. Информация есть, но подача слабая — нужно больше цифр и результатов.";
    } else if (score >= 5) {
      summary = "⚠️ Резюме junior-уровня. Много текста об обязанностях, мало о результатах. Переработайте формат и добавьте метрики.";
    } else if (score >= 3) {
      summary = "❌ Слабое резюме. Отсутствуют ключевые секции, нет структуры, мало конкретики. Требуется полная переработка.";
    } else {
      summary = "🚫 Резюме не соответствует минимальным стандартам. Следуйте всем рекомендациям ниже для создания профессионального резюме.";
    }
    
    return {
      summary,
      score,
      strengths: strengths.slice(0, 6),
      weaknesses: weaknesses.slice(0, 5),
      recommendations: recommendations.slice(0, 4),
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
    return Math.min(companyMarkers.length, 5); // Максимум 5 компаний
  }
  
  private extractYears(text: string): number {
    // Ищем упоминания опыта в годах
    const yearMatches = text.match(/(\d+)\s*(лет|год|year|г\.|г)/gi);
    if (yearMatches && yearMatches.length > 0) {
      const numbers = yearMatches[0].match(/\d+/);
      return numbers ? parseInt(numbers[0]) : 0;
    }
    
    // Пробуем посчитать по датам
    const dateMatches = text.match(/20\d{2}|19\d{2}/g);
    if (dateMatches && dateMatches.length >= 2) {
      const years = dateMatches.map(d => parseInt(d));
      const experience = Math.max(...years) - Math.min(...years);
      return Math.min(experience, 40); // Ограничение 40 лет
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
    
    // Если уникальных предложений меньше 90% от всех - есть дубликаты
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
        "1. Создайте структуру: Summary, Опыт, Образование, Навыки (15 мин)",
        "2. Добавьте даты и названия компаний (5 мин)",
        "3. Укажите хотя бы 5 конкретных навыков (3 мин)"
      ];
    } else if (score < 7) {
      return [
        "1. Добавьте Summary из 3-4 строк в начало (5 мин)",
        "2. К каждому опыту добавьте 2-3 достижения с цифрами (10 мин)",
        "3. Замените пассивные фразы на активные глаголы (5 мин)"
      ];
    } else {
      return [
        "1. Усильте метрики: добавьте % роста и объемы (5 мин)",
        "2. Проверьте, что каждое достижение имеет цифру (3 мин)",
        "3. Оптимизируйте длину до 1.5-2 страниц (5 мин)"
      ];
    }
  }
}