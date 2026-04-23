let movimientos = [];

function registrarMovimiento() {
  const container = document.getElementById("contenido");
  if (!container) return;

  const tipoInput = container.querySelector("#tipo");
  const montoInput = container.querySelector("#monto");
  const descripcionInput = container.querySelector("#descripcion");

  if (!tipoInput || !montoInput || !descripcionInput) return;

  const tipo = tipoInput.value;
  const monto = parseFloat(montoInput.value);
  const descripcion = descripcionInput.value;

  if (!monto || monto <= 0) {
    alert("Ingresa un monto válido");
    return;
  }

  movimientos.push({ 
    tipo, 
    monto, 
    descripcion,
    fecha: new Date().toLocaleString()
  });

  const modal = container.querySelector("#modalMovimiento");
  const bsModal = bootstrap.Modal.getInstance(modal);
  bsModal.hide();

  montoInput.value = "";
  descripcionInput.value = "";

  actualizarCaja();
}

function actualizarCaja() {
  const container = document.getElementById("contenido");
  if (!container) return;

  const lista = container.querySelector("#listaMovimientos");
  const totalIngresos = container.querySelector("#totalIngresos");
  const totalEgresos = container.querySelector("#totalEgresos");
  const saldo = container.querySelector("#saldo");

  const buscar = container.querySelector("#buscarMovimiento").value.toLowerCase();
  const filtro = container.querySelector("#filtroTipo").value;

  let ingresos = 0;
  let egresos = 0;

  lista.innerHTML = "";

  movimientos.forEach((m, index) => {
    const tipoMatch = filtro === "todos" || m.tipo === filtro;
    const descMatch = m.descripcion.toLowerCase().includes(buscar);

    if (!tipoMatch || !descMatch) return;

    if (m.tipo === "ingreso") ingresos += m.monto;
    else egresos += m.monto;

    const colorClass = m.tipo === "ingreso" ? "border-success" : "border-danger";
    const badgeClass = m.tipo === "ingreso" ? "bg-success" : "bg-danger";
    const icono = m.tipo === "ingreso" ? "↑" : "↓";

    lista.innerHTML += `
      <div class="col-md-6 col-sm-12">
        <div class="card border-start border-4 ${colorClass}">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <span class="badge ${badgeClass}">${icono} ${m.tipo.toUpperCase()}</span>
                <p class="mb-0 mt-2 fw-bold">${m.descripcion}</p>
                <small class="text-muted">${m.fecha}</small>
              </div>
              <div class="text-end">
                <h4 class="${m.tipo === 'ingreso' ? 'text-success' : 'text-danger'}">S/ ${m.monto}</h4>
                <button class="btn btn-sm btn-outline-danger" onclick="eliminarMovimiento(${index})">Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  if (totalIngresos) totalIngresos.innerText = ingresos;
  if (totalEgresos) totalEgresos.innerText = egresos;
  if (saldo) saldo.innerText = ingresos - egresos;
}

function filtrarCaja() {
  actualizarCaja();
}

function eliminarMovimiento(index) {
  document.querySelector("#mensajeEliminar").textContent = `¿Eliminar movimiento de S/ ${movimientos[index].monto}?`;
  document.querySelector("#indexEliminar").value = index;
  document.querySelector("#tipoEliminar").value = "caja";
  const modal = document.querySelector("#modalConfirmar");
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();
}

function cargarCaja() {
  actualizarCaja();
}