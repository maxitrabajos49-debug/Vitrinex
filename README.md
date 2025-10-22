# 🛍️ VITRINEX — Plataforma Digital para Emprendedores

Vitrinex es una aplicación web que conecta a emprendedores locales con clientes a través de una plataforma digital moderna.  
Permite registrar negocios, gestionar productos, ofrecer promociones y facilitar la interacción entre tiendas y usuarios.

---

## 🚀 Tecnologías Utilizadas

### 🧠 **Frontend (React + Vite)**
- React 18
- Vite 7
- React Router DOM 7
- Axios
- TailwindCSS
- Context API

### ⚙️ **Backend (Node + Express + MongoDB)**
- Node.js + Express
- MongoDB + Mongoose
- JWT (JSON Web Tokens)
- Cookie-parser
- BcryptJS
- CORS
- Dotenv
- Nodemon

---

## 📂 Estructura del Proyecto

VITRINEX/
├── backend/
│ ├── src/
│ │ ├── controllers/
│ │ ├── middlewares/
│ │ ├── models/
│ │ ├── routes/
│ │ ├── schemas/
│ │ ├── app.js
│ │ ├── config.js
│ │ ├── db.js
│ │ └── index.js
│ ├── package.json
│ └── .env
│
└── frontend/
├── public/
├── src/
│ ├── api/
│ ├── assets/
│ ├── components/
│ ├── context/
│ ├── pages/
│ ├── App.jsx
│ ├── main.jsx
│ └── index.css
├── package.json
├── vite.config.js
└── .env

---

## ⚙️ Configuración del Entorno

### 🔑 Backend (.env)
```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/vitrinex
JWT_SECRET=clave_super_segura_y_larga
CLIENT_URL=http://localhost:5173

🌐 Frontend (.env)
VITE_API_URL=http://localhost:3000/api

▶️ Instrucciones de Ejecución
1️⃣ Clonar el repositorio
git clone https://github.com/<tu_usuario>/vitrinex.git
cd vitrinex
2️⃣ Instalar dependencias
cd backend
npm install

cd ../frontend
npm install
3️⃣ Ejecutar servidores

Backend:

cd backend
npm run dev
Servidor en → http://localhost:3000

Frontend:

cd frontend
npm run dev


App en → http://localhost:5173
🔐 Autenticación

El sistema utiliza JWT (JSON Web Tokens) almacenado en cookies seguras (HTTPOnly).
Esto garantiza que el usuario pueda mantenerse autenticado entre sesiones sin exponer sus credenciales.

Registro → /api/auth/register

Login → /api/auth/login

Perfil → /api/auth/profile

Logout → /api/auth/logout
🧩 Funcionalidades Actuales

✅ Registro de usuarios

✅ Inicio y cierre de sesión

✅ Validación de contraseñas

✅ Rutas protegidas con Context + ProtectedRoute

✅ Persistencia de sesión mediante cookies JWT

✅ Integración completa con backend Express y MongoDB
📈 Próximas Mejoras

 Panel de administración de tiendas

 Integración de estadísticas de ventas

 Subida de imágenes de productos

 Módulo de recomendaciones inteligentes (IA)
 👨‍💻 Autores

Maximiliano Inostroza
Jaime Herrera
Estudiantes de Ingeniería en Informática — INACAP Renca
Proyecto de Título 2025
📍 Renca, Santiago de Chile
📧 maxitrabajos49@gmail.com
💡 Desarrollado con pasión por impulsar el emprendimiento local.