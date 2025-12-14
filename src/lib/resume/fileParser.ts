/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Динамическая загрузка PDF.js (локальная версия)
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
 * Динамическая загрузка Mammoth.js (ЛОКАЛЬНАЯ версия из public/)
 */
async function loadMammoth(): Promise<any> {
  if (typeof window === 'undefined') {
    throw new Error('Mammoth.js можно использовать только в браузере');
  }

  // Проверяем, загружен ли уже Mammoth.js
  if ((window as any).mammoth) {
    console.log('✅ Mammoth.js уже загружен');
    return (window as any).mammoth;
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = '/mammoth.browser.min.js';  // ← Локальный файл из public/
    script.async = true;
    
    script.onload = () => {
      const mammoth = (window as any).mammoth;
      if (mammoth) {
        console.log('✅ Mammoth.js загружен успешно из /public');
        resolve(mammoth);
      } else {
        reject(new Error('Не удалось загрузить Mammoth.js'));
      }
    };
    
    script.onerror = () => {
      console.error('❌ Ошибка загрузки Mammoth.js из /mammoth.browser.min.js');
      reject(new Error('Ошибка загрузки Mammoth.js. Проверьте наличие файла /public/mammoth.browser.min.js'));
    };
    
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
 * Парсинг DOCX через локальную версию Mammoth.js
 */
async function parseDOCX(file: File): Promise<string> {
  try {
    console.log('🔄 Начинаем парсинг DOCX:', file.name, 'размер:', file.size, 'байт');
    
    const mammoth = await loadMammoth();
    const arrayBuffer = await file.arrayBuffer();
    
    console.log('📄 ArrayBuffer создан, размер:', arrayBuffer.byteLength, 'байт');
    
    // Извлекаем текст из DOCX
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    console.log('📝 Результат парсинга:', {
      textLength: result.value?.length || 0,
      messagesCount: result.messages?.length || 0
    });
    
    if (result.messages && result.messages.length > 0) {
      console.warn('⚠️ Предупреждения Mammoth:', result.messages);
    }
    
    if (!result.value || result.value.trim().length === 0) {
      console.error('❌ Текст не извлечен из DOCX');
      throw new Error('Документ пуст или не содержит текста');
    }
    
    console.log('✅ Успешно извлечено', result.value.length, 'символов');
    return result.value;
    
  } catch (error) {
    console.error('❌ DOCX parsing error:', error);
    
    if (error instanceof Error) {
      throw new Error(
        `Не удалось прочитать DOCX: ${error.message}. Попробуйте скопировать текст вручную.`
      );
    }
    
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
      console.log('📕 Обработка PDF файла...');
      text = await parsePDF(file);
    } 
    else if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.endsWith('.docx')
    ) {
      console.log('📘 Обработка DOCX файла...');
      text = await parseDOCX(file);
    }
    else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      console.log('📄 Обработка TXT файла...');
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
    console.log('✂️ Текст обрезан до 50000 символов');
  }
  
  console.log(`✅ Успешно извлечено ${text.length} символов из ${file.name}`);
  
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