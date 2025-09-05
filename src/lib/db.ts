import Database from 'better-sqlite3';

const db = new Database('./main.db', { verbose: console.log });

process.on('exit', () => db.close());

export default db;