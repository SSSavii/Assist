/* eslint-disable @typescript-eslint/no-explicit-any */
import * as pdfjsLib from 'pdfjs-dist';
// Используем обычный импорт mammoth (он работает и в браузере)
import * as mammoth from 'mammoth';

// Настройка worker для PDF.js
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

/**
 * Парсинг PDF файла в браузере
 */
async function parsePDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  
  // Извлекаем текст со всех страниц
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ');
    fullText += pageText + '\n';
  }
  
  return fullText;
}

/**
 * Парсинг DOCX файла в браузере
 */
async function parseDOCX(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
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