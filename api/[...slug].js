import { randomInt, createHmac } from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "sisit-" + (process.env.EMAIL_PASS || "fallback-dev-secret");
const JWT_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000;
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY;

let redis = null;

async function getRedis() {
  if (redis) return redis;
  const REDIS_URL = process.env.REDIS_URL;
  if (!REDIS_URL) return null;
  try {
    const mod = await import("ioredis");
    const Redis = mod.default;
    redis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      connectTimeout: 5000,
      lazyConnect: true,
    });
    await redis.connect();
    return redis;
  } catch (e) {
    console.warn("Redis unavailable:", e.message);
    redis = null;
    return null;
  }
}

const USERS_KEY = "users";

async function getUsers() {
  const r = await getRedis();
  if (r) {
    const data = await r.get(USERS_KEY);
    return data ? JSON.parse(data) : [];
  }
  return [];
}

async function saveUsers(users) {
  const r = await getRedis();
  if (r) await r.set(USERS_KEY, JSON.stringify(users));
}

async function findUser(email) {
  const users = await getUsers();
  return users.find((u) => u.email === email) || null;
}

async function updateUser(email, updates) {
  const users = await getUsers();
  const idx = users.findIndex((u) => u.email === email);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...updates };
  await saveUsers(users);
  return users[idx];
}

async function addUser(user) {
  const users = await getUsers();
  users.push(user);
  await saveUsers(users);
}

function generateToken(email, name) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = { email, name, iat: Date.now(), exp: Date.now() + JWT_EXPIRES_MS };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${signature}`;
}

function verifyToken(token) {
  try {
    const [header, body, signature] = token.split(".");
    const expected = createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
    if (signature !== expected) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function authMiddleware(req) {
  const auth = req.headers?.authorization || req.headers?.Authorization;
  if (!auth || !auth.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  return verifyToken(token);
}

async function sendEmail(to, subject, html) {
  const mod = await import("nodemailer");
  const nodemailer = mod.default;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  await transporter.sendMail({
    from: `"Sistema Integral" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

function verificationEmailHTML(name, code) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="color:#1e293b;font-size:22px;margin:0;">Sistema Integral</h1>
      </div>
      <p style="color:#334155;font-size:15px;">Hola <strong>${name}</strong>,</p>
      <p style="color:#334155;font-size:15px;">Tu codigo de verificacion es:</p>
      <div style="text-align:center;margin:28px 0;">
        <span style="display:inline-block;font-size:32px;font-weight:bold;letter-spacing:10px;color:#6366f1;background:#eef2ff;padding:16px 32px;border-radius:8px;font-family:monospace;">${code}</span>
      </div>
      <p style="color:#64748b;font-size:13px;">Este codigo expira en 15 minutos. Si no solicitaste este registro, ignora este mensaje.</p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;" />
      <p style="color:#94a3b8;font-size:12px;text-align:center;">Sistema Integral - Analisis de Datos con Python</p>
    </div>
  `;
}

async function verifyTurnstile(token, ip) {
  if (!TURNSTILE_SECRET) return true;
  if (!token) return false;
  try {
    const resp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: TURNSTILE_SECRET, response: token, remoteip: ip || "" }),
    });
    const result = await resp.json();
    return result.success === true;
  } catch {
    return false;
  }
}

const rateLimitStore = new Map();

function checkRateLimit(key, maxAttempts, windowMs) {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry || now - entry.start > windowMs) {
    rateLimitStore.set(key, { start: now, count: 1 });
    return { allowed: true, remaining: maxAttempts - 1 };
  }
  entry.count++;
  if (entry.count > maxAttempts) {
    const retryAfter = Math.ceil((windowMs - (now - entry.start)) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }
  return { allowed: true, remaining: maxAttempts - entry.count };
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
  };
}

function securityHeaders() {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  };
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      try { resolve(JSON.parse(body)); }
      catch { resolve({}); }
    });
  });
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.writeHead(204, corsHeaders());
    return res.end();
  }

  const url = new URL(req.url, "http://localhost");
  const pathname = url.pathname;

  try {
    if (pathname === "/api/health" && req.method === "GET") {
      const REDIS_URL = process.env.REDIS_URL;
      res.writeHead(200, { "Content-Type": "application/json", ...corsHeaders(), ...securityHeaders() });
      return res.end(JSON.stringify({ status: "ok", storage: REDIS_URL ? "redis" : "none" }));
    }

    if (pathname === "/api/register" && req.method === "POST") {
      const { name, email: rawEmail, turnstileToken } = await readBody(req);
      const email = (rawEmail || "").trim().toLowerCase();
      if (!name || !email) {
        res.writeHead(400, { "Content-Type": "application/json", ...corsHeaders(), ...securityHeaders() });
        return res.end(JSON.stringify({ error: "Nombre y correo son requeridos." }));
      }

      const turnstileOk = await verifyTurnstile(turnstileToken, req.headers?.["x-forwarded-for"] || "");
      if (!turnstileOk) {
        res.writeHead(403, { "Content-Type": "application/json", ...corsHeaders(), ...securityHeaders() });
        return res.end(JSON.stringify({ error: "Verificacion anti-bot fallida. Intenta de nuevo." }));
      }

      const existing = await findUser(email);
      if (existing) {
        res.writeHead(400, { "Content-Type": "application/json", ...corsHeaders(), ...securityHeaders() });
        return res.end(JSON.stringify({ error: "Este correo ya esta registrado." }));
      }

      const code = String(randomInt(100000, 999999));
      await addUser({ name, email, code, verified: false });

      try {
        await sendEmail(email, "Codigo de verificacion - Sistema Integral", verificationEmailHTML(name, code));
        res.writeHead(200, { "Content-Type": "application/json", ...corsHeaders(), ...securityHeaders() });
        return res.end(JSON.stringify({ message: "Codigo enviado a tu correo electronico." }));
      } catch (e) {
        console.error("Email send failed:", e.message);
        res.writeHead(500, { "Content-Type": "application/json", ...corsHeaders(), ...securityHeaders() });
        return res.end(JSON.stringify({ error: "No se pudo enviar el correo. Intenta de nuevo." }));
      }
    }

    if (pathname === "/api/verify-code" && req.method === "POST") {
      const { email: rawEmail, code } = await readBody(req);
      const email = (rawEmail || "").trim().toLowerCase();

      const rl = checkRateLimit(`verify:${email}`, 5, 60000);
      if (!rl.allowed) {
        res.writeHead(429, { "Content-Type": "application/json", ...corsHeaders(), ...securityHeaders() });
        return res.end(JSON.stringify({ error: `Demasiados intentos. Espera ${rl.retryAfter} segundos.` }));
      }

      const user = await findUser(email);
      if (!user) {
        res.writeHead(404, { "Content-Type": "application/json", ...corsHeaders(), ...securityHeaders() });
        return res.end(JSON.stringify({ error: "Usuario no encontrado." }));
      }
      if (user.code !== code) {
        res.writeHead(400, { "Content-Type": "application/json", ...corsHeaders(), ...securityHeaders() });
        return res.end(JSON.stringify({ error: "Codigo incorrecto." }));
      }
      await updateUser(email, { verified: true });

      const token = generateToken(email, user.name);
      res.writeHead(200, { "Content-Type": "application/json", ...corsHeaders(), ...securityHeaders() });
      return res.end(JSON.stringify({ message: "Verificado correctamente.", token, user: { name: user.name, email } }));
    }

    if (pathname === "/api/login" && req.method === "POST") {
      const { email: rawEmail, turnstileToken } = await readBody(req);
      const email = (rawEmail || "").trim().toLowerCase();

      const turnstileOk = await verifyTurnstile(turnstileToken, req.headers?.["x-forwarded-for"] || "");
      if (!turnstileOk) {
        res.writeHead(403, { "Content-Type": "application/json", ...corsHeaders(), ...securityHeaders() });
        return res.end(JSON.stringify({ error: "Verificacion anti-bot fallida. Intenta de nuevo." }));
      }

      const user = await findUser(email);
      if (!user) {
        res.writeHead(404, { "Content-Type": "application/json", ...corsHeaders(), ...securityHeaders() });
        return res.end(JSON.stringify({ error: "Correo no registrado. Registrate primero." }));
      }
      if (!user.verified) {
        res.writeHead(403, { "Content-Type": "application/json", ...corsHeaders(), ...securityHeaders() });
        return res.end(JSON.stringify({ error: "Cuenta no verificada. Verifica tu codigo." }));
      }

      const token = generateToken(email, user.name);
      res.writeHead(200, { "Content-Type": "application/json", ...corsHeaders(), ...securityHeaders() });
      return res.end(JSON.stringify({ message: "Inicio de sesion exitoso.", token, user: { name: user.name, email } }));
    }

    if (pathname === "/api/resend-code" && req.method === "POST") {
      const { email: rawEmail } = await readBody(req);
      const email = (rawEmail || "").trim().toLowerCase();

      const rl = checkRateLimit(`resend:${email}`, 3, 60000);
      if (!rl.allowed) {
        res.writeHead(429, { "Content-Type": "application/json", ...corsHeaders(), ...securityHeaders() });
        return res.end(JSON.stringify({ error: `Demasiados intentos. Espera ${rl.retryAfter} segundos.` }));
      }

      const user = await findUser(email);
      if (!user) {
        res.writeHead(404, { "Content-Type": "application/json", ...corsHeaders(), ...securityHeaders() });
        return res.end(JSON.stringify({ error: "Usuario no encontrado." }));
      }

      const code = String(randomInt(100000, 999999));
      await updateUser(email, { code });

      try {
        await sendEmail(email, "Nuevo codigo de verificacion - Sistema Integral", verificationEmailHTML(user.name, code));
        res.writeHead(200, { "Content-Type": "application/json", ...corsHeaders(), ...securityHeaders() });
        return res.end(JSON.stringify({ message: "Nuevo codigo enviado a tu correo electronico." }));
      } catch (e) {
        console.error("Email send failed:", e.message);
        res.writeHead(500, { "Content-Type": "application/json", ...corsHeaders(), ...securityHeaders() });
        return res.end(JSON.stringify({ error: "No se pudo enviar el correo. Intenta de nuevo." }));
      }
    }

    if (pathname === "/api/me" && req.method === "GET") {
      const user = authMiddleware(req);
      if (!user) {
        res.writeHead(401, { "Content-Type": "application/json", ...corsHeaders(), ...securityHeaders() });
        return res.end(JSON.stringify({ error: "Token invalido o expirado." }));
      }
      res.writeHead(200, { "Content-Type": "application/json", ...corsHeaders(), ...securityHeaders() });
      return res.end(JSON.stringify({ user: { name: user.name, email: user.email } }));
    }

    if (pathname === "/api/profile" && req.method === "GET") {
      const user = authMiddleware(req);
      if (!user) {
        res.writeHead(401, { "Content-Type": "application/json", ...corsHeaders(), ...securityHeaders() });
        return res.end(JSON.stringify({ error: "Token invalido o expirado." }));
      }
      const dbUser = await findUser(user.email);
      if (!dbUser) {
        res.writeHead(404, { "Content-Type": "application/json", ...corsHeaders(), ...securityHeaders() });
        return res.end(JSON.stringify({ error: "Usuario no encontrado." }));
      }
      const { nombre, rol, institucion, avatar } = dbUser;
      res.writeHead(200, { "Content-Type": "application/json", ...corsHeaders(), ...securityHeaders() });
      return res.end(JSON.stringify({ profile: { nombre: nombre || "", rol: rol || "analista", institucion: institucion || "SENATI", avatar: avatar || null } }));
    }

    if (pathname === "/api/profile" && req.method === "PUT") {
      const user = authMiddleware(req);
      if (!user) {
        res.writeHead(401, { "Content-Type": "application/json", ...corsHeaders(), ...securityHeaders() });
        return res.end(JSON.stringify({ error: "Token invalido o expirado." }));
      }
      const body = await readBody(req);
      const { nombre, rol, institucion, avatar } = body;
      const updates = {};
      if (nombre !== undefined) updates.nombre = nombre;
      if (rol !== undefined) updates.rol = rol;
      if (institucion !== undefined) updates.institucion = institucion;
      if (avatar !== undefined) updates.avatar = avatar;
      await updateUser(user.email, updates);
      res.writeHead(200, { "Content-Type": "application/json", ...corsHeaders(), ...securityHeaders() });
      return res.end(JSON.stringify({ message: "Perfil actualizado." }));
    }

    res.writeHead(404, { "Content-Type": "application/json", ...corsHeaders(), ...securityHeaders() });
    return res.end(JSON.stringify({ error: "Not found" }));
  } catch (e) {
    res.writeHead(500, { "Content-Type": "application/json", ...corsHeaders(), ...securityHeaders() });
    return res.end(JSON.stringify({ error: e.message }));
  }
}
