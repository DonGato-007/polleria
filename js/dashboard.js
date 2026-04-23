function cargarDashboard() {
  const container = document.getElementById("contenido");
  if (!container) return;

  const dashIngresos = container.querySelector("#dashIngresos");
  const dashGastos = container.querySelector("#dashGastos");
  const dashVentas = container.querySelector("#dashVentas");
  const dashSaldo = container.querySelector("#dashSaldo");
  const listaStock = container.querySelector("#listaStock");
  const graficoCaja = container.querySelector("#graficoCaja");

  if (!dashIngresos || !dashGastos || !dashVentas || !dashSaldo) return;

  let ingresos = 0;
  let egresos = 0;

  movimientos.forEach(m => {
    if (m.tipo === "ingreso") ingresos += m.monto;
    else egresos += m.monto;
  });

  let totalVentas = movimientos.filter(m => m.tipo === "ingreso").length;

  dashIngresos.innerText = ingresos;
  dashGastos.innerText = egresos;
  dashVentas.innerText = totalVentas;
  dashSaldo.innerText = ingresos - egresos;

  if (listaStock) {
    listaStock.innerHTML = "";
    inventario.forEach(p => {
      if (p.stock <= 5) {
        listaStock.innerHTML += `<li>${p.nombre} (Stock: ${p.stock})</li>`;
      }
    });
  }

  if (graficoCaja) {
    new Chart(graficoCaja, {
      type: 'bar',
      data: {
        labels: ['Ingresos', 'Gastos'],
        datasets: [{
          label: 'Soles',
          data: [ingresos, egresos]
        }]
      }
    });
  }
}