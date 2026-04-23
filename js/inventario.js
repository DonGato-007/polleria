let inventario = [];

function agregarProducto() {
  const container = document.getElementById("contenido");
  if (!container) return;

  const nombreInput = container.querySelector("#nombre");
  const stockInput = container.querySelector("#stock");
  const precioInput = container.querySelector("#precio");

  if (!nombreInput || !stockInput || !precioInput) return;

  const nombre = nombreInput.value;
  const stock = parseInt(stockInput.value);
  const precio = parseFloat(precioInput.value);

  if (!nombre || stock < 0 || precio <= 0) {
    alert("Datos inválidos");
    return;
  }

  inventario.push({ nombre, stock, precio });

  const modal = container.querySelector("#modalAgregar");
  const bsModal = bootstrap.Modal.getInstance(modal);
  bsModal.hide();

  nombreInput.value = "";
  stockInput.value = "";
  precioInput.value = "";

  actualizarInventario();
}

function actualizarInventario() {
  const container = document.getElementById("contenido");
  if (!container) return;

  const cardsContainer = container.querySelector("#cardsInventario");
  if (!cardsContainer) return;

  const buscar = container.querySelector("#buscarProducto").value.toLowerCase();
  const filtro = container.querySelector("#filtroStock").value;

  cardsContainer.innerHTML = "";

  inventario.forEach((p, index) => {
    const nombreMatch = p.nombre.toLowerCase().includes(buscar);
    
    let stockMatch = true;
    if (filtro === "bajo") stockMatch = p.stock <= 10;
    else if (filtro === "medio") stockMatch = p.stock > 10 && p.stock <= 30;
    else if (filtro === "alto") stockMatch = p.stock > 30;

    if (!nombreMatch || !stockMatch) return;

    let badgeClass = p.stock <= 10 ? "bg-danger" : p.stock <= 30 ? "bg-warning" : "bg-success";
    let stockText = p.stock <= 10 ? "Bajo" : p.stock <= 30 ? "Medio" : "Alto";

    cardsContainer.innerHTML += `
      <div class="col-md-4 col-sm-6">
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <h5 class="card-title">${p.nombre}</h5>
              <span class="badge ${badgeClass}">${stockText}</span>
            </div>
            <p class="text-muted mb-1">Stock: <strong>${p.stock}</strong></p>
            <p class="text-success fw-bold mb-3">S/ ${p.precio}</p>
            <div class="d-flex gap-2">
              <button class="btn btn-warning btn-sm flex-grow-1" onclick="abrirEditar(${index})">Editar</button>
              <button class="btn btn-danger btn-sm" onclick="eliminarProducto(${index})">Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
}

function filtrarInventario() {
  actualizarInventario();
}

function eliminarProducto(index) {
  document.querySelector("#mensajeEliminar").textContent = `¿Estás seguro de eliminar "${inventario[index].nombre}"?`;
  document.querySelector("#indexEliminar").value = index;
  document.querySelector("#tipoEliminar").value = "inventario";
  const modal = document.querySelector("#modalConfirmar");
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();
}

function abrirEditar(index) {
  const container = document.getElementById("contenido");
  if (!container) return;

  const producto = inventario[index];
  
  container.querySelector("#indexEditar").value = index;
  container.querySelector("#nombreEditar").value = producto.nombre;
  container.querySelector("#stockEditar").value = producto.stock;
  container.querySelector("#precioEditar").value = producto.precio;
  
  const modal = container.querySelector("#modalEditar");
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();
}

function guardarEdicion() {
  const container = document.getElementById("contenido");
  if (!container) return;

  const index = parseInt(container.querySelector("#indexEditar").value);
  const nombre = container.querySelector("#nombreEditar").value;
  const stock = parseInt(container.querySelector("#stockEditar").value);
  const precio = parseFloat(container.querySelector("#precioEditar").value);

  if (!nombre || stock < 0 || precio <= 0) {
    alert("Datos inválidos");
    return;
  }

  inventario[index] = { nombre, stock, precio };

  const modal = container.querySelector("#modalEditar");
  const bsModal = bootstrap.Modal.getInstance(modal);
  bsModal.hide();

  actualizarInventario();
}

function cargarInventario() {
  actualizarInventario();
}