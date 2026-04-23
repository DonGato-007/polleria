let gastos = [];

function agregarGasto() {
  const container = document.getElementById("contenido");
  if (!container) return;

  const descripcionInput = container.querySelector("#descripcionGasto");
  const montoInput = container.querySelector("#montoGasto");
  const fechaInput = container.querySelector("#fechaGasto");
  const indexEditar = container.querySelector("#indexEditar");

  if (!descripcionInput || !montoInput || !fechaInput) return;

  const descripcion = descripcionInput.value;
  const monto = parseFloat(montoInput.value);
  const fecha = fechaInput.value;
  const index = indexEditar.value;

  if (!descripcion || !monto || monto <= 0 || !fecha) {
    alert("Completa todos los campos correctamente");
    return;
  }

  if (index !== "") {
    gastos[parseInt(index)] = { descripcion, monto, fecha };
  } else {
    gastos.push({ descripcion, monto, fecha });
  }

  const modal = container.querySelector("#modalGasto");
  const bsModal = bootstrap.Modal.getInstance(modal);
  bsModal.hide();

  descripcionInput.value = "";
  montoInput.value = "";
  fechaInput.value = "";
  indexEditar.value = "";

  actualizarGastos();
  guardarGastos();
}

function actualizarGastos() {
  const container = document.getElementById("contenido");
  if (!container) return;

  const lista = container.querySelector("#listaGastos");
  const totalGastos = container.querySelector("#totalGastos");

  const buscar = container.querySelector("#buscarGasto").value.toLowerCase();
  const filtroFecha = container.querySelector("#filtroFecha").value;

  lista.innerHTML = "";

  let total = 0;

  gastos.forEach((g, index) => {
    const descMatch = g.descripcion.toLowerCase().includes(buscar);
    const fechaMatch = !filtroFecha || g.fecha === filtroFecha;

    if (!descMatch || !fechaMatch) return;

    total += g.monto;

    lista.innerHTML += `
      <div class="col-md-6 col-sm-12">
        <div class="card border-danger border-start border-4">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h5 class="mb-1">${g.descripcion}</h5>
                <small class="text-muted">${g.fecha}</small>
              </div>
              <div class="text-end">
                <h4 class="text-danger">S/ ${g.monto}</h4>
                <div class="d-flex gap-1 justify-content-end">
                  <button class="btn btn-sm btn-outline-warning" onclick="editarGasto(${index})">Editar</button>
                  <button class="btn btn-sm btn-outline-danger" onclick="eliminarGasto(${index})">Eliminar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  if (totalGastos) totalGastos.innerText = total;
}

function filtrarGastos() {
  actualizarGastos();
}

function eliminarGasto(index) {
  document.querySelector("#mensajeEliminar").textContent = `¿Eliminar gasto de S/ ${gastos[index].monto}?`;
  document.querySelector("#indexEliminar").value = index;
  document.querySelector("#tipoEliminar").value = "finanzas";
  const modal = document.querySelector("#modalConfirmar");
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();
}

function editarGasto(index) {
  const container = document.getElementById("contenido");
  if (!container) return;

  const gasto = gastos[index];
  
  container.querySelector("#indexEditar").value = index;
  container.querySelector("#descripcionGasto").value = gasto.descripcion;
  container.querySelector("#montoGasto").value = gasto.monto;
  container.querySelector("#fechaGasto").value = gasto.fecha;
  container.querySelector("#tituloModalGasto").textContent = "Editar Gasto";
  
  const modal = container.querySelector("#modalGasto");
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();
}

function guardarGastos() {
  localStorage.setItem("gastos", JSON.stringify(gastos));
}

function cargarFinanzas() {
  const data = localStorage.getItem("gastos");
  if (data) {
    gastos = JSON.parse(data);
  }
  actualizarGastos();
}