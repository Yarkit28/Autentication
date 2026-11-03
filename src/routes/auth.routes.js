import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail } from '../db.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { config } from '../config.js';

const router = Router();

// POST /register
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email y password son obligatorios' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'password mínimo 6 caracteres' });
  }

  try {
    const passwordHash = await hashPassword(password);
    const user = createUser({ email, passwordHash });
    return res.status(201).json({ id: user.id, email: user.email });
  } catch (err) {
    if (err.message === 'EMAIL_EXISTS') {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }
    return res.status(500).json({ error: 'Error interno' });
  }
});

// POST /login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email y password son obligatorios' });
  }

  const user = findUserByEmail(email);
  if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

  const token = jwt.sign(
    { sub: user.id, email: user.email },
    config.jwtSecret,
    { expiresIn: config.jwtExpires }
  );

  return res.json({ token });
});

export default router;