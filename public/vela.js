/* ============================================================
   🥇 OBTENER ID DE LA URL
============================================================ */
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

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
   💬 CARGAR COMENTARIOS
============================================================ */
async function renderComentarios() {
  const lista = document.getElementById("listaComentarios");
  const res = await fetch(`/comentarios/${id}`);
  const comentarios = await res.json();

  if (!comentarios.length) {
    lista.innerHTML = "<p>Aún no hay comentarios 💛</p>";
    return;
  }

  lista.innerHTML = comentarios.map(c => `
      <div class="comentario-item">
        <div class="comentario-meta"><strong>${c.nombre}</strong> (${c.pais}) • ${c.fecha}</div>
        <div>${c.texto}</div>
      </div>
  `).join("");
}

/* ============================================================
   ✍️ ENVIAR COMENTARIO
============================================================ */
document.getElementById("formComentario").addEventListener("submit", async e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));

  const res = await fetch(`/comentario/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await res.json();
  if (result.ok) {
    e.target.reset();
    renderComentarios();
  } else {
    alert("❌ Error al guardar el comentario");
  }
});

/* ============================================================
   👁️ MOSTRAR VELA
============================================================ */
async function cargarVela() {
  const res = await fetch(`/vela/${id}`);
  const data = await res.json();
  const cont = document.getElementById("contenedorVela");

  if (data.error) return cont.innerHTML = `<h2>❌ Vela no encontrada</h2>`;

  const v = data.vela;
  const estado = data.estado;

  cont.innerHTML = `
    <div class="vela-box grande">
      ${estado === "encendida"
        ? `<div class="vela"><div class="llama"></div></div>`
        : `<img src="vela-apagada.png" class="vela-img apagada">`}
      <h2>${v.nombre}</h2>
      ${v.por ? `<p>💛 En homenaje a: <strong>${v.por}</strong></p>` : ""}
      <p class="mensaje">"${v.mensaje}"</p>
      <p>🌍 <strong>${v.pais}</strong></p>
      <div id="contador" style="color:orange;font-size:20px;margin-top:10px;"></div>
      <button onclick="compartirVela('${id}')" class="btn-compartir">📲 Compartir</button>
    </div>
  `;
}

/* ============================================================
   📲 COMPARTIR
============================================================ */
function compartirVela(id) {
  const url = `${window.location.origin}/vela.html?id=${id}`;
  const msg = `Encendí una vela virtual 🕯️\n\nMírala aquí:\n${url}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
}

/* ============================================================
   🕒 CONTADOR
============================================================ */
async function actualizarContador() {
  const res = await fetch(`/vela/${id}`);
  const data = await res.json();
  if (!data.vela) return;
  document.getElementById("contador").innerHTML = `⏳ ${tiempoRestante(data.vela.fin)}`;
}

/* ============================================================
   🚀 INICIO
============================================================ */
cargarVela();
renderComentarios();
setInterval(actualizarContador, 1000);
