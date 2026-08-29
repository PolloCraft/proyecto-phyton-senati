# Proyecto Final - Análisis de Datos con Inteligencia Artificial

## Descripción
Plataforma web educativa para el análisis de datos usando Python en el navegador. Permite a los estudiantes aprender y practicar con Pandas, NumPy y Matplotlib directamente desde el navegador, sin necesidad de instalaciones locales. Incluye funcionalidades de autenticación, dashboards interactivos y un sistema de clasificación de imágenes, audio y posturas usando modelos de inteligencia artificial.

## Miembros del Equipo
| Nombre | Rol |
|--------|-----|
| Diego Luna | Servidor |
| Deivyd Vidal | Backend |
| Diego Carlin | Frontend |
| Tinoco Leon | Soporte |
| Ronal de la Cruz | Backend |

**Institución:** SENATI - Seminario de Complementación Práctica I - Ciclo IV

## Stack Tecnológico
- **Frontend:** React 19 + TypeScript + Vite 6
- **Estilos:** CSS modular (9 archivos en `src/styles/`)
- **Lógica de negocio:** Python ejecutado en Pyodide (WebAssembly)
- **Backend API:** Node.js/Express + Vercel Serverless Functions
- **Librerías Python:** Pandas, NumPy, Matplotlib
- **Inteligencia Artificial:** TensorFlow.js, Teachable Machine
- **Despliegue:** Vercel
- **Control de versiones:** Git + GitHub

## Variables de Entorno
### Vercel (producción)
No se requieren variables de entorno adicionales en Vercel. La API serverless (`api/[...slug].js`) funciona sin configuración externa.

### Local (desarrollo)
Si deseas usar la API completa con Redis y nodemailer (para funcionalidades avanzadas como envío de emails), configura:
```bash
# Archivo .env en la raíz del proyecto
REDIS_URL=tu_url_de_redis
EMAIL_USER=tu_usuario_de_email
EMAIL_PASS=tu_contraseña_de_email
```

## Instalación y Ejecución en Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/proyecto-final.git
cd proyecto-final
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Ejecutar el servidor de desarrollo
```bash
npm run dev
```

El servidor de desarrollo estará disponible en: `http://localhost:5173`

### 4. API local (opcional)
Para ejecutar la API de backend localmente:
```bash
npm run api
```
La API estará disponible en: `http://localhost:3001`

> **Nota:** El frontend se conecta a la API automáticamente. En desarrollo, Vite proxy redirige `/api` → `localhost:3001`.

## Despliegue en Vercel

### 1. Conectar el repositorio a Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Importa el repositorio desde GitHub
3. Vercel detectará automáticamente la configuración de Vite

### 2. Configuración
La configuración está predefinida en `vercel.json`:
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Functions:** `api/[...slug].js` (10 segundos máximo)
- **SPA Rewrites:** Todas las rutas se redirigen a `index.html`

### 3. Desplegar
```bash
# Opción 1: Desde la CLI
npx vercel

# Opción 2: Desde la interfaz web de Vercel
# Simplemente haz push a la rama principal y Vercel desplegará automáticamente
```

## Estructura del Proyecto

```
proyecto-final/
├── api/                          # Backend API
│   ├── server.js                 # Servidor Express (desarrollo local)
│   └── [...slug].js              # Serverless function (Vercel)
├── data/
│   └── users.json                # Almacenamiento de usuarios
├── public/                       # Archivos estáticos
│   ├── matplotlib_chart.py       # Script Python para gráficos
│   ├── models/                   # Modelos de IA (JSON)
│   ├── data/                     # Archivos CSV de datos
│   ├── audios/                   # Archivos de audio
│   └── posturas/                 # Imágenes de posturas
├── src/
│   ├── components/               # Componentes React
│   │   ├── auth/                 # Componentes de autenticación
│   │   │   ├── AuthForm.tsx
│   │   │   └── FormField.tsx
│   │   ├── common/               # Componentes reutilizables
│   │   │   ├── ColumnSelect.tsx
│   │   │   ├── FeatureCard.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── InfoBanner.tsx
│   │   │   ├── SectionTitle.tsx
│   │   │   ├── StatBadge.tsx
│   │   │   ├── TabSelector.tsx
│   │   │   ├── TeamMemberCard.tsx
│   │   │   └── TechGroup.tsx
│   │   ├── Button.tsx
│   │   ├── DataViewer.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── Footer.tsx
│   │   ├── Navbar.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── Toast.tsx
│   ├── context/                  # Context de React
│   │   ├── AuthContext.tsx
│   │   └── ToastContext.tsx
│   ├── img/                      # Imágenes del proyecto
│   ├── layouts/                  # Layouts de páginas
│   │   └── MainLayouts.tsx
│   ├── pages/                    # Páginas de la aplicación
│   │   ├── Clasificar/           # Módulos de clasificación
│   │   │   ├── ClasificarAudios.tsx
│   │   │   ├── ClasificarImagenes.tsx
│   │   │   └── ClasificarPosturas.tsx
│   │   ├── dashboard/            # Sub-páginas del dashboard
│   │   │   ├── numpy/            # Secciones de NumPy
│   │   │   │   ├── DescriptiveSection.tsx
│   │   │   │   ├── MatrixSection.tsx
│   │   │   │   ├── OperationsSection.tsx
│   │   │   │   ├── TransformSection.tsx
│   │   │   │   └── VectorSection.tsx
│   │   │   ├── Dashboard.css
│   │   │   ├── Graficos.tsx
│   │   │   ├── Numpy.tsx
│   │   │   └── Pandas.tsx
│   │   ├── About.tsx
│   │   ├── Contact.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Registro.tsx
│   │   ├── Services.tsx
│   │   └── VerificarCodigo.tsx
│   ├── routes/                   # Rutas de React Router
│   │   └── AppRoutes.tsx
│   ├── scripts/                  # Scripts Python
│   │   ├── matplotlib_chart.py
│   │   ├── numpy_ops.py
│   │   ├── pandas_clean.py
│   │   └── zip_images.py
│   ├── styles/                   # CSS modular
│   │   ├── animations.css
│   │   ├── auth.css
│   │   ├── base.css
│   │   ├── dashboard.css
│   │   ├── footer.css
│   │   ├── index.css
│   │   ├── navbar.css
│   │   ├── pages.css
│   │   └── variables.css
│   ├── types/                    # Tipos TypeScript
│   ├── utils/                    # Utilidades
│   │   ├── pyodide.ts
│   │   └── storage.ts
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── .gitignore
├── index.html
├── package.json
├── README.md
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vercel.json
└── vite.config.ts
```

## Características Principales

### Autenticación
- Registro con código de verificación (6 dígitos)
- Login con validación de credenciales
- Persistencia de sesión en localStorage
- Protección de rutas autenticadas

### Dashboard de Análisis de Datos
- **Pandas:** Carga de CSV, visualización de DataFrames, filtrado por columnas y tipos de datos, estadísticas descriptivas
- **NumPy:** Operaciones matriciales, transformaciones, estadísticas descriptivas, vectorización
- **Gráficos:** Generación de gráficos de barras, líneas, pastel y dispersión usando Matplotlib

### Sistema de Clasificación
- **Imágenes:** Clasificación de imágenes usando TensorFlow.js y modelos de Teachable Machine
- **Audios:** Análisis y clasificación de archivos de audio
- **Posturas:** Reconocimiento de posturas humanas usando modelos pre-entrenados

### Diseño Responsive
- **Desktop:** Sidebar colapsable + contenido principal
- **Tablet (≤768px):** Sidebar se vuelve barra lateral, cards se apilan
- **Móvil (≤480px):** Sidebar como barra inferior, tipografía escalable, tablas con scroll horizontal

### Notificaciones Toast
- Sistema de notificaciones en tiempo real
- Soporte para diferentes tipos (éxito, error, advertencia, información)
- Auto-dismiss configurable

## Consideraciones Técnicas

### Pyodide (Python en el Navegador)
Los scripts Python se ejecutan en el navegador usando Pyodide (WebAssembly). Esto significa:
- No se necesita servidor Python
- Los scripts se importan como strings usando `?raw`
- Pyodide se carga bajo demanda para optimizar el rendimiento
- Algunas librerías pueden no estar disponibles en Pyodide

### Almacenamiento
- Los datos de usuario se almacenan en `data/users.json` (API local)
- Los datos de sesión se almacenan en `localStorage`
- Los archivos CSV y modelos de IA se sirven desde `/public`

### CORS y Proxy
En desarrollo, Vite redirige las llamadas a `/api` al servidor local (`localhost:3001`). En producción, la API serverless de Vercel maneja las peticiones.

### Build para Producción
```bash
npm run build
```
Los archivos optimizados se generan en la carpeta `dist/`.

### Scripts NPM
| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo (Vite) |
| `npm run build` | Construye para producción |
| `npm run preview` | Vista previa de la build |
| `npm run lint` | Ejecuta ESLint |
| `npm run api` | Inicia API local (Express) |

### Licencia
Este proyecto es educativo y forma parte del curso Seminario de Complementación Práctica I en SENATI.
