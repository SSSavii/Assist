import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';

const db = new Database('./main.db');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(request: NextRequest, context: any) {
  const id = context.params?.id;

  try {
    if (!id) {
        return NextResponse.json({ error: 'ID лота не предоставлен' }, { status: 400 });
    }

    const lotId = parseInt(id, 10);
    if (isNaN(lotId)) {
      return NextResponse.json({ error: 'Некорректный ID лота' }, { status: 400 });
    }

    const stmt = db.prepare(`
      SELECT 
        l.*, 
        u.first_name as winner_first_name,
        u.last_name as winner_last_name
      FROM Lots l
      LEFT JOIN users u ON l.winner_id = u.id
      WHERE l.id = ?
    `);
    const lot = stmt.get(lotId);

    if (!lot) {
      return NextResponse.json({ error: 'Лот не найден' }, { status: 404 });
    }

    return NextResponse.json(lot);

  } catch (error) {
    console.error(`API Error on /api/lots/${id}:`, error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}