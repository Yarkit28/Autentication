import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { createUser, findUserByName, findUserByEmail } from '../db.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { config } from '../config.js';

const router = Router();

// POST /register  → { name, password, email }
router.post('/register', async (req, res) => {
  const { name, password, email } = req.body;

  if (!name || !password) {
    return res.status(400).json({ error: 'name y password son obligatorios' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'password mínimo 6 caracteres' });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'email inválido' });
  }

  try {
    const passwordHash = await hashPassword(password);
    const user = createUser({ name, passwordHash, email });
    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    if (err.message === 'NAME_EXISTS') {
      return res.status(409).json({ error: 'El nombre ya está registrado' });
    }
    if (err.message === 'EMAIL_EXISTS') {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }
    return res.status(500).json({ error: 'Error interno' });
  }
});

// POST /login  → { name | email, password }
router.post('/login', async (req, res) => {
  const { name, email, password } = req.body;

  if ((!name && !email) || !password) {
    return res.status(400).json({ error: 'name/email y password son obligatorios' });
  }

  const user = name ? findUserByName(name) : findUserByEmail(email);
  if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

  try {
    const token = jwt.sign(
      { sub: user.id, name: user.name },
      config.jwtSecret,
      { algorithm: 'HS256', expiresIn: config.jwtExpires }
    );
    return res.json({ token });
  } catch (err) {
    console.error('Error firmando JWT:', err.message);
    return res.status(500).json({ error: 'Error generando token' });
  }
});

export default router;