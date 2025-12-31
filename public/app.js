/* ============================================================
   ⏳ TIEMPO RESTANTE
============================================================ */
function tiempoRestante(fin) {
  let diff = new Date(fin) - new Date();
  if (diff <= 0) return "0h 0m 0s";
  let h = Math.floor(diff / 3600000);
  let m = Math.floor((diff % 3600000) / 60000);
  let s = Math.floor((diff % 60000) / 1000);
  return `${h}h ${m}m ${s}s`;
}

/* ============================================================
   🔄 CARGAR VELAS
============================================================ */
let velasGlobales = []; // <- guardamos todas para búsqueda

function cargarVelas() {
  fetch("/velas")
    .then(r => r.json())
    .then(velas => {
      velasGlobales = velas;
      mostrarVelas(velas);
    });
}

/* ============================================================
   🔍 BUSQUEDA POR NOMBRE O FECHA
============================================================ */
document.getElementById("buscar").addEventListener("input", e => {
  const q = e.target.value.toLowerCase().trim();

  if (q === "") {
    mostrarVelas(velasGlobales);
    return;
  }

  const filtradas = velasGlobales.filter(v =>
    v.nombre.toLowerCase().includes(q) ||
    (v.por && v.por.toLowerCase().includes(q)) ||
    new Date(v.inicio).toLocaleDateString().includes(q)
  );

  mostrarVelas(filtradas);
});

/* ============================================================
   📲 COMPARTIR WHATSAPP CON URL ÚNICA
============================================================ */
function compartirWhatsApp(v) {
  const url = `${window.location.origin}/vela.html?id=${v.id}`;
  const txt =
    `🕯️ *Vela virtual*\n` +
    `Encendida por: ${v.nombre}\n` +
    `${v.por ? `En homenaje a: ${v.por}\n` : ""}` +
    `"${v.mensaje}"\n\n` +
    `Ver aquí:\n${url}`;

  return `https://wa.me/?text=${encodeURIComponent(txt)}`;
}

/* ============================================================
   🕯️ MOSTRAR VELAS EN GALERÍA
============================================================ */
function mostrarVelas(velas) {
  const cont = document.getElementById("galeria");
  cont.innerHTML = "";

  velas.forEach(v => {
    cont.innerHTML += `
      <div class="vela-box">
        <div class="vela"><div class="llama"></div></div>
        <div class="nombre">${v.nombre}${v.por ? ` → 💛 ${v.por}` : ""}</div>
        <div class="mensaje">"${v.mensaje}"</div>
        <div style="color:orange;">⏳ ${tiempoRestante(v.fin)}</div>

        
        <a class="btn-mini" href="vela.html?id=${v.id}">👁 Ver vela</a>
        <a class="btn-mini" href="${compartirWhatsApp(v)}" target="_blank">📲 Compartir</a>
      </div>
    `;
  });
}

/* ============================================================
   🕯️ ENCENDER NUEVA VELA
============================================================ */
document.getElementById("formVela").addEventListener("submit", e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));

  fetch("/encender", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  .then(r => r.json())
  .then(resp => {
    alert("🕯️ Tu vela se ha encendido con amor ✨");
    e.target.reset();
    cargarVelas();
  });
});

/* ============================================================
   🌗 MODO DÍA / NOCHE
============================================================ */
document.getElementById("btnModo").addEventListener("click", () => {
  document.body.classList.toggle("claro");
});

/* ============================================================
   🚀 AUTO-REFRESCO Y CARGA INICIAL
============================================================ */
cargarVelas();

// recarga solo si no hay búsqueda activa
setInterval(() => {
  const q = document.getElementById("buscar").value.trim();
  if (q === "") cargarVelas();
}, 1000);
