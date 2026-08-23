# Analisis de Datos con Python - SENATI

Plataforma web para limpiar, procesar y visualizar datos usando **Pandas**, **NumPy** y **Matplotlib**, directamente desde el navegador sin instalar Python.

**URL del proyecto:** [https://python-xi-six.vercel.app](https://python-senati-vercel.vercel.app/)

---

## Indice

1. [Descripcion del Proyecto](#descripcion-del-proyecto)
2. [Demo en Linea](#demo-en-linea)
3. [Tecnologias Utilizadas](#tecnologias-utilizadas)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Requisitos Previos](#requisitos-previos)
6. [Instalacion Paso a Paso](#instalacion-paso-a-paso)
7. [Configuracion del Correo (Nodemailer)](#configuracion-del-correo-nodemailer)
8. [Uso del Proyecto](#uso-del-proyecto)
9. [Funcionamiento Interno](#funcionamiento-interno)
10. [Librerias y Dependencias](#librerias-y-dependencias)
11. [Despliegue en Vercel (Frontend)](#despliegue-en-vercel-frontend)
12. [Despliegue en Render (Backend)](#despliegue-en-render-backend)
13. [Equipo de Desarrollo](#equipo-de-desarrollo)

---

## Descripcion del Proyecto

Esta plataforma fue desarrollada por **5 estudiantes de la SENATI** como parte de su formacion tecnica. Permite a los usuarios:

- Registrar e iniciar sesion con verificacion por correo electronico
- Cargar archivos CSV desde el navegador
- Limpiar datos automaticamente (valores vacios, tipos, duplicados) usando Pandas via Pyodide (WebAssembly)
- Realizar analisis estadistico con NumPy (media, mediana, varianza, transformaciones, matrices)
- Generar graficos con Matplotlib (barras, lineas, dispersion, circular)
- Descargar resultados en CSV limpio
- Persistir datos entre sesiones usando localStorage

**Flujo del usuario:**

```
Registro → Verificacion por correo → Login → Dashboard → Cargar CSV → Limpiar → Analizar → Graficar
```

---

## Demo en Linea

| Servicio | URL |
|----------|-----|
| **Frontend (Vercel)** | [https://python-xi-six.vercel.app](https://python-senati-vercel.vercel.app/) |
| **Repositorio GitHub** | https://github.com/PolloCraft/proyecto-phyton-senati |

> **Nota:** El backend se ejecuta localmente en `http://localhost:3001`. Sin backend, el login funciona en modo desarrollo (los codigos se muestran en pantalla).

---

## Tecnologias Utilizadas

| Capa | Tecnologias |
|------|------------|
| **Frontend** | React 19, TypeScript, Vite 8, React Router 7 |
| **Backend** | Node.js, Express 4, Nodemailer, CORS |
| **Python (en navegador)** | Pyodide 0.25, Pandas, NumPy, Matplotlib |
| **Persistencia** | localStorage (frontend), JSON files (backend) |
| **Despliegue Frontend** | Vercel |
| **Despliegue Backend** | Render |

---

## Estructura del Proyecto

```
proyecto-phyton-senati/
│
├── public/img/                    # Imagenes estaticas
│   ├── logo.png                   # Logo del proyecto
│   ├── equipo.jpeg                # Foto del equipo
│   ├── icon-backend.svg           # Icono backend
│   ├── icon-frontend.svg          # Icono frontend
│   ├── icon-servidor.svg          # Icono servidor
│   └── icon-proyecto.svg          # Icono proyecto
│
├── src/
│   ├── components/
│   │   ├── auth/                  # Componentes de autenticacion
│   │   │   ├── AuthForm.tsx       # Formulario de auth reusable
│   │   │   └── FormField.tsx      # Campo de formulario
│   │   ├── common/                # Componentes reutilizables por dominio
│   │   │   ├── ColumnSelect.tsx   # Selector de columnas
│   │   │   ├── FeatureCard.tsx    # Tarjeta de feature/servicio
│   │   │   ├── HeroSection.tsx    # Seccion hero con imagen
│   │   │   ├── InfoBanner.tsx     # Banner informativo
│   │   │   ├── SectionTitle.tsx   # Titulo de seccion
│   │   │   ├── StatBadge.tsx      # Badge de estadistica
│   │   │   ├── TabSelector.tsx    # Selector de pestanas
│   │   │   ├── TeamMemberCard.tsx # Tarjeta de integrante
│   │   │   └── TechGroup.tsx      # Grupo de tecnologias
│   │   ├── Button.tsx             # Boton con variantes
│   │   ├── DataViewer.tsx         # Visor de datos en popup
│   │   ├── Footer.tsx             # Pie de pagina
│   │   ├── Navbar.tsx             # Navegacion responsive
│   │   └── ProtectedRoute.tsx     # Ruta protegida
│   │
│   ├── context/
│   │   └── AuthContext.tsx        # Contexto de autenticacion
│   │
│   ├── layouts/
│   │   └── MainLayouts.tsx        # Layout principal
│   │
│   ├── pages/
│   │   ├── dashboard/             # Paginas del dashboard
│   │   │   ├── Dashboard.css      # Estilos del dashboard
│   │   │   ├── Graficos.tsx       # Graficos con Matplotlib
│   │   │   ├── Numpy.tsx          # Operaciones NumPy
│   │   │   └── Pandas.tsx         # Limpieza con Pandas
│   │   ├── Home.tsx               # Pagina de inicio
│   │   ├── About.tsx              # Sobre nosotros
│   │   ├── Contact.tsx            # Contacto
│   │   ├── Services.tsx           # Servicios
│   │   ├── Login.tsx              # Iniciar sesion
│   │   ├── Registro.tsx           # Registrarse
│   │   ├── VerificarCodigo.tsx    # Verificacion por codigo
│   │   └── Dashboard.tsx          # Layout del dashboard
│   │
│   ├── routes/
│   │   └── AppRoutes.tsx          # Configuracion de rutas
│   │
│   ├── scripts/                   # Scripts Python (Pyodide)
│   │   ├── matplotlib_chart.py    # Generacion de graficos
│   │   ├── numpy_ops.py           # Operaciones NumPy
│   │   └── pandas_clean.py        # Limpieza con Pandas
│   │
│   ├── utils/
│   │   ├── pyodide.ts             # Configuracion Pyodide
│   │   └── storage.ts             # Utilidades localStorage
│   │
│   ├── App.css                    # Estilos de la aplicacion
│   ├── App.tsx                    # Componente raiz
│   ├── index.css                  # Estilos globales
│   └── main.tsx                   # Punto de entrada
│
├── backend/
│   ├── .env.example               # Plantilla de variables de entorno
│   ├── server.js                  # Servidor Express
│   ├── users.json                 # Base de datos de usuarios
│   ├── codes.json                 # Codigos de verificacion
│   ├── package.json               # Dependencias del backend
│   └── Initializer.bat            # Iniciador del backend
│
├── Initializer.bat                # Iniciador del frontend
├── .env.example                   # Plantilla del frontend
├── vercel.json                    # Configuracion de Vercel
├── render.yaml                    # Configuracion de Render
├── package.json                   # Dependencias del frontend
├── vite.config.ts                 # Configuracion de Vite
├── tsconfig.json                  # Configuracion de TypeScript
└── README.md                      # Este archivo
```

---

## Requisitos Previos

| Requisito | Version Minima | Donde descargarlo |
|-----------|---------------|-------------------|
| **Node.js** | >= 18.x | https://nodejs.org/ |
| **npm** | >= 9.x | Viene con Node.js |
| **Git** | Cualquier version | https://git-scm.com/ |
| **Cuenta Gmail** | (Opcional) | https://mail.google.com/ |

> **Importante:** Python NO es necesario. Pyodide ejecuta Python via WebAssembly directamente en el navegador.

---

## Instalacion Paso a Paso

### Paso 1: Clonar el repositorio

```bash
git clone https://github.com/PolloCraft/proyecto-phyton-senati.git
cd proyecto-phyton-senati
```

### Paso 2: Instalar dependencias del Frontend

```bash
npm install
```

### Paso 3: Configurar variables de entorno del Frontend

```bash
copy .env.example .env
```

El archivo `.env` del frontend contiene:

```env
# URL del backend API (puerto 3001 por defecto)
VITE_API_URL=http://localhost:3001
```

> Si despliegas el backend en Render, cambia `VITE_API_URL` por la URL de tu backend.

### Paso 4: Instalar dependencias del Backend

```bash
cd backend
npm install
cd ..
```

### Paso 5: Configurar variables de entorno del Backend

```bash
cd backend
copy .env.example .env
cd ..
```

Edita `backend/.env` con tus credenciales (ver seccion [Configuracion del Correo](#configuracion-del-correo-nodemailer)):

```env
EMAIL_USER=tu-correo@gmail.com
EMAIL_PASS=tu-contraseña-de-aplicacion
DEV_EMAIL=tu-correo@gmail.com
```

### Paso 6: Ejecutar el proyecto

**Opcion A: Usando los Initializers (Windows)**

Abre **dos ventanas de CMD** y ejecuta:

```
Ventana 1:  Doble clic en Initializer.bat (carpeta raiz)
Ventana 2:  Doble clic en backend/Initializer.bat
```

Los scripts verifican si existen las dependencias y las instalan automaticamente.

**Opcion B: Usando comandos npm**

```bash
# Terminal 1 - Frontend (puerto 5173)
npm run dev

# Terminal 2 - Backend (puerto 3001)
cd backend
npm run dev
```

### Paso 7: Abrir en el navegador

| Servicio | URL |
|----------|-----|
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://localhost:3001 |

---

## Configuracion del Correo (Nodemailer)

El sistema de autenticacion envia codigos de verificacion por correo electronico.

### Sin configuracion de correo (Modo Desarrollo)

Si **no** configuras el correo, el backend funcionara en modo desarrollo:
- Los codigos de verificacion se devuelven directamente en la respuesta JSON
- Se muestra el codigo en pantalla durante el registro
- La autenticacion sigue funcionando correctamente
- No necesitas cuenta de Gmail

### Con configuracion real de correo

#### Paso 1: Habilitar verificacion en 2 pasos

1. Ve a https://myaccount.google.com/security
2. Activa la **Verificacion en 2 pasos** en tu cuenta de Google

#### Paso 2: Crear una contraseña de aplicacion

1. Ve a https://myaccount.google.com/apppasswords
2. Selecciona **Correo** y **Otra (nombre personalizado)**
3. Escribe "SENATI Python Project" y haz clic en **Crear**
4. Google generara una contraseña de 16 caracteres (ej: `abcd efgh ijkl mnop`)

#### Paso 3: Configurar el archivo .env

Edita `backend/.env`:

```env
# Tu correo de Gmail
EMAIL_USER=tu-correo@gmail.com

# La contraseña de aplicacion de 16 caracteres (con o sin espacios)
EMAIL_PASS=abcd efgh ijkl mnop

# Correo donde se envian las notificaciones de nuevos registros
DEV_EMAIL=tu-correo@gmail.com
```

#### Flujo de autenticacion con correo

```
1. Usuario se registra (nombre + correo)
2. Backend genera codigo de 6 digitos
3. Backend envia correo con el codigo via Gmail
4. Usuario ingresa el codigo
5. Backend valida el codigo y activa la cuenta
6. Usuario puede iniciar sesion
```

---

## Uso del Proyecto

### Registro y Login

1. Ir a **Registrarse** → Ingresar nombre y correo
2. Recibir codigo de 6 digitos por correo (o verlo en pantalla en modo desarrollo)
3. Ingresar el codigo en **Verificar Codigo**
4. Ir a **Login** → Ingresar el correo registrado
5. Acceder al **Dashboard**

### Dashboard - Pandas (CSV)

1. Haz clic en **Seleccionar archivo** para cargar un CSV
2. Haz clic en **Limpiar Datos** para procesar con Pandas
3. Visualiza la tabla de datos limpios
4. Opciones disponibles:
   - **Descargar CSV Limpio** → Descarga el archivo procesado
   - **Ver Datos Completos** → Abre ventana con tabla original y limpia
   - **Recargar archivo** → Limpia todo y carga un nuevo CSV
   - **Continuar a Numpy** → Pasa al analisis estadistico

### Dashboard - NumPy (Matrices)

- **Vector:** Selecciona una columna numerica y crea un array NumPy
- **Descriptiva:** Media, mediana, moda, varianza, desviacion estandar, percentiles
- **Transformacion:** Normalizar, estandarizar, operaciones con escalares, raiz cuadrada, valor absoluto
- **Matrices:** Descripcion, transpuesta, suma por filas/columnas, producto punto
- **Operadores:** Suma, resta, multiplicacion, division, potencia, modulo entre vectores

### Dashboard - Graficos (Matplotlib)

- **Barras:** Grafico de barras con etiquetas de valor
- **Lineas:** Grafico de lineas con media y mediana
- **Dispersion:** Grafico de dispersion con linea de tendencia
- **Circular:** Grafico circular con porcentajes

---

## Funcionamiento Interno

### Arquitectura General

```
┌─────────────────────────────────────────────────┐
│                   NAVEGADOR                      │
│                                                  │
│  ┌──────────────┐     ┌──────────────────────┐  │
│  │  React App   │────►│    Pyodide (WASM)    │  │
│  │  (Frontend)  │     │  Pandas / NumPy /    │  │
│  │              │     │  Matplotlib          │  │
│  └──────┬───────┘     └──────────────────────┘  │
│         │ localStorage                           │
└─────────┼───────────────────────────────────────┘
          │ fetch() - HTTP
┌─────────▼───────────────────────────────────────┐
│              BACKEND (Express)                    │
│  ┌────────────────┐  ┌──────────────────────┐   │
│  │   Auth API     │  │   Nodemailer (Gmail) │   │
│  │  POST /api/*   │  │  Envio de codigos    │   │
│  └────────────────┘  └──────────────────────┘   │
│  Archivos: users.json / codes.json               │
└──────────────────────────────────────────────────┘
```

### Pyodide - Python en el Navegador

El proyecto usa [Pyodide](https://pyodide.org/) para ejecutar codigo Python real via WebAssembly. Los scripts Python en `src/scripts/` se importan como strings y se ejecutan en el navegador:

```typescript
// Cargar Pyodide y paquetes
const py = await getPyodide();
await py.loadPackage(["pandas", "numpy", "matplotlib"]);

// Pasar datos al script Python
py.globals.set("csv_content", csvRaw);

// Ejecutar el script Python
const result = await py.runPythonAsync(pandasCleanScript);
const data = JSON.parse(result);
```

Los scripts Python usan librerias reales:
- `pandas_clean.py`: Usa `pd.read_csv()`, `df.isna()`, `pd.to_numeric()`
- `numpy_ops.py`: Usa `np.mean()`, `np.median()`, `np.percentile()`, `np.dot()`
- `matplotlib_chart.py`: Usa `plt.bar()`, `plt.plot()`, `plt.scatter()`, `plt.pie()`

### Persistencia de Datos

| Dato | Donde se guarda | Clave | Descripcion |
|------|----------------|-------|-------------|
| Sesion de usuario | `localStorage` | `userEmail` | Correo del usuario autenticado |
| Datos del dashboard | `localStorage` | `dashboard_data` | CSV, columnas, datos originales y limpios |
| Usuarios registrados | `backend/users.json` | - | ID, nombre, correo, verificado, fecha |
| Codigos de verificacion | `backend/codes.json` | - | Email, nombre, codigo, timestamp (expira 10 min) |

### Rutas de la Aplicacion

| Ruta | Protegida | Descripcion |
|------|-----------|-------------|
| `/` | No | Pagina de inicio |
| `/Nosotros` | No | Sobre nosotros (5 estudiantes) |
| `/Servicios` | No | Servicios del proyecto |
| `/Contacto` | No | Contacto del equipo |
| `/Login` | No | Iniciar sesion |
| `/Registro` | No | Registrarse |
| `/Verificar` | No | Verificar codigo de 6 digitos |
| `/Dashboard` | Si | Dashboard analitico (redirige a /pandas) |
| `/Dashboard/pandas` | Si | Herramienta Pandas (CSV) |
| `/Dashboard/numpy` | Si | Herramienta NumPy (Matrices) |
| `/Dashboard/numpy/graficos` | Si | Graficos con Matplotlib |

### API del Backend

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| `POST` | `/api/register` | Registrar nuevo usuario (envia codigo por correo) |
| `POST` | `/api/verify-code` | Verificar codigo de 6 digitos |
| `POST` | `/api/resend-code` | Reenviar codigo de verificacion |
| `POST` | `/api/login` | Iniciar sesion |
| `GET` | `/api/users` | Listar todos los usuarios |

---

## Librerias y Dependencias

### Frontend (`package.json`)

| Libreria | Version | Uso |
|----------|---------|-----|
| **react** | ^19.2.8 | Framework de interfaz de usuario |
| **react-dom** | ^19.2.8 | Renderizado en el navegador |
| **react-router-dom** | ^7.18.2 | Enrutamiento SPA (Single Page Application) |
| **xlsx** | ^0.18.5 | Manipulacion de archivos Excel |
| **vite** | ^8.2.0 | Bundler y servidor de desarrollo |
| **typescript** | ~6.0.2 | Tipado estatico para JavaScript |
| **oxlint** | ^1.75.0 | Linting y analisis de codigo |

### Backend (`backend/package.json`)

| Libreria | Version | Uso |
|----------|---------|-----|
| **express** | ^4.21.0 | Framework de servidor HTTP |
| **nodemailer** | ^6.10.1 | Envio de correos via Gmail SMTP |
| **cors** | ^2.8.5 | Habilitar peticiones cross-origin |
| **dotenv** | ^17.4.2 | Variables de entorno desde archivos .env |

### Python (via Pyodide - en el navegador)

| Libreria | Uso en el Proyecto |
|----------|-------------------|
| **pandas** | Limpieza, transformacion y analisis de datos tabulares (CSV) |
| **numpy** | Operaciones numericas, estadistica descriptiva, algebra lineal |
| **matplotlib** | Generacion de graficos: barras, lineas, dispersion, circular |

---

## Despliegue en Vercel (Frontend)

### Deploy automatico

1. Ve a https://vercel.com/ y crea una cuenta con GitHub
2. Haz clic en **"Add New Project"**
3. Selecciona el repositorio `PolloCraft/proyecto-phyton-senati`
4. Configura:

| Campo | Valor |
|-------|-------|
| Framework Preset | Vite |
| Root Directory | `./` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

5. En **Environment Variables** agrega:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | URL de tu backend en Render (ej: `https://tu-backend.onrender.com`) |

6. Haz clic en **Deploy**

### Deploy con Vercel CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Hacer login
vercel login

# Desplegar en produccion
vercel --prod
```

---

## Despliegue en Render (Backend)

### Deploy automatico con render.yaml

El proyecto incluye `render.yaml` para despliegue automatico:

1. Ve a https://render.com/ y conecta tu repositorio GitHub
2. Render detectara automaticamente el `render.yaml`
3. Configura las **Environment Variables** en el panel:

| Key | Value |
|-----|-------|
| `EMAIL_USER` | tu-correo@gmail.com |
| `EMAIL_PASS` | tu-contraseña-de-aplicacion |
| `DEV_EMAIL` | tu-correo@gmail.com |

4. Render creara el servicio automaticamente
5. Copia la URL asignada (ej: `https://tu-backend.onrender.com`)
6. Actualiza `VITE_API_URL` en Vercel con esa URL

### Deploy manual en Render

Si prefieres hacerlo manualmente:

1. Crear un **Web Service** en Render
2. Conectar el repositorio GitHub
3. Configurar:

| Campo | Valor |
|-------|-------|
| Runtime | Node |
| Build Command | `cd backend && npm install` |
| Start Command | `cd backend && node server.js` |
| Port | 3001 |

4. Agregar las variables de entorno
5. Desplegar

### Notas importantes sobre Render

- En el plan gratuito, el backend se **duerme** despues de 15 minutos de inactividad
- La primera peticion despues de dormir tarda **~30 segundos** en despertar
- Esto afecta la primera carga del login despues de un rato sin uso

---

## Equipo de Desarrollo

| Nombre | Rol | Responsabilidades |
|--------|-----|-------------------|
| **Diego Luna** | Servidor | Infraestructura, configuracion del servidor, despliegue y mantenimiento |
| **Deivyd Vidal** | Backend | Logica del servidor, autenticacion de usuarios y seguridad |
| **Diego Carlin** | Frontend | Interfaz de usuario, componentes React y diseno visual |
| **Tinoco Leon** | Soporte | Soporte tecnico, resolucion de problemas y asistencia al usuario |
| **Ronal de la Cruz** | Backend | Desarrollo de funcionalidades backend, integracion de servicios y optimizacion |

**Institucion:** SENATI - Proyecto de Analisis de Datos con Python
