# 🎨 ColorPal (ColorCraft)

Aplicación web full-stack para crear, visualizar, guardar y exportar paletas de colores. Integra generación de paletas mediante Inteligencia Artificial (Google Gemini) y ofrece una previsualización en vivo (Landing Page dinámica) aplicando las paletas de color.

## 🚀 Tecnologías

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, Zustand, react-i18next, Framer Motion.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, JWT.
- **IA**: Google Gemini 1.5-flash.

## ⚙️ Configuración del Entorno (.env)

Debes crear un archivo `.env` en la ruta `/server/.env` con el siguiente formato:

```env
DATABASE_URL="postgresql://user:password@host:port/dbname"
JWT_SECRET="tu_secreto_super_seguro"
PORT=3001
GEMINI_API_KEY="tu_api_key_de_gemini"
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

3. Inicializar la Base de Datos (PostgreSQL):
   ```bash
   cd server
   npx prisma db push
   npx prisma generate
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
   > El cliente se abrirá automáticamente en el puerto configurado (ej: 5173).

## 📦 Despliegue

### Frontend (Vercel)
1. Conecta tu repositorio con Vercel.
2. Configura el Framework Preset como **Vite**.
3. El comando de build es `npm run build` y el Root Directory debe ser la raíz.

### Backend (Render / Railway)
1. Conecta la carpeta `/server` a un servicio web en Render.
2. Comando de instalación: `npm install && npx prisma generate`.
3. Comando de build: `npm run build`.
4. Comando start: `npm start`.
5. Asegúrate de añadir las variables de entorno en el panel del servidor.