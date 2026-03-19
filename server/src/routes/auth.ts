import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

router.post('/register', async (req, res) => {
  try {
    const { nombre, correo, usuario, contraseña } = req.body;

    if (!nombre || !correo || !usuario || !contraseña) {
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ usuario }, { correo }]
      }
    });

    if (existingUser) {
      if (existingUser.usuario === usuario) return res.status(400).json({ success: false, message: 'El usuario ya existe' });
      if (existingUser.correo === correo) return res.status(400).json({ success: false, message: 'El correo ya existe' });
    }

    const hashedPassword = await bcrypt.hash(contraseña, 12);

    const newUser = await prisma.user.create({
      data: { nombre, correo, usuario, password: hashedPassword }
    });

    res.status(201).json({
      success: true,
      user: { id: newUser.id, nombre: newUser.nombre, correo: newUser.correo, usuario: newUser.usuario }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { usuario, contraseña } = req.body;

    if (!usuario || !contraseña) {
      return res.status(400).json({ success: false, message: 'Usuario y contraseña requeridos' });
    }

    const user = await prisma.user.findUnique({ where: { usuario } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    const validPassword = await bcrypt.compare(contraseña, user.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ userId: user.id, usuario: user.usuario }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      success: true,
      token,
      user: { id: user.id, nombre: user.nombre, correo: user.correo, usuario: user.usuario }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, nombre: true, correo: true, usuario: true, createdAt: true }
    });

    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
