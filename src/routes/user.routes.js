import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  findUserById,
  updateUser,
  deleteUser,
  listUsers,
} from '../db.js';

const router = Router();
router.use(authMiddleware);

// GET /user  → lista todos
router.get('/', (req, res) => {
  res.json(listUsers());
});

// GET /user/:id → detalle
router.get('/:id', (req, res) => {
  const user = findUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  const { passwordHash, ...safe } = user;
  res.json(safe);
});

// PUT /user/:id → actualizar (solo el mismo usuario)
router.put('/:id', (req, res) => {
  if (Number(req.params.id) !== req.user.sub) {
    return res.status(403).json({ error: 'No autorizado' });
  }
  const { email } = req.body;
  const updated = updateUser(req.params.id, email ? { email } : {});
  if (!updated) return res.status(404).json({ error: 'Usuario no encontrado' });
  const { passwordHash, ...safe } = updated;
  res.json(safe);
});

// DELETE /user/:id → borrar (solo el mismo usuario)
router.delete('/:id', (req, res) => {
  if (Number(req.params.id) !== req.user.sub) {
    return res.status(403).json({ error: 'No autorizado' });
  }
  deleteUser(req.params.id);
  res.status(204).send();
});

export default router;