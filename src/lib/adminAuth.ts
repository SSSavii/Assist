import { NextRequest, NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withAdminAuth(handler: (request: NextRequest, context: any) => Promise<NextResponse>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (request: NextRequest, context: any) => {
    const adminSecretKey = process.env.ADMIN_API_SECRET_KEY;

    if (!adminSecretKey) {
      console.error('CRITICAL: ADMIN_API_SECRET_KEY не установлен в .env.local');
      return NextResponse.json({ error: 'Ошибка конфигурации сервера' }, { status: 500 });
    }

    const providedKey = request.headers.get('X-Admin-Secret-Key');

    if (providedKey !== adminSecretKey) {
      console.warn('Отклонен неавторизованный запрос к админ-API.');
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    return handler(request, context);
  };
}