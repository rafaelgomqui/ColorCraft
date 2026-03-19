import { Router } from 'express';
import { prisma } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all palettes for logged-in user
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const palettes = await prisma.palette.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' }
    });
    
    // SQLite: Convert JSON string back to string array
    const parsedPalettes = palettes.map(p => ({
      ...p,
      colors: JSON.parse(p.colors)
    }));
    
    res.json({ success: true, palettes: parsedPalettes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new palette
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { name, colors, format, notes } = req.body;
    
    if (!name || !colors || !Array.isArray(colors) || colors.length !== 6) {
      return res.status(400).json({ success: false, message: 'Se requieren exactamente 6 colores y un nombre' });
    }

    const palette = await prisma.palette.create({
      data: {
        name,
        colors: JSON.stringify(colors),
        format: format || 'HEX',
        notes,
        userId: req.user!.userId
      }
    });

    res.status(201).json({ 
      success: true, 
      palette: { ...palette, colors: JSON.parse(palette.colors) }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete palette
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    
    const palette = await prisma.palette.findUnique({ where: { id } });
    
    if (!palette) return res.status(404).json({ success: false, message: 'Paleta no encontrada' });
    if (palette.userId !== req.user!.userId) return res.status(403).json({ success: false, message: 'No autorizado' });

    await prisma.palette.delete({ where: { id } });

    res.json({ success: true, message: 'Paleta eliminada' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
