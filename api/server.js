import { createServer } from "http";
import { randomInt } from "crypto";
import nodemailer from "nodemailer";

const REDIS_URL = process.env.REDIS_URL;
let redis = null;

async function getRedis() {
  if (redis) return redis;
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

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail(to, subject, html) {
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

function json(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(data));
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

const server = createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    return res.end();
  }

  const url = new URL(req.url, "http://localhost");
  const pathname = url.pathname;

  try {
    if (pathname === "/api/health" && req.method === "GET") {
      return json(res, 200, { status: "ok", storage: REDIS_URL ? "redis" : "none" });
    }

    if (pathname === "/api/register" && req.method === "POST") {
      const { name, email: rawEmail } = await readBody(req);
      const email = (rawEmail || "").trim().toLowerCase();
      if (!name || !email) return json(res, 400, { error: "Nombre y correo son requeridos." });
      const existing = await findUser(email);
      if (existing) return json(res, 400, { error: "Este correo ya esta registrado." });

      const code = String(randomInt(100000, 999999));
      await addUser({ name, email, code, verified: false });

      try {
        await sendEmail(
          email,
          "Codigo de verificacion - Sistema Integral",
          verificationEmailHTML(name, code)
        );
        return json(res, 200, { message: "Codigo enviado a tu correo electronico." });
      } catch (e) {
        console.error("Email send failed:", e.message);
        return json(res, 500, { error: "No se pudo enviar el correo. Intenta de nuevo." });
      }
    }

    if (pathname === "/api/verify-code" && req.method === "POST") {
      const { email: rawEmail, code } = await readBody(req);
      const email = (rawEmail || "").trim().toLowerCase();
      const user = await findUser(email);
      if (!user) return json(res, 404, { error: "Usuario no encontrado." });
      if (user.code !== code) return json(res, 400, { error: "Codigo incorrecto." });
      await updateUser(email, { verified: true });
      return json(res, 200, { message: "Verificado correctamente." });
    }

    if (pathname === "/api/login" && req.method === "POST") {
      const { email: rawEmail } = await readBody(req);
      const email = (rawEmail || "").trim().toLowerCase();
      const user = await findUser(email);
      if (!user) return json(res, 404, { error: "Correo no registrado. Registrate primero." });
      if (!user.verified) return json(res, 403, { error: "Cuenta no verificada. Verifica tu codigo." });
      return json(res, 200, { message: "Inicio de sesion exitoso." });
    }

    if (pathname === "/api/resend-code" && req.method === "POST") {
      const { email: rawEmail } = await readBody(req);
      const email = (rawEmail || "").trim().toLowerCase();
      const user = await findUser(email);
      if (!user) return json(res, 404, { error: "Usuario no encontrado." });

      const code = String(randomInt(100000, 999999));
      await updateUser(email, { code });

      try {
        await sendEmail(
          email,
          "Nuevo codigo de verificacion - Sistema Integral",
          verificationEmailHTML(user.name, code)
        );
        return json(res, 200, { message: "Nuevo codigo enviado a tu correo electronico." });
      } catch (e) {
        console.error("Email send failed:", e.message);
        return json(res, 500, { error: "No se pudo enviar el correo. Intenta de nuevo." });
      }
    }

    return json(res, 404, { error: "Not found" });
  } catch (e) {
    return json(res, 500, { error: e.message });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log(`Storage: ${REDIS_URL ? "Redis" : "none"}`);
  console.log(`Email: ${process.env.EMAIL_USER ? "configured" : "NOT configured"}`);
});
