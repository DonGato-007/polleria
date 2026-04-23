let carrito = [];
let productoSeleccionado = null;

function cargarProductos() {
  const container = document.getElementById("contenido");
  if (!container) return;

  const productosContainer = container.querySelector("#productosContainer");
  if (!productosContainer) return;

  productosContainer.innerHTML = "";

  inventario.forEach((p, index) => {
    productosContainer.innerHTML += `
      <div class="col-md-4 col-sm-6">
        <div class="card h-100 producto-card" style="cursor:pointer" onclick="seleccionarProducto(${index})">
          <div class="card-body text-center">
            <h6 class="card-title">${p.nombre}</h6>
            <p class="text-success fw-bold">S/ ${p.precio}</p>
            <small class="text-muted">Stock: ${p.stock}</small>
          </div>
        </div>
      </div>
    `;
  });
}

function seleccionarProducto(index) {
  productoSeleccionado = inventario[index];
  
  const container = document.getElementById("contenido");
  const nombreModal = container.querySelector("#nombreProductoModal");
  const cantidadInput = container.querySelector("#cantidadProducto");
  const modal = container.querySelector("#modalCantidad");
  
  nombreModal.textContent = `${productoSeleccionado.nombre} - S/ ${productoSeleccionado.precio} (Stock: ${productoSeleccionado.stock})`;
  cantidadInput.value = 1;
  cantidadInput.max = productoSeleccionado.stock;
  
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();
}

function confirmarAgregar() {
  const container = document.getElementById("contenido");
  const cantidadInput = container.querySelector("#cantidadProducto");
  
  const producto = productoSeleccionado;
  const cantidad = parseInt(cantidadInput.value);
  
  if (!cantidad || cantidad <= 0) {
    alert("Cantidad inválida");
    return;
  }
  
  if (cantidad > producto.stock) {
    alert("No hay suficiente stock");
    return;
  }

  const existente = carrito.find(item => item.nombre === producto.nombre);
  if (existente) {
    const nuevaCant = existente.cantidad + cantidad;
    if (nuevaCant > producto.stock) {
      alert("No hay suficiente stock");
      return;
    }
    existente.cantidad = nuevaCant;
  } else {
    carrito.push({
      nombre: producto.nombre,
      cantidad,
      precio: producto.precio
    });
  }

  actualizarCarrito();
  
  const modal = container.querySelector("#modalCantidad");
  const bsModal = bootstrap.Modal.getInstance(modal);
  bsModal.hide();
}

function agregarAlCarrito() {
  const container = document.getElementById("contenido");
  if (!container) return;

  const productoSelect = container.querySelector("#productoSelect");
  const cantidadVenta = container.querySelector("#cantidadVenta");

  if (!productoSelect || !cantidadVenta) return;

  const index = productoSelect.value;
  const cantidad = parseInt(cantidadVenta.value);

  const producto = inventario[index];

  if (!cantidad || cantidad <= 0) {
    alert("Cantidad inválida");
    return;
  }

  if (cantidad > producto.stock) {
    alert("No hay suficiente stock");
    return;
  }

  const existente = carrito.find(item => item.nombre === producto.nombre);
  if (existente) {
    existente.cantidad += cantidad;
  } else {
    carrito.push({
      nombre: producto.nombre,
      cantidad,
      precio: producto.precio
    });
  }

  actualizarCarrito();
}

function actualizarCarrito() {
  const container = document.getElementById("contenido");
  if (!container) return;

  const tabla = container.querySelector("#tablaCarrito");
  const totalVenta = container.querySelector("#totalVenta");

  if (!tabla) return;

  tabla.innerHTML = "";

  let total = 0;

  carrito.forEach((item, index) => {
    const subtotal = item.cantidad * item.precio;
    total += subtotal;

    tabla.innerHTML += `
      <tr>
        <td>${item.nombre}</td>
        <td>${item.cantidad}</td>
        <td>S/ ${subtotal}</td>
        <td><button class="btn btn-sm btn-danger" onclick="eliminarDelCarrito(${index})">×</button></td>
      </tr>
    `;
  });

  if (totalVenta) totalVenta.innerText = total;
}

function eliminarDelCarrito(index) {
  carrito.splice(index, 1);
  actualizarCarrito();
}

function finalizarVenta() {
  if (carrito.length === 0) {
    alert("Carrito vacío");
    return;
  }

  let total = 0;

  let ticket = "🧾 TICKET DE VENTA\n";
  ticket += "====================\n";
  
  carrito.forEach(item => {
    total += item.cantidad * item.precio;
    ticket += `${item.nombre} x${item.cantidad} = S/ ${item.cantidad * item.precio}\n`;

    const producto = inventario.find(p => p.nombre === item.nombre);
    producto.stock -= item.cantidad;
  });

  ticket += "====================\n";
  ticket += `TOTAL: S/ ${total}\n`;
  ticket += "====================\n";
  ticket += "¡Gracias por su compra!";

  const container = document.getElementById("contenido");
  const contenidoTicket = container.querySelector("#contenidoTicket");
  contenidoTicket.textContent = ticket;
  
  const modal = container.querySelector("#modalTicket");
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();

  movimientos.push({
    tipo: "ingreso",
    monto: total,
    descripcion: "Venta realizada"
  });

  actualizarInventario();
  actualizarCaja();
}

function cerrarVenta() {
  carrito = [];
  actualizarCarrito();
}