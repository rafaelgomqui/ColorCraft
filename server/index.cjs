const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Verificar variables de entorno
if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET no está definido en .env');
  process.exit(1);
}

// Configuración de PostgreSQL con manejo de errores
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'colorcraft',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

// Verificar conexión a la base de datos
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error conectando a PostgreSQL:', err.stack);
    process.exit(1);
  }
  console.log('Conectado a PostgreSQL correctamente');
  release();
});

// Middleware
app.use(cors());
app.use(express.json());

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { nombre, correo, usuario, contraseña } = req.body;

    console.log('Intentando registrar:', { usuario, correo });

    // Validaciones
    if (!nombre || !correo || !usuario || !contraseña) {
      return res.status(400).json({ 
        success: false, 
        message: 'Todos los campos son obligatorios' 
      });
    }

    // Verificar si el usuario ya existe
    const userExists = await pool.query(
      'SELECT * FROM usuarios WHERE usuario = $1 OR correo = $2',
      [usuario, correo]
    );

    if (userExists.rows.length > 0) {
      const existingUser = userExists.rows[0];
      if (existingUser.usuario === usuario) {
        return res.status(400).json({ 
          success: false, 
          message: 'El nombre de usuario ya está en uso' 
        });
      }
      if (existingUser.correo === correo) {
        return res.status(400).json({ 
          success: false, 
          message: 'El correo electrónico ya está registrado' 
        });
      }
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 12);

    
    // Insertar usuario
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, correo, usuario, contraseña) VALUES ($1, $2, $3, $4) RETURNING id, nombre, correo, usuario, created_at',
      [nombre, correo, usuario, hashedPassword]
    );

    console.log('Usuario registrado exitosamente:', result.rows[0].usuario);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor: ' + error.message 
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { usuario, contraseña } = req.body;

    console.log('Intentando login:', usuario);

    if (!usuario || !contraseña) {
      return res.status(400).json({ 
        success: false, 
        message: 'Usuario y contraseña son requeridos' 
      });
    }

    // Buscar usuario
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE usuario = $1',
      [usuario]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario o contraseña incorrectos' 
      });
    }

    const user = result.rows[0];

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(contraseña, user.contraseña);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario o contraseña incorrectos' 
      });
    }

    // Generar token
    const token = jwt.sign(
      { userId: user.id, usuario: user.usuario },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Eliminar contraseña de la respuesta
    const { contraseña: _, ...userWithoutPassword } = user;

    console.log('Login exitoso para:', usuario);

    res.json({
      success: true,
      message: 'Login exitoso',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor: ' + error.message 
    });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre, correo, usuario, created_at FROM usuarios WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// Ruta de salud para verificar que el servidor funciona
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Inicializar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Base de datos: ${process.env.DB_NAME}`);
  console.log(`JWT Secret: ${process.env.JWT_SECRET ? 'Configurado' : 'NO CONFIGURADO'}`);
});