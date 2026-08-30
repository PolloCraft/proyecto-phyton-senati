# Analisis de Datos con Python

Plataforma web para el analisis automatico de archivos CSV utilizando Python en el navegador. Desarrollada por estudiantes de la SENATI como parte del curso Seminario de Complementacion Practica I - Ciclo IV.

---

## Indice

- [Descripcion del Proyecto](#descripcion-del-proyecto)
- [Funcionalidades](#funcionalidades)
- [Integrantes del Equipo](#integrantes-del-equipo)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Requisitos Previos](#requisitos-previos)
- [Instalacion y Uso Local](#instalacion-y-uso-local)
- [Despliegue en Vercel](#despliegue-en-vercel)
- [Configuracion de Variables de Entorno](#configuracion-de-variables-de-entorno)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Flujo de Datos](#flujo-de-datos)
- [API Endpoints](#api-endpoints)
- [Adaptabilidad y Diseno Responsivo](#adaptabilidad-y-diseno-responsivo)

---

## Descripcion del Proyecto

Esta plataforma permite a los usuarios subir archivos CSV y realizar un pipeline completo de analisis de datos directamente desde el navegador, sin necesidad de instalar Python ni ninguna libreria de forma local. El procesamiento se ejecuta mediante **Pyodide** (Python via WebAssembly), lo que garantiza privacidad total ya que todos los datos permanecen en el navegador del usuario.

### Flujo de Uso

1. **Registro e Inicio de Sesion**: El usuario se registra con su correo electronico y verifica su identidad mediante un codigo de 6 digitos.
2. **Subida de CSV**: Selecciona o arrastra un archivo CSV al panel de Pandas.
3. **Limpieza Automatica**: Pandas detecta y corrige valores vacios, duplicados, tipos inconsistentes, fechas invalidas y errores de texto.
4. **Analisis Estadistico**: NumPy calcula estadisticas descriptivas, crea vectores, matrices y aplica transformaciones.
5. **Visualizacion**: Matplotlib genera graficos de barras, lineas, dispersion y circulares con estadisticas asociadas.
6. **Clasificacion**: Herramientas de Teachable Machine para clasificar imagenes, audios y posturas en tiempo real.

---

## Funcionalidades

### Pandas - Limpieza de Datos
- Deteccion automatica de columnas numericas (>70% valores parseables)
- Identificacion de duplicados, valores vacios y tipo NaN
- Normalizacion de categorias (case-insensitive)
- Deteccion de fechas con formato invalido
- Deteccion de columnas innecesarias (un solo valor unico)
- Reporte completo de calidad de datos con severidad
- Exportacion de datos limpios en CSV y JSON

### NumPy - Analisis Estadistico
- Estadistica descriptiva: media, mediana, moda, varianza, desviacion estandar, IQR, cuartiles
- Creacion y operaciones con vectores
- Transformaciones: normalizar, estandarizar, operaciones aritmeticas
- Operaciones con matrices: transpuesta, suma de filas/columnas, producto punto
- Operaciones elemento a elemento: suma, resta, multiplicacion, division, potencia, modulo

### Matplotlib - Visualizacion
- Graficos de barras con etiquetas de valores
- Graficos de lineas con lineas de media y mediana
- Graficos de dispersion con linea de tendencia y mapa de colores
- Graficos circulares con top 8 categorias
- Estadisticas asociadas: total, media, mediana, desviacion estandar, min, max

### Clasificacion con Teachable Machine
- Clasificacion de imagenes en tiempo real via webcam
- Clasificacion de audios (modelo embebido)
- Clasificacion de posturas corporales

### Autenticacion
- Registro con nombre y correo electronico
- Verificacion por codigo de 6 digitos enviado por correo
- Login solo con correo electronico (sin contrasena)
- Persistencia de sesion via localStorage

---

## Integrantes del Equipo

| Nombre | Rol | Responsabilidad |
|--------|-----|-----------------|
| Diego Luna | Servidor | Infraestructura, configuracion del servidor, despliegue en la nube, administracion de bases de datos y mantenimiento continuo |
| Deivyd Vidal | Backend | Logica del servidor, autenticacion de usuarios, seguridad de datos, gestion de API REST y endpoints protegidos |
| Diego Carlin | Frontend | Interfaz de usuario, componentes React, diseno visual responsivo, animaciones y experiencia de usuario |
| Tinoco Leon | Soporte | Soporte tecnico, resolucion de problemas, documentacion tecnica, asistencia al usuario y pruebas de calidad |
| Ronal de la Cruz | Backend | Funcionalidades backend, integracion de servicios externos, optimizacion de rendimiento y gestion de datos |

**Institucion**: SENATI - Instituto de Tecnologia  
**Carrera**: Desarrollo de Software  
**Ciclo**: IV  
**Curso**: Seminario de Complementacion Practica I

---

## Tecnologias Utilizadas

### Frontend
| Tecnologia | Version | Uso |
|------------|---------|-----|
| React | ^19.2.8 | Framework de interfaz de usuario |
| TypeScript | ~6.0.2 | Tipado estatico para JavaScript |
| React Router DOM | ^7.18.2 | Enrutamiento SPA (Single Page Application) |
| Vite | ^8.2.0 | Herramienta de build y desarrollo |

### Backend
| Tecnologia | Version | Uso |
|------------|---------|-----|
| Express | ^4.21.0 | Framework de servidor Node.js |
| Nodemailer | ^9.0.6 | Envio de correos de verificacion |
| Redis (ioredis) | ^5.6.1 | Almacenamiento en cache (Upstash en produccion) |

### Procesamiento de Datos
| Tecnologia | Version | Uso |
|------------|---------|-----|
| Pyodide | 0.25.0 | Python via WebAssembly en el navegador |
| Pandas | (via Pyodide) | Manipulacion y limpieza de datos |
| NumPy | (via Pyodide) | Computo numerico y estadistico |
| Matplotlib | (via Pyodide) | Generacion de graficos |

### Inteligencia Artificial
| Tecnologia | Version | Uso |
|------------|---------|-----|
| TensorFlow.js | ^4.22.0 | Framework de ML en JavaScript |
| Teachable Machine Image | ^0.8.5 | Clasificacion de imagenes |
| Teachable Machine Pose | ^0.8.6 | Clasificacion de posturas |

### Otros
| Tecnologia | Version | Uso |
|------------|---------|-----|
| XLSX | ^0.18.5 | Lectura de archivos Excel |

---

## Estructura del Proyecto

```
proyecto-unificado/
├── api/
│   ├── server.js              # Servidor Express (produccion)
│   └── [...slug].js           # Funcion serverless Vercel
├── data/
│   └── users.json             # Almacenamiento local de usuarios
├── public/
│   ├── img/                   # Imagenes estaticas (logo, iconos)
│   ├── audio_classifier.html  # Clasificador de audios (iframe)
│   ├── audio_model/           # Modelo Teachable Machine para audio
│   └── pose_model/            # Modelo Teachable Machine para posturas
├── src/
│   ├── components/
│   │   ├── Navbar.tsx         # Navegacion principal
│   │   ├── Footer.tsx         # Pie de pagina
│   │   ├── Button.tsx         # Boton reutilizable
│   │   ├── DataViewer.tsx     # Visor de datos en pantalla completa
│   │   ├── ProtectedRoute.tsx # Ruta protegida (requiere login)
│   │   ├── auth/
│   │   │   ├── AuthForm.tsx   # Formulario de autenticacion
│   │   │   └── FormField.tsx  # Campo de formulario reutilizable
│   │   └── common/
│   │       ├── SmartFilter.tsx    # Filtros inteligentes de datos
│   │       ├── TabSelector.tsx    # Selector de pestanas
│   │       ├── StatBadge.tsx      # Badge de estadisticas
│   │       ├── ColumnSelect.tsx   # Seleccion de columnas
│   │       ├── SectionTitle.tsx   # Titulo de seccion
│   │       ├── InfoBanner.tsx     # Banner informativo
│   │       ├── HeroSection.tsx    # Seccion hero
│   │       ├── FeatureCard.tsx    # Tarjeta de caracteristica
│   │       ├── TeamMemberCard.tsx # Tarjeta de miembro del equipo
│   │       └── TechGroup.tsx      # Grupo de tecnologias
│   ├── context/
│   │   └── AuthContext.tsx    # Contexto de autenticacion
│   ├── layouts/
│   │   └── MainLayouts.tsx    # Layout principal (Navbar + Footer)
│   ├── pages/
│   │   ├── Home.tsx           # Pagina principal
│   │   ├── About.tsx          # Pagina Nosotros
│   │   ├── Services.tsx       # Pagina Servicios
│   │   ├── Contact.tsx        # Pagina Contacto
│   │   ├── Login.tsx          # Inicio de sesion
│   │   ├── Registro.tsx       # Registro de usuario
│   │   ├── VerificarCodigo.tsx # Verificacion por codigo
│   │   ├── Dashboard.tsx      # Layout del dashboard
│   │   ├── dashboard/
│   │   │   ├── Pandas.tsx     # Limpieza de datos CSV
│   │   │   ├── Numpy.tsx      # Analisis estadistico
│   │   │   └── Graficos.tsx   # Generacion de graficos
│   │   └── Clasificar/
│   │       ├── ClasificarImagenes.tsx
│   │       ├── ClasificarAudios.tsx
│   │       └── ClasificarPosturas.tsx
│   ├── scripts/
│   │   ├── pandas_clean.py    # Script de limpieza con Pandas
│   │   ├── numpy_ops.py       # Operaciones con NumPy
│   │   ├── matplotlib_chart.py # Generacion de graficos
│   │   └── zip_images.py      # Empaquetado de imagenes ZIP
│   ├── styles/
│   │   ├── index.css          # Archivo principal de estilos
│   │   ├── variables.css      # Variables de diseno (colores, espaciados)
│   │   ├── base.css           # Reset, tipografia, estilos base
│   │   ├── animations.css     # Animaciones keyframe
│   │   ├── navbar.css         # Estilos del navbar
│   │   ├── footer.css         # Estilos del footer
│   │   ├── pages.css          # Estilos de paginas publicas
│   │   ├── auth.css           # Estilos de autenticacion
│   │   └── dashboard.css      # Estilos del dashboard
│   ├── utils/
│   │   ├── storage.ts         # Persistencia en localStorage
│   │   ├── pyodide.ts         # Loader de Pyodide WebAssembly
│   │   └── columnAnalyzer.ts  # Analisis de tipos de columna
│   ├── types/
│   │   └── index.ts           # Definiciones de tipos
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── .env.example               # Variables de entorno de ejemplo
├── .env.local                 # Variables de entorno local (no subir)
├── vercel.json                # Configuracion de despliegue Vercel
├── vite.config.ts             # Configuracion de Vite
├── tsconfig.json              # Configuracion de TypeScript
├── package.json               # Dependencias y scripts
└── README.md                  # Este archivo
```

---

## Requisitos Previos

### Para Desarrollo Local
- **Node.js** version 18 o superior
- **npm** version 9 o superior
- Navegador web moderno (Chrome, Firefox, Edge, Safari)

### Para Despliegue en Vercel
- Cuenta en [GitHub](https://github.com)
- Cuenta en [Vercel](https://vercel.com)
- Cuenta en [Upstash](https://upstash.com) (para Redis)
- Cuenta de Gmail con App Password (para Nodemailer)

---

## Instalacion y Uso Local

### 1. Clonar el repositorio

```bash
git clone https://github.com/USUARIO/proyecto-unificado.git
cd proyecto-unificado
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y configura tus credenciales:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus valores:

```
REDIS_URL=tu-url-de-redis
EMAIL_USER=tu-correo@gmail.com
EMAIL_PASS=tu-app-password
PORT=3001
```

### 4. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Esto inicia:
- **Frontend (Vite)**: `http://localhost:5173`
- **Backend (Express)**: `http://localhost:3001`

### 5. Abrir en el navegador

Accede a `http://localhost:5173` y registra una cuenta para comenzar a usar la plataforma.

---

## Despliegue en Vercel

### Preparacion

1. Asegurate de que el codigo este subido a GitHub
2. Verifica que `vercel.json` exista en la raiz del proyecto

### Pasos de Despliegue

1. **Iniciar sesion en Vercel**
   ```bash
   npx vercel login
   ```

2. **Desplegar el proyecto**
   ```bash
   npx vercel
   ```
   
   Sigue las instrucciones en pantalla:
   - Selecciona tu organizacion
   - Confirma el nombre del proyecto
   - Confirma el directorio raiz (`.`)
   - Confirma la configuracion de build

3. **Configurar variables de entorno en Vercel**
   - Ve al dashboard de Vercel > tu proyecto > Settings > Environment Variables
   - Agrega las siguientes variables:
     - `REDIS_URL`: URL de tu instancia Redis (Upstash)
     - `EMAIL_USER`: Correo electronico para envio de codigos
     - `EMAIL_PASS`: App Password del correo

4. **Desplegar a produccion**
   ```bash
   npx vercel --prod
   ```

### Configuracion automatica

El archivo `vercel.json` configura automaticamente:
- Routing de la SPA (todas las rutas redirigen a `index.html`)
- Funciones serverless en `/api/*` para el backend
- Build y deploy del frontend via Vercel Build

---

## Configuracion de Variables de Entorno

| Variable | Descripcion | Requerida | Donde se usa |
|----------|-------------|-----------|--------------|
| `REDIS_URL` | URL de conexion a Redis (Upstash) | Si (produccion) | `api/server.js` |
| `EMAIL_USER` | Correo electronico para Nodemailer | Si (produccion) | `api/server.js` |
| `EMAIL_PASS` | App Password de Gmail | Si (produccion) | `api/server.js` |
| `PORT` | Puerto del servidor (default: 3001) | No | `server.py` |

### Obtener REDIS_URL (Upstash)

1. Crea una cuenta en [Upstash](https://upstash.com)
2. Crea una nueva base de datos Redis
3. Copia la URL de conexion desde el dashboard

### Obtener EMAIL_PASS (Gmail)

1. Ve a la configuracion de tu cuenta Google
2. Activa la verificacion en 2 pasos
3. Genera una App Password en Seguridad > App Passwords
4. Copia la contrasena generada

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────┐
│                    NAVEGADOR                         │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │    React      │  │    Pyodide   │  │ TF.js     │ │
│  │  (Frontend)   │  │  (WebAsm)    │  │ (ML)      │ │
│  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘ │
│         │                  │                 │       │
│  ┌──────┴───────┐  ┌──────┴───────┐  ┌─────┴─────┐ │
│  │  React Router │  │    Pandas    │  │ Teachable │ │
│  │  (SPA Router) │  │    NumPy     │  │ Machine   │ │
│  └──────────────┘  │  Matplotlib  │  └───────────┘ │
│                     └──────────────┘                │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │           localStorage (datos)                  │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
         │
         │ HTTP API (fetch)
         ▼
┌─────────────────────────────────────────────────────┐
│              SERVIDOR (Vercel / Local)               │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │   Express     │  │   Redis      │  │ Nodemailer│ │
│  │  (API REST)   │  │  (Upstash)   │  │ (Email)   │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
│                                                      │
│  Endpoints:                                          │
│  POST /api/register     - Registro de usuario       │
│  POST /api/login        - Inicio de sesion          │
│  POST /api/verify-code  - Verificacion de codigo    │
│  POST /api/resend-code  - Reenvio de codigo         │
└─────────────────────────────────────────────────────┘
```

---

## Flujo de Datos

```
Usuario sube CSV
       │
       ▼
Pandas.tsx (lectura via Pyodide)
       │
       ▼
pandas_clean.py (limpieza automatica)
       │
       ▼
Resultados guardados en localStorage
       │
       ├──► Numpy.tsx (analisis estadistico)
       │         │
       │         ▼
       │    numpy_ops.py (operaciones)
       │         │
       │         ▼
       │    Resultados en panel profesional
       │
       └──► Graficos.tsx (visualizacion)
                 │
                 ▼
            matplotlib_chart.py (graficos)
                 │
                 ▼
            Imagenes base64 + estadisticas
```

---

## API Endpoints

| Metodo | Ruta | Descripcion | Body |
|--------|------|-------------|------|
| `POST` | `/api/register` | Registrar nuevo usuario | `{ name, email }` |
| `POST` | `/api/login` | Iniciar sesion | `{ email }` |
| `POST` | `/api/verify-code` | Verificar codigo | `{ email, code }` |
| `POST` | `/api/resend-code` | Reenviar codigo | `{ email }` |

### Respuestas de la API

**Registro exitoso:**
```json
{
  "ok": true,
  "message": "Codigo enviado al correo"
}
```

**Login exitoso:**
```json
{
  "ok": true,
  "message": "Inicio de sesion exitoso",
  "user": { "name": "Juan", "email": "juan@correo.com" }
}
```

**Error:**
```json
{
  "ok": false,
  "message": "Correo no registrado"
}
```

---

## Adaptabilidad y Diseno Responsivo

La plataforma esta disenada para funcionar en multiples dispositivos:

| Dispositivo | Ancho | Comportamiento |
|-------------|-------|----------------|
| Escritorio | > 900px | Layout completo con sidebar |
| Tablet | 640px - 900px | Sidebar reducido, grids adaptados |
| Movil | < 640px | Layout apilado, sidebar horizontal |

### Caracteristicas Responsivas
- Navbar con menu hamburguesa en movil
- Dashboard con sidebar colapsable
- Tablas con scroll horizontal
- Formularios de autenticacion centrados
- Grids de tarjetas adaptativos (4 -> 2 -> 1 columnas)
- Tipografia escalada segun viewport

---

## Licencia

Este proyecto es de uso academico, desarrollado como parte del curso Seminario de Complementacion Practica I en SENATI.

---

**SENATI** - Instituto de Tecnologia  
Desarrollo de Software | Ciclo IV
