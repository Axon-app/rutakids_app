/* """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
   RUTAKIDS - MAIN APPLICATION
   Handles application initialization, navigation, and events
   """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""" */

const App = (() => {
  'use strict';

  // 
  // STATE
  // 
  const state = {
    currentView: 'dashboard',
    calendarYear: 0,
    calendarMonth: 0,
    calendar2Year: 0,
    calendar2Month: 0,
    calendarView: 'month',
    calendar2View: 'month',
    selectedDate: '',
    manualDateSelection: false,
    selectedColor: 'blue',
    deleteChildId: '',
    statusSelection: { att: null, pay: null },
    dayModalDate: '',
    authUser: null,
    listenersBound: false,
    dataHooksInstalled: false,
    isHydratingCloud: false,
    cloudSaveTimer: null,
    authSubscription: null,
    autoDateTimer: null,
    deferredInstallPrompt: null,
    initStartedAt: 0,
    installHandlersBound: false
  };

  // View titles
  const VIEW_TITLES = {
    dashboard: 'Panel Principal',
    calendario: 'Calendario de Rutas',
    hijos: 'Mis Hijos',
    pagos: 'Control de Pagos',
    resumen: 'Resumenes',
    notificaciones: 'Notificaciones',
    configuracion: 'Configuracion'
  };

  const VALID_VIEWS = new Set(Object.keys(VIEW_TITLES));
  const GUIDE_SEEN_KEY = 'rutakids_guide_seen_v1';

  const esc = (value) => DataManager.escapeHTML(value);

  const getChildInitial = (name) => {
    const text = String(name || '').trim();
    if (!text) return 'N';
    return esc(text.charAt(0).toUpperCase());
  };

  const getSafeViewFromQuery = () => {
    const params = new URLSearchParams(window.location.search);
    const requested = (params.get('view') || '').trim().toLowerCase();
    return VALID_VIEWS.has(requested) ? requested : '';
  };

  // 
  // NAVIGATION
  // 
  
  /**
   * Navigate to a view
   */
  const navigateTo = (viewName) => {
    if (!VALID_VIEWS.has(viewName)) {
      viewName = 'dashboard';
    }

    state.currentView = viewName;

    // Update UI
    document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
    const viewElement = document.getElementById(`view-${viewName}`);
    if (viewElement) viewElement.classList.add('active');

    // Update navigation items
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.view === viewName);
    });
    document.querySelectorAll('.mn-item').forEach(el => {
      el.classList.toggle('active', el.dataset.mn === viewName);
    });

    // Update page title
    document.getElementById('page-h').textContent = VIEW_TITLES[viewName] || viewName;

    // Show/hide export button in topbar
    const exportBtn = document.getElementById('export-btn-topbar');
    const addChildBtn = document.getElementById('add-child-btn');
    
    if (viewName === 'pagos' || viewName === 'resumen') {
      exportBtn.style.display = 'block';
      addChildBtn.style.display = 'none';
    } else {
      exportBtn.style.display = 'none';
      addChildBtn.style.display = 'block';
    }

    // Render view content
    renderView(viewName);
    updateBadges();
  };

  /**
   * Render specific view
   */
  const renderView = (viewName) => {
    switch (viewName) {
      case 'dashboard':
        renderDashboard();
        break;
      case 'calendario':
        renderCalendario();
        break;
      case 'hijos':
        renderHijos();
        break;
      case 'pagos':
        renderPagos();
        break;
      case 'resumen':
        renderResumen();
        break;
      case 'notificaciones':
        UIManager.renderNotifications();
        break;
      case 'configuracion':
        renderConfiguracion();
        break;
    }
  };

  // 
  // DASHBOARD
  // 

  const syncSelectedDateWithToday = () => {
    if (state.manualDateSelection) return false;

    const today = new Date();
    const todayStr = DataManager.formatDate(today);

    if (state.selectedDate === todayStr) return false;

    state.selectedDate = todayStr;
    state.calendarYear = today.getFullYear();
    state.calendarMonth = today.getMonth();
    state.calendar2Year = today.getFullYear();
    state.calendar2Month = today.getMonth();
    return true;
  };

  const ensureSelectedDate = () => {
    if (!state.selectedDate) {
      const today = new Date();
      state.selectedDate = DataManager.formatDate(today);
      state.calendarYear = today.getFullYear();
      state.calendarMonth = today.getMonth();
      state.calendar2Year = today.getFullYear();
      state.calendar2Month = today.getMonth();
      return;
    }

    syncSelectedDateWithToday();
  };

  const getStartOfWeek = (date) => {
    const start = new Date(date);
    const dayIndex = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - dayIndex);
    return start;
  };

  const getEndOfWeek = (date) => {
    const start = getStartOfWeek(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return end;
  };

  const updateCalendarLeftPanel = (prefix, dateStr) => {
    const date = dateStr ? DataManager.parseDate(dateStr) : new Date();
    const dayName = DataManager.DAY_NAMES[date.getDay()];
    const dayNum = date.getDate();
    const monthYear = `${DataManager.MONTHS[date.getMonth()]} ${date.getFullYear()}`;
    const holidayName = dateStr ? DataManager.getHoliday(dateStr) : '';

    const dayEl = document.getElementById(`${prefix}-left-dayname`);
    const numEl = document.getElementById(`${prefix}-left-daynum`);
    const monthEl = document.getElementById(`${prefix}-left-monthyear`);

    if (dayEl) dayEl.textContent = holidayName ? 'DÍA FESTIVO' : dayName.toUpperCase();
    if (numEl) numEl.textContent = dayNum;
    if (monthEl) {
      monthEl.innerHTML = holidayName
        ? `${monthYear}<span class="cal-left-holiday-label">DÍA FESTIVO</span><span class="cal-left-holiday-title">${holidayName}</span>`
        : monthYear;
    }
  };

  const computeRangeStats = (startDate, endDate) => {
    const children = DataManager.getChildren();
    let totalIncome = 0;
    let tripsIn = 0;
    let tripsOut = 0;
    let paid = 0;
    let pending = 0;
    let paidAmount = 0;
    let attended = 0;
    let absent = 0;

    const current = new Date(startDate);
    while (current <= endDate) {
      const dateStr = DataManager.formatDate(current);
      children.forEach(child => {
        const status = DataManager.getStatus(child.id, dateStr);
        const breakdown = DataManager.getFareTotal(child, status);

        if (!status && breakdown.total === 0) return;

        totalIncome += breakdown.total;
        if (breakdown.tripIn) tripsIn++;
        if (breakdown.tripOut) tripsOut++;
        if (breakdown.pay === 'pagado') {
          paid++;
          paidAmount += breakdown.total;
        }
        else if (breakdown.pay === 'pendiente') pending++;
        if (breakdown.att === 'asistio') attended++;
        else if (breakdown.att === 'no') absent++;
      });
      current.setDate(current.getDate() + 1);
    }

    return { totalIncome, tripsIn, tripsOut, paid, pending, paidAmount, attended, absent };
  };

  const renderCalendarStats = (statsId, stats) => {
    const statsEl = document.getElementById(statsId);
    if (!statsEl) return;
    statsEl.innerHTML = `
      <div class="cal-stat"><span>Total pagado</span><strong>${DataManager.formatCurrency(stats.paidAmount || 0)}</strong></div>
      <div class="cal-stat"><span>Viajes</span><strong>Ida ${stats.tripsIn} · Regreso ${stats.tripsOut}</strong></div>
      <div class="cal-stat"><span>Pagos</span><strong>Pagado ${stats.paid} · Pendiente ${stats.pending}</strong></div>
      <div class="cal-stat"><span>Asistencia</span><strong>Asistió ${stats.attended}</strong></div>
    `;
  };

  const renderCalendarPanel = ({
    gridId,
    weekGridId,
    yearGridId,
    titleId,
    weekdaysId,
    statsId,
    view,
    year,
    month,
    dateStr,
    onDateClick
  }) => {
    const grid = document.getElementById(gridId);
    const weekGrid = document.getElementById(weekGridId);
    const yearGrid = document.getElementById(yearGridId);
    const titleEl = document.getElementById(titleId);
    const weekdaysEl = document.getElementById(weekdaysId);

    const selectedDate = dateStr || DataManager.formatDate(new Date());
    const dateObj = DataManager.parseDate(selectedDate);

    if (view === 'month') {
      if (weekdaysEl) weekdaysEl.style.display = 'grid';
      if (grid) grid.style.display = 'grid';
      if (weekGrid) weekGrid.style.display = 'none';
      if (yearGrid) yearGrid.style.display = 'none';
      UIManager.buildCalendar(gridId, year, month, selectedDate, onDateClick, { showLabels: false });
      if (titleEl) titleEl.textContent = `${DataManager.MONTHS[month]} ${year}`;
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0);
      renderCalendarStats(statsId, computeRangeStats(start, end));
    } else if (view === 'week') {
      if (weekdaysEl) weekdaysEl.style.display = 'grid';
      if (grid) grid.style.display = 'none';
      if (weekGrid) weekGrid.style.display = 'grid';
      if (yearGrid) yearGrid.style.display = 'none';
      UIManager.buildWeekCalendar(weekGridId, selectedDate, selectedDate, onDateClick);
      const start = getStartOfWeek(dateObj);
      const end = getEndOfWeek(dateObj);
      if (titleEl) titleEl.textContent = `Semana de ${start.getDate()} ${DataManager.MONTHS[start.getMonth()]} ${start.getFullYear()}`;
      renderCalendarStats(statsId, computeRangeStats(start, end));
    } else {
      if (weekdaysEl) weekdaysEl.style.display = 'none';
      if (grid) grid.style.display = 'none';
      if (weekGrid) weekGrid.style.display = 'none';
      if (yearGrid) yearGrid.style.display = 'grid';
      UIManager.buildYearCalendar(yearGridId, year, selectedDate, onDateClick);
      if (titleEl) titleEl.textContent = `Año ${year}`;
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31);
      renderCalendarStats(statsId, computeRangeStats(start, end));
    }
  };
  
  const renderDashboard = () => {
    const now = new Date();

    ensureSelectedDate();

    // Update calendar title
    updateCalendarLeftPanel('cal', state.selectedDate);

    // Update labels
    document.getElementById('pay-month-lbl').textContent = DataManager.MONTHS[now.getMonth()];
    document.getElementById('donut-month-lbl').textContent = DataManager.MONTHS[now.getMonth()];

    // Render components
    UIManager.renderMetrics();
    const calViewSelect = document.getElementById('cal-view-select');
    if (calViewSelect) calViewSelect.value = state.calendarView;
    renderCalendarPanel({
      gridId: 'cal-grid',
      weekGridId: 'cal-week-grid',
      yearGridId: 'cal-year-grid',
      titleId: 'cal-title',
      weekdaysId: 'cal-weekdays',
      statsId: 'cal-stats',
      view: state.calendarView,
      year: state.calendarYear,
      month: state.calendarMonth,
      dateStr: state.selectedDate,
      onDateClick: (dateStr) => {
        const holidayName = DataManager.getHoliday(dateStr);
        if (holidayName) {
          state.manualDateSelection = true;
          state.selectedDate = dateStr;
          state.calendarYear = DataManager.parseDate(dateStr).getFullYear();
          state.calendarMonth = DataManager.parseDate(dateStr).getMonth();
          updateCalendarLeftPanel('cal', state.selectedDate);
          renderDashboard();
          UIManager.showToast(holidayName);
          return;
        }
        state.manualDateSelection = true;
        state.selectedDate = dateStr;
        state.calendarYear = DataManager.parseDate(dateStr).getFullYear();
        state.calendarMonth = DataManager.parseDate(dateStr).getMonth();
        updateCalendarLeftPanel('cal', state.selectedDate);
        renderDashboard();
        openDayModal(dateStr);
      }
    });
    UIManager.buildDayDetail(state.selectedDate, 'dd-date-lbl', 'dd-children');
    UIManager.renderChildrenSidebar();
    UIManager.renderNotificationPreview();
    UIManager.renderPaymentTable();
    UIManager.renderDonutChart();

    // Attach click handlers to child rows
    attachChildRowHandlers();
  };

  // 
  // CALENDARIO VIEW
  // 
  
  const renderCalendario = () => {
    ensureSelectedDate();
    updateCalendarLeftPanel('cal2', state.selectedDate);
    const cal2ViewSelect = document.getElementById('cal2-view-select');
    if (cal2ViewSelect) cal2ViewSelect.value = state.calendar2View;

    renderCalendarPanel({
      gridId: 'cal-grid2',
      weekGridId: 'cal2-week-grid',
      yearGridId: 'cal2-year-grid',
      titleId: 'cal2-title',
      weekdaysId: 'cal2-weekdays',
      statsId: 'cal2-stats',
      view: state.calendar2View,
      year: state.calendar2Year,
      month: state.calendar2Month,
      dateStr: state.selectedDate,
      onDateClick: (dateStr) => {
        const holidayName = DataManager.getHoliday(dateStr);
        if (holidayName) {
          state.manualDateSelection = true;
          state.selectedDate = dateStr;
          state.calendar2Year = DataManager.parseDate(dateStr).getFullYear();
          state.calendar2Month = DataManager.parseDate(dateStr).getMonth();
          updateCalendarLeftPanel('cal2', state.selectedDate);
          renderCalendario();
          UIManager.showToast(holidayName);
          return;
        }
        state.manualDateSelection = true;
        state.selectedDate = dateStr;
        state.calendar2Year = DataManager.parseDate(dateStr).getFullYear();
        state.calendar2Month = DataManager.parseDate(dateStr).getMonth();
        updateCalendarLeftPanel('cal2', state.selectedDate);
        renderCalendario();
        openDayModal(dateStr);
      }
    });
  };

  // 
  // HIJOS VIEW
  // 
  
  const renderHijos = () => {
    const container = document.getElementById('hijos-grid');
    if (!container) return;

    const children = DataManager.getChildren();

    if (children.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <p>No hay hijos registrados.<br><br>
          <button class="btn btn-primary" onclick="App.openAddChildModal()">+ Agregar primer hijo</button></p>
        </div>
      `;
      return;
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    container.innerHTML = children.map(child => {
      let paid = 0;
      let pending = 0;
      const childName = esc(child.name);
      const childSchool = esc(child.school);
      const childInitial = getChildInitial(child.name);

      Object.entries(DataManager.getChildStatuses(child.id)).forEach(([dateStr, status]) => {
        const date = DataManager.parseDate(dateStr);
        
        if (date.getFullYear() === year && date.getMonth() === month) {
          const breakdown = DataManager.getFareTotal(child, status);
          if (breakdown.pay === 'pagado') {
            paid += breakdown.total;
          } else {
            pending += breakdown.total;
          }
        }
      });

      return `
        <div class="card" style="padding:20px">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
            <div style="width:50px;height:50px;border-radius:50%;background:${DataManager.COLORS[child.color]};display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:#fff;flex-shrink:0">
              ${childInitial}
            </div>
            <div style="flex:1">
              <div style="font-size:16px;font-weight:700">${childName}</div>
              <div style="font-size:12px;color:var(--text3)">${childSchool}</div>
            </div>
          </div>
          
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px">
            <div class="fare-box">
              <div class="fare-lbl"><i class="fas fa-sun"></i> Tarifa Ida</div>
              <div class="fare-val">${DataManager.formatCurrency(child.fareIn)}</div>
            </div>
            <div class="fare-box">
              <div class="fare-lbl"><i class="fas fa-moon"></i> Tarifa Regreso</div>
              <div class="fare-val">${DataManager.formatCurrency(child.fareOut)}</div>
            </div>
            <div class="fare-box">
              <div class="fare-lbl">Pagado (mes)</div>
              <div class="fare-val" style="color:var(--accent)">${DataManager.formatCurrency(paid)}</div>
            </div>
            <div class="fare-box">
              <div class="fare-lbl">⏳ Pendiente</div>
              <div class="fare-val" style="color:var(--warn)">${DataManager.formatCurrency(pending)}</div>
            </div>
          </div>
          
          <div style="margin-bottom:12px">
            <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:5px">DÍAS DE SERVICIO</div>
            <div style="display:flex;gap:3px">
              ${[1, 2, 3, 4, 5, 6, 0].map(d => `
                <div class="dchip ${child.days.includes(d) ? 'dchip-on' : 'dchip-off'}">
                  ${DataManager.DAY_MAP[d]}
                </div>
              `).join('')}
            </div>
          </div>
          
          <div style="display:flex;gap:7px">
            <button class="btn btn-ghost btn-sm" style="flex:1" data-edit="${child.id}">Editar</button>
            <button class="btn btn-danger btn-sm" style="flex:1" data-del="${child.id}">Eliminar</button>
          </div>
        </div>
      `;
    }).join('');

    // Attach event handlers
    container.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', () => openEditChildModal(btn.dataset.edit));
    });
    container.querySelectorAll('[data-del]').forEach(btn => {
      btn.addEventListener('click', () => openDeleteModal(btn.dataset.del));
    });
  };

  // 
  // PAGOS VIEW
  // 
  
  const renderPagos = () => {
    const container = document.getElementById('pagos-content');
    if (!container) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const children = DataManager.getChildren();

    let html = `
      <div class="card" style="overflow:hidden">
        <div class="card-head">
          <div class="card-title">Control de pagos — ${DataManager.MONTHS[month]} ${year}</div>
        </div>
    `;

    let hasPaymentRecords = false;

    children.forEach(child => {
      const paymentDays = [];
      const childName = esc(child.name);
      const childInitial = getChildInitial(child.name);
      
      Object.entries(DataManager.getChildStatuses(child.id)).forEach(([dateStr, status]) => {
        const date = DataManager.parseDate(dateStr);
        if (date.getFullYear() === year && date.getMonth() === month) {
          const breakdown = DataManager.getFareTotal(child, status);
          if (breakdown.total > 0) {
            paymentDays.push({
              date,
              dateStr,
              status,
              total: breakdown.total,
              fareIn: breakdown.fareIn,
              fareOut: breakdown.fareOut,
              isPaid: breakdown.pay === 'pagado'
            });
          }
        }
      });

      if (paymentDays.length === 0) return;

      hasPaymentRecords = true;
      paymentDays.sort((a, b) => a.date - b.date);

      const pendingDaysCount = paymentDays.filter(pd => !pd.isPaid).length;
      const totalMonthAmount = paymentDays.reduce((sum, pd) => sum + pd.total, 0);

      html += `
        <div style="padding:14px 20px;border-bottom:1px solid var(--border)">
          <div style="display:flex;align-items:center;gap:9px;margin-bottom:10px;flex-wrap:wrap">
            <div style="width:30px;height:30px;border-radius:50%;background:${DataManager.COLORS[child.color]};color:#fff;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center">
              ${childInitial}
            </div>
            <span style="font-weight:700">${childName}</span>
            <span class="sbadge ${pendingDaysCount > 0 ? 'sb-pendiente' : 'sb-pagado'}">${pendingDaysCount > 0 ? `${pendingDaysCount} pendientes` : 'Al día'}</span>
            <span class="sbadge" style="background:var(--warn-pale);color:var(--warn-dark);margin-left:auto">
              Total: ${DataManager.formatCurrency(totalMonthAmount)}
            </span>
          </div>
          ${paymentDays.map(pd => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:var(--surface2);border-radius:8px;margin-bottom:5px;border:1px solid var(--border)">
              <div style="text-decoration:${pd.isPaid ? 'line-through' : 'none'};opacity:${pd.isPaid ? '0.65' : '1'}">
                <div style="font-size:12px;font-weight:600;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                  ${DataManager.DAY_NAMES[pd.date.getDay()]} ${pd.date.getDate()} ${DataManager.MONTHS[pd.date.getMonth()]}
                  ${pd.isPaid ? '<span class="sbadge sb-pagado">Pagado</span>' : ''}
                </div>
                <div style="font-size:10px;color:var(--text3)">
                  Ida ${DataManager.formatCurrency(pd.fareIn)} + Regreso ${DataManager.formatCurrency(pd.fareOut)}
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
                <label style="display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:var(--text2);cursor:pointer">
                  <input type="checkbox" class="qpay-check" data-cid="${child.id}" data-ds="${pd.dateStr}" ${pd.isPaid ? 'checked' : ''}>
                  Pagado
                </label>
                <button class="btn btn-ghost btn-sm qpay-del-btn" data-cid="${child.id}" data-ds="${pd.dateStr}" title="Borrar registro" aria-label="Borrar registro">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    });

    if (!hasPaymentRecords) {
      html += `
        <div class="empty-state" style="padding:30px">
          <p>No hay pagos registrados en este mes.</p>
        </div>
      `;
    }

    html += '</div>';
    container.innerHTML = html;

    // Attach quick pay handlers
    container.querySelectorAll('.qpay-check').forEach(input => {
      input.addEventListener('change', () => {
        const childId = input.dataset.cid;
        const dateStr = input.dataset.ds;
        const child = DataManager.getChildById(childId);
        const status = DataManager.getStatus(childId, dateStr) || { att: 'asistio', pay: 'pendiente', nota: '', tripIn: true, tripOut: true, fareIn: child?.fareIn, fareOut: child?.fareOut };
        
        status.pay = input.checked ? 'pagado' : 'pendiente';
        DataManager.setStatus(childId, dateStr, status);
        
        UIManager.showToast(input.checked ? 'Pago registrado' : 'Pago marcado como pendiente');
        renderPagos();
        UIManager.renderMetrics();
        updateBadges();
      });
    });

    container.querySelectorAll('.qpay-del-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const childId = btn.dataset.cid;
        const dateStr = btn.dataset.ds;

        DataManager.clearStatus(childId, dateStr);

        UIManager.showToast('Registro eliminado');
        renderPagos();
        UIManager.renderMetrics();
        updateBadges();
      });
    });
  };

  // 
  // RESUMEN VIEW
  // 
  
  const renderResumen = () => {
    const container = document.getElementById('resumen-content');
    if (!container) return;

    const now = new Date();
    const year = now.getFullYear();
    const children = DataManager.getChildren();

    let html = '';

    for (let month = 0; month <= now.getMonth(); month++) {
      let monthPaid = 0;
      let monthPending = 0;
      let monthDays = 0;
      let monthTripIn = 0;
      let monthTripOut = 0;

      const rows = children.map(child => {
        let paid = 0;
        let pending = 0;
        let days = 0;
        let tripInCount = 0;
        let tripOutCount = 0;
        const childShortName = esc(String(child.name || '').split(' ')[0]);
        const childInitial = getChildInitial(child.name);

        Object.entries(DataManager.getChildStatuses(child.id)).forEach(([dateStr, status]) => {
          const date = DataManager.parseDate(dateStr);
          if (date.getFullYear() !== year || date.getMonth() !== month) return;
          if (date > now) return;

          days++;
          const breakdown = DataManager.getFareTotal(child, status);

          if (breakdown.pay === 'pagado') {
            paid += breakdown.total;
          } else {
            pending += breakdown.total;
          }

          if (breakdown.tripIn) tripInCount++;
          if (breakdown.tripOut) tripOutCount++;
        });

        monthPaid += paid;
        monthPending += pending;
        monthDays += days;
        monthTripIn += tripInCount;
        monthTripOut += tripOutCount;

        return { child, paid, pending, days, tripInCount, tripOutCount, childShortName, childInitial };
      }).filter(r => r.days > 0);

      if (rows.length === 0) continue;

      html += `
        <div class="card" style="margin-bottom:18px">
          <div class="card-head">
            <div class="card-title"><i class="fas fa-calendar-alt"></i> ${DataManager.MONTHS[month]} ${year}</div>
            <div style="display:flex;gap:7px;flex-wrap:wrap">
              <span class="sbadge sb-pagado">Pagado: ${DataManager.formatCurrency(monthPaid)}</span>
              <span class="sbadge sb-pendiente">Pend: ${DataManager.formatCurrency(monthPending)}</span>
            </div>
          </div>
          <div style="overflow-x:auto">
            <table class="weekly-table">
              <thead>
                <tr>
                  <th style="text-align:left">Niño</th>
                  <th style="text-align:center">Total días</th>
                  <th style="text-align:center">Días ida</th>
                  <th style="text-align:center">Días regreso</th>
                  <th style="text-align:center">Pagado</th>
                  <th style="text-align:center">Pendiente por pagar</th>
                  <th style="text-align:center">Total</th>
                </tr>
              </thead>
              <tbody>
                ${rows.map(r => `
                  <tr>
                    <td>
                      <div style="display:flex;align-items:center;gap:7px">
                        <div style="width:22px;height:22px;border-radius:50%;background:${DataManager.COLORS[r.child.color]};color:#fff;font-weight:800;font-size:10px;display:flex;align-items:center;justify-content:center">
                          ${r.childInitial}
                        </div>
                        ${r.childShortName}
                      </div>
                    </td>
                    <td style="text-align:center">${r.days}</td>
                    <td style="text-align:center"><span class="sbadge sb-asistio">${r.tripInCount}</span></td>
                    <td style="text-align:center"><span class="sbadge sb-pendiente">${r.tripOutCount}</span></td>
                    <td style="text-align:center;color:var(--accent);font-weight:700">${DataManager.formatCurrency(r.paid)}</td>
                    <td style="text-align:center;color:var(--warn);font-weight:700">${DataManager.formatCurrency(r.pending)}</td>
                    <td style="text-align:center;font-weight:700">${DataManager.formatCurrency(r.paid + r.pending)}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr style="background:var(--surface2)">
                  <td style="font-weight:700;padding:10px 12px">
                    TOTAL ${DataManager.MONTHS[month].toUpperCase()}
                  </td>
                  <td style="text-align:center;font-weight:700">${monthDays}</td>
                  <td style="text-align:center;font-weight:700">${monthTripIn}</td>
                  <td style="text-align:center;font-weight:700">${monthTripOut}</td>
                  <td style="text-align:center;color:var(--accent);font-weight:700">${DataManager.formatCurrency(monthPaid)}</td>
                  <td style="text-align:center;color:var(--warn);font-weight:700">${DataManager.formatCurrency(monthPending)}</td>
                  <td style="text-align:center;font-weight:700">${DataManager.formatCurrency(monthPaid + monthPending)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      `;
    }

    if (!html) {
      html = '<div class="empty-state"><p>No hay datos registrados aún.</p></div>';
    }

    container.innerHTML = html;
  };

  const renderConfiguracion = () => {
    const config = DataManager.getConfig();
    const user = DataManager.getUser();

    const nameInput = document.getElementById('cfg-name');
    const notifSelect = document.getElementById('cfg-notif');
    const daysInput = document.getElementById('cfg-days');

    if (nameInput) nameInput.value = user.name || '';

    if (notifSelect) {
      notifSelect.value = config.notificationsEnabled ? 'Activadas' : 'Desactivadas';
    }

    if (daysInput) {
      const safeDays = Number.isFinite(Number(config.paymentReminderDays))
        ? Number(config.paymentReminderDays)
        : 2;
      daysInput.value = String(Math.max(1, Math.min(7, safeDays)));
    }
  };

  const saveConfiguration = () => {
    const nameInput = document.getElementById('cfg-name');
    const notifSelect = document.getElementById('cfg-notif');
    const daysInput = document.getElementById('cfg-days');
    const currentConfig = DataManager.getConfig();
    const currentUser = DataManager.getUser();

    const name = String(nameInput?.value || '').trim() || currentUser.name || 'Usuario RutaKids';
    const notifValue = String(notifSelect?.value || 'Activadas');
    const notificationsEnabled = notifValue !== 'Desactivadas';
    const parsedDays = Number(daysInput?.value);
    const paymentReminderDays = Number.isFinite(parsedDays)
      ? Math.max(1, Math.min(7, Math.round(parsedDays)))
      : 2;

    DataManager.updateConfig({
      ...currentConfig,
      userName: name,
      notificationsEnabled,
      paymentReminderDays
    });

    DataManager.updateUser({
      ...currentUser,
      name,
      initials: getInitials(name)
    });

    updateSidebarUserUI();
    renderConfiguracion();
    UIManager.showToast('Configuración guardada');
  };

  // 
  // MODALS
  // 
  
  const openModal = (modalId) => {
    const modal = document.getElementById(`modal-${modalId}`);
    if (modal) modal.style.display = 'flex';
  };

  const closeModal = (modalId) => {
    const modal = document.getElementById(`modal-${modalId}`);
    if (modal) modal.style.display = 'none';
    if (modalId === 'install') {
      sessionStorage.setItem('rutakids_install_prompt_closed', '1');
    }
    if (modalId === 'guide') {
      localStorage.setItem(GUIDE_SEEN_KEY, '1');
    }
  };

  const openGuideModal = ({ force = false } = {}) => {
    if (!force && localStorage.getItem(GUIDE_SEEN_KEY) === '1') return;
    openModal('guide');
  };

  /**
   * Populate names datalist with existing unique names
   */
  const populateNamesList = () => {
    const datalist = document.getElementById('names-list');
    const uniqueNames = DataManager.getUniqueNames();
    
    datalist.innerHTML = '';
    uniqueNames.forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      datalist.appendChild(option);
    });
  };

  const setChildFormError = (message, invalidFieldIds = []) => {
    const errorEl = document.getElementById('child-error');
    const fields = ['f-name', 'f-school', 'f-in', 'f-out']
      .map(id => document.getElementById(id))
      .filter(Boolean);
    if (!errorEl) return;

    fields.forEach(input => input.classList.remove('is-invalid'));

    if (message) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
      invalidFieldIds.forEach(id => {
        const input = document.getElementById(id);
        if (input) input.classList.add('is-invalid');
      });
    } else {
      errorEl.textContent = '';
      errorEl.style.display = 'none';
    }
  };

  /**
   * Open add child modal
   */
  const openAddChildModal = () => {
    document.getElementById('mchild-title').innerHTML = 'Agregar Nuevo Hijo <i class="fas fa-user-plus"></i>';
    document.getElementById('f-id').value = '';
    ['f-name', 'f-school'].forEach(id => {
      document.getElementById(id).value = '';
    });
    document.getElementById('f-in').value = '';
    document.getElementById('f-out').value = '';
    
    // Reset day toggles to weekdays
    document.querySelectorAll('.dtoggle').forEach(el => {
      el.classList.toggle('on', [1, 2, 3, 4, 5].includes(Number(el.dataset.d)));
    });
    
    setColor('blue');
    populateNamesList();
    setChildFormError('');
    openModal('child');
  };

  /**
   * Open edit child modal
   */
  const openEditChildModal = (childId) => {
    const child = DataManager.getChildById(childId);
    if (!child) return;

    document.getElementById('mchild-title').innerHTML = 'Editar Información <i class="fas fa-user-edit"></i>';
    document.getElementById('f-id').value = childId;
    document.getElementById('f-name').value = child.name;
    document.getElementById('f-school').value = child.school;
    document.getElementById('f-in').value = child.fareIn;
    document.getElementById('f-out').value = child.fareOut;

    document.querySelectorAll('.dtoggle').forEach(el => {
      el.classList.toggle('on', child.days.includes(Number(el.dataset.d)));
    });

    setColor(child.color);
    populateNamesList();
    setChildFormError('');
    openModal('child');
  };

  /**
   * Save child (create or update)
   */
  const saveChild = () => {
    const name = document.getElementById('f-name').value.trim();
    const school = document.getElementById('f-school').value.trim();
    const fareInRaw = document.getElementById('f-in').value.trim();
    const fareOutRaw = document.getElementById('f-out').value.trim();
    const selectedDays = Array.from(document.querySelectorAll('.dtoggle.on')).map(el => Number(el.dataset.d));

    if (!name || !school) {
      setChildFormError('Nombre e institución son obligatorios.', ['f-name', 'f-school']);
      return;
    }

    if (name.length < 3) {
      setChildFormError('El nombre debe tener al menos 3 caracteres.', ['f-name']);
      return;
    }

    if (school.length < 3) {
      setChildFormError('La institución debe tener al menos 3 caracteres.', ['f-school']);
      return;
    }

    if (fareInRaw && (!Number.isFinite(Number(fareInRaw)) || Number(fareInRaw) < 0)) {
      setChildFormError('La tarifa de ida debe ser un número válido mayor o igual a 0.', ['f-in']);
      return;
    }

    if (fareOutRaw && (!Number.isFinite(Number(fareOutRaw)) || Number(fareOutRaw) < 0)) {
      setChildFormError('La tarifa de regreso debe ser un número válido mayor o igual a 0.', ['f-out']);
      return;
    }

    if (selectedDays.length === 0) {
      setChildFormError('Selecciona al menos un día de servicio.');
      return;
    }

    setChildFormError('');

    const fareIn = fareInRaw === '' ? 0 : Math.round(Number(fareInRaw));
    const fareOut = fareOutRaw === '' ? 0 : Math.round(Number(fareOutRaw));

    const childData = {
      name,
      school,
      address: '',
      fareIn,
      fareOut,
      days: selectedDays,
      color: state.selectedColor
    };

    const id = document.getElementById('f-id').value;

    if (id) {
      DataManager.updateChild(id, childData);
      UIManager.showToast('Información actualizada');
    } else {
      DataManager.addChild(childData);
      UIManager.showToast('Hijo agregado correctamente');
    }

    closeModal('child');
    renderView(state.currentView);
    UIManager.renderChildrenSidebar();
    UIManager.renderMetrics();
    updateBadges();
  };

  /**
   * Set color selection
   */
  const setColor = (color) => {
    state.selectedColor = color;
    document.querySelectorAll('.col-opt').forEach(el => {
      el.style.border = el.dataset.col === color ? '3px solid var(--primary)' : '3px solid transparent';
    });
  };

  /**
   * Open status edit modal
   */
  const openStatusModal = (childId, dateStr) => {
    const child = DataManager.getChildById(childId);
    if (!child) return;

    document.getElementById('s-cid').value = childId;
    document.getElementById('s-date').value = dateStr;

    const date = DataManager.parseDate(dateStr);
    const dow = date.getDay();
    const [year, month, day] = dateStr.split('-');

    document.getElementById('mstatus-title').textContent = 
      `${child.name.split(' ')[0]}  ${DataManager.DAY_NAMES[dow]} ${parseInt(day)} ${DataManager.MONTHS[parseInt(month) - 1]}`;

    document.getElementById('s-info').innerHTML = `
      <div style="font-size:11px;color:var(--text3);font-weight:600;margin-bottom:6px">${esc(child.school)}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
        <div style="font-size:12px"><i class="fas fa-sun"></i> Ida: <strong>${DataManager.formatCurrency(child.fareIn)}</strong></div>
        <div style="font-size:12px"><i class="fas fa-moon"></i> Regreso: <strong>${DataManager.formatCurrency(child.fareOut)}</strong></div>
      </div>
    `;

    const status = DataManager.getStatus(childId, dateStr);
    document.getElementById('s-nota').value = status?.nota || '';

    state.statusSelection = {
      att: status?.att || null,
      pay: status?.pay || null
    };

    // Reset button states
    document.querySelectorAll('.status-btn').forEach(el => el.className = 'status-btn');

    // Highlight selected states
    if (state.statusSelection.att) {
      const btn = document.querySelector(`.status-btn[data-s="att"][data-v="${state.statusSelection.att}"]`);
      if (btn) btn.classList.add(`sel-${state.statusSelection.att}`);
    }
    if (state.statusSelection.pay) {
      const btn = document.querySelector(`.status-btn[data-s="pay"][data-v="${state.statusSelection.pay}"]`);
      if (btn) btn.classList.add(`sel-${state.statusSelection.pay}`);
    }

    openModal('status');
  };

  /**
   * Save status
   */
  const saveStatus = () => {
    const childId = document.getElementById('s-cid').value;
    const dateStr = document.getElementById('s-date').value;

    DataManager.setStatus(childId, dateStr, {
      att: state.statusSelection.att || 'pendiente',
      pay: state.statusSelection.pay || 'pendiente',
      nota: document.getElementById('s-nota').value
    });

    closeModal('status');
    UIManager.showToast('Estado guardado');
    
    renderView(state.currentView);
    if (state.selectedDate) {
      UIManager.buildDayDetail(state.selectedDate, 'dd-date-lbl', 'dd-children');
      attachChildRowHandlers();
    }
    updateBadges();
  };

  /**
   * Build and open day modal for bulk trip editing
   */
  const openDayModal = (dateStr) => {
    const holidayName = DataManager.getHoliday(dateStr);
    if (holidayName) {
      UIManager.showToast(holidayName);
      return;
    }

    state.dayModalDate = dateStr;
    const date = DataManager.parseDate(dateStr);
    document.getElementById('d-date').value = dateStr;
    document.getElementById('mday-title').textContent = `${DataManager.DAY_NAMES[date.getDay()]} ${date.getDate()} de ${DataManager.MONTHS[date.getMonth()]} ${date.getFullYear()}`;

    const container = document.getElementById('day-form-rows');
    const children = DataManager.getChildren();

    if (children.length === 0) {
      container.innerHTML = '<div class="no-service">No hay niños registrados</div>';
      document.getElementById('day-total-val').textContent = DataManager.formatCurrency(0);
      openModal('day');
      return;
    }

    container.innerHTML = children.map(child => {
      const status = DataManager.getStatus(child.id, dateStr);
      const breakdown = DataManager.getFareTotal(child, status);
      const childName = esc(child.name);
      const baseFareIn = Number(child.fareIn) || 0;
      const baseFareOut = Number(child.fareOut) || 0;

      return `
        <div class="day-student-block" data-cid="${child.id}" data-fare-in="${baseFareIn}" data-fare-out="${baseFareOut}">
          <div class="day-student-name">${childName}</div>
          <div class="day-trip-row">
            <label class="trip-check-wrap">
              <input class="trip-check trip-in" type="checkbox" ${breakdown.tripIn ? 'checked' : ''}>
              <span class="trip-label ida-label">Ida</span>
            </label>
            <div class="trip-fare-value">${DataManager.formatCurrency(baseFareIn)}</div>
          </div>
          <div class="day-trip-row">
            <label class="trip-check-wrap">
              <input class="trip-check trip-out" type="checkbox" ${breakdown.tripOut ? 'checked' : ''}>
              <span class="trip-label regreso-label">Regreso</span>
            </label>
            <div class="trip-fare-value">${DataManager.formatCurrency(baseFareOut)}</div>
          </div>
        </div>
      `;
    }).join('');

    updateDayTotals();
    openModal('day');
  };

  /**
   * Update per-row and overall totals in the day modal
   */
  const updateDayTotals = () => {
    const blocks = document.querySelectorAll('#day-form-rows .day-student-block');
    let dayTotal = 0;

    blocks.forEach(block => {
      const baseFareIn = Number(block.dataset.fareIn) || 0;
      const baseFareOut = Number(block.dataset.fareOut) || 0;
      const hasTripIn = Boolean(block.querySelector('.trip-in')?.checked);
      const hasTripOut = Boolean(block.querySelector('.trip-out')?.checked);

      dayTotal += (hasTripIn ? baseFareIn : 0) + (hasTripOut ? baseFareOut : 0);
    });

    document.getElementById('day-total-val').textContent = DataManager.formatCurrency(dayTotal);
  };

  /**
   * Save bulk day data
   */
  const saveDayModal = () => {
    const dateStr = document.getElementById('d-date').value;
    const blocks = document.querySelectorAll('#day-form-rows .day-student-block');
    if (blocks.length === 0) {
      closeModal('day');
      return;
    }

    blocks.forEach(block => {
      const childId = block.dataset.cid;
      const baseFareIn = Number(block.dataset.fareIn) || 0;
      const baseFareOut = Number(block.dataset.fareOut) || 0;
      const hasTripIn = Boolean(block.querySelector('.trip-in')?.checked);
      const hasTripOut = Boolean(block.querySelector('.trip-out')?.checked);
      const fareIn = hasTripIn ? baseFareIn : 0;
      const fareOut = hasTripOut ? baseFareOut : 0;
      const existing = DataManager.getStatus(childId, dateStr) || {};

      DataManager.setStatus(childId, dateStr, {
        att: (hasTripIn || hasTripOut) ? 'asistio' : 'no',
        pay: existing.pay || 'pendiente',
        nota: existing.nota || '',
        tripIn: hasTripIn,
        tripOut: hasTripOut,
        fareIn,
        fareOut
      });
    });

    closeModal('day');
    UIManager.showToast('Día actualizado');
    renderView(state.currentView);
    updateBadges();
  };

  /**
   * Clear all statuses for the selected day
   */
  const clearDayData = () => {
    if (!state.dayModalDate) return;
    DataManager.clearDateStatuses(state.dayModalDate);
    UIManager.showToast('Día limpiado correctamente');
    closeModal('clear-day');
    closeModal('day');
    renderView(state.currentView);
    updateBadges();
  };

  /**
   * Open clear day confirmation modal
   */
  const openClearDayModal = () => {
    if (!state.dayModalDate) return;
    const date = DataManager.parseDate(state.dayModalDate);
    const dateText = `${DataManager.DAY_NAMES[date.getDay()]} ${date.getDate()} de ${DataManager.MONTHS[date.getMonth()]} ${date.getFullYear()}`;
    document.getElementById('clear-day-date').textContent = dateText;
    openModal('clear-day');
  };

  /**
   * Open delete confirmation modal
   */
  const openDeleteModal = (childId) => {
    state.deleteChildId = childId;
    const child = DataManager.getChildById(childId);
    document.getElementById('del-name').textContent = child?.name || 'este hijo';
    openModal('del');
  };

  /**
   * Confirm child deletion
   */
  const confirmDelete = () => {
    DataManager.deleteChild(state.deleteChildId);
    state.deleteChildId = '';
    closeModal('del');
    UIManager.showToast('Hijo eliminado');
    renderView(state.currentView);
    UIManager.renderChildrenSidebar();
    UIManager.renderMetrics();
    updateBadges();
  };

  // 
  // UTILITY FUNCTIONS
  // 
  
  /**
   * Update badge counts
   */
  const updateBadges = () => {
    // Pending payments count
    let pendingCount = 0;
    const children = DataManager.getChildren();
    children.forEach(child => {
      Object.values(DataManager.getChildStatuses(child.id)).forEach(status => {
        if (status.pay === 'pendiente') pendingCount++;
      });
    });
    document.getElementById('sb-pay').textContent = pendingCount;

    // Notification count
    const notifCount = UIManager.generateNotifications().filter(n => n.unread).length;
    document.getElementById('sb-notif').textContent = notifCount;
    document.getElementById('notif-dot').style.display = notifCount > 0 ? 'block' : 'none';
  };

  /**
   * Attach click handlers to child rows
   */
  const attachChildRowHandlers = (containerId = 'dd-children') => {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.querySelectorAll('.child-row').forEach(row => {
      row.addEventListener('click', () => {
        openStatusModal(row.dataset.cid, row.dataset.ds);
      });
    });
  };

  /**
   * Initialize page subtitle
   */
  const updatePageSubtitle = () => {
    const now = new Date();
    const dayName = DataManager.DAY_NAMES[now.getDay()];
    const day = now.getDate();
    const month = DataManager.MONTHS[now.getMonth()];
    const year = now.getFullYear();

    document.getElementById('page-sub').textContent = 
      `${dayName}, ${day} de ${month} ${year} - Semana activa`;
  };

  const getInitials = (name = '') => {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0].toUpperCase())
      .join('') || 'RK';
  };

  const showAuthScreen = (message = '') => {
    const authScreen = document.getElementById('auth-screen');
    const shell = document.querySelector('.shell');
    if (authScreen) authScreen.style.display = 'flex';
    if (shell) shell.style.display = 'none';
    setAuthMessage(message, Boolean(message));
  };

  const showAppScreen = () => {
    const authScreen = document.getElementById('auth-screen');
    const shell = document.querySelector('.shell');
    if (authScreen) authScreen.style.display = 'none';
    if (shell) shell.style.display = 'grid';
  };

  const setAuthMessage = (message, isError = true) => {
    const errorEl = document.getElementById('auth-error');
    if (!errorEl) return;

    if (!message) {
      errorEl.style.display = 'none';
      errorEl.textContent = '';
      return;
    }

    errorEl.style.display = 'block';
    errorEl.textContent = message;
    errorEl.style.background = isError ? 'var(--danger-pale)' : 'var(--accent-pale)';
    errorEl.style.color = isError ? 'var(--danger)' : 'var(--accent-dark)';
    errorEl.style.border = isError
      ? '1px solid rgba(240, 62, 62, 0.35)'
      : '1px solid rgba(18, 184, 134, 0.35)';
  };

  const updateSidebarUserUI = () => {
    const user = DataManager.getUser();
    const initialsEl = document.getElementById('sidebar-user-initials');
    const nameEl = document.getElementById('sidebar-user-name');
    const topbarInitialsEl = document.getElementById('topbar-user-initials');
    const topbarNameEl = document.getElementById('topbar-user-name');
    const initials = user.initials || getInitials(user.name);
    const name = user.name || 'Usuario';

    if (initialsEl) initialsEl.textContent = initials;
    if (nameEl) nameEl.textContent = name;
    if (topbarInitialsEl) topbarInitialsEl.textContent = initials;
    if (topbarNameEl) topbarNameEl.textContent = name;
  };

  const setAuthButtonsLoading = (loading) => {
    const loginBtn = document.getElementById('auth-login-btn');
    const registerBtn = document.getElementById('auth-register-btn');
    if (loginBtn) loginBtn.disabled = loading;
    if (registerBtn) registerBtn.disabled = loading;
  };

  const translateAuthError = (error, fallbackMessage) => {
    const raw = (error?.message || '').trim();
    const message = raw.toLowerCase();

    if (!message) return fallbackMessage;

    if (message.includes('invalid login credentials')) {
      return 'Correo o contraseña incorrectos. Si no recuerdas la clave, usa "¿Olvidaste tu contraseña?".';
    }

    if (message.includes('email not confirmed')) {
      return 'Tu correo aún no está confirmado. Revisa tu bandeja y confirma la cuenta.';
    }

    if (message.includes('for security purposes') || message.includes('can only request this after')) {
      return 'Por seguridad, debes esperar unos segundos antes de solicitarlo nuevamente.';
    }

    if (message.includes('user already registered')) {
      return 'Este correo ya está registrado. Inicia sesión o usa "¿Olvidaste tu contraseña?".';
    }

    if (message.includes('password should be at least')) {
      return 'La contraseña debe tener mínimo 6 caracteres.';
    }

    if (message.includes('unable to validate email address') || message.includes('invalid email')) {
      return 'El correo ingresado no es válido.';
    }

    if (message.includes('signup is disabled')) {
      return 'El registro de usuarios está deshabilitado temporalmente.';
    }

    return fallbackMessage;
  };

  const scheduleCloudSave = () => {
    if (!state.authUser || state.isHydratingCloud) return;
    if (state.cloudSaveTimer) clearTimeout(state.cloudSaveTimer);

    state.cloudSaveTimer = setTimeout(async () => {
      try {
        await CloudManager.saveUserData(state.authUser.id, DataManager.exportData());
      } catch (error) {
        console.error('Error guardando en la nube:', error);
      }
    }, 700);
  };

  const setupCloudAutosaveHooks = () => {
    if (state.dataHooksInstalled) return;
    state.dataHooksInstalled = true;

    const methodsToWrap = [
      'addChild',
      'updateChild',
      'deleteChild',
      'setStatus',
      'clearStatus',
      'clearDateStatuses',
      'updateConfig',
      'updateUser',
      'importData',
      'saveAllData',
      'setDemoDisabled'
    ];

    methodsToWrap.forEach(methodName => {
      if (typeof DataManager[methodName] !== 'function') return;
      const original = DataManager[methodName];

      DataManager[methodName] = (...args) => {
        const result = original(...args);
        scheduleCloudSave();
        return result;
      };
    });
  };

  const bootstrapUserData = async (user) => {
    state.isHydratingCloud = true;
    try {
      DataManager.setDemoDisabled(true);
      const remotePayload = await CloudManager.getUserData(user.id);

      if (remotePayload) {
        DataManager.importData(remotePayload);
      } else {
        const current = DataManager.exportData();
        DataManager.importData({
          children: [],
          statuses: {},
          config: current.config,
          user: current.user
        });
        await CloudManager.saveUserData(user.id, DataManager.exportData());
      }

      const nameFromAuth = user.user_metadata?.full_name || user.email || 'Usuario RutaKids';
      DataManager.updateUser({
        name: nameFromAuth,
        initials: getInitials(nameFromAuth)
      });
      updateSidebarUserUI();
    } finally {
      state.isHydratingCloud = false;
    }
  };

  const startAuthenticatedApp = async (user) => {
    state.authUser = user;
    await bootstrapUserData(user);
    showAppScreen();

    const now = new Date();
    state.calendarYear = now.getFullYear();
    state.calendarMonth = now.getMonth();
    state.calendar2Year = now.getFullYear();
    state.calendar2Month = now.getMonth();
    state.selectedDate = DataManager.formatDate(now);
    state.manualDateSelection = false;

    setupEventListeners();
    updatePageSubtitle();
    navigateTo(getSafeViewFromQuery() || 'dashboard');
    setTimeout(() => openGuideModal(), 200);
  };

  const handleSignOut = async () => {
    await CloudManager.signOut();
    DataManager.clearAllData();
    location.reload();
  };

  const buildEmptyPayload = () => {
    const authName = state.authUser?.user_metadata?.full_name || state.authUser?.email || 'Usuario RutaKids';
    return {
      children: [],
      statuses: {},
      config: {
        userName: authName,
        notificationsEnabled: true,
        paymentReminderDays: 2
      },
      user: {
        name: authName,
        initials: getInitials(authName)
      }
    };
  };

  const handleResetData = async () => {
    try {
      if (state.cloudSaveTimer) {
        clearTimeout(state.cloudSaveTimer);
        state.cloudSaveTimer = null;
      }

      const emptyPayload = buildEmptyPayload();

      if (state.authUser) {
        await CloudManager.resetUserData(state.authUser.id, emptyPayload);
      }

      state.isHydratingCloud = true;
      DataManager.clearAllData();
      DataManager.importData(emptyPayload);
      DataManager.setDemoDisabled(true);
      sessionStorage.clear();

      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.map(name => caches.delete(name)));
      }

      closeModal('reset');
      UIManager.showToast('Reiniciando aplicación...');
      setTimeout(() => {
        location.reload();
      }, 500);
    } catch (error) {
      console.error('Error reiniciando datos:', error);
      UIManager.showToast('No se pudo reiniciar. Verifica la conexión e intenta de nuevo.');
    } finally {
      state.isHydratingCloud = false;
    }
  };

  const handleAuthLogin = async () => {
    const email = document.getElementById('auth-email')?.value.trim();
    const password = document.getElementById('auth-password')?.value || '';

    if (!email || !password) {
      setAuthMessage('Debes ingresar correo y contraseña.');
      return;
    }

    setAuthButtonsLoading(true);
    setAuthMessage('');

    try {
      const result = await CloudManager.signIn({ email, password });
      if (!result?.user) {
        setAuthMessage('No se pudo obtener la sesión del usuario.');
      }
    } catch (error) {
      setAuthMessage(translateAuthError(error, 'No se pudo iniciar sesión.'));
    } finally {
      setAuthButtonsLoading(false);
    }
  };

  const handleAuthRegister = async () => {
    const fullName = document.getElementById('auth-name')?.value.trim();
    const email = document.getElementById('auth-email')?.value.trim();
    const password = document.getElementById('auth-password')?.value || '';

    if (!fullName || !email || !password) {
      setAuthMessage('Nombre, correo y contraseña son obligatorios para registro.');
      return;
    }

    if (password.length < 6) {
      setAuthMessage('La contraseña debe tener mínimo 6 caracteres.');
      return;
    }

    setAuthButtonsLoading(true);
    setAuthMessage('');

    try {
      const result = await CloudManager.signUp({ email, password, fullName });
      const identities = result?.user?.identities;
      const existingUser = Array.isArray(identities) && identities.length === 0;

      if (existingUser) {
        setAuthMessage('Este correo ya está registrado. Inicia sesión o usa "¿Olvidaste tu contraseña?".');
      } else if (!(result?.user && result?.session)) {
        setAuthMessage('Registro creado. Revisa tu correo para confirmar la cuenta.', false);
      }
    } catch (error) {
      setAuthMessage(translateAuthError(error, 'No se pudo registrar la cuenta.'));
    } finally {
      setAuthButtonsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = document.getElementById('auth-email')?.value.trim();

    if (!email) {
      setAuthMessage('Escribe tu correo para enviarte recuperación de contraseña.');
      return;
    }

    setAuthButtonsLoading(true);
    setAuthMessage('');

    try {
      await CloudManager.resetPassword(email);
      setAuthMessage('Te enviamos un correo para restablecer la contraseña.', false);
    } catch (error) {
      setAuthMessage(translateAuthError(error, 'No se pudo enviar el correo de recuperación.'));
    } finally {
      setAuthButtonsLoading(false);
    }
  };

  const setupAuthListeners = () => {
    const loginBtn = document.getElementById('auth-login-btn');
    const registerBtn = document.getElementById('auth-register-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const logoutBtnMobile = document.getElementById('logout-btn-mobile');
    const forgotBtn = document.getElementById('auth-forgot-btn');
    const passwordInput = document.getElementById('auth-password');
    const passwordToggleBtn = document.getElementById('auth-pass-toggle');

    if (loginBtn) loginBtn.addEventListener('click', handleAuthLogin);
    if (registerBtn) registerBtn.addEventListener('click', handleAuthRegister);
    if (logoutBtn) logoutBtn.addEventListener('click', handleSignOut);
    if (logoutBtnMobile) logoutBtnMobile.addEventListener('click', handleSignOut);
    if (forgotBtn) forgotBtn.addEventListener('click', handleForgotPassword);

    if (passwordInput && passwordToggleBtn) {
      passwordToggleBtn.addEventListener('click', () => {
        const isHidden = passwordInput.type === 'password';
        passwordInput.type = isHidden ? 'text' : 'password';
        passwordToggleBtn.innerHTML = isHidden
          ? '<i class="fas fa-eye-slash"></i>'
          : '<i class="fas fa-eye"></i>';
        const label = isHidden ? 'Ocultar contraseña' : 'Mostrar contraseña';
        passwordToggleBtn.setAttribute('aria-label', label);
        passwordToggleBtn.setAttribute('title', label);
      });
    }

    ['auth-name', 'auth-email', 'auth-password'].forEach(id => {
      const input = document.getElementById(id);
      if (!input) return;
      input.addEventListener('input', () => setAuthMessage(''));
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') handleAuthLogin();
      });
    });
  };

  // 
  // PDF EXPORT FUNCTIONS
  // 
  
  /**
   * Open export modal
   */
  const openExportModal = () => {
    const now = new Date();
    
    // Populate month selector
    const monthSelect = document.getElementById('export-month');
    monthSelect.innerHTML = DataManager.MONTHS.map((m, i) => 
      `<option value="${i}" ${i === now.getMonth() ? 'selected' : ''}>${m}</option>`
    ).join('');
    
    // Populate year selector (current year and previous years)
    const yearSelect = document.getElementById('export-year');
    const currentYear = now.getFullYear();
    const years = [];
    for (let y = currentYear; y >= currentYear - 5; y--) {
      years.push(`<option value="${y}" ${y === currentYear ? 'selected' : ''}>${y}</option>`);
    }
    yearSelect.innerHTML = years.join('');
    
    // Set today's date
    document.getElementById('export-date').value = DataManager.formatDate(now);
    
    // Show month fields by default
    updateExportFields();
    
    openModal('export');
  };

  /**
   * Update export modal fields based on type
   */
  const updateExportFields = () => {
    const type = document.getElementById('export-type').value;
    
    document.getElementById('export-day-group').style.display = type === 'day' ? 'block' : 'none';
    document.getElementById('export-month-group').style.display = type === 'month' ? 'block' : 'none';
    document.getElementById('export-year-group').style.display = type === 'year' || type === 'month' ? 'block' : 'none';
  };

  /**
   * Generate PDF report
   */
  const generatePDF = async () => {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
      UIManager.showToast('Error: Librería PDF no cargada');
      return;
    }

    const type = document.getElementById('export-type').value;
    const children = DataManager.getChildren();

    if (children.length === 0) {
      UIManager.showToast('No hay hijos registrados');
      return;
    }

    try {
      UIManager.showToast('Descargando informe PDF...');

      const doc = new jsPDF();
      let fileName = '';

      if (type === 'day') {
        fileName = generateDayReport(doc);
      } else if (type === 'month') {
        fileName = generateMonthReport(doc);
      } else if (type === 'year') {
        fileName = generateYearReport(doc);
      }

      if (!fileName) {
        UIManager.showToast('No se pudo generar el informe');
        return;
      }

      await doc.save(fileName, { returnPromise: true });
      closeModal('export');
      UIManager.showToast('Informe descargado correctamente');
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      UIManager.showToast('Error al descargar el informe');
    }
  };

  /**
   * Generate day report
   */
  const generateDayReport = (doc) => {
    const dateStr = document.getElementById('export-date').value;
    const date = DataManager.parseDate(dateStr);
    const dow = date.getDay();
    const children = DataManager.getChildren();
    const activeChildren = children.filter(child => child.days.includes(dow));

    // Header
    doc.setFontSize(20);
    doc.setTextColor(59, 91, 219);
    doc.text('RutaKids - Informe Diario', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Fecha: ${DataManager.DAY_NAMES[dow]} ${date.getDate()} de ${DataManager.MONTHS[date.getMonth()]} ${date.getFullYear()}`, 105, 30, { align: 'center' });

    let y = 50;
    let totalPaid = 0;
    let totalPending = 0;
    let totalAttended = 0;
    let totalAbsent = 0;

    // Children data
    activeChildren.forEach((child, index) => {
      const status = DataManager.getStatus(child.id, dateStr);
      const breakdown = DataManager.getFareTotal(child, status);
      
      if (breakdown.pay === 'pagado') totalPaid += breakdown.total;
      else totalPending += breakdown.total;
      
      if (breakdown.att === 'asistio') totalAttended++;
      else if (breakdown.att === 'no') totalAbsent++;

      // Child section
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(`${index + 1}. ${child.name}`, 20, y);
      y += 7;

      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      doc.text(`   Institucion: ${child.school}`, 20, y);
      y += 5;
      doc.text(`   Tarifa: Ida ${DataManager.formatCurrency(breakdown.fareIn)} + Regreso ${DataManager.formatCurrency(breakdown.fareOut)} = ${DataManager.formatCurrency(breakdown.total)}`, 20, y);
      y += 5;
      doc.text(`   Asistencia: ${breakdown.att === 'asistio' ? 'Asistio' : breakdown.att === 'no' ? 'No asistio' : 'Sin registro'}`, 20, y);
      y += 5;
      doc.text(`   Pago: ${breakdown.pay === 'pagado' ? 'Pagado' : 'Pendiente'}`, 20, y);
      y += 5;
      
      if (breakdown.nota) {
        doc.text(`   Nota: ${breakdown.nota}`, 20, y);
        y += 5;
      }
      
      y += 5;

      // New page if needed
      if (y > 270 && index < activeChildren.length - 1) {
        doc.addPage();
        y = 20;
      }
    });

    // Summary
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    y += 10;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('RESUMEN DEL DIA', 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Total de ninos activos: ${activeChildren.length}`, 30, y);
    y += 7;
    doc.text(`Asistencias: ${totalAttended}`, 30, y);
    y += 7;
    doc.text(`Ausencias: ${totalAbsent}`, 30, y);
    y += 7;
    doc.text(`Total pagado: ${DataManager.formatCurrency(totalPaid)}`, 30, y);
    y += 7;
    doc.setTextColor(240, 62, 62);
    doc.text(`Total pendiente: ${DataManager.formatCurrency(totalPending)}`, 30, y);
    doc.setTextColor(0, 0, 0);
    y += 7;
    doc.setFont(undefined, 'bold');
    doc.text(`TOTAL: ${DataManager.formatCurrency(totalPaid + totalPending)}`, 30, y);

    return `RutaKids-Dia-${dateStr}.pdf`;
  };

  /**
   * Generate month report
   */
  const generateMonthReport = (doc) => {
    const month = parseInt(document.getElementById('export-month').value);
    const year = parseInt(document.getElementById('export-year').value);
    const children = DataManager.getChildren();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(59, 91, 219);
    doc.text('RutaKids - Informe Mensual', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Periodo: ${DataManager.MONTHS[month]} ${year}`, 105, 30, { align: 'center' });

    let y = 50;
    let monthPaid = 0;
    let monthPending = 0;
    let monthAttended = 0;
    let monthAbsent = 0;

    children.forEach((child, index) => {
      let paid = 0;
      let pending = 0;
      let attended = 0;
      let absent = 0;
      let days = 0;

      const totalDays = new Date(year, month + 1, 0).getDate();

      for (let day = 1; day <= totalDays; day++) {
        const date = new Date(year, month, day);
        if (!child.days.includes(date.getDay())) continue;

        days++;
        const status = DataManager.getStatus(child.id, DataManager.formatDate(date));
        const breakdown = DataManager.getFareTotal(child, status);

        if (breakdown.pay === 'pagado') paid += breakdown.total;
        else pending += breakdown.total;

        if (breakdown.att === 'asistio') attended++;
        else if (breakdown.att === 'no') absent++;
      }

      monthPaid += paid;
      monthPending += pending;
      monthAttended += attended;
      monthAbsent += absent;

      // Child section
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(`${index + 1}. ${child.name}`, 20, y);
      y += 7;

      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      doc.text(`   Dias activos: ${days}`, 20, y);
      y += 5;
      doc.text(`   Asistencias: ${attended} | Ausencias: ${absent}`, 20, y);
      y += 5;
      doc.setTextColor(18, 184, 134);
      doc.text(`   Total pagado: ${DataManager.formatCurrency(paid)}`, 20, y);
      y += 5;
      doc.setTextColor(245, 159, 0);
      doc.text(`   Total pendiente: ${DataManager.formatCurrency(pending)}`, 20, y);
      y += 5;
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'bold');
      doc.text(`   TOTAL: ${DataManager.formatCurrency(paid + pending)}`, 20, y);
      doc.setFont(undefined, 'normal');
      y += 10;

      // New page if needed
      if (y > 260 && index < children.length - 1) {
        doc.addPage();
        y = 20;
      }
    });

    // Summary
    if (y > 220) {
      doc.addPage();
      y = 20;
    }

    y += 10;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('RESUMEN DEL MES', 20, y);
    y += 12;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Total de ninos registrados: ${children.length}`, 30, y);
    y += 7;
    doc.text(`Total asistencias: ${monthAttended}`, 30, y);
    y += 7;
    doc.text(`Total ausencias: ${monthAbsent}`, 30, y);
    y += 10;
    doc.setTextColor(18, 184, 134);
    doc.setFontSize(11);
    doc.text(`Total pagado: ${DataManager.formatCurrency(monthPaid)}`, 30, y);
    y += 7;
    doc.setTextColor(245, 159, 0);
    doc.text(`Total pendiente: ${DataManager.formatCurrency(monthPending)}`, 30, y);
    y += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`TOTAL GENERAL: ${DataManager.formatCurrency(monthPaid + monthPending)}`, 30, y);

    return `RutaKids-${DataManager.MONTHS[month]}-${year}.pdf`;
  };

  /**
   * Generate year report
   */
  const generateYearReport = (doc) => {
    const year = parseInt(document.getElementById('export-year').value);
    const children = DataManager.getChildren();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(59, 91, 219);
    doc.text('RutaKids - Informe Anual', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Ano: ${year}`, 105, 30, { align: 'center' });

    let y = 50;
    let yearPaid = 0;
    let yearPending = 0;
    let yearAttended = 0;
    let yearAbsent = 0;

    // By child
    children.forEach((child, index) => {
      let totalPaid = 0;
      let totalPending = 0;
      let totalAttended = 0;
      let totalAbsent = 0;
      let totalDays = 0;

      for (let month = 0; month < 12; month++) {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(year, month, day);
          if (!child.days.includes(date.getDay())) continue;

          totalDays++;
          const status = DataManager.getStatus(child.id, DataManager.formatDate(date));
          const breakdown = DataManager.getFareTotal(child, status);

          if (breakdown.pay === 'pagado') totalPaid += breakdown.total;
          else totalPending += breakdown.total;

          if (breakdown.att === 'asistio') totalAttended++;
          else if (breakdown.att === 'no') totalAbsent++;
        }
      }

      yearPaid += totalPaid;
      yearPending += totalPending;
      yearAttended += totalAttended;
      yearAbsent += totalAbsent;

      // Child section
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(`${index + 1}. ${child.name}`, 20, y);
      y += 7;

      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      doc.text(`   Total dias activos en el ano: ${totalDays}`, 20, y);
      y += 5;
      doc.text(`   Asistencias: ${totalAttended} | Ausencias: ${totalAbsent}`, 20, y);
      y += 5;
      doc.setTextColor(18, 184, 134);
      doc.text(`   Total pagado: ${DataManager.formatCurrency(totalPaid)}`, 20, y);
      y += 5;
      doc.setTextColor(245, 159, 0);
      doc.text(`   Total pendiente: ${DataManager.formatCurrency(totalPending)}`, 20, y);
      y += 5;
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'bold');
      doc.text(`   TOTAL ANUAL: ${DataManager.formatCurrency(totalPaid + totalPending)}`, 20, y);
      doc.setFont(undefined, 'normal');
      y += 10;

      // New page if needed
      if (y > 240 && index < children.length - 1) {
        doc.addPage();
        y = 20;
      }
    });

    // Summary
    if (y > 200) {
      doc.addPage();
      y = 20;
    }

    y += 10;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`RESUMEN ANUAL ${year}`, 20, y);
    y += 12;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Total de ninos registrados: ${children.length}`, 30, y);
    y += 7;
    doc.text(`Total asistencias: ${yearAttended}`, 30, y);
    y += 7;
    doc.text(`Total ausencias: ${yearAbsent}`, 30, y);
    y += 10;
    doc.setTextColor(18, 184, 134);
    doc.setFontSize(11);
    doc.text(`Total pagado: ${DataManager.formatCurrency(yearPaid)}`, 30, y);
    y += 7;
    doc.setTextColor(245, 159, 0);
    doc.text(`Total pendiente: ${DataManager.formatCurrency(yearPending)}`, 30, y);
    y += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`TOTAL GENERAL ${year}: ${DataManager.formatCurrency(yearPaid + yearPending)}`, 30, y);

    return `RutaKids-Anual-${year}.pdf`;
  };

  // 
  // THEME MANAGEMENT
  // 
  
  /**
   * Initialize theme from localStorage or system preference
   */
  const initTheme = () => {
    const savedTheme = localStorage.getItem('rutakids_theme');
    const theme = savedTheme || 'light';
    
    setTheme(theme);
  };

  /**
   * Set theme and update UI
   */
  const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('rutakids_theme', theme);
    
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
      themeIcon.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
  };

  /**
   * Toggle between light and dark themes
   */
  const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const SPLASH_FADE_DURATION = 420;
  const SPLASH_MIN_DURATION = 1400;

  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const isMobileDevice = () => /android|iphone|ipad|ipod/i.test(navigator.userAgent || '');

  const isStandaloneApp = () => {
    const standaloneMedia = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
    const standaloneIOS = window.navigator.standalone === true;
    return Boolean(standaloneMedia || standaloneIOS);
  };

  const updateInstallModalContent = () => {
    const textEl = document.getElementById('install-modal-text');
    const installBtn = document.getElementById('install-app-btn');
    if (!textEl || !installBtn) return;

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent || '');
    if (state.deferredInstallPrompt) {
      textEl.textContent = '¿Deseas instalar RutaKids en tu celular para abrirla como app?';
      installBtn.disabled = false;
      installBtn.innerHTML = '<i class="fas fa-download"></i> Instalar app';
      return;
    }

    if (isIOS) {
      textEl.textContent = 'Para instalar en iPhone: toca Compartir y luego “Añadir a pantalla de inicio”.';
      installBtn.disabled = false;
      installBtn.innerHTML = '<i class="fas fa-mobile-screen-button"></i> Ver cómo instalar';
      return;
    }

    textEl.textContent = 'La instalación no está disponible en este momento. Puedes seguir usando la app en el navegador.';
    installBtn.disabled = true;
    installBtn.innerHTML = '<i class="fas fa-download"></i> Instalar app';
  };

  const maybeShowInstallModal = () => {
    if (!isMobileDevice()) return;
    if (isStandaloneApp()) return;
    if (sessionStorage.getItem('rutakids_install_prompt_closed') === '1') return;

    updateInstallModalContent();
    openModal('install');
  };

  const setupInstallPromptHandlers = () => {
    if (state.installHandlersBound) return;
    state.installHandlersBound = true;

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      state.deferredInstallPrompt = event;
      updateInstallModalContent();
    });

    window.addEventListener('appinstalled', () => {
      state.deferredInstallPrompt = null;
      sessionStorage.setItem('rutakids_install_prompt_closed', '1');
      closeModal('install');
      UIManager.showToast('RutaKids instalada correctamente');
    });

    const installContinueBtn = document.getElementById('install-continue-btn');
    if (installContinueBtn) {
      installContinueBtn.addEventListener('click', () => {
        sessionStorage.setItem('rutakids_install_prompt_closed', '1');
        closeModal('install');
      });
    }

    const installAppBtn = document.getElementById('install-app-btn');
    if (installAppBtn) {
      installAppBtn.addEventListener('click', async () => {
        if (state.deferredInstallPrompt) {
          const promptEvent = state.deferredInstallPrompt;
          state.deferredInstallPrompt = null;
          await promptEvent.prompt();
          await promptEvent.userChoice;
          closeModal('install');
          sessionStorage.setItem('rutakids_install_prompt_closed', '1');
          return;
        }

        const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent || '');
        if (isIOS) {
          UIManager.showToast('iPhone: Compartir → Añadir a pantalla de inicio');
        } else {
          UIManager.showToast('Instalación no disponible en este navegador');
        }
      });
    }
  };

  const finalizeSplash = async () => {
    const elapsed = Date.now() - (state.initStartedAt || Date.now());
    const remaining = SPLASH_MIN_DURATION - elapsed;
    if (remaining > 0) await wait(remaining);

    hideSplashScreen();
    await wait(SPLASH_FADE_DURATION + 80);
    maybeShowInstallModal();
  };

  const hideSplashScreen = () => {
    const splash = document.getElementById('splash-screen');
    if (!splash || splash.dataset.hidden === '1') return;
    splash.dataset.hidden = '1';
    splash.classList.add('splash-hidden');
    setTimeout(() => {
      if (splash.parentElement) {
        splash.parentElement.removeChild(splash);
      }
    }, SPLASH_FADE_DURATION);
  };

  // 
  // EVENT LISTENERS
  // 
  
  const setupEventListeners = () => {
    if (state.listenersBound) return;
    state.listenersBound = true;

    // Navigation
    document.querySelectorAll('.nav-item[data-view]').forEach(el => {
      el.addEventListener('click', () => navigateTo(el.dataset.view));
    });
    document.querySelectorAll('.mn-item[data-mn]').forEach(el => {
      el.addEventListener('click', () => navigateTo(el.dataset.mn));
    });

    const shiftCalendar = (isSecond, direction) => {
      const view = isSecond ? state.calendar2View : state.calendarView;
      const delta = direction === 'next' ? 1 : -1;

      if (view === 'month') {
        if (isSecond) {
          state.calendar2Month += delta;
          if (state.calendar2Month < 0) {
            state.calendar2Month = 11;
            state.calendar2Year--;
          }
          if (state.calendar2Month > 11) {
            state.calendar2Month = 0;
            state.calendar2Year++;
          }
        } else {
          state.calendarMonth += delta;
          if (state.calendarMonth < 0) {
            state.calendarMonth = 11;
            state.calendarYear--;
          }
          if (state.calendarMonth > 11) {
            state.calendarMonth = 0;
            state.calendarYear++;
          }
        }
      } else if (view === 'week') {
        const date = DataManager.parseDate(state.selectedDate);
        date.setDate(date.getDate() + (delta * 7));
        state.manualDateSelection = true;
        state.selectedDate = DataManager.formatDate(date);
        if (isSecond) {
          state.calendar2Year = date.getFullYear();
          state.calendar2Month = date.getMonth();
        } else {
          state.calendarYear = date.getFullYear();
          state.calendarMonth = date.getMonth();
        }
      } else {
        const date = DataManager.parseDate(state.selectedDate);
        date.setFullYear(date.getFullYear() + delta);
        state.manualDateSelection = true;
        state.selectedDate = DataManager.formatDate(date);
        if (isSecond) state.calendar2Year = date.getFullYear();
        else state.calendarYear = date.getFullYear();
      }

      if (isSecond) renderCalendario();
      else renderDashboard();
    };

    // Calendar navigation
    document.getElementById('prev-month').addEventListener('click', () => shiftCalendar(false, 'prev'));
    document.getElementById('next-month').addEventListener('click', () => shiftCalendar(false, 'next'));
    document.getElementById('prev-month2').addEventListener('click', () => shiftCalendar(true, 'prev'));
    document.getElementById('next-month2').addEventListener('click', () => shiftCalendar(true, 'next'));

    const calViewSelect = document.getElementById('cal-view-select');
    if (calViewSelect) {
      calViewSelect.addEventListener('change', (e) => {
        state.calendarView = e.target.value;
        renderDashboard();
      });
    }

    const cal2ViewSelect = document.getElementById('cal2-view-select');
    if (cal2ViewSelect) {
      cal2ViewSelect.addEventListener('change', (e) => {
        state.calendar2View = e.target.value;
        renderCalendario();
      });
    }

    const todayBtn = document.getElementById('cal-today-btn');
    if (todayBtn) {
      todayBtn.addEventListener('click', () => {
        const today = new Date();
        state.manualDateSelection = false;
        state.selectedDate = DataManager.formatDate(today);
        state.calendarYear = today.getFullYear();
        state.calendarMonth = today.getMonth();
        renderDashboard();
      });
    }

    const todayBtn2 = document.getElementById('cal2-today-btn');
    if (todayBtn2) {
      todayBtn2.addEventListener('click', () => {
        const today = new Date();
        state.manualDateSelection = false;
        state.selectedDate = DataManager.formatDate(today);
        state.calendar2Year = today.getFullYear();
        state.calendar2Month = today.getMonth();
        renderCalendario();
      });
    }

    // Buttons
    document.getElementById('add-child-btn').addEventListener('click', openAddChildModal);
    document.getElementById('sidebar-add-btn').addEventListener('click', openAddChildModal);
    document.getElementById('hijos-add-btn').addEventListener('click', openAddChildModal);
    const navAdd = document.getElementById('nav-add-child');
    if (navAdd) navAdd.addEventListener('click', openAddChildModal);
    document.getElementById('notif-btn').addEventListener('click', () => navigateTo('notificaciones'));
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('see-all-notif').addEventListener('click', () => navigateTo('notificaciones'));
    document.getElementById('save-child-btn').addEventListener('click', saveChild);
    document.getElementById('save-status-btn').addEventListener('click', saveStatus);
    document.getElementById('save-day-btn').addEventListener('click', saveDayModal);
    document.getElementById('clear-day-btn').addEventListener('click', openClearDayModal);
    document.getElementById('confirm-clear-day-btn').addEventListener('click', clearDayData);
    document.getElementById('confirm-del-btn').addEventListener('click', confirmDelete);
    document.getElementById('mark-read-btn').addEventListener('click', () => {
      UIManager.showToast('Notificaciones marcadas como leídas');
      UIManager.renderNotifications();
    });
    document.getElementById('save-cfg-btn').addEventListener('click', saveConfiguration);
    const openAppInfoBtn = document.getElementById('open-app-info-btn');
    if (openAppInfoBtn) {
      openAppInfoBtn.addEventListener('click', () => openModal('app-info'));
    }
    const openGuideBtn = document.getElementById('open-guide-btn');
    if (openGuideBtn) {
      openGuideBtn.addEventListener('click', () => openGuideModal({ force: true }));
    }
    const guideGotItBtn = document.getElementById('guide-got-it-btn');
    if (guideGotItBtn) {
      guideGotItBtn.addEventListener('click', () => {
        localStorage.setItem(GUIDE_SEEN_KEY, '1');
        closeModal('guide');
      });
    }

    const clearChildError = () => setChildFormError('');
    ['f-name', 'f-school', 'f-in', 'f-out'].forEach(id => {
      const input = document.getElementById(id);
      if (!input) return;
      input.addEventListener('input', clearChildError);
      input.addEventListener('change', clearChildError);
    });

    const resetBtn = document.getElementById('reset-data-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        openModal('reset');
      });
    }

    const confirmResetBtn = document.getElementById('confirm-reset-btn');
    if (confirmResetBtn) {
      confirmResetBtn.addEventListener('click', handleResetData);
    }

    // Export buttons
    document.getElementById('export-btn-topbar').addEventListener('click', openExportModal);
    document.getElementById('generate-pdf-btn').addEventListener('click', generatePDF);
    document.getElementById('export-type').addEventListener('change', updateExportFields);

    const dayForm = document.getElementById('day-form-rows');
    if (dayForm) {
      dayForm.addEventListener('input', updateDayTotals);
      dayForm.addEventListener('change', updateDayTotals);
    }

    // Modal close buttons
    document.querySelectorAll('[data-close]').forEach(el => {
      el.addEventListener('click', () => closeModal(el.dataset.close));
    });

    if (!state.autoDateTimer) {
      state.autoDateTimer = setInterval(() => {
        const changed = syncSelectedDateWithToday();
        if (!changed) return;

        if (state.currentView === 'dashboard') {
          renderDashboard();
        } else if (state.currentView === 'calendario') {
          renderCalendario();
        }
      }, 60000);
    }

    // Close modal when clicking overlay
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          const modalId = overlay.id.replace('modal-', '');
          closeModal(modalId);
        }
      });
    });

    // Day toggles
    document.querySelectorAll('.dtoggle').forEach(el => {
      el.addEventListener('click', () => {
        el.classList.toggle('on');
        clearChildError();
      });
    });

    const editAllBtn = document.getElementById('edit-all-btn');
    if (editAllBtn) {
      editAllBtn.addEventListener('click', () => {
        if (!state.selectedDate) return;
        openDayModal(state.selectedDate);
      });
    }

    // Color picker
    document.querySelectorAll('.col-opt').forEach(el => {
      el.addEventListener('click', () => setColor(el.dataset.col));
    });

    // Status buttons
    document.querySelectorAll('.status-btn[data-s]').forEach(btn => {
      btn.addEventListener('click', () => {
        const statusType = btn.dataset.s;
        const statusValue = btn.dataset.v;

        // Reset buttons of same type
        document.querySelectorAll(`.status-btn[data-s="${statusType}"]`).forEach(b => {
          b.className = 'status-btn';
        });

        // Highlight selected button
        btn.classList.add(`sel-${statusValue}`);

        // Update state
        if (statusType === 'att') {
          state.statusSelection.att = statusValue;
        } else {
          state.statusSelection.pay = statusValue;
        }
      });
    });
  };

  // 
  // INITIALIZATION
  // 
  
  const init = async () => {
    state.initStartedAt = Date.now();
    initTheme();
    showAuthScreen('Conectando...');
    setupCloudAutosaveHooks();
    setupInstallPromptHandlers();
    setupAuthListeners();

    const cloudConfig = window.RUTAKIDS_SUPABASE || {};
    const cloudInit = await CloudManager.init(cloudConfig);

    if (!cloudInit.ok) {
      showAuthScreen(`${cloudInit.error} Configura el archivo js/config.js`);
      console.warn('a️ Supabase no configurado.');
      await finalizeSplash();
      return;
    }

    if (state.authSubscription) state.authSubscription();
    state.authSubscription = CloudManager.onAuthStateChange(async (_event, session) => {
      if (!session?.user) return;
      if (state.authUser?.id === session.user.id) return;
      await startAuthenticatedApp(session.user);
    });

    try {
      const session = await CloudManager.getSession();
      if (session?.user) {
        await startAuthenticatedApp(session.user);
      } else {
        showAuthScreen('Ingresa con tu cuenta para cargar tus datos.');
      }
    } catch (error) {
      console.error('Error iniciando autenticación:', error);
      showAuthScreen('No se pudo iniciar la autenticación. Verifica la configuración de Supabase.');
    }

    await finalizeSplash();
    console.log('RutaKids initialized successfully');
  };

  // 
  // PUBLIC API
  // 
  return {
    init,
    navigateTo,
    openAddChildModal,
    openEditChildModal: openEditChildModal,
    openStatusModal,
    openDeleteModal
  };
})();

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', App.init);
} else {
  App.init();
}

