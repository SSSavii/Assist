import { NextRequest, NextResponse } from 'next/server';
import db from 'wxqryy/lib/db';
import { withAdminAuth } from 'wxqryy/lib/adminAuth';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET = withAdminAuth(async (_request: NextRequest) => {
  try {
    const lots = db.prepare(`
      SELECT id, title, status, current_price 
      FROM Lots 
      ORDER BY created_at DESC
    `).all();
    return NextResponse.json(lots);
  } catch (error) {
    console.error('Ошибка в GET /api/admin/lots:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { 
      title, 
      start_price, 
      photoUrl, 
      duration_hours, 
      description, 
      city, 
      age 
    } = body;

    if (!title || !start_price || !duration_hours) {
      return NextResponse.json({ error: 'Отсутствуют обязательные поля: title, start_price, duration_hours' }, { status: 400 });
    }

    const expiresDate = new Date();
    expiresDate.setHours(expiresDate.getHours() + duration_hours);
    const expires_at = expiresDate.toISOString();

    const stmt = db.prepare(`
      INSERT INTO Lots (
        title, 
        description, 
        photoUrl, 
        city, 
        age, 
        start_price, 
        current_price, 
        expires_at,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
    `);

    const result = stmt.run(
      title, 
      description, 
      photoUrl, 
      city, 
      age, 
      start_price,
      start_price,
      expires_at
    );

    return NextResponse.json({ message: 'Лот успешно создан', lotId: result.lastInsertRowid }, { status: 201 });

  } catch (error) {
    console.error('Ошибка в POST /api/admin/lots:', error);
    return NextResponse.json({ error: 'Ошибка сервера при создании лота' }, { status: 500 });
  }
});