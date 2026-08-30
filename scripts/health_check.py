#!/usr/bin/env python3
"""
Health Check - Verifica servidores y endpoints antes de git push.
Uso: python health_check.py
"""
import urllib.request
import json
import sys
from datetime import datetime

BASE = "http://localhost:3001"
VITE = "http://localhost:5173"

ENDPOINTS = [
    ("/api/me", "GET"),
    ("/api/register", "POST"),
    ("/api/login", "POST"),
    ("/api/send-code", "POST"),
]

def check(name, url, method="GET"):
    try:
        req = urllib.request.Request(url, method=method)
        req.add_header("Content-Type", "application/json")
        if method == "POST":
            req.data = b'{}'
        resp = urllib.request.urlopen(req, timeout=5)
        status = resp.getcode()
        print(f"  [OK]  {name:<30} {url:<45} {status}")
        return True
    except urllib.error.HTTPError as e:
        print(f"  [WARN] {name:<30} {url:<45} {e.code} (endpoint existe)")
        return True
    except Exception as e:
        print(f"  [FAIL] {name:<30} {url:<45} {e}")
        return False

def main():
    print(f"\n{'='*60}")
    print(f" HEALTH CHECK - {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"{'='*60}\n")

    ok = True

    # 1. Vite dev server
    print("[1] Vite Dev Server (puerto 5173)")
    if not check("Vite", VITE):
        ok = False

    # 2. API Server
    print("\n[2] API Server (puerto 3001)")
    if not check("API Root", BASE):
        ok = False

    # 3. Endpoints
    print("\n[3] API Endpoints")
    for path, method in ENDPOINTS:
        if not check(f"  {method} {path}", f"{BASE}{path}", method):
            ok = False

    # 4. .env check
    print("\n[4] Seguridad - Verificacion de .env")
    import os
    env_file = os.path.join(os.path.dirname(__file__), "..", "api", ".env")
    if os.path.exists(env_file):
        with open(env_file) as f:
            content = f.read()
        has_localhost = "localhost" in content or "127.0.0.1" in content
        has_placeholder = "tu-" in content or "TU_" in content or "placeholder" in content.lower()
        has_real_pass = any(x in content for x in ["pass123", "password123", "admin123"])

        if has_localhost:
            print(f"  [WARN] .env contiene 'localhost' - revisar antes de push")
        if has_placeholder:
            print(f"  [INFO] .env contiene placeholders (OK para repo)")
        if has_real_pass:
            print(f"  [WARN] .env contiene contraseñas débiles")
        if not has_localhost and not has_real_pass:
            print(f"  [OK] .env parece seguro")
    else:
        print(f"  [OK] No existe api/.env (usar .env.example)")

    # Resumen
    print(f"\n{'='*60}")
    if ok:
        print(" RESULTADO: Todos los checks PASARON")
    else:
        print(" RESULTADO: Hay checks FALLIDOS - revisar antes de push")
    print(f"{'='*60}\n")
    return 0 if ok else 1

if __name__ == "__main__":
    sys.exit(main())
