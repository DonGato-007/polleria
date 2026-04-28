/* ═══════════════════════════════════════════════
   DATA STORE (localStorage)
═══════════════════════════════════════════════ */
function getData(key, def=[]) {
  try { return JSON.parse(localStorage.getItem('fogon_' + key)) || def; } catch { return def; }
}
function setData(key, val) {
  localStorage.setItem('fogon_' + key, JSON.stringify(val));
}

// Seed initial inventory if empty
if (!localStorage.getItem('fogon_inventario')) {
  setData('inventario', [
    { nombre:'Pollo entero 🍗', stock:20, precio:35 },
    { nombre:'1/4 de pollo 🍖', stock:40, precio:10 },
    { nombre:'1/2 pollo 🍗', stock:30, precio:18 },
    { nombre:'Anticuchos 🥩', stock:25, precio:8 },
    { nombre:'Papas fritas 🍟', stock:50, precio:5 },
    { nombre:'Ensalada 🥗', stock:15, precio:4 },
    { nombre:'Gaseosa 600ml 🥤', stock:60, precio:3.5 },
    { nombre:'Chicha morada 🫙', stock:30, precio:3 },
  ]);
}
if (!localStorage.getItem('fogon_caja')) {
  setData('caja', [
    { tipo:'ingreso', monto:350, descripcion:'Ventas del turno mañana', fecha:'2025-04-23' },
    { tipo:'egreso',  monto:80,  descripcion:'Compra de carbón',        fecha:'2025-04-23' },
    { tipo:'ingreso', monto:520, descripcion:'Ventas del turno noche',  fecha:'2025-04-22' },
  ]);
}
if (!localStorage.getItem('fogon_gastos')) {
  setData('gastos', [
    { descripcion:'Compra de pollos (proveedor)', monto:420, fecha:'2025-04-23' },
    { descripcion:'Gas',                          monto:55,  fecha:'2025-04-22' },
    { descripcion:'Sueldo personal',              monto:600, fecha:'2025-04-21' },
  ]);
}
if (!localStorage.getItem('fogon_ventas')) {
  setData('ventas', []);
}

/* ═══════════════════════════════════════════════
   AUTH
═══════════════════════════════════════════════ */
const CREDENTIALS = { user:'admin', pass:'fogon2024' };

function doLogin() {
  const u = document.getElementById('loginUser').value.trim();
  const p = document.getElementById('loginPass').value;
  const err = document.getElementById('loginError');
  if (u === CREDENTIALS.user && p === CREDENTIALS.pass) {
    err.classList.remove('show');
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('adminShell').classList.add('active');
    loadView('dashboard');
  } else {
    err.classList.add('show');
    document.getElementById('loginPass').value = '';
    document.getElementById('loginPass').focus();
  }
}

function doLogout() {
  if (!confirm('¿Cerrar sesión?')) return;
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('adminShell').classList.remove('active');
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
}

/* ═══════════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════════ */
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('show');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('show');
}

/* ═══════════════════════════════════════════════
   ROUTER — fetch each view's HTML
═══════════════════════════════════════════════ */
const VIEW_FILES = {
  dashboard: 'vistas/dashboard.html',
  reportes:  'vistas/reportes.html',
  venta:     'vistas/venta.html',
  inventario:'vistas/inventario.html',
  caja:      'vistas/caja.html',
  finanzas:  'vistas/finanzas.html',
};

const VIEW_TITLES = {
  dashboard: 'Dashboard',
  reportes:  'Reportes',
  venta:     'Punto de Venta',
  inventario:'Inventario',
  caja:      'Caja',
  finanzas:  'Gastos / Finanzas',
};

// Track which views have been rendered
const rendered = {};
let currentView = 'dashboard';

async function loadView(name) {
  // Update active nav
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.querySelectorAll(`.nav-item`).forEach(el => {
    if (el.getAttribute('onclick') && el.getAttribute('onclick').includes(`'${name}'`))
      el.classList.add('active');
  });

  // Update title
  document.getElementById('pageTitle').textContent = VIEW_TITLES[name] || name;
  currentView = name;
  closeSidebar();

  // Hide all panes
  document.querySelectorAll('.view-pane').forEach(p => p.classList.remove('active'));
  const pane = document.getElementById('view-' + name);
  pane.classList.add('active');

  if (rendered[name]) {
    // Already loaded - just refresh dynamic content
    refreshView(name);
    return;
  }

  // Show loading
  pane.innerHTML = `<div class="view-loading"><div class="spinner"></div><span>Cargando ${VIEW_TITLES[name]}…</span></div>`;

  try {
    const res = await fetch(VIEW_FILES[name]);
    if (!res.ok) throw new Error('No se pudo cargar la vista');
    const html = await res.text();

    // Strip full document tags if present
    const stripped = html.replace(/<!DOCTYPE[^>]*>/gi,'')
                          .replace(/<html[^>]*>/gi,'').replace(/<\/html>/gi,'')
                          .replace(/<head[\s\S]*?<\/head>/gi,'')
                          .replace(/<body[^>]*>/gi,'').replace(/<\/body>/gi,'')
                          .replace(/<aside[\s\S]*?<\/aside>/gi,'') // remove old layout elements
                          .replace(/<div class="admin-content">/g,'').replace(/^(\s*<\/div>){0,1}/,'');
    pane.innerHTML = stripped;
    rendered[name] = true;
    refreshView(name);
  } catch(e) {
    pane.innerHTML = `<div class="view-loading"><i class="fa fa-triangle-exclamation" style="font-size:2rem;color:var(--accent2)"></i><span>${e.message}</span></div>`;
  }
}

function refreshView(name) {
  if (name === 'dashboard')  renderDashboard();
  if (name === 'reportes')   renderReportes();
  if (name === 'inventario') renderInventario();
  if (name === 'caja')       renderCaja();
  if (name === 'finanzas')   renderFinanzas();
  if (name === 'venta')      renderVenta();
}

/* ═══════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════ */
function renderDashboard() {
  const ventas   = getData('ventas');
  const caja     = getData('caja');
  const gastos   = getData('gastos');
  const inv      = getData('inventario');

  const today = new Date().toISOString().slice(0,10);
  const ventasHoy = ventas.filter(v => v.fecha === today).reduce((s,v)=>s+v.total,0);
  const ingCaja   = caja.filter(c=>c.tipo==='ingreso').reduce((s,c)=>s+Number(c.monto),0);
  const egrCaja   = caja.filter(c=>c.tipo==='egreso').reduce((s,c)=>s+Number(c.monto),0);
  const saldo     = ingCaja - egrCaja;
  const stockBajo = inv.filter(i=>i.stock < 5).length;

  const pane = document.getElementById('view-dashboard');
  pane.innerHTML = `
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-3">
        <div class="stat-card">
          <div class="stat-icon orange"><i class="fa fa-cash-register"></i></div>
          <div class="stat-info">
            <div class="label">Ventas hoy</div>
            <div class="value">S/ ${ventasHoy.toFixed(2)}</div>
            <div class="sub">${ventas.filter(v=>v.fecha===today).length} transacciones</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="stat-card">
          <div class="stat-icon pink"><i class="fa fa-file-invoice-dollar"></i></div>
          <div class="stat-info">
            <div class="label">Total gastos</div>
            <div class="value">S/ ${gastos.reduce((s,g)=>s+Number(g.monto),0).toFixed(2)}</div>
            <div class="sub">${gastos.length} registros</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="stat-card">
          <div class="stat-icon yellow"><i class="fa fa-vault"></i></div>
          <div class="stat-info">
            <div class="label">Saldo caja</div>
            <div class="value" style="color:${saldo>=0?'#4dffa0':'#ff6075'}">S/ ${saldo.toFixed(2)}</div>
            <div class="sub">${caja.length} movimientos</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="stat-card">
          <div class="stat-icon red"><i class="fa fa-triangle-exclamation"></i></div>
          <div class="stat-info">
            <div class="label">Stock bajo</div>
            <div class="value">${stockBajo}</div>
            <div class="sub">productos críticos</div>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-3">
      <div class="col-md-6">
        <div class="section-card">
          <div class="sc-header"><h5>📋 Últimas ventas</h5></div>
          <div class="sc-body">
            ${ventas.length === 0
              ? `<div style="text-align:center;padding:2rem;color:var(--gray)"><i class="fa fa-inbox" style="font-size:2rem;display:block;margin-bottom:.5rem"></i>Sin ventas registradas</div>`
              : `<table class="admin-table">
                  <thead><tr><th>Productos</th><th>Total</th><th>Fecha</th></tr></thead>
                  <tbody>
                    ${ventas.slice(-8).reverse().map(v=>`
                      <tr>
                        <td style="color:var(--gray);font-size:.8rem">${v.items.map(i=>i.nombre).join(', ').substring(0,40)}…</td>
                        <td><strong style="color:var(--accent2)">S/ ${v.total.toFixed(2)}</strong></td>
                        <td style="color:var(--gray);font-size:.78rem">${v.fecha}</td>
                      </tr>`).join('')}
                  </tbody>
                </table>`}
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="section-card">
          <div class="sc-header"><h5>📦 Inventario crítico</h5></div>
          <div class="sc-body">
            ${inv.filter(i=>i.stock<10).length===0
              ? `<div style="text-align:center;padding:2rem;color:var(--gray)"><i class="fa fa-check-circle" style="font-size:2rem;display:block;margin-bottom:.5rem;color:#4dffa0"></i>Todo en orden</div>`
              : `<table class="admin-table">
                  <thead><tr><th>Producto</th><th>Stock</th><th>Precio</th></tr></thead>
                  <tbody>
                    ${inv.filter(i=>i.stock<10).map(i=>`
                      <tr>
                        <td>${i.nombre}</td>
                        <td><span class="stock-pill ${i.stock<5?'stock-bajo':'stock-medio'}">${i.stock} u.</span></td>
                        <td>S/ ${Number(i.precio).toFixed(2)}</td>
                      </tr>`).join('')}
                  </tbody>
                </table>`}
          </div>
        </div>
      </div>
    </div>`;
}

/* ═══════════════════════════════════════════════
   REPORTES
   ═══════════════════════════════════════════════ */
const productosColores = {
  'pollo':      ['#e85c00', '#ffb300'],
  'broaster':   ['#008080', '#00d4aa'],
  'mixto':      ['#c0001a', '#ff4d88'],
  'salchi':     ['#d4a017', '#ffce44'],
  'chaufa':     ['#6a0dad', '#9b59b6'],
  'caldo':      ['#2e8b57', '#58d68d'],
  'milanesa':   ['#4a8a00', '#82e022'],
  'bebida':     ['#0066cc', '#5dade2'],
};

function getColorCat(nombre) {
  const n = nombre.toLowerCase();
  if (n.includes('pollo') || n.includes('bras')) return productosColores.pollo;
  if (n.includes('broaster')) return productosColores.broaster;
  if (n.includes('mixto')) return productosColores.mixto;
  if (n.includes('salchi') || n.includes('pap')) return productosColores.salchi;
  if (n.includes('chaufa') || n.includes('arroz')) return productosColores.chaufa;
  if (n.includes('caldo') || n.includes('aguadito')) return productosColores.caldo;
  if (n.includes('milanesa')) return productosColores.milanesa;
  if (n.includes('gaseosa') || n.includes('chicha') || n.includes('limon') || n.includes('maracuyá') || n.includes('bebida')) return productosColores.bebida;
  return ['#888', '#ccc'];
}

function filtrarReportes() {
  renderReportes();
}

function renderReportes() {
  // Guard: ensure Reportes module is available
  if (typeof Reportes === 'undefined') {
    console.error('Reportes module not loaded yet.');
    return;
  }

  // Guard: ensure all required DOM elements exist
  const requiredIds = ['ingHoy','totalPedidos','ticketProm','productoTop','chartVentas','tablaReportes','buscarReporte','filtroPeriodo','filtroCategoria'];
  for (const id of requiredIds) {
    if (!document.getElementById(id)) {
      console.warn('Reportes: missing element #' + id);
      return;
    }
  }

  const ventas = getData('ventas');
  
  // Build base report
  const salesData = Reportes.getSalesReport();
  
  // Apply filters
  let filtered = salesData;
  const periodo   = document.getElementById('filtroPeriodo').value;
  const buscar    = document.getElementById('buscarReporte').value.toLowerCase();
  const categoria = document.getElementById('filtroCategoria').value;

  filtered = Reportes.filterByPeriod(filtered, periodo);
  filtered = Reportes.filterByCategory(filtered, categoria);
  filtered = Reportes.filterBySearch(filtered, buscar);

  // Sort by total descending
  filtered.sort((a,b) => b.total - a.total);

  // Stats
  const totalGeneral = filtered.reduce((s,f) => s + f.total, 0);
  const totalCant    = filtered.reduce((s,f) => s + f.cantidad, 0);
  document.getElementById('ingHoy').textContent       = totalGeneral.toFixed(2);
  document.getElementById('totalPedidos').textContent = totalCant;
  document.getElementById('ticketProm').textContent   = totalCant ? (totalGeneral / totalCant).toFixed(2) : '0';
  document.getElementById('productoTop').textContent  = filtered[0]?.nombre.replace(/[^\u0020-\u007E\u00A0-\u00FF]/g,'').trim().substring(0,12) || '—';

  // — Chart —
  const chartContainer = document.getElementById('chartVentas');
  chartContainer.innerHTML = Reportes.generateBarChartHTML(filtered, 6);

  // — Table —
  const tbody = document.getElementById('tablaReportes');
  tbody.innerHTML = Reportes.generateTableRowsHTML(filtered);

  // ── Attach filter event listeners (only once)
  const pane = document.getElementById('view-reportes');
  if (!pane.dataset.listenersAttached) {
    const buscarInput = document.getElementById('buscarReporte');
    const periodoSel  = document.getElementById('filtroPeriodo');
    const categoriaSel= document.getElementById('filtroCategoria');

    const handler = () => renderReportes();
    buscarInput?.addEventListener('input', handler);
    periodoSel?.addEventListener('change', handler);
    categoriaSel?.addEventListener('change', handler);

    pane.dataset.listenersAttached = 'true';
  }
  }

  function exportarPDF() {
  alert('Función de exportación a PDF próximamente. Puedes usar la opción de impresión (Ctrl+P) como alternativa.');
}

/* ═══════════════════════════════════════════════
   INVENTARIO
   ═══════════════════════════════════════════════ */
function renderInventario() {
  const inv = getData('inventario');
  const pane = document.getElementById('view-inventario');

  // Inject toolbar + cards
  pane.querySelector('#cardsInventario') && renderInvCards('');
  // Hook the "nuevo" button and search
  const btn = pane.querySelector('[data-bs-target="#modalAgregar"], .btn-primary');
  if (btn) {
    btn.removeAttribute('data-bs-toggle');
    btn.removeAttribute('data-bs-target');
    btn.onclick = () => openInvModal(-1);
  }
  const buscar = pane.querySelector('#buscarProducto');
  if (buscar) buscar.oninput = () => renderInvCards(buscar.value);
  const filtro = pane.querySelector('#filtroStock');
  if (filtro) filtro.onchange = () => renderInvCards(buscar?.value || '');

  renderInvCards('');
}

function renderInvCards(query) {
  const inv = getData('inventario');
  const filtro = document.querySelector('#filtroStock')?.value || 'todos';
  const q = query.toLowerCase();

  const filtered = inv.filter((i,idx)=>{
    const matchQ = i.nombre.toLowerCase().includes(q);
    let matchF = true;
    if (filtro==='bajo')  matchF = i.stock < 5;
    if (filtro==='medio') matchF = i.stock >= 5 && i.stock < 20;
    if (filtro==='alto')  matchF = i.stock >= 20;
    return matchQ && matchF;
  });

  const container = document.getElementById('cardsInventario');
  if (!container) return;

  if (filtered.length === 0) {
    container.innerHTML = `<div class="col-12" style="text-align:center;padding:2rem;color:var(--gray)"><i class="fa fa-box-open" style="font-size:2rem;display:block;margin-bottom:.5rem"></i>Sin productos</div>`;
    return;
  }

  container.innerHTML = filtered.map((item) => {
    const idx = inv.indexOf(item);
    const stockClass = item.stock < 5 ? 'stock-bajo' : item.stock < 20 ? 'stock-medio' : 'stock-alto';
    return `
      <div class="col-6 col-md-4 col-lg-3">
        <div class="section-card" style="border-radius:12px">
          <div style="padding:1rem">
            <div style="font-size:1.4rem;margin-bottom:.4rem">${item.nombre.includes('🍗')||item.nombre.includes('🍖')||item.nombre.includes('🥩')||item.nombre.includes('🍟')||item.nombre.includes('🥗')||item.nombre.includes('🥤')||item.nombre.includes('🫙')?'':'📦'} ${item.nombre}</div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:.6rem">
              <span class="stock-pill ${stockClass}">${item.stock} u.</span>
              <strong style="color:var(--accent2)">S/ ${Number(item.precio).toFixed(2)}</strong>
            </div>
            <div style="display:flex;gap:.5rem;margin-top:.8rem">
              <button class="btn-sm-icon" style="flex:1" onclick="openInvModal(${idx})"><i class="fa fa-pen"></i> Editar</button>
              <button class="btn-sm-icon" onclick="eliminarInventario(${idx})"><i class="fa fa-trash" style="color:#ff6075"></i></button>
            </div>
          </div>
        </div>
      </div>`;
  }).join('');
}

function openInvModal(idx) {
  document.getElementById('invEditIdx').value = idx;
  const inv = getData('inventario');
  const isNew = idx < 0;
  document.getElementById('modalInvTitle').innerHTML = `<i class="fa fa-box"></i> ${isNew ? 'Nuevo' : 'Editar'} Producto`;
  if (!isNew) {
    const item = inv[idx];
    document.getElementById('invNombre').value = item.nombre;
    document.getElementById('invStock').value  = item.stock;
    document.getElementById('invPrecio').value = item.precio;
  } else {
    document.getElementById('invNombre').value = '';
    document.getElementById('invStock').value  = '';
    document.getElementById('invPrecio').value = '';
  }
  openModal('modalInventario');
}

function guardarInventario() {
  const idx    = Number(document.getElementById('invEditIdx').value);
  const nombre = document.getElementById('invNombre').value.trim();
  const stock  = Number(document.getElementById('invStock').value);
  const precio = Number(document.getElementById('invPrecio').value);
  if (!nombre) return alert('Ingresa el nombre del producto.');
  const inv = getData('inventario');
  if (idx < 0) inv.push({ nombre, stock, precio });
  else inv[idx] = { nombre, stock, precio };
  setData('inventario', inv);
  closeModal('modalInventario');
  renderInvCards('');
}

function eliminarInventario(idx) {
  if (!confirm('¿Eliminar este producto?')) return;
  const inv = getData('inventario');
  inv.splice(idx, 1);
  setData('inventario', inv);
  renderInvCards('');
}

/* ═══════════════════════════════════════════════
   CAJA
═══════════════════════════════════════════════ */
function renderCaja() {
  const pane = document.getElementById('view-caja');
  const btn = pane.querySelector('[data-bs-target="#modalMovimiento"], .btn-primary');
  if (btn) { btn.removeAttribute('data-bs-toggle'); btn.removeAttribute('data-bs-target'); btn.onclick = () => openModal('modalCaja'); }
  const buscar = pane.querySelector('#buscarMovimiento');
  if (buscar) buscar.oninput = () => renderMovimientos(buscar.value);
  const filtro = pane.querySelector('#filtroTipo');
  if (filtro) filtro.onchange = () => renderMovimientos(buscar?.value || '');
  renderMovimientos('');
}

function renderMovimientos(query) {
  const caja   = getData('caja');
  const filtro = document.querySelector('#filtroTipo')?.value || 'todos';
  const q = query.toLowerCase();
  const filtered = caja.filter(c => {
    const matchQ = c.descripcion.toLowerCase().includes(q);
    const matchF = filtro === 'todos' || c.tipo === filtro;
    return matchQ && matchF;
  });

  const total_ing = caja.filter(c=>c.tipo==='ingreso').reduce((s,c)=>s+Number(c.monto),0);
  const total_egr = caja.filter(c=>c.tipo==='egreso').reduce((s,c)=>s+Number(c.monto),0);
  const saldo = total_ing - total_egr;

  // Update stat spans
  const si = document.getElementById('totalIngresos');
  const se = document.getElementById('totalEgresos');
  const ss = document.getElementById('saldo');
  if (si) si.textContent = total_ing.toFixed(2);
  if (se) se.textContent = total_egr.toFixed(2);
  if (ss) { ss.textContent = saldo.toFixed(2); ss.style.color = saldo >= 0 ? '#4dffa0' : '#ff6075'; }

  const container = document.getElementById('listaMovimientos');
  if (!container) return;

  // Style the summary cards
  document.querySelectorAll('#view-caja .card').forEach((card,i) => {
    card.style.background = 'linear-gradient(135deg,#1e0018,#130010)';
    card.style.border = '1px solid rgba(255,179,0,.13)';
    card.style.borderRadius = '12px';
    card.style.color = '#fff';
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div class="col-12" style="text-align:center;padding:2rem;color:var(--gray)"><i class="fa fa-inbox" style="font-size:2rem;display:block;margin-bottom:.5rem"></i>Sin movimientos</div>`;
    return;
  }

  container.innerHTML = `<div class="col-12"><div style="display:flex;flex-direction:column;gap:.6rem">` +
    filtered.slice().reverse().map((m,i) => `
      <div class="mov-card ${m.tipo}">
        <div class="mov-left">
          <div class="mov-icon">${m.tipo==='ingreso'?'<i class="fa fa-arrow-trend-up"></i>':'<i class="fa fa-arrow-trend-down"></i>'}</div>
          <div>
            <div class="mov-desc">${m.descripcion}</div>
            <div class="mov-date">${m.fecha || '—'}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:.8rem">
          <div class="mov-amount">${m.tipo==='ingreso'?'+':'-'} S/ ${Number(m.monto).toFixed(2)}</div>
        </div>
      </div>`).join('') + `</div></div>`;
}

function guardarMovimiento() {
  const tipo   = document.getElementById('cajaTipo').value;
  const monto  = Number(document.getElementById('cajaMonto').value);
  const desc   = document.getElementById('cajaDesc').value.trim();
  if (!monto || !desc) return alert('Completa todos los campos.');
  const caja = getData('caja');
  caja.push({ tipo, monto, descripcion: desc, fecha: new Date().toISOString().slice(0,10) });
  setData('caja', caja);
  closeModal('modalCaja');
  renderMovimientos('');
}

/* ═══════════════════════════════════════════════
   GASTOS / FINANZAS
═══════════════════════════════════════════════ */
function renderFinanzas() {
  const pane = document.getElementById('view-finanzas');
  const btn = pane.querySelector('[data-bs-target="#modalGasto"], .btn-danger');
  if (btn) { btn.removeAttribute('data-bs-toggle'); btn.removeAttribute('data-bs-target'); btn.onclick = () => { document.getElementById('gastoEditIdx').value = -1; openModal('modalGastos'); }; }
  const buscar = pane.querySelector('#buscarGasto');
  if (buscar) buscar.oninput = () => renderGastos(buscar.value);
  const filtroF = pane.querySelector('#filtroFecha');
  if (filtroF) filtroF.onchange = () => renderGastos(buscar?.value||'');
  renderGastos('');
}

function renderGastos(query) {
  const gastos = getData('gastos');
  const fechaF = document.getElementById('filtroFecha')?.value;
  const q = query.toLowerCase();
  const filtered = gastos.filter(g => {
    const matchQ = g.descripcion.toLowerCase().includes(q);
    const matchF = !fechaF || g.fecha === fechaF;
    return matchQ && matchF;
  });

  const total = gastos.reduce((s,g)=>s+Number(g.monto),0);
  const tg = document.getElementById('totalGastos');
  if (tg) tg.textContent = total.toFixed(2);

  // style summary card
  document.querySelectorAll('#view-finanzas .card').forEach(c => {
    c.style.background='linear-gradient(135deg,#1e0018,#130010)';
    c.style.border='1px solid rgba(255,179,0,.13)';
    c.style.borderRadius='12px';
    c.style.color='#fff';
  });

  const container = document.getElementById('listaGastos');
  if (!container) return;

  if (filtered.length === 0) {
    container.innerHTML = `<div class="col-12" style="text-align:center;padding:2rem;color:var(--gray)"><i class="fa fa-inbox" style="font-size:2rem;display:block;margin-bottom:.5rem"></i>Sin gastos</div>`;
    return;
  }

  container.innerHTML = filtered.slice().reverse().map((g) => {
    const idx = gastos.indexOf(g);
    return `<div class="col-md-6 col-lg-4">
      <div class="section-card" style="border-radius:12px">
        <div style="padding:1rem;display:flex;align-items:flex-start;justify-content:space-between;gap:.5rem">
          <div>
            <div style="font-weight:700;font-size:.9rem;margin-bottom:.3rem">${g.descripcion}</div>
            <div style="font-size:.75rem;color:var(--gray)">${g.fecha||'—'}</div>
          </div>
          <div style="text-align:right;flex-shrink:0">
            <div style="font-size:1.1rem;font-weight:900;color:#ff6075">S/ ${Number(g.monto).toFixed(2)}</div>
            <div style="display:flex;gap:.4rem;margin-top:.5rem;justify-content:flex-end">
              <button class="btn-sm-icon" onclick="editarGasto(${idx})"><i class="fa fa-pen"></i></button>
              <button class="btn-sm-icon" onclick="eliminarGasto(${idx})"><i class="fa fa-trash" style="color:#ff6075"></i></button>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }).join('');
}

function editarGasto(idx) {
  const gastos = getData('gastos');
  const g = gastos[idx];
  document.getElementById('gastoEditIdx').value = idx;
  document.getElementById('gastoDesc').value  = g.descripcion;
  document.getElementById('gastoMonto').value = g.monto;
  document.getElementById('gastoFecha').value = g.fecha;
  openModal('modalGastos');
}

function guardarGasto() {
  const idx  = Number(document.getElementById('gastoEditIdx').value);
  const desc  = document.getElementById('gastoDesc').value.trim();
  const monto = Number(document.getElementById('gastoMonto').value);
  const fecha = document.getElementById('gastoFecha').value;
  if (!desc || !monto) return alert('Completa todos los campos.');
  const gastos = getData('gastos');
  if (idx < 0) gastos.push({ descripcion:desc, monto, fecha });
  else gastos[idx] = { descripcion:desc, monto, fecha };
  setData('gastos', gastos);
  closeModal('modalGastos');
  renderGastos('');
}

function eliminarGasto(idx) {
  if (!confirm('¿Eliminar este gasto?')) return;
  const gastos = getData('gastos');
  gastos.splice(idx, 1);
  setData('gastos', gastos);
  renderGastos('');
}

/* ═══════════════════════════════════════════════
   PUNTO DE VENTA
═══════════════════════════════════════════════ */
let ventaCarrito = [];
let ventaProdTemp = null;

function renderVenta() {
  ventaCarrito = [];
  const inv = getData('inventario');
  const container = document.getElementById('productosContainer');
  if (!container) return;

container.innerHTML = inv.map((item, idx) => {
            const icon = getIcon(item.nombre);
            const nameWithoutIcon = item.nombre.replace(icon, '').trim();
            return `
     <div class="col-6 col-md-4">
       <div class="prod-card" onclick="abrirModalCantidad(${idx})">
         <div class="prod-icon">${icon}</div>
         <div class="prod-name">${nameWithoutIcon}</div>
         <div class="prod-price">S/ ${Number(item.precio).toFixed(2)}</div>
         <div style="font-size:.72rem;color:${item.stock<5?'#ff6075':'var(--gray)'}">${item.stock} disponibles</div>
       </div>
     </div>`;
        }).join('');

  updateTicketUI();

  // Style the carrito card
  document.querySelectorAll('#view-venta .card').forEach(c => {
    c.style.background='linear-gradient(135deg,#1e0018,#130010)';
    c.style.border='1px solid rgba(255,179,0,.13)';
    c.style.borderRadius='12px';
    c.style.color='#fff';
  });
}

function getIcon(nombre) {
  const n = nombre.toLowerCase();
  if (n.includes('🍗')) return '🍗';
  if (n.includes('🍖')) return '🍖';
  if (n.includes('🥩')) return '🥩';
  if (n.includes('🍟')) return '🍟';
  if (n.includes('🥗')) return '🥗';
  if (n.includes('🥤')) return '🥤';
  if (n.includes('🫙')) return '🫙';
  if (n.includes('pollo')) return '🍗';
  if (n.includes('papa'))  return '🍟';
  if (n.includes('ensalada')) return '🥗';
  if (n.includes('gaseosa')||n.includes('bebida')) return '🥤';
  return '🍽️';
}

function abrirModalCantidad(idx) {
  const inv = getData('inventario');
  ventaProdTemp = idx;
  document.getElementById('cantProdNombre').textContent = inv[idx].nombre;
  document.getElementById('cantCantidad').value = 1;
  openModal('modalCantidad');
}

function confirmarAgregarVenta() {
  const inv = getData('inventario');
  const idx  = ventaProdTemp;
  const cant = Number(document.getElementById('cantCantidad').value) || 1;
  const item = inv[idx];
  const existing = ventaCarrito.find(c=>c.nombre===item.nombre);
  if (existing) existing.cantidad += cant;
  else ventaCarrito.push({ nombre: item.nombre, precio: Number(item.precio), cantidad: cant });
  closeModal('modalCantidad');
  updateTicketUI();
}

function updateTicketUI() {
  const tbody = document.getElementById('tablaCarrito');
  const totalEl = document.getElementById('totalVenta');
  if (!tbody) return;

  if (ventaCarrito.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--gray);padding:1rem">Carrito vacío</td></tr>`;
  } else {
    tbody.innerHTML = ventaCarrito.map((c,i) => `
      <tr style="font-size:.82rem">
        <td>${c.nombre.replace(/[^\u0020-\u007E\u00A0-\u00FF]/g,'').trim()}</td>
        <td>${c.cantidad}</td>
        <td>S/ ${(c.precio*c.cantidad).toFixed(2)}</td>
        <td><button class="btn-sm-icon" onclick="quitarDeCarrito(${i})"><i class="fa fa-x" style="font-size:.65rem"></i></button></td>
      </tr>`).join('');
  }
  const total = ventaCarrito.reduce((s,c)=>s+(c.precio*c.cantidad),0);
  if (totalEl) totalEl.textContent = total.toFixed(2);

  // Style table
  const table = tbody.closest('table');
  if (table) { table.style.color='#fff'; }
}

function quitarDeCarrito(i) {
  ventaCarrito.splice(i, 1);
  updateTicketUI();
}

function finalizarVenta() {
  if (ventaCarrito.length === 0) { alert('El carrito está vacío.'); return; }

  const inv = getData('inventario');
  // Discount stock
  ventaCarrito.forEach(c => {
    const item = inv.find(i=>i.nombre===c.nombre);
    if (item) item.stock = Math.max(0, item.stock - c.cantidad);
  });
  setData('inventario', inv);

  const total = ventaCarrito.reduce((s,c)=>s+(c.precio*c.cantidad),0);
  const fecha = new Date().toISOString().slice(0,10);

  // Save venta
  const ventas = getData('ventas');
  ventas.push({ items:[...ventaCarrito], total, fecha });
  setData('ventas', ventas);

  // Auto-register in caja
  const caja = getData('caja');
  const resumen = ventaCarrito.map(c=>`${c.cantidad}x ${c.nombre.replace(/[^\u0020-\u007E]/g,'').trim()}`).join(', ');
  caja.push({ tipo:'ingreso', monto:total, descripcion:'Venta: '+resumen.substring(0,60), fecha });
  setData('caja', caja);

  // Show ticket
  let ticket = `════════════════════\n`;
  ticket += `     🍗 EL FOGÓN\n`;
  ticket += `   Pollos a la Brasa\n`;
  ticket += `════════════════════\n`;
  ticket += `Fecha: ${fecha}\n`;
  ticket += `────────────────────\n`;
  ventaCarrito.forEach(c => {
    ticket += `${c.cantidad}x ${c.nombre.replace(/[^\u0020-\u007E]/g,'').trim().padEnd(15)} S/${(c.precio*c.cantidad).toFixed(2)}\n`;
  });
  ticket += `────────────────────\n`;
  ticket += `TOTAL: S/ ${total.toFixed(2)}\n`;
  ticket += `════════════════════\n`;
  ticket += `   ¡Gracias por\n   su preferencia!\n`;

  document.getElementById('ticketContent').textContent = ticket;
  openModal('modalTicket');
}

function cerrarVenta() {
  ventaCarrito = [];
  updateTicketUI();
  closeModal('modalTicket');
}

/* ═══════════════════════════════════════════════
   MODAL HELPERS
═══════════════════════════════════════════════ */
function openModal(id) {
  document.getElementById(id).classList.add('open');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// Close modal on backdrop click
document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
  backdrop.addEventListener('click', e => {
    if (e.target === backdrop) backdrop.classList.remove('open');
  });
});

/* ═══════════════════════════════════════════════
   BOOTSTRAP MODAL INTERCEPT
   (vistas use bootstrap modals — redirect to custom)
═══════════════════════════════════════════════ */
// Override any remaining bootstrap data attributes dynamically
document.addEventListener('click', e => {
  const btn = e.target.closest('[data-bs-toggle="modal"]');
  if (!btn) return;
  e.stopPropagation();
  const target = btn.getAttribute('data-bs-target');
  if (!target) return;
  // Map bootstrap modal targets to custom modals
  const map = {
    '#modalMovimiento': 'modalCaja',
    '#modalGasto':      'modalGastos',
    '#modalAgregar':    () => openInvModal(-1),
    '#modalEditar':     'modalInventario',
    '#modalCantidad':   'modalCantidad',
  };
  const action = map[target];
  if (typeof action === 'function') action();
  else if (action) openModal(action);
});

// Set today's date on gastos modal
document.getElementById('gastoFecha').valueAsDate = new Date();