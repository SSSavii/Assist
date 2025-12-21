/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Результат парсинга файла
 */
export interface ParseResult {
  text: string;
  metadata: {
    fileName: string;
    fileSize: number;
    fileType: string;
    extractedLength: number;
    pageCount?: number;
    quality: 'good' | 'ocr' | 'poor';
    warning?: string;
    ocrUsed?: boolean;
    ocrPages?: number;
  };
}

/**
 * Callback для отображения прогресса
 */
export type ProgressCallback = (progress: number, status: string) => void;

/**
 * Динамическая загрузка PDF.js
 */
async function loadPdfJs(): Promise<any> {
  if (typeof window === 'undefined') {
    throw new Error('PDF.js можно использовать только в браузере');
  }

  if ((window as any).pdfjsLib) {
    return (window as any).pdfjsLib;
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;
    
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      if (pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
        resolve(pdfjsLib);
      } else {
        reject(new Error('Не удалось загрузить PDF.js'));
      }
    };
    
    script.onerror = () => reject(new Error('Ошибка загрузки PDF.js'));
    document.head.appendChild(script);
  });
}

/**
 * Динамическая загрузка Tesseract.js
 */
async function loadTesseract(): Promise<any> {
  if (typeof window === 'undefined') {
    throw new Error('Tesseract.js можно использовать только в браузере');
  }
  
  // Динамический импорт для code splitting
  const Tesseract = await import('tesseract.js');
  return Tesseract.default || Tesseract;
}

/**
 * Проверка качества извлечённого текста
 */
function checkTextQuality(text: string): { 
  isGood: boolean; 
  score: number;
  reason?: string 
} {
  if (!text || text.trim().length === 0) {
    return { isGood: false, score: 0, reason: 'Текст пустой' };
  }

  const trimmed = text.trim();
  
  // Слишком короткий текст для резюме
  if (trimmed.length < 100) {
    return { isGood: false, score: 1, reason: 'Текст слишком короткий' };
  }
  
  // Паттерн: отдельные буквы с пробелами (признак проблемного PDF)
  // Например: "P y t h o n" или ") k o o l t u O"
  const singleLetterRuns = trimmed.match(/(\s[a-zA-Zа-яА-ЯёЁ]\s){3,}/g) || [];
  if (singleLetterRuns.length >= 3) {
    return { isGood: false, score: 2, reason: 'Буквы разделены пробелами' };
  }
  
  // Паттерн: reversed текст или мусор
  const reversedPattern = /[)(\]\[}{><]/g;
  const brackets = (trimmed.match(reversedPattern) || []).length;
  const bracketRatio = brackets / trimmed.length;
  if (bracketRatio > 0.05) {
    return { isGood: false, score: 2, reason: 'Много скобок и спецсимволов' };
  }
  
  // Проверяем соотношение пробелов к буквам
  const letters = (trimmed.match(/[a-zA-Zа-яА-ЯёЁ]/g) || []).length;
  const spaces = (trimmed.match(/\s/g) || []).length;
  
  if (letters === 0) {
    return { isGood: false, score: 0, reason: 'Нет букв в тексте' };
  }
  
  const spaceToLetterRatio = spaces / letters;
  // Нормальный текст: ~0.15-0.25, проблемный: >0.5
  if (spaceToLetterRatio > 0.5) {
    return { isGood: false, score: 3, reason: 'Слишком много пробелов между символами' };
  }
  
  // Проверяем наличие осмысленных слов (минимум 3 буквы подряд)
  const words = trimmed.match(/[a-zA-Zа-яА-ЯёЁ]{3,}/g) || [];
  if (words.length < 20) {
    return { isGood: false, score: 3, reason: 'Мало распознаваемых слов' };
  }
  
  // Проверяем ключевые слова резюме
  const resumeKeywords = [
    'опыт', 'работа', 'образование', 'навык', 'компания', 'должность',
    'experience', 'education', 'skills', 'работал', 'university', 'manager'
  ];
  const foundKeywords = resumeKeywords.filter(kw => 
    trimmed.toLowerCase().includes(kw)
  ).length;
  
  if (foundKeywords === 0) {
    // Нет ключевых слов, но текст может быть нормальным
    return { isGood: true, score: 6, reason: 'Нет типичных слов резюме' };
  }
  
  // Хороший текст
  const qualityScore = Math.min(10, 5 + foundKeywords + (words.length > 50 ? 2 : 0));
  return { isGood: true, score: qualityScore };
}

/**
 * Рендеринг страницы PDF в Canvas для OCR
 */
async function renderPageToCanvas(page: any, scale: number = 2.5): Promise<HTMLCanvasElement> {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  
  // Белый фон для лучшего OCR
  context.fillStyle = 'white';
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  await page.render({
    canvasContext: context,
    viewport: viewport
  }).promise;
  
  return canvas;
}

/**
 * OCR одной страницы через Tesseract.js
 */
async function ocrPage(
  canvas: HTMLCanvasElement,
  Tesseract: any,
  pageNum: number,
  totalPages: number,
  onProgress?: ProgressCallback
): Promise<string> {
  const worker = await Tesseract.createWorker('rus+eng', 1, {
    logger: (m: any) => {
      if (onProgress && m.status === 'recognizing text') {
        const pageProgress = m.progress * 100;
        const overallProgress = ((pageNum - 1) / totalPages * 100) + (pageProgress / totalPages);
        onProgress(
          Math.round(overallProgress), 
          `Распознаём страницу ${pageNum}/${totalPages}...`
        );
      }
    }
  });
  
  try {
    const { data: { text } } = await worker.recognize(canvas);
    return text;
  } finally {
    await worker.terminate();
  }
}

/**
 * Парсинг PDF с fallback на OCR
 */
async function parsePDF(
  file: File, 
  onProgress?: ProgressCallback
): Promise<{ text: string; pageCount: number; ocrUsed: boolean; ocrPages: number }> {
  onProgress?.(5, 'Загружаем PDF...');
  
  const pdfjsLib = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  
  onProgress?.(10, 'Открываем документ...');
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pageCount = pdf.numPages;
  
  let fullText = '';
  let ocrUsed = false;
  let ocrPagesCount = 0;
  
  // Сначала пробуем извлечь текст обычным способом
  onProgress?.(15, 'Извлекаем текст...');
  
  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str || '')
      .join(' ');
    fullText += pageText + '\n';
    
    onProgress?.(15 + (i / pageCount) * 25, `Читаем страницу ${i}/${pageCount}...`);
  }
  
  // Проверяем качество
  const quality = checkTextQuality(fullText);
  console.log('📊 Качество извлечённого текста:', quality);
  
  if (quality.isGood && quality.score >= 5) {
    onProgress?.(100, 'Готово!');
    return { text: fullText, pageCount, ocrUsed: false, ocrPages: 0 };
  }
  
  // Качество плохое — пробуем OCR
  console.log('🔄 Качество текста низкое, запускаем OCR...');
  onProgress?.(45, 'Текст нечитаемый, запускаем распознавание...');
  
  try {
    const Tesseract = await loadTesseract();
    onProgress?.(50, 'Загружаем модуль распознавания...');
    
    let ocrText = '';
    
    for (let i = 1; i <= pageCount; i++) {
      onProgress?.(50 + (i / pageCount) * 45, `Распознаём страницу ${i}/${pageCount}...`);
      
      const page = await pdf.getPage(i);
      const canvas = await renderPageToCanvas(page);
      
      const pageText = await ocrPage(
        canvas, 
        Tesseract, 
        i, 
        pageCount,
        (progress, status) => {
          onProgress?.(50 + (i - 1) / pageCount * 45 + progress / pageCount * 0.45, status);
        }
      );
      
      ocrText += pageText + '\n\n';
      ocrPagesCount++;
      
      // Очищаем canvas для экономии памяти
      canvas.width = 0;
      canvas.height = 0;
    }
    
    // Проверяем качество OCR результата
    const ocrQuality = checkTextQuality(ocrText);
    
    if (ocrQuality.isGood && ocrQuality.score > quality.score) {
      onProgress?.(100, 'Распознавание завершено!');
      return { text: ocrText, pageCount, ocrUsed: true, ocrPages: ocrPagesCount };
    }
    
    // OCR не помог — возвращаем лучший из двух вариантов
    if (quality.score >= ocrQuality.score) {
      return { text: fullText, pageCount, ocrUsed: false, ocrPages: 0 };
    }
    
    return { text: ocrText, pageCount, ocrUsed: true, ocrPages: ocrPagesCount };
    
  } catch (ocrError) {
    console.error('❌ Ошибка OCR:', ocrError);
    
    // OCR не сработал, но есть хоть какой-то текст
    if (fullText.trim().length > 50) {
      return { text: fullText, pageCount, ocrUsed: false, ocrPages: 0 };
    }
    
    throw new Error(
      'Не удалось распознать текст в PDF. ' +
      'Попробуйте открыть файл и скопировать текст вручную (Ctrl+A, Ctrl+C).'
    );
  }
}

/**
 * Динамическая загрузка Mammoth.js
 */
async function loadMammoth(): Promise<any> {
  if (typeof window === 'undefined') {
    throw new Error('Mammoth.js можно использовать только в браузере');
  }

  if ((window as any).mammoth) {
    return (window as any).mammoth;
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = '/mammoth.browser.min.js';
    script.async = true;
    
    script.onload = () => {
      const mammoth = (window as any).mammoth;
      if (mammoth) {
        resolve(mammoth);
      } else {
        reject(new Error('Не удалось загрузить Mammoth.js'));
      }
    };
    
    script.onerror = () => reject(new Error('Ошибка загрузки Mammoth.js'));
    document.head.appendChild(script);
  });
}

/**
 * Парсинг DOCX
 */
async function parseDOCX(file: File, onProgress?: ProgressCallback): Promise<string> {
  onProgress?.(10, 'Загружаем документ...');
  
  const mammoth = await loadMammoth();
  const arrayBuffer = await file.arrayBuffer();
  
  onProgress?.(50, 'Извлекаем текст...');
  
  const result = await mammoth.extractRawText({ arrayBuffer });
  
  if (!result.value || result.value.trim().length === 0) {
    throw new Error('Документ пуст или не содержит текста');
  }
  
  onProgress?.(100, 'Готово!');
  return result.value;
}

/**
 * Парсинг TXT
 */
async function parseTXT(file: File, onProgress?: ProgressCallback): Promise<string> {
  onProgress?.(50, 'Читаем файл...');
  const text = await file.text();
  onProgress?.(100, 'Готово!');
  return text;
}

/**
 * Универсальная функция парсинга файлов с поддержкой OCR
 */
export async function parseResumeFile(
  file: File,
  onProgress?: ProgressCallback
): Promise<ParseResult> {
  // Проверка размера
  if (file.size > 15 * 1024 * 1024) {
    throw new Error('Файл слишком большой (максимум 15MB)');
  }
  
  let text = '';
  let pageCount: number | undefined;
  let ocrUsed = false;
  let ocrPages = 0;
  let quality: 'good' | 'ocr' | 'poor' = 'good';
  let warning: string | undefined;
  
  try {
    const fileName = file.name.toLowerCase();
    
    if (file.type === 'application/pdf' || fileName.endsWith('.pdf')) {
      console.log('📕 Обработка PDF файла...');
      const result = await parsePDF(file, onProgress);
      text = result.text;
      pageCount = result.pageCount;
      ocrUsed = result.ocrUsed;
      ocrPages = result.ocrPages;
      
      if (ocrUsed) {
        quality = 'ocr';
        warning = `Использовано распознавание текста (OCR) для ${ocrPages} страниц. Проверьте корректность.`;
      }
    } 
    else if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.docx')
    ) {
      console.log('📘 Обработка DOCX файла...');
      text = await parseDOCX(file, onProgress);
    }
    else if (file.type === 'text/plain' || fileName.endsWith('.txt')) {
      console.log('📄 Обработка TXT файла...');
      text = await parseTXT(file, onProgress);
    }
    else if (file.type === 'application/msword' || fileName.endsWith('.doc')) {
      throw new Error('Старый формат .doc не поддерживается. Сохраните файл в формате .docx');
    }
    else {
      throw new Error(`Неподдерживаемый формат: ${file.name}. Поддерживаются: PDF, DOCX, TXT`);
    }
    
    // Очистка текста
    text = text
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\t/g, ' ')
      .replace(/[ ]{2,}/g, ' ')
      .trim();
    
    // Финальная проверка
    if (!text || text.length < 50) {
      quality = 'poor';
      throw new Error(
        'Не удалось извлечь достаточно текста. ' +
        'Попробуйте открыть файл и скопировать текст вручную.'
      );
    }
    
    // Проверяем качество финального текста
    const finalQuality = checkTextQuality(text);
    if (!finalQuality.isGood || finalQuality.score < 4) {
      quality = 'poor';
      warning = 'Качество извлечённого текста низкое. Рекомендуем проверить или вставить текст вручную.';
    }
    
    // Ограничение размера
    if (text.length > 50000) {
      text = text.substring(0, 50000);
      warning = (warning ? warning + ' ' : '') + 'Текст обрезан до 50000 символов.';
    }
    
    console.log(`✅ Успешно извлечено ${text.length} символов из ${file.name}${ocrUsed ? ' (с OCR)' : ''}`);
    
    return {
      text,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || 'unknown',
        extractedLength: text.length,
        pageCount,
        quality,
        warning,
        ocrUsed,
        ocrPages
      }
    };
    
  } catch (error) {
    console.error('❌ Ошибка парсинга файла:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Не удалось прочитать файл. Попробуйте вставить текст вручную.');
  }
}