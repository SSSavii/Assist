/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Динамическая загрузка PDF.js из CDN
 */
async function loadPdfJs(): Promise<any> {
  if (typeof window === 'undefined') {
    throw new Error('PDF.js можно использовать только в браузере');
  }

  // Проверяем, загружен ли уже PDF.js
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
        // Настраиваем worker
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
 * Парсинг PDF через CDN версию PDF.js
 */
async function parsePDF(file: File): Promise<string> {
  try {
    const pdfjsLib = await loadPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    // Извлекаем текст со всех страниц
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str || '')
        .join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error(
      'Не удалось прочитать PDF. Пожалуйста, откройте файл, скопируйте текст (Ctrl+A, Ctrl+C) и вставьте в поле ниже.'
    );
  }
}

/**
 * Парсинг DOCX через встроенный ZIP API браузера
 */
async function parseDOCX(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // DOCX - это ZIP архив
    // Ищем файл word/document.xml
    const zipData = uint8Array;
    
    // Простой поиск XML содержимого
    const decoder = new TextDecoder('utf-8');
    const fullText = decoder.decode(zipData);
    
    // Ищем тег <w:t> который содержит текст в DOCX
    const textMatches = fullText.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
    
    if (!textMatches || textMatches.length === 0) {
      throw new Error('Не найден текстовый контент в DOCX');
    }
    
    // Извлекаем текст из тегов
    const extractedText = textMatches
      .map(match => {
        const textContent = match.replace(/<w:t[^>]*>/, '').replace(/<\/w:t>/, '');
        return textContent
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'");
      })
      .join(' ');
    
    return extractedText;
  } catch (error) {
    console.error('DOCX parsing error:', error);
    throw new Error(
      'Не удалось прочитать DOCX. Пожалуйста, откройте файл, скопируйте текст (Ctrl+A, Ctrl+C) и вставьте в поле ниже.'
    );
  }
}

/**
 * Парсинг TXT файла
 */
async function parseTXT(file: File): Promise<string> {
  return await file.text();
}

/**
 * Универсальная функция парсинга файлов
 */
export async function parseResumeFile(file: File): Promise<{
  text: string;
  metadata: {
    fileName: string;
    fileSize: number;
    fileType: string;
    extractedLength: number;
  };
}> {
  let text = '';
  
  // Проверка размера
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Файл слишком большой (максимум 10MB)');
  }
  
  try {
    // Определяем тип файла и парсим
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      console.log('Parsing PDF:', file.name);
      text = await parsePDF(file);
    } 
    else if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.endsWith('.docx')
    ) {
      console.log('Parsing DOCX:', file.name);
      text = await parseDOCX(file);
    }
    else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      console.log('Parsing TXT:', file.name);
      text = await parseTXT(file);
    }
    else if (file.type === 'application/msword' || file.name.endsWith('.doc')) {
      throw new Error('Старый формат .doc не поддерживается. Сохраните файл в формате .docx');
    }
    else {
      throw new Error(`Неподдерживаемый формат: ${file.name}. Поддерживаются: PDF, DOCX, TXT`);
    }
  } catch (error) {
    console.error('File parsing error:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Не удалось прочитать файл.');
  }
  
  // Очистка текста
  text = text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\t/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .trim();
  
  if (!text || text.length < 50) {
    throw new Error('Файл пуст или содержит слишком мало текста (минимум 50 символов)');
  }
  
  // Ограничение размера
  if (text.length > 50000) {
    text = text.substring(0, 50000);
    console.log('Text truncated to 50000 characters');
  }
  
  return {
    text,
    metadata: {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      extractedLength: text.length
    }
  };
}