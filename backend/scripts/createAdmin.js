import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { pool } from '../src/db.js';

const [email, password] = process.argv.slice(2);

if (!email || !password || password.length < 8) {
  console.error('Usage: npm run create-admin -- email@example.com strong-password');
  process.exit(1);
}

try {
  const hash = await bcrypt.hash(password, 12);
  await pool.query('INSERT INTO admins (email, password_hash) VALUES ($1, $2)', [email.trim().toLowerCase(), hash]);
  console.log('Admin created');
} catch (error) {
  console.error('Could not create admin:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
