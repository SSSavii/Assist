import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';

const db = new Database('./main.db', { verbose: console.log });

interface Lot { id: number; status: string; expires_at: string; current_price: number; min_bid_step: number; winner_id: number | null; }
interface User { id: number; balance_crystals: number; }

const placeBidTransaction = db.transaction((lotId: number, userId: number, bidAmount: number) => {
  console.log(`[TRANSACTION START] Placing bid for lot ${lotId} by user ${userId} with amount ${bidAmount}`);

  const lot = db.prepare('SELECT * FROM Lots WHERE id = ?').get(lotId) as Lot | undefined;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User | undefined;
  
  if (!lot || !user) {
    console.error('[TRANSACTION FAIL] Lot or User not found.');
    throw new Error('Лот или пользователь не найдены');
  }
  console.log(`[TRANSACTION] Found Lot - Current Price: ${lot.current_price}, Found User - Balance: ${user.balance_crystals}`);

  if (lot.status !== 'ACTIVE') throw new Error('Аукцион неактивен');
  if (new Date(lot.expires_at) < new Date()) throw new Error('Аукцион завершен');
  if (bidAmount < lot.current_price + lot.min_bid_step) throw new Error(`Минимальная ставка: ${lot.current_price + lot.min_bid_step}`);
  if (user.balance_crystals < bidAmount) throw new Error('Недостаточно средств');
  console.log('[TRANSACTION] Validation successful.');

  if (lot.winner_id) {
    const previousBidAmount = lot.current_price;
    db.prepare('UPDATE users SET balance_crystals = balance_crystals + ? WHERE id = ?').run(previousBidAmount, lot.winner_id);
    console.log(`[TRANSACTION] Returned ${previousBidAmount} crystals to previous winner ${lot.winner_id}`);
  }

  db.prepare('UPDATE users SET balance_crystals = balance_crystals - ? WHERE id = ?').run(bidAmount, user.id);
  console.log(`[TRANSACTION] Deducted ${bidAmount} crystals from new bidder ${user.id}`);

  db.prepare('UPDATE Lots SET current_price = ?, winner_id = ? WHERE id = ?').run(bidAmount, user.id, lot.id);
  console.log(`[TRANSACTION] Updated lot ${lot.id} with new price ${bidAmount} and winner ${user.id}`);

  db.prepare('INSERT INTO Bids (lot_id, user_id, amount) VALUES (?, ?, ?)').run(lot.id, user.id, bidAmount);
  console.log(`[TRANSACTION] Logged new bid to Bids table.`);
  
  console.log('[TRANSACTION SUCCESS]');
  return { success: true, message: 'Ставка принята!' };
});


export async function POST(request: Request) {
  console.log(`\n\n--- [${new Date().toISOString()}] Received /api/bids POST request ---`);
  try {
    const { lotId, userId, bidAmount } = await request.json();
    console.log(`[STEP 1] Received data: lotId=${lotId}, userId=${userId}, bidAmount=${bidAmount}`);

    if (!lotId || !userId || !bidAmount) {
      return NextResponse.json({ error: 'Недостаточно данных для ставки' }, { status: 400 });
    }

    const result = placeBidTransaction(lotId, userId, bidAmount);
    return NextResponse.json(result);

  } catch (error) {
    console.error('--- [FATAL ERROR] API /api/bids crashed: ---');
    const errorMessage = error instanceof Error ? error.message : 'Произошла неизвестная ошибка';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}