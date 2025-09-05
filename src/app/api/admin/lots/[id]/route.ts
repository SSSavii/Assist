import { NextResponse } from 'next/server';
import db from 'wxqryy/lib/db';
import { withAdminAuth } from 'wxqryy/lib/adminAuth';

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
export const PATCH = withAdminAuth(async (request: any, context: any) => {
  const lotId = parseInt(context.params.id, 10);
  if (isNaN(lotId)) {
    return NextResponse.json({ error: 'Некорректный ID лота' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const fieldToUpdate = Object.keys(body)[0];
    const newValue = Object.values(body)[0];
    const allowedFields = ['title', 'description', 'photoUrl', 'city', 'age', 'start_price', 'status'];

    if (!fieldToUpdate || !allowedFields.includes(fieldToUpdate)) {
      return NextResponse.json({ error: `Недопустимое поле для редактирования: ${fieldToUpdate}` }, { status: 400 });
    }

    const stmt = db.prepare(`UPDATE Lots SET ${fieldToUpdate} = ? WHERE id = ?`);
    const result = stmt.run(newValue, lotId);

    if (result.changes === 0) {
      return NextResponse.json({ error: `Лот с ID ${lotId} не найден` }, { status: 404 });
    }

    return NextResponse.json({ message: `Лот ${lotId} успешно обновлен` });
  } catch (error) {
    console.error(`Ошибка в PATCH /api/admin/lots/${lotId}:`, error);
    return NextResponse.json({ error: 'Ошибка сервера при редактировании лота' }, { status: 500 });
  }
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
export const DELETE = withAdminAuth(async (_request: any, context: any) => {
  const lotId = parseInt(context.params.id, 10);
  if (isNaN(lotId)) {
    return NextResponse.json({ error: 'Некорректный ID лота' }, { status: 400 });
  }
  
  try {
    const cancelLotTransaction = db.transaction(() => {
        const lot = db.prepare('SELECT winner_id, current_price FROM Lots WHERE id = ?').get(lotId) as { winner_id: number | null, current_price: number } | undefined;

        if (!lot) {
            throw new Error(`Лот с ID ${lotId} не найден`);
        }

        if (lot.winner_id && lot.current_price > 0) {
            console.log(`[CANCEL LOT] Возврат ${lot.current_price} кристаллов пользователю ${lot.winner_id} за отмену лота ${lotId}`);
            db.prepare('UPDATE users SET balance_crystals = balance_crystals + ? WHERE id = ?')
              .run(lot.current_price, lot.winner_id);
        }

        const result = db.prepare(`UPDATE Lots SET status = 'CANCELLED' WHERE id = ?`).run(lotId);
        
        if (result.changes === 0) {
            throw new Error(`Лот с ID ${lotId} не найден при попытке обновления статуса`);
        }
    });

    cancelLotTransaction();
    
    return NextResponse.json({ message: `Лот ${lotId} был отменен, ставка (если была) возвращена.` });

  } catch (error) {
    console.error(`Ошибка в DELETE /api/admin/lots/${lotId}:`, error);
    const errorMessage = error instanceof Error ? error.message : "Ошибка сервера";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
});