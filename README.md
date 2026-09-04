# 📅 Mi Calendario - Organizador Personal y Agenda

Una aplicación web moderna, intuitiva y 100% responsiva (diseñada tanto para tu celular como para computadora) para organizar tus actividades diarias, tareas y pendientes. Construida con **Next.js**, **React**, **Tailwind CSS** y lista para desplegar en **Vercel**.

---

## ✨ Características Principales

- **📱 Diseño 100% Responsivo**:
  - Experiencia optimizada para celulares con barra de navegación inferior, vistas táctiles cómodas y botón flotante (+) para crear tareas.
  - Vistas adaptadas a pantallas de computadora y tablets en dos columnas (mes a la izquierda, agenda del día a la derecha).
- **🗓️ Vista de Calendario Completa**:
  - Cuadrícula mensual interactiva con indicadores visuales por color para cada categoría de tarea.
  - Navegación rápida entre meses y botón directo para saltar a **"Hoy"**.
  - Al pulsar cualquier día en el calendario, se despliega la lista de tareas de esa fecha.
- **✅ Gestión de Actividades del Día**:
  - Crear, editar y eliminar actividades o pendientes.
  - Asignar hora de inicio y fin, o marcar como "Todo el día".
  - Marcar tareas como completadas con un solo toque (con tachado visual y barra de progreso).
  - Filtros rápidos por estado: *Todas*, *Pendientes* y *Completadas*.
  - Buscador de actividades por palabra clave en tiempo real.
- **🏷️ Categorías y Prioridades**:
  - Categorías con código de colores: **Trabajo** (Azul), **Personal** (Verde), **Estudio** (Púrpura), **Salud** (Rosa), **Urgente** (Ámbar) y **Otro** (Gris).
  - Niveles de prioridad: Baja, Media y Alta.
  - Filtro por categoría en la barra superior.
- **🔐 Autenticación de Usuarios**:
  - Registro de cuenta con nombre, email y contraseña segura (hash con bcrypt y sesiones seguras JWT en cookies HttpOnly).
  - Inicio de sesión rápido y botón de **"Entrar como Usuario Demo"** con un solo clic para pruebas inmediatas.
  - Cada usuario tiene su propia agenda privada y protegida.
- **🌓 Modo Claro y Modo Oscuro**:
  - Selector de tema con detección automática de preferencia del sistema y persistencia en el dispositivo.

---

## 🚀 Cómo Ejecutar en Local

1. Clona o abre la carpeta del proyecto:
   ```bash
   cd "d:\trabajos mios\Calendario"
   ```

2. Instala las dependencias (si no lo has hecho ya):
   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Abre tu navegador en [http://localhost:3000](http://localhost:3000).

---

## 🌐 Cómo Desplegar en Vercel

Desplegar esta aplicación en Vercel es muy rápido:

### Opción 1: Con la CLI de Vercel
1. Instala la herramienta de Vercel si no la tienes:
   ```bash
   npm i -g vercel
   ```
2. Ejecuta dentro de la carpeta:
   ```bash
   vercel
   ```
3. Sigue las instrucciones en pantalla para iniciar sesión y desplegar.

### Opción 2: Desde GitHub / GitLab / Bitbucket
1. Sube este proyecto a un repositorio en tu cuenta de GitHub.
2. Ingresa a [vercel.com](https://vercel.com) e inicia sesión.
3. Haz clic en **"Add New..."** -> **"Project"**.
4. Selecciona tu repositorio de Calendario.
5. (Opcional) En la sección **Environment Variables**, añade:
   - `JWT_SECRET`: Una clave secreta larga (ej. `mi_clave_secreta_super_segura_2026`).
6. Haz clic en **Deploy**. ¡Listo! Vercel te entregará una URL pública (ejemplo: `https://mi-calendario.vercel.app`) para que puedas usarla y abrirla desde tu celular.

---

## 📁 Estructura del Código

```
src/
├── app/
│   ├── api/
│   │   ├── auth/              # Endpoints de login, registro, logout y sesión
│   │   └── events/            # Endpoints para obtener, crear, editar y borrar tareas
│   ├── login/page.tsx         # Página de inicio de sesión (+ acceso Demo)
│   ├── register/page.tsx      # Página de creación de cuenta
│   ├── layout.tsx             # Layout global con AuthProvider y ThemeProvider
│   ├── page.tsx               # Dashboard principal del calendario
│   └── globals.css            # Estilos globales y Tailwind CSS
├── components/
│   ├── Calendar/
│   │   ├── MonthView.tsx      # Cuadrícula mensual interactiva
│   │   ├── DayAgenda.tsx      # Lista de tareas y progreso del día
│   │   ├── EventModal.tsx     # Modal/Bottom-sheet para crear/editar tareas
│   │   └── CategoryBadge.tsx  # Etiquetas de categoría con colores
│   ├── AuthContext.tsx        # Contexto de autenticación del usuario
│   ├── ThemeContext.tsx       # Contexto para modo oscuro/claro
│   ├── Navbar.tsx             # Barra superior de navegación y filtros
│   └── MobileNav.tsx          # Barra de navegación inferior para celular
├── lib/
│   ├── auth.ts                # Funciones JWT y bcrypt
│   ├── constants.ts           # Definición de categorías, prioridades y meses
│   ├── db.ts                  # Capa de almacenamiento y persistencia
│   └── utils.ts               # Utilidades de fechas y calendario
└── types/
    └── index.ts               # Tipos TypeScript
```
