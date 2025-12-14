/* eslint-disable @typescript-eslint/no-unused-vars */
import PizZip from 'pizzip';

/**
 * Парсинг PDF через встроенный API браузера (без внешних библиотек!)
 */
async function parsePDF(file: File): Promise<string> {
  // Простое извлечение текста из PDF через FileReader
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
        
        // Конвертируем в текст (базовый подход)
        const decoder = new TextDecoder('utf-8');
        let text = decoder.decode(typedArray);
        
        // Очищаем от PDF служебных символов
        text = text
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ' ') // Удаляем control chars
          .replace(/<<[^>]*>>/g, ' ') // Удаляем PDF objects
          .replace(/\/[A-Za-z]+/g, ' ') // Удаляем PDF commands
          .replace(/\s+/g, ' ') // Множественные пробелы
          .trim();
        
        resolve(text);
      } catch (error) {
        reject(new Error('Не удалось прочитать PDF файл'));
      }
    };
    
    reader.onerror = () => reject(new Error('Ошибка чтения файла'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Парсинг DOCX через PizZip (простой и надежный)
 */
async function parseDOCX(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const zip = new PizZip(arrayBuffer);
        
        // Извлекаем document.xml из DOCX
        const documentXml = zip.file('word/document.xml')?.asText();
        
        if (!documentXml) {
          throw new Error('Не удалось найти текст в документе');
        }
        
        // Извлекаем текст из XML (простой regex)
        const text = documentXml
          .replace(/<w:t[^>]*>([^<]*)<\/w:t>/g, '$1 ') // Извлекаем текст из <w:t> тегов
          .replace(/<[^>]*>/g, '') // Удаляем все XML теги
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'")
          .replace(/\s+/g, ' ')
          .trim();
        
        resolve(text);
      } catch (error) {
        reject(new Error('Не удалось прочитать DOCX файл. Возможно, он поврежден.'));
      }
    };
    
    reader.onerror = () => reject(new Error('Ошибка чтения файла'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Парсинг TXT файла (как было)
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
      throw new Error(`Неподдерживаемый формат файла: ${file.name}`);
    }
  } catch (error) {
    console.error('File parsing error:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Не удалось прочитать файл. Возможно, он поврежден.');
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