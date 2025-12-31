const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static("public"));

/* ============================================================
   📁 RUTAS DE ARCHIVOS
============================================================ */
const velasPath = path.join(__dirname, "data", "velas.json");
const memorialPath = path.join(__dirname, "data", "memorial.json");
const personasPath = path.join(__dirname, "data", "personas.txt");
const comentariosPath = path.join(__dirname, "data", "comentarios.json");

/* ============================================================
   ✨ ARCHIVOS NECESARIOS
============================================================ */
function ensureFile(pathName, defaultValue) {
  if (!fs.existsSync(pathName)) {
    fs.writeFileSync(pathName, JSON.stringify(defaultValue, null, 2));
  }
}

ensureFile(velasPath, []);
ensureFile(memorialPath, []);
ensureFile(comentariosPath, {});

/* ============================================================
   🕯️ FUNCIONES VELAS Y MEMORIAL
============================================================ */
function cargarMemorial() {
  return JSON.parse(fs.readFileSync(memorialPath));
}

function cargarVelas() {
  let velas = JSON.parse(fs.readFileSync(velasPath));
  let ahora = Date.now();
  let activas = [];
  let apagadas = cargarMemorial();

  velas.forEach(v => {
    if (v.fin > ahora) activas.push(v);
    else apagadas.push({ ...v, estado: "apagada" });
  });

  fs.writeFileSync(velasPath, JSON.stringify(activas, null, 2));
  fs.writeFileSync(memorialPath, JSON.stringify(apagadas, null, 2));
  return activas;
}

/* ============================================================
   💬 FUNCIONES COMENTARIOS
============================================================ */
function cargarComentarios() {
  ensureFile(comentariosPath, {});
  return JSON.parse(fs.readFileSync(comentariosPath));
}

function guardarComentarios(data) {
  fs.writeFileSync(comentariosPath, JSON.stringify(data, null, 2));
}

/* ============================================================
   📌 RUTAS API
============================================================ */

// todas las velas encendidas
app.get("/velas", (req, res) => res.json(cargarVelas()));

// todas las velas apagadas
app.get("/memorial", (req, res) => res.json(cargarMemorial()));

// obtener una vela por ID
app.get("/vela/:id", (req, res) => {
  const id = req.params.id;
  const velas = cargarVelas();
  const memoria = cargarMemorial();

  const activa = velas.find(v => v.id === id);
  if (activa) return res.json({ estado: "encendida", vela: activa });

  const apagada = memoria.find(v => v.id === id);
  if (apagada) return res.json({ estado: "apagada", vela: apagada });

  res.json({ error: "No existe esta vela" });
});

// encender nueva vela
app.post("/encender", (req, res) => {
  const { nombre, por, pais, mensaje, email, whatsapp } = req.body;
  if (!nombre || !mensaje || !pais)
    return res.status(400).json({ error: "Nombre, mensaje y país son obligatorios." });

  const ahora = Date.now();
  const fin = ahora + 86400000;
  const id = Date.now().toString();

  const vela = { id, nombre, por: por || null, pais, mensaje, inicio: ahora, fin, estado: "encendida" };

  const velas = cargarVelas();
  velas.push(vela);
  fs.writeFileSync(velasPath, JSON.stringify(velas, null, 2));

  res.json({ ok: true, vela, url: `http://localhost:3000/vela.html?id=${id}` });
});

// re-encender desde memorial
app.post("/extender/:id", (req, res) => {
  const id = req.params.id;
  const memoria = cargarMemorial();
  const velasActivas = cargarVelas();

  const apagada = memoria.find(v => v.id === id);
  if (!apagada) return res.json({ ok: false, error: "No existe en memorial" });

  const nueva = { ...apagada, inicio: Date.now(), fin: Date.now() + 86400000, estado: "encendida" };

  fs.writeFileSync(memorialPath, JSON.stringify(memoria.filter(v => v.id !== id), null, 2));
  velasActivas.push(nueva);
  fs.writeFileSync(velasPath, JSON.stringify(velasActivas, null, 2));

  res.json({ ok: true, vela: nueva });
});

/* ============================================================
   💬 COMENTARIOS
============================================================ */

// obtener comentarios
app.get("/comentarios/:id", (req, res) => {
  const id = req.params.id;
  const comentarios = cargarComentarios();
  res.json(comentarios[id] || []);
});

// agregar comentario
app.post("/comentario/:id", (req, res) => {
  const id = req.params.id;
  const { nombre, pais, texto } = req.body;
  const fecha = new Date().toLocaleString();

  if (!nombre || !pais || !texto)
    return res.status(400).json({ error: "Todos los campos son obligatorios" });

  const comentarios = cargarComentarios();
  if (!comentarios[id]) comentarios[id] = [];

  comentarios[id].unshift({ nombre, pais, texto, fecha });
  guardarComentarios(comentarios);

  res.json({ ok: true, mensaje: "Comentario guardado" });
});

/* ============================================================
   🚀 INICIAR SERVIDOR
============================================================ */
const port = 3000;
app.listen(port, () => console.log(`🕯️ Servidor encendido en puerto ${port}`));
