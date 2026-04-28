/* ═════════════════════════════════════════════════════════════════════════════
   REPORTES.JS — Lógica de generación de reportes y estadísticas
   Módulo independiente para el sistema El Fogón
   ═════════════════════════════════════════════════════════════════════════════ */

(function(global) {
  'use strict';

  // ═══════════════════════════════════════════════
  // DATA ACCESS (localStorage)
  // ═══════════════════════════════════════════════
  const STORAGE_PREFIX = 'fogon_';

  function getData(key, def = []) {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + key);
      return raw ? JSON.parse(raw) : def;
    } catch (e) {
      console.warn('Error reading', key, e);
      return def;
    }
  }

  function setData(key, val) {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(val));
  }

  // ═══════════════════════════════════════════════
  // AGGREGATION ENGINE
  // ═══════════════════════════════════════════════
  /**
   * Aggregates all sales data into a summary map
   * @returns {Map<string, {cant: number, total: number, items: Array}>}
   */
  function aggregateSales() {
    const ventas = getData('ventas', []);
    const map = {};

    ventas.forEach(v => {
      if (!v.items || !Array.isArray(v.items)) return;
      v.items.forEach(i => {
        const key = i.nombre || String(i);
        if (!map[key]) {
          map[key] = { cant: 0, total: 0, items: [] };
        }
        const qty = Number(i.cantidad) || 1;
        const price = Number(i.precio) || 0;
        map[key].cant  += qty;
        map[key].total += qty * price;
        map[key].items.push({ ...i, cantidad: qty });
      });
    });

    return map;
  }

  /**
   * Aggregates sales with full detail (grouped by product)
   * @returns {Array<{nombre: string, cantidad: number, total: number, promedio: number}>}
   */
  function getSalesReport() {
    const map = aggregateSales();
    return Object.entries(map)
      .map(([nombre, datos]) => ({
        nombre,
        cantidad: datos.cant,
        total: datos.total,
        promedio: datos.cant ? datos.total / datos.cant : 0
      }))
      .sort((a, b) => b.total - a.total);
  }

  /**
   * Gets daily sales trend for the last N days
   * @param {number} days - Number of days to look back
   * @returns {Array<{fecha: string, total: number, pedidos: number}>}
   */
  function getDailyTrend(days = 7) {
    const ventas = getData('ventas', []);
    const trend = {};
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      trend[key] = { fecha: key, total: 0, pedidos: 0 };
    }

    ventas.forEach(v => {
      if (!v.fecha || trend[v.fecha] === undefined) return;
      trend[v.fecha].total  += Number(v.total) || 0;
      trend[v.fecha].pedidos += 1;
    });

    return Object.values(trend).reverse();
  }

  /**
   * Gets top-selling products
   * @param {number} limit - Max number of products to return
   * @returns {Array}
   */
  function getTopProducts(limit = 10) {
    return getSalesReport().slice(0, limit);
  }

  /**
   * Gets sales by category (grouped by type)
   * @returns {Object.<string, {total: number, cantidad: number}>}
   */
  function getSalesByCategory() {
    const map = aggregateSales();
    const cats = {
      'Pollo a la Brasa': { total: 0, cantidad: 0 },
      'Broaster':         { total: 0, cantidad: 0 },
      'Mixtos':           { total: 0, cantidad: 0 },
      'Salchipapa':       { total: 0, cantidad: 0 },
      'Chaufa':           { total: 0, cantidad: 0 },
      'Caldos':           { total: 0, cantidad: 0 },
      'Milanesa':         { total: 0, cantidad: 0 },
      'Bebidas':          { total: 0, cantidad: 0 },
      'Otros':           { total: 0, cantidad: 0 }
    };

    Object.entries(map).forEach(([nombre, datos]) => {
      const n = nombre.toLowerCase();
      let assigned = false;
      if (n.includes('pollo') || n.includes('bras') || n.includes('1/4') || n.includes('1/2') || n.includes('entero')) {
        cats['Pollo a la Brasa'].total += datos.total; cats['Pollo a la Brasa'].cantidad += datos.cant; assigned = true;
      }
      if (n.includes('broaster')) {
        cats['Broaster'].total += datos.total; cats['Broaster'].cantidad += datos.cant; assigned = true;
      }
      if (n.includes('mixto')) {
        cats['Mixtos'].total += datos.total; cats['Mixtos'].cantidad += datos.cant; assigned = true;
      }
      if (n.includes('salchi') || n.includes('salchipapa')) {
        cats['Salchipapa'].total += datos.total; cats['Salchipapa'].cantidad += datos.cant; assigned = true;
      }
      if (n.includes('chaufa') || n.includes('arroz')) {
        cats['Chaufa'].total += datos.total; cats['Chaufa'].cantidad += datos.cant; assigned = true;
      }
      if (n.includes('caldo') || n.includes('aguadito') || n.includes('sopa')) {
        cats['Caldos'].total += datos.total; cats['Caldos'].cantidad += datos.cant; assigned = true;
      }
      if (n.includes('milanesa')) {
        cats['Milanesa'].total += datos.total; cats['Milanesa'].cantidad += datos.cant; assigned = true;
      }
      if (n.includes('gaseosa') || n.includes('chicha') || n.includes('limon') || n.includes('maracuyá') || n.includes('bebida') || n.includes('agua')) {
        cats['Bebidas'].total += datos.total; cats['Bebidas'].cantidad += datos.cant; assigned = true;
      }
      if (!assigned) {
        cats['Otros'].total += datos.total; cats['Otros'].cantidad += datos.cant;
      }
    });

    return cats;
  }

  /**
   * Calculates basic KPIs from sales data
   * @param {Date} [fromDate] - Optional start date filter
   * @param {Date} [toDate] - Optional end date filter
   * @returns {Object} KPIs object
   */
  function getKPIs(fromDate = null, toDate = null) {
    const ventas = getData('ventas', []);
    const filtered = ventas.filter(v => {
      if (!v.fecha) return true;
      const f = new Date(v.fecha);
      if (fromDate && f < fromDate) return false;
      if (toDate && f > toDate) return false;
      return true;
    });

    const totalVentas   = filtered.length;
    const totalIngresos = filtered.reduce((s, v) => s + (Number(v.total) || 0), 0);
    const ticketPromedio = totalVentas ? totalIngresos / totalVentas : 0;

    // Clientes únicos (aproximado por ventas con mismo fecha+hora, o simplemente conteo de transacciones)
    // En un sistema con login real se haría por usuario registrado
    const clientesUnicos = totalVentas; // Fallback

    // Producto más vendido por cantidad
    const sales = getSalesReport();
    const topPorCantidad = sales[0] || null;

    return {
      totalVentas,
      totalIngresos: Number(totalIngresos.toFixed(2)),
      ticketPromedio: Number(ticketPromedio.toFixed(2)),
      clientesUnicos,
      topProductoCantidad: topPorCantidad ? {
        nombre: topPorCantidad.nombre,
        cantidad: topPorCantidad.cantidad
      } : null,
      topProductoIngresos: sales[0] || null
    };
  }

  /**
   * Gets sales summary for Today, This Week, This Month
   * @returns {Object}
   */
  function getPeriodSummary() {
    const ventas = getData('ventas', []);
    const today = new Date().toISOString().slice(0, 10);
    const thisMonth = new Date().toISOString().slice(0, 7);

    const stats = {
      hoy: { pedidos: 0, total: 0 },
      semana: { pedidos: 0, total: 0 },
      mes: { pedidos: 0, total: 0 }
    };

    ventas.forEach(v => {
      if (!v.fecha) return;
      const total = Number(v.total) || 0;

      if (v.fecha === today) {
        stats.hoy.pedidos += 1;
        stats.hoy.total  += total;
      }
      if (v.fecha.startsWith(thisMonth)) {
        stats.mes.pedidos += 1;
        stats.mes.total  += total;
      }
      const diffDays = (new Date(v.fecha) - new Date(today)) / (1000 * 60 * 60 * 24);
      if (diffDays >= -6 && diffDays <= 0) {
        stats.semana.pedidos += 1;
        stats.semana.total  += total;
      }
    });

    stats.hoy.total    = Number(stats.hoy.total.toFixed(2));
    stats.semana.total = Number(stats.semana.total.toFixed(2));
    stats.mes.total    = Number(stats.mes.total.toFixed(2));

    return stats;
  }

  // ═══════════════════════════════════════════════
  // FILTER UTILITIES
  // ═══════════════════════════════════════════════
  /**
   * Filters sales report by period — re-queries raw ventas to respect dates
   * @param {Array} sales - Aggregated sales report array
   * @param {string} periodo - 'hoy' | 'semana' | 'mes' | 'todo'
   * @returns {Array}
   */
  function filterByPeriod(sales, periodo) {
    if (periodo === 'todo') return sales;

    const ventas   = getData('ventas', []);
    const today    = new Date().toISOString().slice(0,10);
    const validSet = new Set();

    ventas.forEach(v => {
      if (!v.fecha) return;
      let ok = false;
      if (periodo === 'hoy')     ok = (v.fecha === today);
      if (periodo === 'semana')  ok = ((new Date() - new Date(v.fecha)) < 7*24*60*60*1000);
      if (periodo === 'mes')     ok = (v.fecha.startsWith(new Date().toISOString().slice(0,7)));
      if (!ok) return;
      if (v.items) {
        v.items.forEach(i => validSet.add(i.nombre));
      }
    });

    return sales.filter(s => validSet.has(s.nombre));
  }

  /**
   * Filters sales by category
   * @param {Array} sales - Aggregated sales report array
   * @param {string} categoria - 'todas' | 'brasas' | 'broaster' | 'mixtos' | 'bebidas'
   * @returns {Array}
   */
  function filterByCategory(sales, categoria) {
    if (categoria === 'todas') return sales;

    const catMap = {
      'brasas':   ['pollo', 'bras', '1/4', '1/2', 'entero'],
      'broaster': ['broaster'],
      'mixtos':   ['mixto'],
      'bebidas':  ['gaseosa', 'chicha', 'limon', 'maracuyá', 'bebida', 'agua']
    };

    const keywords = catMap[categoria] || [];
    return sales.filter(s => {
      const n = s.nombre.toLowerCase();
      return keywords.some(k => n.includes(k));
    });
  }

  /**
   * Filters sales by search text
   * @param {Array} sales - Aggregated sales report array
   * @param {string} query
   * @returns {Array}
   */
    function filterBySearch(sales, query) {
      if (!query) return sales;
      const q = query.toLowerCase();
      return sales.filter(s => s.nombre.toLowerCase().includes(q));
    }

  // ═══════════════════════════════════════════════
  // CHART GENERATION
  // ═══════════════════════════════════════════════
  const PRODUCT_COLORS = {
    pollo:     { start: '#e85c00', end: '#ffb300' },
    broaster:  { start: '#008080', end: '#00d4aa' },
    mixto:     { start: '#c0001a', end: '#ff4d88' },
    salchi:    { start: '#d4a017', end: '#ffce44' },
    chaufa:    { start: '#6a0dad', end: '#9b59b6' },
    caldo:     { start: '#2e8b57', end: '#58d68d' },
    milanesa:  { start: '#4a8a00', end: '#82e022' },
    bebida:    { start: '#0066cc', end: '#5dade2' },
    default:   { start: '#888888', end: '#cccccc' }
  };

  function getCategoryColors(nombre) {
    const n = nombre.toLowerCase();
    if (n.includes('pollo') || n.includes('bras')) return PRODUCT_COLORS.pollo;
    if (n.includes('broaster')) return PRODUCT_COLORS.broaster;
    if (n.includes('mixto')) return PRODUCT_COLORS.mixto;
    if (n.includes('salchi') || n.includes('pap')) return PRODUCT_COLORS.salchi;
    if (n.includes('chaufa') || n.includes('arroz')) return PRODUCT_COLORS.chaufa;
    if (n.includes('caldo') || n.includes('aguadito')) return PRODUCT_COLORS.caldo;
    if (n.includes('milanesa')) return PRODUCT_COLORS.milanesa;
    if (n.includes('gaseosa') || n.includes('chicha') || n.includes('limon') || n.includes('bebida')) return PRODUCT_COLORS.bebida;
    return PRODUCT_COLORS.default;
  }

  /**
   * Generates HTML for a vertical bar chart
   * @param {Array} data - Filtered sales data
   * @param {number} maxBars - Maximum bars to show
   * @returns {string} HTML string
   */
  function generateBarChartHTML(data, maxBars = 6) {
    if (!data || data.length === 0) return '<div class="text-muted text-center py-4">No hay datos para mostrar</div>';

    const maxVal = Math.max(...data.map(d => d.total), 1);
    const slice = data.slice(0, maxBars);

    return slice.map(d => {
      const heightPct = Math.max((d.total / maxVal) * 100, 3);
      const colors = getCategoryColors(d.nombre);
      const label = d.nombre.replace(/[^\u0020-\u007E\u00A0-\u00FF]/g, '').trim().substring(0, 10);
      const value = d.total.toFixed(0);

      return `
        <div class="chart-bar-wrapper" style="flex:1;display:flex;flex-direction:column;align-items:center;gap:.4rem;">
          <div class="chart-bar" style="
            width: 50px;
            height: ${heightPct}%;
            background: linear-gradient(180deg, ${colors.start}, ${colors.end});
            border-radius: 6px 6px 0 0;
            position: relative;
            transition: all .3s;
          ">
            <span class="chart-value" style="
              position: absolute;
              top: -20px;
              left: 50%;
              transform: translateX(-50%);
              font-size: .65rem;
              font-weight: 900;
              color: #fff;
              opacity: 0;
              transition: opacity .2s;
            ">S/ ${value}</span>
          </div>
          <span class="chart-label" style="
            font-size: .65rem;
            color: var(--gray, #aaa);
            text-align: center;
            font-weight: 700;
            text-transform: uppercase;
          ">${label}</span>
        </div>`;
    }).join('');
  }

  // ═══════════════════════════════════════════════
  // TABLE GENERATION
  // ═══════════════════════════════════════════════
  /**
   * Generates HTML table rows for the sales table
   * @param {Array} data
   * @returns {string}
   */
  function generateTableRowsHTML(data) {
    if (!data || data.length === 0) {
      return `<tr><td colspan="4" class="text-center text-muted py-3"><i class="fa fa-inbox"></i> Sin datos disponibles</td></tr>`;
    }

    const totalGeneral = data.reduce((s, d) => s + d.total, 0);

    return data.map(d => {
      const pct = totalGeneral ? ((d.total / totalGeneral) * 100).toFixed(1) : 0;
      const colors = getCategoryColors(d.nombre);
      const nameClean = d.nombre.replace(/[^\u0020-\u007E\u00A0-\u00FF]/g, '').trim();

      return `
        <tr>
          <td style="font-weight: 700;">
            <span style="
              display: inline-block;
              width: 8px; height: 8px;
              border-radius: 50%;
              background: ${colors.start};
              margin-right: .5rem;
            "></span>
            ${nameClean}
          </td>
          <td class="text-center">${d.cantidad}</td>
          <td class="text-end text-warning fw-semibold">S/ ${d.total.toFixed(2)}</td>
          <td class="text-center">
            <div class="progress" style="
              height: 6px;
              background: rgba(255,255,255,.1);
              border-radius: 3px;
            ">
              <div class="progress-bar" style="
                width: ${pct}%;
                background: linear-gradient(90deg, ${colors.start}, ${colors.end});
                border-radius: 3px;
              "></div>
            </div>
            <small class="text-muted">${pct}%</small>
          </td>
        </tr>`;
    }).join('');
  }

  // ═══════════════════════════════════════════════
  // EXPORT FUNCTIONS
  // ═══════════════════════════════════════════════
  /**
   * Exports current report data as CSV
   * @param {Array} data
   * @param {string} filename
   */
  function exportToCSV(data, filename = 'reporte_ventas.csv') {
    if (!data || data.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }

    const headers = ['Producto', 'Cantidad', 'Total (S/)', 'Promedio (S/)'];
    const rows = data.map(d => [
      `"${d.nombre}"`,
      d.cantidad,
      d.total.toFixed(2),
      d.promedio.toFixed(2)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }

  /**
   * Opens browser print dialog for PDF export
   */
  function exportToPDF() {
    // Simply trigger print; user can Save as PDF
    window.print();
  }

  // ═══════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════
  const Reportes = {
    // Data fetching
    getData,
    setData,
    aggregateSales,
    getSalesReport,
    getDailyTrend,
    getTopProducts,
    getSalesByCategory,
    getKPIs,
    getPeriodSummary,

    // Filters
    filterByPeriod,
    filterByCategory,
    filterBySearch,

    // Rendering
    getCategoryColors,
    generateBarChartHTML,
    generateTableRowsHTML,

    // Export
    exportToCSV,
    exportToPDF
  };

  // Expose globally
  global.Reportes = Reportes;

  // Also expose for console debugging
  if (typeof window !== 'undefined') {
    window.Reportes = Reportes;
  }
})(typeof window !== 'undefined' ? window : this);
