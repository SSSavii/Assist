/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Настройка worker для pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const uint8Array = new Uint8Array(buffer);
  const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
  const pdf = await loadingTask.promise;
  
  let fullText = '';
  
  // Извлекаем текст со всех страниц
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n';
  }
  
  return fullText;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'Файл не загружен' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'Файл слишком большой (максимум 10MB)' 
      }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = '';

    try {
      // Обработка PDF с помощью pdfjs-dist
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        console.log('Parsing PDF file:', file.name);
        text = await extractTextFromPDF(buffer);
      }
      
      // Обработка DOCX
      else if (
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.name.endsWith('.docx')
      ) {
        console.log('Parsing DOCX file:', file.name);
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
        
        if (result.messages && result.messages.length > 0) {
          console.log('Mammoth warnings:', result.messages);
        }
      }
      
      // Обработка DOC
      else if (file.type === 'application/msword' || file.name.endsWith('.doc')) {
        return NextResponse.json({ 
          error: 'Старый формат .doc не поддерживается. Пожалуйста, сохраните документ в формате .docx' 
        }, { status: 400 });
      }
      
      // Обработка TXT
      else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        console.log('Parsing TXT file:', file.name);
        text = await file.text();
      }
      
      else {
        return NextResponse.json({ 
          error: `Неподдерживаемый формат файла: ${file.type || file.name}` 
        }, { status: 400 });
      }

    } catch (parseError) {
      console.error('File parsing error:', parseError);
      return NextResponse.json({ 
        error: 'Не удалось прочитать файл. Возможно, он поврежден или зашифрован.' 
      }, { status: 500 });
    }

    // Очистка текста
    text = text
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\t/g, ' ')
      .replace(/[ ]{2,}/g, ' ')
      .trim();

    if (!text || text.length < 50) {
      return NextResponse.json({ 
        error: 'Файл пуст или содержит слишком мало текста (минимум 50 символов)' 
      }, { status: 400 });
    }

    if (text.length > 50000) {
      text = text.substring(0, 50000);
      console.log('Text truncated to 50000 characters');
    }

    console.log(`Successfully extracted ${text.length} characters from ${file.name}`);

    return NextResponse.json({ 
      text,
      metadata: {
        originalFileName: file.name,
        fileSize: file.size,
        extractedLength: text.length,
        fileType: file.type
      }
    });
    
  } catch (error) {
    console.error('Resume parse error:', error);
    return NextResponse.json({ 
      error: 'Произошла ошибка при обработке файла. Попробуйте другой файл.' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Resume parser API is running',
    supportedFormats: ['PDF', 'DOCX', 'TXT'],
    maxFileSize: '10MB',
    version: '1.0.0'
  });
}