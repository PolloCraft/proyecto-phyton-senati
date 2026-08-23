# Analisis de Datos con Python - SENATI

Plataforma web para limpiar, procesar y visualizar datos usando **Pandas**, **NumPy** y **Matplotlib**, directamente desde el navegador sin instalar Python.

---

## Indice

- [Descripcion del Proyecto](#descripcion-del-proyecto)
- [Demo](#demo)
- [Tecnologias](#tecnologias)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Requisitos Previos](#requisitos-previos)
- [Instalacion y Ejecucion](#instalacion-y-ejecucion)
- [Configuracion del Correo (Nodemailer)](#configuracion-del-correo-nodemailer)
- [Uso del Proyecto](#uso-del-proyecto)
- [Funcionamiento Interno](#funcionamiento-interno)
- [Librerias Utilizadas](#librerias-utilizadas)
- [Despliegue en Render](#despliegue-en-render)
- [Equipo de Desarrollo](#equipo-de-desarrollo)
- [Licencia](#licencia)

---

## Descripcion del Proyecto

Esta plataforma fue desarrollada por estudiantes de la **SENATI** como parte de su formacion tecnica. Permite a los usuarios:

1. **Registrar e iniciar sesion** con verificacion por correo electronico.
2. **Cargar archivos CSV** desde el navegador.
3. **Limpiar datos** automaticamente (valores vacios, tipos, duplicados) usando Pandas via Pyodide (WebAssembly).
4. **Realizar analisis estadistico** con NumPy (media, mediana, varianza, transformaciones, matrices).
5. **Generar graficos** con Matplotlib (barras, lineas, dispersion, circular).
6. **Descargar resultados** en CSV limpio.
7. **Persistir datos** entre sesiones usando localStorage.

---

## Demo

**Repositorio:** [github.com/PolloCraft/proyecto-phyton-senati](https://github.com/PolloCraft/proyecto-phyton-senati)

---

## Tecnologias

| Capa | Tecnologias |
|------|------------|
| **Frontend** | React 19, TypeScript, Vite, React Router |
| **Backend** | Node.js, Express, Nodemailer |
| **Python (en navegador)** | Pyodide, Pandas, NumPy, Matplotlib |
| **Persistencia** | localStorage (frontend), JSON files (backend) |
| **Despliegue** | Render (frontend estatico + backend Node) |

---

## Estructura del Proyecto

```
proyecto-phyton-senati/
├── public/
│   └── img/                    # Imagenes estaticas (logo, iconos, equipo)
├── src/
│   ├── assets/                 # Assets de Vite (hero.png, react.svg)
│   ├── components/
│   │   ├── auth/               # Componentes de autenticacion
│   │   │   ├── AuthForm.tsx    # Formulario de auth reusable
│   │   │   └── FormField.tsx   # Campo de formulario reutilizable
│   │   ├── common/             # Componentes reutilizables por dominio
│   │   │   ├── ColumnSelect.tsx
│   │   │   ├── FeatureCard.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── InfoBanner.tsx
│   │   │   ├── SectionTitle.tsx
│   │   │   ├── StatBadge.tsx
│   │   │   ├── TabSelector.tsx
│   │   │   ├── TeamMemberCard.tsx
│   │   │   └── TechGroup.tsx
│   │   ├── Button.tsx          # Boton con variantes
│   │   ├── DataViewer.tsx      # Visor de datos en ventana emergente
│   │   ├── Footer.tsx
│   │   ├── Navbar.tsx          # Navegacion responsive con hamburger
│   │   └── ProtectedRoute.tsx  # Ruta protegida por autenticacion
│   ├── context/
│   │   └── AuthContext.tsx     # Contexto de autenticacion global
│   ├── img/                    # Iconos SVG del proyecto
│   ├── layouts/
│   │   └── MainLayouts.tsx     # Layout con Navbar + Footer
│   ├── pages/
│   │   ├── dashboard/          # Paginas del dashboard
│   │   │   ├── Dashboard.css   # Estilos del dashboard
│   │   │   ├── Graficos.tsx    # Graficos con Matplotlib
│   │   │   ├── Numpy.tsx       # Operaciones NumPy
│   │   │   └── Pandas.tsx      # Limpieza de datos con Pandas
│   │   ├── About.tsx           # Sobre nosotros (5 estudiantes)
│   │   ├── Contact.tsx         # Contacto
│   │   ├── Dashboard.tsx       # Layout principal del dashboard
│   │   ├── Home.tsx            # Pagina de inicio
│   │   ├── Login.tsx           # Iniciar sesion
│   │   ├── Registro.tsx        # Registrarse
│   │   ├── Services.tsx        # Servicios del proyecto
│   │   └── VerificarCodigo.tsx # Verificacion por codigo
│   ├── routes/
│   │   └── AppRoutes.tsx       # Configuracion de rutas
│   ├── scripts/                # Scripts Python ejecutados via Pyodide
│   │   ├── matplotlib_chart.py # Generacion de graficos
│   │   ├── numpy_ops.py        # Operaciones con NumPy
│   │   └── pandas_clean.py     # Limpieza de datos con Pandas
│   ├── types/
│   │   └── index.ts            # Definiciones TypeScript
│   ├── utils/
│   │   ├── pyodide.ts          # Configuracion de Pyodide (WebAssembly)
│   │   └── storage.ts          # Utilidades de localStorage
│   ├── App.css                 # Estilos de la aplicacion
│   ├── App.tsx                 # Componente raiz
│   ├── index.css               # Estilos globales (variables, reset)
│   └── main.tsx                # Punto de entrada React
├── backend/
│   ├── .env.example            # Plantilla de variables de entorno
│   ├── server.js               # Servidor Express (auth + correo)
│   ├── users.json              # Base de datos de usuarios
│   ├── codes.json              # Codigos de verificacion
│   └── Initializer.bat         # Iniciador del backend
├── Initializer.bat             # Iniciador del frontend
├── index.html                  # Entry HTML de Vite
├── package.json                # Dependencias del frontend
├── vite.config.ts              # Configuracion de Vite
├── tsconfig.json               # Configuracion de TypeScript
├── render.yaml                 # Configuracion de despliegue en Render
└── .env.example                # Variables de entorno del frontend
```

---

## Requisitos Previos

| Requisito | Version | Enlace de descarga |
|-----------|---------|-------------------|
| **Node.js** | >= 18.x | [nodejs.org](https://nodejs.org/) |
| **npm** | >= 9.x (viene con Node) | - |
| **Git** | Cualquier version | [git-scm.com](https://git-scm.com/) |
| **Cuenta Gmail** | (Opcional, para envio real de correos) | [mail.google.com](https://mail.google.com/) |

> **Nota:** Python NO es necesario. Pyodide ejecuta Python via WebAssembly directamente en el navegador.

---

## Instalacion y Ejecucion

### 1. Clonar el repositorio

```bash
git clone https://github.com/PolloCraft/proyecto-phyton-senati.git
cd proyecto-phyton-senati
```

### 2. Configurar el Frontend

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
copy .env.example .env
```

Editar `.env` si es necesario:

```env
VITE_API_URL=http://localhost:3001
```

### 3. Configurar el Backend

```bash
# Entrar a la carpeta del backend
cd backend

# Instalar dependencias
npm install

# Copiar variables de entorno
copy .env.example .env
```

Editar `backend/.env` (ver seccion [Configuracion del Correo](#configuracion-del-correo-nodemailer)):

```env
EMAIL_USER=tu-correo@gmail.com
EMAIL_PASS=tu-contraseña-de-aplicacion
DEV_EMAIL=tu-correo@gmail.com
```

### 4. Ejecutar el proyecto

**Opcion A: Usando los Initializers (Windows)**

Ejecutar `Initializer.bat` en la carpeta raiz para el frontend, y `backend/Initializer.bat` para el backend. Ambos en ventanas de CMD separadas:

```
Ventana 1 (Frontend):  Doble clic en Initializer.bat
Ventana 2 (Backend):   Doble clic en backend/Initializer.bat
```

Los scripts verifican automaticamente si existen las dependencias y las instalan si es necesario.

**Opcion B: Usando comandos npm**

```bash
# Terminal 1 - Frontend (puerto 5173)
npm run dev

# Terminal 2 - Backend (puerto 3001)
cd backend
npm run dev
```

### 5. Abrir en el navegador

Frontend: [http://localhost:5173](http://localhost:5173)
Backend API: [http://localhost:3001](http://localhost:3001)

---

## Configuracion del Correo (Nodemailer)

El sistema de autenticacion envia codigos de verificacion por correo. Para configurarlo:

### Paso 1: Habilitar verificacion en 2 pasos de Google

1. Ve a [myaccount.google.com/security](https://myaccount.google.com/security)
2. Activa la **Verificacion en 2 pasos** en tu cuenta de Google

### Paso 2: Crear una contraseña de aplicacion

1. Ve a [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Selecciona **Correo** y **Otra (nombre personalizado)**
3. Escribe "SENATI Python Project" y haz clic en **Crear**
4. Google generara una contraseña de 16 caracteres como: `abcd efgh ijkl mnop`

### Paso 3: Configurar el archivo .env

Editar `backend/.env` con tus credenciales:

```env
EMAIL_USER=tu-correo@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
DEV_EMAIL=tu-correo@gmail.com
```

### Sin configuracion de correo

Si no se configura el correo, el backend funcionara en **modo desarrollo**:
- Los codigos de verificacion se devuelven directamente en la respuesta JSON
- Se muestra el codigo en pantalla durante el registro
- La autenticacion sigue funcionando correctamente

---

## Uso del Proyecto

### Flujo de Usuario

```
1. Registro    → Ingresa nombre y correo electronico
2. Verificacion → Recibe un codigo de 6 digitos por correo
3. Login       → Ingresa su correo para acceder
4. Dashboard   → Accede a las herramientas de analisis
```

### Dashboard - Herramientas

#### Pandas (CSV)
1. Haz clic en **Seleccionar archivo** para cargar un archivo CSV
2. Haz clic en **Limpiar Datos** para procesar con Pandas
3. Visualiza la tabla de datos limpios
4. **Descargar CSV Limpio** para obtener el resultado
5. **Ver Datos Completos** abre una ventana con ambas tablas
6. **Recargar archivo** para cargar un nuevo CSV
7. **Continuar a Numpy** para analisis estadistico

#### NumPy (Matrices)
- **Vector:** Selecciona una columna numerica y crea un array NumPy
- **Descriptiva:** Media, mediana, moda, varianza, desviacion estandar, percentiles
- **Transformacion:** Normalizar, estandarizar, operaciones con escalares, raiz cuadrada
- **Matrices:** Descripcion, transpuesta, suma por filas/columnas, producto punto
- **Operadores:** Suma, resta, multiplicacion, division, potencia, modulo entre vectores

#### Graficos (Matplotlib)
- **Barras:** Grafico de barras con etiquetas de valor
- **Lineas:** Grafico de lineas con media y mediana
- **Dispersion:** Grafico de dispersion con linea de tendencia
- **Circular:** Grafico circular con porcentajes

---

## Funcionamiento Interno

### Arquitectura

```
┌─────────────────────────────────────────────┐
│                  NAVEGADOR                   │
│  ┌─────────────┐    ┌─────────────────────┐ │
│  │  React App  │◄──►│    Pyodide (WASM)   │ │
│  │  (Frontend) │    │  Pandas / NumPy /   │ │
│  │             │    │  Matplotlib         │ │
│  └──────┬──────┘    └─────────────────────┘ │
│         │ localStorage                       │
└─────────┼───────────────────────────────────┘
          │ HTTP (fetch)
┌─────────▼───────────────────────────────────┐
│            BACKEND (Express)                  │
│  ┌──────────────┐  ┌────────────────────┐   │
│  │   Auth API   │  │  Nodemailer (Gmail) │   │
│  │  /api/*      │  │  Codigos de verif.  │   │
│  └──────────────┘  └────────────────────┘   │
│  users.json / codes.json                     │
└──────────────────────────────────────────────┘
```

### Pyodide (Python en el Navegador)

El proyecto usa [Pyodide](https://pyodide.org/) para ejecutar codigo Python real via WebAssembly. Los scripts Python en `src/scripts/` se importan como strings raw y se ejecutan:

```typescript
// Cargar Pyodide
const py = await getPyodide();
await py.loadPackage(["pandas", "numpy", "matplotlib"]);

// Ejecutar script Python
py.globals.set("csv_content", csvRaw);
const result = await py.runPythonAsync(pandasCleanScript);
```

### Persistencia de Datos

| Dato | Almacenamiento | Descripcion |
|------|---------------|-------------|
| Sesion de usuario | `localStorage` (userEmail) | Correo del usuario autenticado |
| Datos del dashboard | `localStorage` (dashboard_data) | CSV, columnas, datos limpios |
| Usuarios registrados | `backend/users.json` | Nombre, correo, verificado |
| Codigos de verificacion | `backend/Codes.json` | Codigo temporal (10 min expira) |

---

## Librerias Utilizadas

### Frontend

| Libreria | Version | Uso |
|----------|---------|-----|
| React | ^19.2.8 | Framework de interfaz de usuario |
| React DOM | ^19.2.8 | Renderizado en el navegador |
| React Router DOM | ^7.18.2 | Enrutamiento SPA |
| xlsx | ^0.18.5 | Manipulacion de archivos Excel |
| Vite | ^8.2.0 | Bundler y servidor de desarrollo |
| TypeScript | ~6.0.2 | Tipado estatico |
| Oxlint | ^1.75.0 | Linting y analisis de codigo |

### Backend

| Libreria | Version | Uso |
|----------|---------|-----|
| Express | ^4.21.0 | Framework de servidor HTTP |
| Nodemailer | ^6.10.1 | Envio de correos via Gmail |
| CORS | ^2.8.5 | Habilitar peticiones cross-origin |
| dotenv | ^17.4.2 | Variables de entorno |

### Python (via Pyodide)

| Libreria | Uso |
|----------|-----|
| Pandas | Limpieza, transformacion y analisis de datos tabulares |
| NumPy | Operaciones numericas, estadistica, algebra lineal |
| Matplotlib | Generacion de graficos (barras, lineas, dispersion, circular) |

---

## Despliegue en Render

El proyecto incluye `render.yaml` para despliegue automatico en [Render](https://render.com/):

### Frontend (Estatico)

- **Tipo:** Static Site
- **Build:** `npm install && npm run build`
- **Publish:** `./dist`
- **Variable:** `VITE_API_URL` (URL del backend en Render)

### Backend (Node)

- **Tipo:** Web Service
- **Runtime:** Node
- **Build:** `cd backend && npm install`
- **Start:** `cd backend && node server.js`
- **Variables:** `EMAIL_USER`, `EMAIL_PASS`

### Pasos para desplegar

1. Crear una cuenta en [render.com](https://render.com/)
2. Conectar el repositorio de GitHub
3. Render detectara automaticamente el `render.yaml`
4. Configurar las variables de entorno en el panel de Render
5. El despliegue se ejecutara automaticamente

---

## Equipo de Desarrollo

| Nombre | Rol | Descripcion |
|--------|-----|-------------|
| **Diego Luna** | Servidor | Infraestructura, configuracion del servidor, despliegue y mantenimiento |
| **Deivyd Vidal** | Backend | Logica del servidor, autenticacion de usuarios y seguridad |
| **Diego Carlin** | Frontend | Interfaz de usuario, componentes React y diseno visual |
| **Tinoco Leon** | Soporte | Soporte tecnico, resolucion de problemas y asistencia al usuario |
| **Ronal de la Cruz** | Backend | Desarrollo de funcionalidades backend, integracion de servicios y optimizacion |

**Institucion:** SENATI

---

## Licencia

Proyecto desarrollado como parte de la formacion tecnica en SENATI.
