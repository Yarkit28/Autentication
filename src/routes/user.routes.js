import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { findUserById, updateUser, deleteUser } from '../db.js';

const router = Router();
router.use(authMiddleware);

// GET /user → usuario autenticado
router.get('/', (req, res) => {
  const user = findUserById(req.user.sub);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  const { passwordHash, ...safe } = user;
  res.json(safe);
});

// PUT /user → actualizar name/email (opcional)
router.put('/', (req, res) => {
  const { name, email } = req.body;
  const patch = {};
  if (name !== undefined) patch.name = name;
  if (email !== undefined) patch.email = email;

  const updated = updateUser(req.user.sub, patch);
  if (!updated) return res.status(404).json({ error: 'Usuario no encontrado' });
  const { passwordHash, ...safe } = updated;
  res.json(safe);
});

// DELETE /user → eliminar usuario autenticado (opcional)
router.delete('/', (req, res) => {
  deleteUser(req.user.sub);
  res.status(204).send();
});

export default router;