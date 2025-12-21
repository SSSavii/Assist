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
    columnsDetected?: boolean;
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
  
  if (trimmed.length < 100) {
    return { isGood: false, score: 1, reason: 'Текст слишком короткий' };
  }
  
  // Паттерн: отдельные буквы с пробелами
  const singleLetterRuns = trimmed.match(/(\s[a-zA-Zа-яА-ЯёЁ]\s){3,}/g) || [];
  if (singleLetterRuns.length >= 3) {
    return { isGood: false, score: 2, reason: 'Буквы разделены пробелами' };
  }
  
  // Паттерн: много скобок и спецсимволов
  const reversedPattern = /[)(\]\[}{><]/g;
  const brackets = (trimmed.match(reversedPattern) || []).length;
  const bracketRatio = brackets / trimmed.length;
  if (bracketRatio > 0.05) {
    return { isGood: false, score: 2, reason: 'Много скобок и спецсимволов' };
  }
  
  const letters = (trimmed.match(/[a-zA-Zа-яА-ЯёЁ]/g) || []).length;
  const spaces = (trimmed.match(/\s/g) || []).length;
  
  if (letters === 0) {
    return { isGood: false, score: 0, reason: 'Нет букв в тексте' };
  }
  
  const spaceToLetterRatio = spaces / letters;
  if (spaceToLetterRatio > 0.5) {
    return { isGood: false, score: 3, reason: 'Слишком много пробелов между символами' };
  }
  
  const words = trimmed.match(/[a-zA-Zа-яА-ЯёЁ]{3,}/g) || [];
  if (words.length < 20) {
    return { isGood: false, score: 3, reason: 'Мало распознаваемых слов' };
  }
  
  const resumeKeywords = [
    'опыт', 'работа', 'образование', 'навык', 'компания', 'должность',
    'experience', 'education', 'skills', 'работал', 'university', 'manager'
  ];
  const foundKeywords = resumeKeywords.filter(kw => 
    trimmed.toLowerCase().includes(kw)
  ).length;
  
  if (foundKeywords === 0) {
    return { isGood: true, score: 6, reason: 'Нет типичных слов резюме' };
  }
  
  const qualityScore = Math.min(10, 5 + foundKeywords + (words.length > 50 ? 2 : 0));
  return { isGood: true, score: qualityScore };
}

/**
 * Интерфейс для текстового элемента PDF
 */
interface TextItem {
  str: string;
  transform: number[];
  width?: number;
  height?: number;
}

/**
 * Извлечение текста из отсортированных элементов
 */
function extractTextFromItems(items: TextItem[]): string {
  if (items.length === 0) return '';
  
  let lastY = -1;
  const result: string[] = [];
  
  for (const item of items) {
    if (!item.str.trim()) continue;
    
    const y = Math.round(item.transform[5]);
    
    if (lastY !== -1 && Math.abs(y - lastY) > 8) {
      result.push('\n');
    } else if (lastY !== -1 && result.length > 0) {
      const lastChar = result[result.length - 1];
      if (lastChar !== '\n' && lastChar !== ' ') {
        result.push(' ');
      }
    }
    
    result.push(item.str);
    lastY = y;
  }
  
  return result.join('').trim();
}

/**
 * Умный парсинг страницы PDF с определением колонок
 */
async function parsePageWithColumnDetection(page: any): Promise<{ text: string; hasColumns: boolean }> {
  const textContent = await page.getTextContent();
  const items = textContent.items as TextItem[];
  
  if (items.length === 0) {
    return { text: '', hasColumns: false };
  }
  
  // Фильтруем пустые элементы
  const validItems = items.filter(item => item.str && item.str.trim());
  
  if (validItems.length === 0) {
    return { text: '', hasColumns: false };
  }
  
  // Получаем размеры страницы
  const viewport = page.getViewport({ scale: 1 });
  const pageWidth = viewport.width;
  
  // Анализируем распределение x-координат для определения колонок
  const xCoords = validItems.map(item => item.transform[4]);
  const minX = Math.min(...xCoords);
  const maxX = Math.max(...xCoords);
  const textWidth = maxX - minX;
  
  // Находим "центр" страницы и проверяем, есть ли разрыв в тексте
  const midPoint = minX + textWidth / 2;
  
  // Группируем элементы по левой/правой стороне
  const leftItems: TextItem[] = [];
  const rightItems: TextItem[] = [];
  
  // Определяем границу между колонками более умно
  // Сортируем x-координаты и ищем большой разрыв
  const sortedX = [...xCoords].sort((a, b) => a - b);
  let maxGap = 0;
  let gapPosition = midPoint;
  
  for (let i = 1; i < sortedX.length; i++) {
    const gap = sortedX[i] - sortedX[i - 1];
    if (gap > maxGap && sortedX[i - 1] > minX + textWidth * 0.2 && sortedX[i] < maxX - textWidth * 0.2) {
      maxGap = gap;
      gapPosition = (sortedX[i - 1] + sortedX[i]) / 2;
    }
  }
  
  // Если разрыв достаточно большой (>15% ширины текста), считаем что есть колонки
  const hasColumns = maxGap > textWidth * 0.15 && maxGap > 30;
  
  if (hasColumns) {
    console.log(`📊 Обнаружены колонки! Разрыв: ${maxGap.toFixed(0)}px, граница: ${gapPosition.toFixed(0)}px`);
    
    for (const item of validItems) {
      const x = item.transform[4];
      if (x < gapPosition) {
        leftItems.push(item);
      } else {
        rightItems.push(item);
      }
    }
    
    // Сортируем каждую колонку по Y (сверху вниз), затем по X
    const sortItems = (a: TextItem, b: TextItem) => {
      const yDiff = b.transform[5] - a.transform[5];
      if (Math.abs(yDiff) > 5) return yDiff;
      return a.transform[4] - b.transform[4];
    };
    
    leftItems.sort(sortItems);
    rightItems.sort(sortItems);
    
    // Собираем текст: сначала левая колонка, потом правая
    const leftText = extractTextFromItems(leftItems);
    const rightText = extractTextFromItems(rightItems);
    
    // Добавляем разделитель между колонками
    const combinedText = leftText + '\n\n---\n\n' + rightText;
    
    return { text: combinedText, hasColumns: true };
  }
  
  // Одноколоночный макет - стандартная обработка
  const sortedItems = validItems.sort((a, b) => {
    const yDiff = b.transform[5] - a.transform[5];
    if (Math.abs(yDiff) > 5) return yDiff;
    return a.transform[4] - b.transform[4];
  });
  
  return { text: extractTextFromItems(sortedItems), hasColumns: false };
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
    // Используем PSM 1 для автоматического определения макета (включая колонки)
    await worker.setParameters({
      tessedit_pageseg_mode: '1', // Automatic page segmentation with OSD
    });
    
    const { data: { text } } = await worker.recognize(canvas);
    return text;
  } finally {
    await worker.terminate();
  }
}

/**
 * Парсинг PDF с fallback на OCR и умным определением колонок
 */
async function parsePDF(
  file: File, 
  onProgress?: ProgressCallback
): Promise<{ 
  text: string; 
  pageCount: number; 
  ocrUsed: boolean; 
  ocrPages: number;
  columnsDetected: boolean;
}> {
  onProgress?.(5, 'Загружаем PDF...');
  
  const pdfjsLib = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  
  onProgress?.(10, 'Открываем документ...');
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pageCount = pdf.numPages;
  
  let fullText = '';
  let ocrUsed = false;
  let ocrPagesCount = 0;
  let columnsDetected = false;
  
  // Извлекаем текст с умным определением колонок
  onProgress?.(15, 'Анализируем структуру документа...');
  
  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const result = await parsePageWithColumnDetection(page);
    
    fullText += result.text + '\n\n';
    
    if (result.hasColumns) {
      columnsDetected = true;
    }
    
    onProgress?.(15 + (i / pageCount) * 25, `Читаем страницу ${i}/${pageCount}...`);
  }
  
  if (columnsDetected) {
    console.log('✅ Обнаружен двухколоночный макет, текст объединён корректно');
  }
  
  // Проверяем качество
  const quality = checkTextQuality(fullText);
  console.log('📊 Качество извлечённого текста:', quality);
  
  if (quality.isGood && quality.score >= 5) {
    onProgress?.(100, 'Готово!');
    return { text: fullText, pageCount, ocrUsed: false, ocrPages: 0, columnsDetected };
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
      
      canvas.width = 0;
      canvas.height = 0;
    }
    
    const ocrQuality = checkTextQuality(ocrText);
    
    if (ocrQuality.isGood && ocrQuality.score > quality.score) {
      onProgress?.(100, 'Распознавание завершено!');
      return { text: ocrText, pageCount, ocrUsed: true, ocrPages: ocrPagesCount, columnsDetected: false };
    }
    
    if (quality.score >= ocrQuality.score) {
      return { text: fullText, pageCount, ocrUsed: false, ocrPages: 0, columnsDetected };
    }
    
    return { text: ocrText, pageCount, ocrUsed: true, ocrPages: ocrPagesCount, columnsDetected: false };
    
  } catch (ocrError) {
    console.error('❌ Ошибка OCR:', ocrError);
    
    if (fullText.trim().length > 50) {
      return { text: fullText, pageCount, ocrUsed: false, ocrPages: 0, columnsDetected };
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
 * Очистка текста от артефактов колонок и лишних символов
 */
function cleanupText(text: string): string {
  return text
    // Нормализация переносов строк
    .replace(/\r\n/g, '\n')
    // Убираем разделитель колонок если он остался
    .replace(/\n---\n/g, '\n\n')
    // Убираем множественные переносы
    .replace(/\n{3,}/g, '\n\n')
    // Нормализация пробелов
    .replace(/\t/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    // Убираем пробелы в начале строк
    .replace(/\n +/g, '\n')
    // Убираем символы-артефакты PDF (№, специальные символы в начале строк)
    .replace(/^[№#•◦▪▸►→●○]\s*/gm, '')
    .replace(/\n[№#•◦▪▸►→●○]\s*/g, '\n')
    .trim();
}

/**
 * Универсальная функция парсинга файлов с поддержкой OCR
 */
export async function parseResumeFile(
  file: File,
  onProgress?: ProgressCallback
): Promise<ParseResult> {
  if (file.size > 15 * 1024 * 1024) {
    throw new Error('Файл слишком большой (максимум 15MB)');
  }
  
  let text = '';
  let pageCount: number | undefined;
  let ocrUsed = false;
  let ocrPages = 0;
  let columnsDetected = false;
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
      columnsDetected = result.columnsDetected;
      
      if (ocrUsed) {
        quality = 'ocr';
        warning = `Использовано распознавание текста (OCR) для ${ocrPages} страниц. Проверьте корректность.`;
      } else if (columnsDetected) {
        warning = 'Обнаружен двухколоночный макет. Текст объединён автоматически.';
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
    text = cleanupText(text);
    
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
    
    console.log(`✅ Успешно извлечено ${text.length} символов из ${file.name}${ocrUsed ? ' (с OCR)' : ''}${columnsDetected ? ' (колонки)' : ''}`);
    
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
        ocrPages,
        columnsDetected
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