# Checklist de Seguridad antes de Git Push

## Variables de Entorno (.env / .env.example)

| Variable | En .env.example | Placeholder seguro | OK |
|---|---|---|---|
| VITE_API_URL | `http://localhost:3001` | Solo para dev local | ✅ |
| REDIS_URL | `redis://default:your_password_here@...` | Placeholder genérico | ✅ |
| EMAIL_USER | `your-email@gmail.com` | Placeholder genérico | ✅ |
| EMAIL_PASS | `your-app-password` | Placeholder genérico | ✅ |
| JWT_SECRET | `your-super-secret-jwt-key-change-this` | Placeholder genérico | ✅ |
| PORT | `3001` | Puerto por defecto | ✅ |
| TURNSTILE_SECRET_KEY | `your-turnstile-secret-key` | Placeholder genérico | ✅ |
| VITE_TURNSTILE_SITE_KEY | `your-turnstile-site-key` | Placeholder genérico | ✅ |

## Verificaciones

- [x] `.gitignore` excluye `.env`, `.env.local`, `.env*.local`
- [x] `.env.example` tiene placeholders (no credenciales reales)
- [x] No hay IPs de producción ni contraseñas reales en `.env.example`
- [x] `api/.env` no existe en el repo (solo en máquina local)
- [x] No hay `node_modules/` ni `dist/` en el repo
- [x] No hay archivos `data/users.json` (datos de usuario)
- [x] No hay logs (`*.log`) en el repo

## Archivos que SÍ se suben

- `src/` - Código fuente React/TypeScript
- `api/server.js` - Backend (sin credenciales hardcodeadas)
- `api/.env.example` - Plantilla de variables de entorno
- `public/` - Assets estáticos
- `scripts/health_check.py` - Script de verificación
- `package.json`, `vite.config.ts`, `tsconfig.json`
- `.gitignore`, `README.md`
