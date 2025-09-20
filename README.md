# ✨ Prado's Tareas

**Prado's Tareas** es una aplicación **colaborativa de gestión de tareas** construida con **React + Vite + TailwindCSS** (frontend) y **json-server** como backend simulado.  
Incluye **login de usuarios con contraseña**, **CRUD de tareas**, **búsqueda**, **paginación**, **marcar como completadas**, contadores y un diseño **neon + glassmorphism** con toasts y animaciones.

---

## 🧠 Tabla de contenido
- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Arquitectura y estructura](#-arquitectura-y-estructura)
- [Requisitos](#-requisitos)
- [Instalación y ejecución](#-instalación-y-ejecución)
- [Variables de entorno](#-variables-de-entorno)
- [Base de datos (db.json)](#-base-de-datos-dbjson)
- [Endpoints y ejemplos](#-endpoints-y-ejemplos)
- [Scripts disponibles](#-scripts-disponibles)
- [Gitflow](#-gitflow)
- [Capturas](#-capturas)
- [Resolución de problemas](#-resolución-de-problemas)
- [Roadmap](#-roadmap)
- [Autores](#-autores)
- [Licencia](#-licencia)

---

## 🚀 Características
- 🔐 **Login** con `username` y `password` (validación contra `db.json`) y **persistencia** en `localStorage`.
- 🧾 **CRUD de tareas**: crear, leer, editar, eliminar.
- 🧍 **Trazabilidad**: quién creó y quién editó (nombre y fecha).
- ✅ **Completar/Deshacer** tarea (campo `completed`).
- 🔎 **Búsqueda con debounce** y **paginación** por página.
- 🔢 **Contadores** globales: **Restantes, Completadas, Total**.
- 🎨 **UI moderna**: neon glow + glassmorphism + micro-animaciones.
- 🔔 **Toasts** personalizados para feedback.
- 🌐 **API REST** fake con `json-server`.

---

## 🛠 Tecnologías
- ⚛️ [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- 🎨 [TailwindCSS](https://tailwindcss.com/)
- 📡 [json-server](https://github.com/typicode/json-server)
- 🔄 [concurrently](https://www.npmjs.com/package/concurrently)

---

## 🧱 Arquitectura y estructura
```
📦 To_Do_List_Colaborativo
├── 📄 README.md
├── 📄 db.json                      # "Base de datos" del json-server
├── 📄 package.json                 # Dependencias y scripts
├── 📄 .env.local                   # VITE_API_URL=http://localhost:3000
├── 📄 postcss.config.js
├── 📄 tailwind.config.js
├── 📂 public
├── 📂 screenshots                  # (opcional) imágenes para el README
│   ├── cover.png
│   ├── login.png
│   └── tasks.png
└── 📂 src
    ├── main.jsx                    # Punto de entrada
    ├── index.css                   # Tailwind + animaciones
    └── ToDoListColaborativo.jsx    # App (login + tareas)
```

---

## ✅ Requisitos
- **Node.js** 20.19+ o 22.12+
- **npm** 9+
- (Windows) Git Credential Manager o GitHub CLI para push por HTTPS

---

## ⚙️ Instalación y ejecución
```bash
# 1) Clonar
git clone https://github.com/<tu-usuario>/To_Do_List_Colaborativo.git
cd To_Do_List_Colaborativo

# 2) Instalar dependencias
npm install

# 3) Variables de entorno
# crea .env.local con:
# VITE_API_URL=http://localhost:3000

# 4) Ejecutar (frontend + backend)
npm run dev
```

- Frontend: http://localhost:5173  
- Backend (json-server): http://localhost:3000

> Si ya tenías el server corriendo y editas `db.json`, json-server recarga automáticamente. Si no, vuelve a correr `npm run dev`.

---

## 🔐 Variables de entorno
- `VITE_API_URL`: URL del backend. Ejemplo:
```
VITE_API_URL=http://localhost:3000
```

---

## 🗄 Base de datos (db.json)
Ejemplo:
```json
{
  "users": [
    { "id": "sebastian", "name": "Sebastian", "username": "sebastian", "password": "1234" },
    { "id": "benjamin", "name": "Benjamin", "username": "benjamin", "password": "abcd" }
  ],
  "tasks": [
    {
      "id": 1,
      "title": "Jugar",
      "description": "En el parque",
      "completed": false,
      "createdBy": "Sebastian",
      "createdAt": "2025-09-19T06:15:13.261Z",
      "updatedBy": "Benjamin",
      "updatedAt": "2025-09-19T06:15:36.027Z"
    }
  ]
}
```

---

## 🌐 Endpoints y ejemplos
### Users
- `GET /users`
- `GET /users/1`
- `POST /users`
- `PATCH /users/1`
- `DELETE /users/1`

### Tasks
- `GET /tasks`
- `GET /tasks?_page=1&_limit=6`
- `GET /tasks?q=buscar`
- `POST /tasks`
- `PATCH /tasks/1`
- `DELETE /tasks/1`

---

## 📜 Scripts disponibles
```bash
npm run dev       # frontend + backend (vite + json-server)
npm run dev:vite  # solo frontend
npm run dev:api   # solo backend
```

---

## 🌳 Gitflow
- `main`: rama estable / producción.
- `develop`: integración de features.
- `feature/*`: ramas de desarrollo de nuevas funcionalidades.

Ejemplo:
```bash
git checkout develop
git checkout -b feature/login
# desarrollar...
git push -u origin feature/login
# abrir Pull Request a develop
```

---

## 🖼 Capturas
### Login
<p align="center"><img src="./screenshots/login.png" width="500"></p>

### Tareas
<p align="center"><img src="./screenshots/tasks.png" width="800"></p>

---

## 🐞 Resolución de problemas
- Error `@vitejs/plugin-react` no encontrado → correr: `npm install @vitejs/plugin-react -D`
- Error `@tailwindcss/postcss` no encontrado → correr: `npm install -D tailwindcss postcss autoprefixer`
- Puerto ocupado (5173 o 3000) → cambiar en `.env.local` o matar proceso.

---

## 🗺 Roadmap
- [ ] Registro de usuarios desde UI  
- [ ] Filtros por tareas completadas/pendientes  
- [ ] Dark/Light mode  
- [ ] Despliegue en Vercel/Netlify + Railway/Render para json-server  

---

## 👥 Autores
- **Sebastian Prado** — Frontend + Presentación  
- **Rodrigo Otalora** — Backend + Documentación 

---

## 📄 Licencia
<a href="license..md">MIT © 2025 — Prado's Tareas</a>
