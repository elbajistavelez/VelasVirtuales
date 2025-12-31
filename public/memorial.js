/* ============================================================
   🕯️ Cargar velas apagadas (memorial)
============================================================ */
async function cargarMemorial() {
  const res = await fetch('/memorial');
  const velas = await res.json();

  const contenedor = document.getElementById("listaMemorial");

  if (!velas.length) {
    contenedor.innerHTML = "<h2 style='text-align:center;margin-top:30px;'>Aún no hay velas en el memorial</h2>";
    return;
  }

  contenedor.innerHTML = velas.map(v => `
    <div class="vela-memorial">

      <!-- Humo animado -->
    <div class="humo" style="top: 100px; left: 315px;"></div>
    <div class="humo" style="top: 90px; left: 315px;"></div>
    <div class="humo" style="top: 80px; left: 315px;"></div>
    <div class="humo" style="top: 70px; left: 315px;"></div>

      <!-- imagen de vela apagada -->
      <img src="images/velaapagada.png" class="vela-apagada-img"/>
      

      <h3>${v.nombre}</h3>
      ${v.por ? `<small>Encendida por: ${v.por}</small><br>` : ""}
      <p style="margin-top:10px; font-size:15px; opacity:.8;">${v.mensaje}</p>

      <button class="btn-reencender" onclick="reencender('${v.id}')">
        Mantener encendida 24h más 🕯️
      </button>
    </div>
  `).join('');
}


/* ============================================================
   🔄 REENCENDER DESDE MEMORIAL
============================================================ */
async function reencender(id) {
  try {
    const res = await fetch(`/extender/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    const data = await res.json();

    if (!data.ok) {
      alert("❌ No se pudo reencender la vela: " + (data.error || "Error desconocido"));
      return;
    }

    alert("🕯️ La vela ha sido reencendida por 24 horas más");

    // 👇 Aquí está la clave: volver donde están las velas encendidas
    window.location.href = "index.html";

  } catch (error) {
    console.error(error);
    alert("⚠️ Error de conexión al reencender la vela");
  }
}


/* ============================================================
   🚀 INICIO
============================================================ */
cargarMemorial();
