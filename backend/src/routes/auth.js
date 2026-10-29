import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const result = await pool.query('SELECT id, email, password_hash FROM admins WHERE email = $1', [email.trim().toLowerCase()]);
    const admin = result.rows[0];
    const valid = admin ? await bcrypt.compare(password, admin.password_hash) : false;
    if (!valid) return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: admin.id, role: 'admin' }, process.env.JWT_SECRET, {
      expiresIn: '8h', algorithm: 'HS256'
    });
    return res.json({ token, email: admin.email });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to log in right now' });
  }
});

export default router;
