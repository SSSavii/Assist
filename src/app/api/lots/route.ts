/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import db from '@/lib/init-database';

// Функция для исправления проблем с кодировкой
function fixEncoding(str: string | null): string {
  if (!str) return '';
  
  // Если строка выглядит как неправильно закодированная кириллица (Windows-1251 → UTF-8)
  if (str.includes('Р') && str.includes('С') && str.includes('Р')) {
    try {
      return Buffer.from(str, 'binary').toString('utf8');
    } catch (e) {
      console.warn('Failed to fix encoding for string:', str);
      return str;
    }
  }
  
  return str;
}

// Функция для обработки всего объекта лота
function fixLotEncoding(lot: any): any {
  return {
    ...lot,
    title: fixEncoding(lot.title),
    description: fixEncoding(lot.description),
    city: fixEncoding(lot.city),
    // Остальные поля остаются без изменений
  };
}

export async function GET() {
  console.log(`\n\n--- [${new Date().toISOString()}] Received /api/lots GET request ---`);
  try {
    const stmt = db.prepare(`
      SELECT 
        l.*, 
        u.first_name as winner_first_name,
        u.last_name as winner_last_name
      FROM Lots l
      LEFT JOIN users u ON l.winner_id = u.id
      WHERE l.status = 'ACTIVE'
      ORDER BY l.expires_at ASC
    `);
    const lots = stmt.all();
    console.log(`[SUCCESS] Found ${lots.length} lots.`);
    
    // Исправляем кодировку для всех лотов
    const fixedLots = lots.map(fixLotEncoding);
    
    console.log(`[SUCCESS] Returning ${fixedLots.length} lots with fixed encoding.`);
    return NextResponse.json(fixedLots);
  } catch (error) {
    console.error('--- [FATAL ERROR] API /api/lots crashed: ---', error);
    return NextResponse.json({ error: 'Ошибка сервера при загрузке лотов' }, { status: 500 });
  }
}