# 🎨 ColorCraft

Aplicación web full-stack para crear, visualizar, guardar y exportar paletas de colores. Integra generación de paletas mediante Inteligencia Artificial (Google Gemini) y ofrece una previsualización en vivo (Landing Page dinámica) aplicando las paletas de color.

## 🚀 Tecnologías

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, Zustand, react-i18next, Framer Motion.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, JWT.
- **IA**: Google Gemini 1.5-flash.

## ⚙️ Configuración del Entorno (.env)

Debes crear un archivo `.env` en la ruta `/server/.env` con el siguiente formato:

```env
JWT_SECRET="clave_secreta"
PORT=3001
GEMINI_API_KEY="tu_api_key_de_gemini" (tiene plan gratuito)
```

## 🛠️ Instalación Local

1. Instalar dependencias del Frontend (raíz):
   ```bash
   npm install
   ```

2. Instalar dependencias del Backend:
   ```bash
   cd server
   npm install
   ```

## 🏃 Ejecución

Para iniciar el proyecto en desarrollo:

1. **Levantar Backend** (en el directorio `/server`):
   ```bash
   npm run dev
   ```
   > El servidor se iniciará en `http://localhost:3001`.

2. **Levantar Frontend** (en el directorio raíz):
   ```bash
   npm run dev
   ```
   > El cliente se abrirá automáticamente en el puerto configurado.
