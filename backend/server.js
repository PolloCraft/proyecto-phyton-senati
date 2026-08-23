import "dotenv/config";
import express from "express";
import cors from "cors";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync, writeFileSync, existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, "users.json");
const CODES_PATH = join(__dirname, "codes.json");

function readJSON(path, fallback) {
  if (!existsSync(path)) {
    writeFileSync(path, JSON.stringify(fallback), "utf-8");
    return fallback;
  }
  const content = readFileSync(path, "utf-8").trim();
  if (!content) {
    writeFileSync(path, JSON.stringify(fallback), "utf-8");
    return fallback;
  }
  return JSON.parse(content);
}

function writeJSON(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2), "utf-8");
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const DEV_EMAIL = process.env.DEV_EMAIL || EMAIL_USER;

let transporter = null;

if (EMAIL_USER && EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
  });
  console.log("Correo configurado:", EMAIL_USER);
} else {
  console.log("Sin credenciales de correo. Los codigos se devuelven en la respuesta.");
}

function generateCode() {
  return crypto.randomInt(100000, 999999).toString();
}

async function sendEmail(to, subject, html) {
  if (!transporter) return false;
  try {
    await transporter.sendMail({ from: EMAIL_USER, to, subject, html });
    console.log(`Correo enviado a ${to}`);
    return true;
  } catch (err) {
    console.error("Error al enviar correo:", err.message);
    return false;
  }
}

async function sendCodeEmail(to, name, code) {
  return sendEmail(to, "Tu codigo de verificacion", `
    <div style="font-family:Arial,sans-serif;max-width:400px;margin:0 auto;">
      <h2 style="color:#6366f1;">Codigo de verificacion</h2>
      <p>Hola <strong>${name}</strong>,</p>
      <p>Tu codigo es:</p>
      <div style="background:#f1f5f9;padding:16px;text-align:center;border-radius:8px;margin:20px 0;">
        <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#6366f1;">${code}</span>
      </div>
      <p style="color:#64748b;font-size:0.85rem;">Expira en 10 minutos.</p>
    </div>
  `);
}

async function sendNotificationEmail(name, email) {
  return sendEmail(DEV_EMAIL, "Nuevo registro en la plataforma", `
    <div style="font-family:Arial,sans-serif;max-width:400px;margin:0 auto;">
      <h3 style="color:#6366f1;">Nuevo usuario registrado</h3>
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Correo:</strong> ${email}</p>
      <p><strong>Fecha:</strong> ${new Date().toLocaleString("es-MX")}</p>
    </div>
  `);
}

app.post("/api/register", async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Nombre y correo son requeridos." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Correo electronico invalido." });
    }

    const users = readJSON(DB_PATH, []);
    const existing = users.find((u) => u.email === email);

    if (existing && existing.verified) {
      return res.status(409).json({ error: "Este correo ya esta registrado." });
    }

    const code = generateCode();

    const codes = readJSON(CODES_PATH, []);
    const filteredCodes = codes.filter(
      (c) => c.email !== email || Date.now() - c.createdAt < 600000
    );

    filteredCodes.push({ email, name, code, createdAt: Date.now() });
    writeJSON(CODES_PATH, filteredCodes);

    const emailSent = await sendCodeEmail(email, name, code);
    await sendNotificationEmail(name, email);

    if (emailSent) {
      res.status(201).json({ message: "Codigo enviado a tu correo.", email });
    } else {
      res.status(201).json({ message: "Registro exitoso.", email, code });
    }
  } catch (error) {
    console.error("Error en /api/register:", error);
    res.status(500).json({ error: "Error del servidor." });
  }
});

app.post("/api/verify-code", (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: "Correo y codigo son requeridos." });
    }

    const codes = readJSON(CODES_PATH, []);
    const valid = codes.find(
      (c) => c.email === email && c.code === code && Date.now() - c.createdAt < 600000
    );

    if (!valid) {
      return res.status(400).json({ error: "Codigo invalido o expirado." });
    }

    const users = readJSON(DB_PATH, []);
    const existing = users.find((u) => u.email === email);

    if (!existing) {
      users.push({
        id: users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1,
        name: valid.name,
        email,
        verified: true,
        created_at: new Date().toISOString(),
      });
    } else {
      existing.verified = true;
    }

    writeJSON(DB_PATH, users);
    writeJSON(CODES_PATH, codes.filter((c) => c.email !== email));

    res.json({ message: "Verificacion exitosa.", name: valid.name, email });
  } catch (error) {
    console.error("Error en /api/verify-code:", error);
    res.status(500).json({ error: "Error del servidor." });
  }
});

app.post("/api/resend-code", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "El correo es requerido." });
    }

    const codes = readJSON(CODES_PATH, []);
    const pending = codes.find(
      (c) => c.email === email && Date.now() - c.createdAt < 600000
    );

    if (!pending) {
      return res.status(404).json({ error: "No hay registro pendiente para este correo." });
    }

    const newCode = generateCode();
    pending.code = newCode;
    pending.createdAt = Date.now();
    writeJSON(CODES_PATH, codes);

    const emailSent = await sendCodeEmail(email, pending.name, newCode);

    if (emailSent) {
      res.json({ message: "Nuevo codigo enviado." });
    } else {
      res.json({ message: "Nuevo codigo generado.", code: newCode });
    }
  } catch (error) {
    console.error("Error en /api/resend-code:", error);
    res.status(500).json({ error: "Error del servidor." });
  }
});

app.post("/api/login", (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "El correo es requerido." });
    }

    const users = readJSON(DB_PATH, []);
    const user = users.find((u) => u.email === email);

    if (!user) {
      return res.status(404).json({ error: "Correo no registrado. Primero debes registrarte." });
    }

    if (!user.verified) {
      return res.status(403).json({ error: "Correo no verificado." });
    }

    res.json({ message: "Inicio de sesion exitoso.", name: user.name, email: user.email });
  } catch (error) {
    console.error("Error en /api/login:", error);
    res.status(500).json({ error: "Error del servidor." });
  }
});

app.get("/api/users", (req, res) => {
  const users = readJSON(DB_PATH, []);
  res.json(users.map(({ id, name, email, verified, created_at }) => ({ id, name, email, verified, created_at })));
});

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
