import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

router.post('/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'El prompt es requerido' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
       return res.status(400).json({ success: false, message: 'La API KEY de Gemini no está configurada en .env o el servidor no se ha reiniciado.' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const systemPrompt = `
      Eres un experto diseñador web especializado en color. 
      Devuelve EXACTAMENTE 6 colores en formato HEX basados en la siguiente descripción.
      Devuelve SOLO un array JSON válido sin formato markdown ni comillas adicionales.
      Ejemplo esperado: ["#FF5733", "#33FF57", "#3357FF", "#F1C40F", "#8E44AD", "#2ECC71"]
      
      Descripción del usuario: "${prompt}"
    `;

    const result = await model.generateContent(systemPrompt);
    const textResult = result.response.text().trim();
    
    // Limpieza de JSON crudo
    let colors: string[] = [];
    try {
      const cleanedText = textResult.replace(/```json/g, '').replace(/```/g, '').trim();
      colors = JSON.parse(cleanedText);
    } catch (e) {
      return res.status(500).json({ success: false, message: 'Error procesando respuesta de IA: ' + textResult });
    }

    if (!Array.isArray(colors) || colors.length !== 6) {
       return res.status(500).json({ success: false, message: 'La IA no devolvió exactamente 6 colores' });
    }

    res.json({ success: true, colors });

  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
