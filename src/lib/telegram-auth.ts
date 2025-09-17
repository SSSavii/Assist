import { createHmac } from 'crypto';
import { URLSearchParams } from 'url';

export function validateTelegramHash(initData: string, botToken: string): boolean {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return false;
    
    params.delete('hash');
    const dataCheckArr: string[] = [];
    const sortedKeys = Array.from(params.keys()).sort();
    
    sortedKeys.forEach(key => dataCheckArr.push(`${key}=${params.get(key)}`));
    const dataCheckString = dataCheckArr.join('\n');
    
    const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
    const ownHash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
    
    return ownHash === hash;
  } catch (error) {
    console.error("Error during hash validation:", error);
    return false;
  }
}