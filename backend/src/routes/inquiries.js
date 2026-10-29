import { Router } from 'express';
import { pool } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
const userTypes = ['Parent', 'Student', 'School'];
const categories = ['Scholarship', 'Concert', 'Admission', 'General Query'];

router.post('/', async (req, res) => {
  const { userType, category, name, email, phone, message } = req.body || {};
  if (!userTypes.includes(userType) || !categories.includes(category) ||
      [name, email, phone, message].some(value => typeof value !== 'string' || !value.trim())) {
    return res.status(400).json({ message: 'Please fill all fields correctly' });
  }

  if (name.trim().length > 120 || email.trim().length > 255 || phone.trim().length > 20 ||
      message.trim().length > 3000 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      !/^[+\d()\s-]{7,20}$/.test(phone.trim())) {
    return res.status(400).json({ message: 'Please enter valid contact details and message' });
  }

  try {
    await pool.query(
      'INSERT INTO inquiries (user_type, category, name, email, phone, message) VALUES ($1, $2, $3, $4, $5, $6)',
      [userType, category, name.trim(), email.trim(), phone.trim(), message.trim()]
    );
    return res.status(201).json({ message: 'Inquiry submitted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to submit inquiry' });
  }
});

router.get('/', requireAdmin, async (req, res) => {
  const { category = '', userType = '', search = '' } = req.query;
  if ((category && !categories.includes(category)) || (userType && !userTypes.includes(userType)) ||
      typeof search !== 'string' || search.length > 100) {
    return res.status(400).json({ message: 'Invalid filters' });
  }

  try {
    const result = await pool.query(
      `SELECT id, name, phone, email, user_type AS "userType", category, message, status, created_at AS "createdAt"
       FROM inquiries
       WHERE ($1::text = '' OR category = $1)
         AND ($2::text = '' OR user_type = $2)
         AND ($3::text = '' OR name ILIKE '%' || $3 || '%' OR phone ILIKE '%' || $3 || '%')
       ORDER BY created_at DESC`,
      [category, userType, search.trim()]
    );
    return res.json(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to load inquiries' });
  }
});

export default router;
