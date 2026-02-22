/* ══════════════════════════════════════════════════════════════
   RUTAKIDS - UI MODULE
   Handles all UI rendering and visual components
   ══════════════════════════════════════════════════════════════ */

const UIManager = (() => {
  'use strict';

  const esc = (value) => DataManager.escapeHTML(value);

  const getChildInitial = (name) => {
    const text = String(name || '').trim();
    if (!text) return 'N';
    return esc(text.charAt(0).toUpperCase());
  };

  // ──────────────────────────────────────────────────────────────
  // CALENDAR RENDERING
  // ──────────────────────────────────────────────────────────────
  
  /**
   * Get calendar status badges for a specific date
   */
  const getCalendarBadges = (dateStr, dayOfWeek) => {
    const badges = [];
    const children = DataManager.getChildren();
    if (children.length === 0) return badges;

    const holiday = DataManager.getHoliday(dateStr);
    if (holiday) badges.push({ text: 'Día festivo', class: 'cb-holiday', title: holiday });

    let hasIn = false;
    let hasOut = false;

    children.forEach(child => {
      const status = DataManager.getStatus(child.id, dateStr);
      const breakdown = DataManager.getFareTotal(child, status);

      // Skip days sin registro para no colorear hasta que se marque algo
      if (!status && breakdown.total === 0) return;

      if (breakdown.tripIn) hasIn = true;
      if (breakdown.tripOut) hasOut = true;
    });

    if (hasIn) badges.push({ text: 'Ida', class: 'cb-ida' });
    if (hasOut) badges.push({ text: 'Regreso', class: 'cb-regreso' });

    return badges;
  };

  /**
   * Determine day color class based on trip completion
   */
  const getDayTripClass = (dateStr, dayOfWeek) => {
    const children = DataManager.getChildren();
    if (children.length === 0) return '';

    let both = 0;
    let inOnly = 0;
    let outOnly = 0;

    children.forEach(child => {
      const breakdown = DataManager.getFareTotal(child, DataManager.getStatus(child.id, dateStr));
      if (breakdown.tripIn && breakdown.tripOut) both++;
      else if (breakdown.tripIn) inOnly++;
      else if (breakdown.tripOut) outOnly++;
    });

    if (both > 0 && inOnly === 0 && outOnly === 0) return 'cal-day-both';
    if (inOnly > 0 && both === 0 && outOnly === 0) return 'cal-day-in';
    if (outOnly > 0 && both === 0 && inOnly === 0) return 'cal-day-out';
    if (both + inOnly + outOnly > 0) return 'cal-day-mixed';
    return '';
  };

  /**
   * Build calendar grid
   */
  const buildCalendar = (gridId, year, month, selectedDate, onClickCallback, options = {}) => {
    const grid = document.getElementById(gridId);
    if (!grid) return;

    grid.innerHTML = '';

    const showLabels = options.showLabels ?? true;

    // Add day labels
    if (showLabels) {
      ['L', 'M', 'X', 'J', 'V', 'S', 'D'].forEach(label => {
        const el = document.createElement('div');
        el.className = 'cal-day-lbl';
        el.textContent = label;
        grid.appendChild(el);
      });
    }

    // Calculate calendar data
    const firstDay = new Date(year, month, 1);
    const firstDow = (firstDay.getDay() + 6) % 7; // Convert to Monday = 0
    const totalDays = new Date(year, month + 1, 0).getDate();
    const today = DataManager.formatDate(new Date());

    // Add empty cells before first day
    for (let i = 0; i < firstDow; i++) {
      const el = document.createElement('div');
      el.className = 'cal-day empty';
      grid.appendChild(el);
    }

    // Add day cells
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day);
      const dateStr = DataManager.formatDate(date);
      const dow = date.getDay();

      const el = document.createElement('div');
      let className = 'cal-day';
      
      if (dateStr === today) className += ' today';
      if (dateStr === selectedDate && dateStr !== today) className += ' selected';
      if (dateStr === selectedDate && dateStr === today) className += ' today selected';

      const tripClass = getDayTripClass(dateStr, dow);
      const badges = getCalendarBadges(dateStr, dow);
      const hasInfo = Boolean(tripClass) || badges.length > 0;
      if (DataManager.getHoliday(dateStr)) className += ' holiday';

      if (!hasInfo) className += ' no-info';

      el.className = tripClass ? `${className} ${tripClass}` : className;

      // Day number
      const dayNum = document.createElement('div');
      dayNum.className = 'cal-day-num';
      dayNum.textContent = day;
      el.appendChild(dayNum);

      // Add status badges (including weekends)
      if (badges.length > 0) {
        const badgesContainer = document.createElement('div');
        badgesContainer.className = 'cal-status-badges';
        
        badges.forEach(badge => {
          const badgeEl = document.createElement('div');
          badgeEl.className = `cal-badge ${badge.class}`;
          badgeEl.textContent = '';
          badgeEl.setAttribute('aria-label', badge.text);
          badgeEl.title = badge.title ? `${badge.text}: ${badge.title}` : badge.text;
          badgesContainer.appendChild(badgeEl);
        });
        
        el.appendChild(badgesContainer);
      }

      el.addEventListener('click', () => onClickCallback(dateStr));

      grid.appendChild(el);
    }
  };

  /**
   * Build weekly calendar grid
   */
  const buildWeekCalendar = (gridId, baseDateStr, selectedDate, onClickCallback) => {
    const grid = document.getElementById(gridId);
    if (!grid) return;

    grid.innerHTML = '';

    const baseDate = baseDateStr ? DataManager.parseDate(baseDateStr) : new Date();
    const start = new Date(baseDate);
    const dow = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - dow);

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const dateStr = DataManager.formatDate(date);
      const today = DataManager.formatDate(new Date());

      const el = document.createElement('div');
      let className = 'cal-day';
      if (dateStr === today) className += ' today';
      if (dateStr === selectedDate && dateStr !== today) className += ' selected';
      if (dateStr === selectedDate && dateStr === today) className += ' today selected';

      const tripClass = getDayTripClass(dateStr, date.getDay());
      const badges = getCalendarBadges(dateStr, date.getDay());
      const hasInfo = Boolean(tripClass) || badges.length > 0;
      if (DataManager.getHoliday(dateStr)) className += ' holiday';

      if (!hasInfo) className += ' no-info';

      el.className = tripClass ? `${className} ${tripClass}` : className;

      const dayNum = document.createElement('div');
      dayNum.className = 'cal-day-num';
      dayNum.textContent = date.getDate();
      el.appendChild(dayNum);

      if (badges.length > 0) {
        const badgesContainer = document.createElement('div');
        badgesContainer.className = 'cal-status-badges';
        badges.forEach(badge => {
          const badgeEl = document.createElement('div');
          badgeEl.className = `cal-badge ${badge.class}`;
          badgeEl.textContent = '';
          badgeEl.setAttribute('aria-label', badge.text);
          badgeEl.title = badge.title ? `${badge.text}: ${badge.title}` : badge.text;
          badgesContainer.appendChild(badgeEl);
        });
        el.appendChild(badgesContainer);
      }

      el.addEventListener('click', () => onClickCallback(dateStr));
      grid.appendChild(el);
    }
  };

  /**
   * Build yearly calendar grid with mini-months
   */
  const buildYearCalendar = (gridId, year, selectedDate, onClickCallback) => {
    const grid = document.getElementById(gridId);
    if (!grid) return;

    grid.innerHTML = '';

    for (let month = 0; month < 12; month++) {
      const monthWrap = document.createElement('div');
      monthWrap.className = 'cal-mini';

      const title = document.createElement('div');
      title.className = 'cal-mini-title';
      title.textContent = DataManager.MONTHS[month];
      monthWrap.appendChild(title);

      const weekdays = document.createElement('div');
      weekdays.className = 'cal-mini-weekdays';
      ['L', 'M', 'X', 'J', 'V', 'S', 'D'].forEach(label => {
        const span = document.createElement('span');
        span.textContent = label;
        weekdays.appendChild(span);
      });
      monthWrap.appendChild(weekdays);

      const miniGrid = document.createElement('div');
      miniGrid.className = 'cal-mini-grid';

      const firstDay = new Date(year, month, 1);
      const firstDow = (firstDay.getDay() + 6) % 7;
      const totalDays = new Date(year, month + 1, 0).getDate();

      for (let i = 0; i < firstDow; i++) {
        const empty = document.createElement('div');
        empty.className = 'cal-mini-day is-muted';
        empty.textContent = '';
        miniGrid.appendChild(empty);
      }

      for (let day = 1; day <= totalDays; day++) {
        const date = new Date(year, month, day);
        const dateStr = DataManager.formatDate(date);
        const cell = document.createElement('div');
        cell.className = 'cal-mini-day';
        cell.textContent = day;

        if (dateStr === selectedDate) cell.classList.add('is-selected');

        if (DataManager.getHoliday(dateStr)) cell.classList.add('is-holiday');

        const badges = getCalendarBadges(dateStr, date.getDay());
        if (badges.length > 0) cell.classList.add('has-event');

        cell.addEventListener('click', () => onClickCallback(dateStr));
        miniGrid.appendChild(cell);
      }

      monthWrap.appendChild(miniGrid);
      grid.appendChild(monthWrap);
    }
  };

  /**
   * Build day detail view
   */
  const buildDayDetail = (dateStr, labelId, containerId) => {
    const dateLabel = document.getElementById(labelId);
    const container = document.getElementById(containerId);
    
    if (!dateLabel || !container) return;

    if (!dateStr) {
      dateLabel.textContent = 'Selecciona un día';
      container.innerHTML = '<div class="no-service">Elige una fecha para ver y editar</div>';
      return;
    }

    const date = DataManager.parseDate(dateStr);
    const dow = date.getDay();
    const [year, monthNum, day] = dateStr.split('-');
    const holidayName = DataManager.getHoliday(dateStr);
    const holidayInfo = holidayName
      ? `<div class="day-holiday-note"><i class="fas fa-star"></i> Festivo: <strong>${esc(holidayName)}</strong></div>`
      : '';

    // Update date label
    dateLabel.textContent = `${DataManager.DAY_NAMES[dow]} ${parseInt(day)} de ${DataManager.MONTHS[parseInt(monthNum) - 1]} ${year}`;

    // Get children with service on this day
    const children = DataManager.getChildren();
    const activeChildren = children.filter(child => child.days.includes(dow));

    if (activeChildren.length === 0) {
      container.innerHTML = `${holidayInfo}<div class="no-service">No hay servicio de ruta este día</div>`;
      return;
    }

    // Build children rows
    container.innerHTML = holidayInfo + activeChildren.map(child => {
      const status = DataManager.getStatus(child.id, dateStr);
      const breakdown = DataManager.getFareTotal(child, status);
      const childName = esc(child.name);
      const childSchool = esc(child.school);
      const childInitial = getChildInitial(child.name);

      const attLabels = {
        asistio: '<i class="fas fa-check"></i> Asistió',
        no: '<i class="fas fa-times"></i> No asistió',
        pendiente: '<i class="fas fa-clock"></i> Sin registro'
      };

      const payLabels = {
        pagado: '<i class="fas fa-credit-card"></i> Pagado',
        pendiente: '<i class="fas fa-clock"></i> Pago pendiente'
      };

      const attClasses = {
        asistio: 'sb-asistio',
        no: 'sb-no',
        pendiente: 'sb-pendiente'
      };

      const payClasses = {
        pagado: 'sb-pagado',
        pendiente: 'sb-pendiente'
      };

      const tripBadges = `
        <div class="cr-trips">
          <span class="sbadge ${breakdown.tripIn ? 'sb-asistio' : 'sb-pendiente'}">Ida ${breakdown.tripIn ? '✔' : '—'}</span>
          <span class="sbadge ${breakdown.tripOut ? 'sb-asistio' : 'sb-pendiente'}">Regreso ${breakdown.tripOut ? '✔' : '—'}</span>
          <span class="sbadge sb-pill">Total ${DataManager.formatCurrency(breakdown.total)}</span>
        </div>
      `;

      return `
        <div class="child-row" data-cid="${child.id}" data-ds="${dateStr}">
          <div class="cr-av" style="background:${DataManager.COLORS[child.color]}">${childInitial}</div>
          <div class="cr-info">
            <div class="cr-name">${childName}</div>
            <div class="cr-detail">${childSchool}</div>
            ${tripBadges}
          </div>
          <div style="display:flex;flex-direction:column;gap:3px;align-items:flex-end">
            <span class="sbadge ${attClasses[breakdown.att]}">${attLabels[breakdown.att]}</span>
            <span class="sbadge ${payClasses[breakdown.pay]}">${payLabels[breakdown.pay]}</span>
          </div>
        </div>
      `;
    }).join('');
  };

  // ──────────────────────────────────────────────────────────────
  // METRICS CARDS
  // ──────────────────────────────────────────────────────────────
  
  /**
   * Render metrics cards
   */
  const renderMetrics = () => {
    const now = new Date();
    const stats = DataManager.getMonthStats(now.getFullYear(), now.getMonth());
    const container = document.getElementById('metrics-row');
    const safeChildNames = DataManager.getChildren()
      .map(c => esc(String(c.name || '').split(' ')[0]))
      .join(' y ');
    
    if (!container) return;

    container.innerHTML = `
      <div class="mcard" onclick="App.navigateTo('pagos')">
        <div class="mcard-top">
          <div class="micon" style="background:var(--primary-pale)">💰</div>
          <span class="mtrend tr-up">Registrado</span>
        </div>
        <div class="mval" style="color:var(--primary)">${DataManager.formatCurrency(stats.paid)}</div>
        <div class="mlabel">Total Pagado — ${DataManager.MONTHS[now.getMonth()]}</div>
        <div class="msub">Haz clic para ver detalle</div>
      </div>

      <div class="mcard" onclick="App.navigateTo('pagos')">
        <div class="mcard-top">
          <div class="micon" style="background:var(--warn-pale)"><i class="fas fa-clock"></i></div>
          <span class="mtrend tr-warn">${stats.pending > 0 ? 'Pendiente' : 'Al día'}</span>
        </div>
        <div class="mval" style="color:var(--warn)">${DataManager.formatCurrency(stats.pending)}</div>
        <div class="mlabel">Saldo Pendiente</div>
        <div class="msub">${stats.pending > 0 ? 'Hay pagos por registrar' : '¡Todo al día!'}</div>
      </div>

      <div class="mcard">
        <div class="mcard-top">
          <div class="micon" style="background:var(--accent-pale)">✅</div>
          <span class="mtrend tr-up">${stats.absent > 0 ? stats.absent + ' ausencias' : 'Sin ausencias'}</span>
        </div>
        <div class="mval" style="color:var(--accent)">${stats.attended}</div>
        <div class="mlabel">Días Asistidos</div>
        <div class="msub">Este mes</div>
      </div>

      <div class="mcard" onclick="App.navigateTo('hijos')">
        <div class="mcard-top">
          <div class="micon" style="background:var(--purple-pale)">🧒</div>
          <span class="mtrend tr-pur">Activos</span>
        </div>
        <div class="mval" style="color:var(--purple)">${DataManager.getChildren().length}</div>
        <div class="mlabel">Niños registrados</div>
        <div class="msub">${safeChildNames || 'Ninguno'}</div>
      </div>
    `;
  };

  // ──────────────────────────────────────────────────────────────
  // CHILDREN SIDEBAR
  // ──────────────────────────────────────────────────────────────
  
  /**
   * Render children sidebar
   */
  const renderChildrenSidebar = () => {
    const container = document.getElementById('children-sidebar');
    if (!container) return;

    const children = DataManager.getChildren();

    if (children.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>Sin hijos registrados</p></div>';
      return;
    }

    container.innerHTML = children.map(child => {
      const childName = esc(child.name);
      const childSchool = esc(child.school);
      const childInitial = getChildInitial(child.name);

      return `
        <div class="ccard">
          <div class="ccard-top">
            <div class="cc-av" style="background:${DataManager.COLORS[child.color]}">
              ${childInitial}
              <div class="cc-online"></div>
            </div>
            <div>
              <div class="cc-name">${childName}</div>
              <div class="cc-school">${childSchool}</div>
            </div>
          </div>
          <div class="fares-grid">
            <div class="fare-box">
              <div class="fare-lbl"><i class="fas fa-sun"></i> Ida</div>
              <div class="fare-val">${DataManager.formatCurrency(child.fareIn)}</div>
            </div>
            <div class="fare-box">
              <div class="fare-lbl"><i class="fas fa-moon"></i> Regreso</div>
              <div class="fare-val">${DataManager.formatCurrency(child.fareOut)}</div>
            </div>
          </div>
          <div class="cc-days">
            ${[1, 2, 3, 4, 5, 6, 0].map(d => `
              <div class="dchip ${child.days.includes(d) ? 'dchip-on' : 'dchip-off'}">
                ${DataManager.DAY_MAP[d]}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  };

  // ──────────────────────────────────────────────────────────────
  // NOTIFICATIONS
  // ──────────────────────────────────────────────────────────────
  
  /**
   * Generate notifications
   */
  const generateNotifications = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const notifications = [];
    const children = DataManager.getChildren();

    children.forEach(child => {
      let pendingCount = 0;
      let pendingTotal = 0;
      let absenceCount = 0;

      Object.entries(DataManager.getChildStatuses(child.id)).forEach(([dateStr, status]) => {
        const date = DataManager.parseDate(dateStr);
        
        if (date.getFullYear() === year && date.getMonth() === month) {
          if (status.pay === 'pendiente') {
            const breakdown = DataManager.getFareTotal(child, status);
            pendingCount++;
            pendingTotal += breakdown.total;
          }
          if (status.att === 'no') {
            absenceCount ++;
          }
        }
      });

      if (pendingCount > 0) {
        notifications.push({
          icon: '<i class="fas fa-exclamation-triangle"></i>',
          bg: 'var(--warn-pale)',
          title: `Pago pendiente · ${child.name.split(' ')[0]}`,
          desc: `${pendingCount} día(s) sin pago registrado. Total: ${DataManager.formatCurrency(pendingTotal)}`,
          time: 'Hoy',
          unread: true
        });
      }

      if (absenceCount > 0) {
        notifications.push({
          icon: '<i class="fas fa-times-circle"></i>',
          bg: 'var(--danger-pale)',
          title: `Inasistencias · ${child.name.split(' ')[0]}`,
          desc: `${absenceCount} inasistencia(s) registradas este mes`,
          time: 'Este mes',
          unread: absenceCount > 1
        });
      }
    });

    notifications.push({
      icon: '<i class="fas fa-check-circle"></i>',
      bg: 'var(--accent-pale)',
      title: 'Sistema actualizado',
      desc: 'Los días de servicio están sincronizados automáticamente',
      time: 'Sistema',
      unread: false
    });

    return notifications;
  };

  /**
   * Render notification preview (dashboard)
   */
  const renderNotificationPreview = () => {
    const container = document.getElementById('notif-preview');
    if (!container) return;

    const notifications = generateNotifications().slice(0, 3);

    if (notifications.length === 0) {
      container.innerHTML = '<div class="no-service">Sin alertas pendientes</div>';
      return;
    }

    container.innerHTML = notifications.map(notif => `
      <div class="notif-item ${notif.unread ? 'notif-unread' : ''}">
        <div class="notif-icon-w" style="background:${notif.bg}">${notif.icon}</div>
        <div class="notif-body">
          <div class="notif-title">${esc(notif.title)}</div>
          <div class="notif-desc">${esc(notif.desc)}</div>
          <div class="notif-time">${esc(notif.time)}</div>
        </div>
      </div>
    `).join('');
  };

  /**
   * Render full notifications view
   */
  const renderNotifications = () => {
    const container = document.getElementById('notif-full');
    if (!container) return;

    const notifications = generateNotifications();
    const unreadCount = notifications.filter(n => n.unread).length;

    container.innerHTML = `
      <div style="padding:12px 18px;border-bottom:1px solid var(--border);font-size:12px;font-weight:600;color:var(--text3)">
        ${unreadCount} notificaciones sin leer
      </div>
      ${notifications.map(notif => `
        <div class="notif-item ${notif.unread ? 'notif-unread' : ''}" style="padding:14px">
          <div class="notif-icon-w" style="background:${notif.bg};width:38px;height:38px;font-size:18px">${notif.icon}</div>
          <div class="notif-body">
            <div class="notif-title">
              ${esc(notif.title)}
              ${notif.unread ? '<span style="display:inline-block;width:6px;height:6px;background:var(--primary);border-radius:50%;margin-left:5px;vertical-align:middle"></span>' : ''}
            </div>
            <div class="notif-desc">${esc(notif.desc)}</div>
            <div class="notif-time">${esc(notif.time)}</div>
          </div>
        </div>
      `).join('')}
    `;
  };

  // ──────────────────────────────────────────────────────────────
  // CHARTS AND VISUALIZATIONS
  // ──────────────────────────────────────────────────────────────
  
  /**
   * Get weeks in a month
   */
  const getWeeks = (year, month) => {
    const weeks = [];
    let week = [];
    const totalDays = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day);
      week.push(date);
      
      if (date.getDay() === 0 || day === totalDays) {
        weeks.push(week);
        week = [];
      }
    }

    return weeks;
  };

  /**
   * Render payment table (weekly breakdown)
   */
  const renderPaymentTable = () => {
    const container = document.getElementById('pay-table');
    if (!container) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const weeks = getWeeks(year, month);
    const children = DataManager.getChildren();

    let maxTotal = 0;
    const weekData = weeks.map((week, index) => {
      let paid = 0;
      let pending = 0;

      children.forEach(child => {
        week.forEach(date => {
          if (date > now) return;
          if (!child.days.includes(date.getDay())) return;

          const status = DataManager.getStatus(child.id, DataManager.formatDate(date));
          const breakdown = DataManager.getFareTotal(child, status);

          if (breakdown.pay === 'pagado') {
            paid += breakdown.total;
          } else {
            pending += breakdown.total;
          }
        });
      });

      const total = paid + pending;
      if (total > maxTotal) maxTotal = total;

      return {
        index,
        paid,
        pending,
        total,
        isFuture: week.every(date => date > now)
      };
    });

    let html = weekData.map(w => {
      if (w.isFuture) {
        return `
          <div class="pay-row">
            <div class="pay-week">Sem ${w.index + 1}</div>
            <div class="pay-bar-wrap">
              <div class="pay-bar" style="width:0"></div>
            </div>
            <div class="pay-amount" style="color:var(--text3)">—</div>
            <span class="sbadge" style="background:var(--border);color:var(--text3)">Próxima</span>
          </div>
        `;
      }

      const percentage = maxTotal ? Math.round(w.total / maxTotal * 100) : 0;
      const barColor = w.pending > 0 ? 
        'linear-gradient(90deg,var(--warn),#ffd43b)' : 
        'linear-gradient(90deg,var(--primary-light),var(--accent))';
      const badge = w.pending > 0 ?
        '<span class="sbadge sb-pendiente">Pend.</span>' :
        '<span class="sbadge sb-pagado">Pagado</span>';

      return `
        <div class="pay-row">
          <div class="pay-week">Sem ${w.index + 1}</div>
          <div class="pay-bar-wrap">
            <div class="pay-bar" style="width:${percentage}%;background:${barColor}"></div>
          </div>
          <div class="pay-amount">${DataManager.formatCurrency(w.total)}</div>
          ${badge}
        </div>
      `;
    }).join('');

    const totalPaid = weekData.reduce((sum, w) => sum + w.paid, 0);
    const totalPending = weekData.reduce((sum, w) => sum + w.pending, 0);

    html += `
      <div style="margin-top:12px;padding:11px;background:var(--primary-pale);border-radius:9px;display:flex;justify-content:space-between">
        <div>
          <div style="font-size:11px;color:var(--text3);font-weight:600">Pagado</div>
          <div style="font-size:18px;font-weight:800;color:var(--primary);font-family:Sora,sans-serif">
            ${DataManager.formatCurrency(totalPaid)}
          </div>
        </div>
        <div style="text-align:right">
          <div style="font-size:11px;color:var(--text3);font-weight:600">Pendiente</div>
          <div style="font-size:18px;font-weight:800;color:var(--warn);font-family:Sora,sans-serif">
            ${DataManager.formatCurrency(totalPending)}
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  };

  /**
   * Render attendance donut chart
   */
  const renderDonutChart = () => {
    const container = document.getElementById('donut-wrap');
    if (!container) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const children = DataManager.getChildren();

    let attended = 0;
    let absent = 0;
    let tripInDays = 0;
    let tripOutDays = 0;
    let paidAmount = 0;
    let pendingDays = 0;
    let total = 0;

    children.forEach(child => {
      Object.entries(DataManager.getChildStatuses(child.id)).forEach(([dateStr, status]) => {
        const date = DataManager.parseDate(dateStr);
        
        if (date.getFullYear() === year && date.getMonth() === month) {
          if (date > now) return;
          const breakdown = DataManager.getFareTotal(child, status);
          total++;
          if (breakdown.att === 'asistio') attended++;
          if (breakdown.att === 'no') absent++;
          if (breakdown.tripIn) tripInDays++;
          if (breakdown.tripOut) tripOutDays++;
          if (breakdown.pay === 'pagado') paidAmount += breakdown.total;
          else pendingDays++;
        }
      });
    });

    const percentage = total ? Math.round(attended / total * 100) : 0;
    const radius = 46;
    const circumference = 2 * Math.PI * radius;
    const attendedArc = circumference * (attended / Math.max(total, 1));
    const absentArc = circumference * (absent / Math.max(total, 1));

    // Calculate stats per child
    const childStats = children.map(child => {
      let childAttended = 0;
      let childTotal = 0;

      Object.entries(DataManager.getChildStatuses(child.id)).forEach(([dateStr, status]) => {
        const date = DataManager.parseDate(dateStr);
        
        if (date.getFullYear() === year && date.getMonth() === month) {
          if (date > now) return;
          const breakdown = DataManager.getFareTotal(child, status);
          childTotal++;
          if (breakdown.att === 'asistio') childAttended++;
        }
      });

      const pct = childTotal ? Math.round(childAttended / childTotal * 100) : 0;
      return { child, percentage: pct };
    });

    container.innerHTML = `
      <div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap">
        <svg width="110" height="110" viewBox="0 0 120 120" style="flex-shrink:0">
          <circle cx="60" cy="60" r="${radius}" fill="none" stroke="var(--border)" stroke-width="16"/>
          <circle cx="60" cy="60" r="${radius}" fill="none" stroke="url(#dg1)" stroke-width="16" 
                  stroke-dasharray="${attendedArc} ${circumference - attendedArc}" 
                  stroke-dashoffset="${circumference * 0.25}" stroke-linecap="round"/>
          <circle cx="60" cy="60" r="${radius}" fill="none" stroke="var(--danger)" stroke-width="16" 
                  stroke-dasharray="${absentArc} ${circumference - absentArc}" 
                  stroke-dashoffset="${circumference * 0.25 - attendedArc}" 
                  stroke-linecap="round" opacity="0.8"/>
          <defs>
            <linearGradient id="dg1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#4c6ef5"/>
              <stop offset="100%" stop-color="#12b886"/>
            </linearGradient>
          </defs>
          <text x="60" y="56" text-anchor="middle" font-size="17" font-weight="800" fill="var(--text)" font-family="Sora,sans-serif">${percentage}%</text>
          <text x="60" y="68" text-anchor="middle" font-size="8.5" fill="var(--text3)">asistencia</text>
        </svg>
        <div style="flex:1;min-width:150px">
          <div class="legend-item">
            <div class="ldot" style="background:var(--primary-light)"></div>
            <span style="color:var(--text2)">Total días de ${DataManager.MONTHS[month]}</span>
            <span class="lval">${totalDaysInMonth}</span>
          </div>
          <div class="legend-item">
            <div class="ldot" style="background:var(--accent)"></div>
            <span style="color:var(--text2)">Total días ida</span>
            <span class="lval">${tripInDays}</span>
          </div>
          <div class="legend-item">
            <div class="ldot" style="background:var(--primary)"></div>
            <span style="color:var(--text2)">Total días regreso</span>
            <span class="lval">${tripOutDays}</span>
          </div>
          <div class="legend-item">
            <div class="ldot" style="background:var(--warn)"></div>
            <span style="color:var(--text2)">Total pagado ${DataManager.MONTHS[month]}</span>
            <span class="lval">${DataManager.formatCurrency(paidAmount)}</span>
          </div>
          <div class="legend-item">
            <div class="ldot" style="background:var(--danger)"></div>
            <span style="color:var(--text2)">Días pendientes por pagar</span>
            <span class="lval">${pendingDays}</span>
          </div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:${childStats.map(() => '1fr').join(' ')};gap:7px;margin-top:14px">
        ${childStats.map(({ child, percentage: pct }) => `
          <div style="padding:9px;border-radius:9px;text-align:center;background:${pct >= 80 ? 'var(--accent-pale)' : 'var(--warn-pale)'}">
            <div style="font-size:11px;font-weight:700;color:${pct >= 80 ? 'var(--accent-dark)' : 'var(--warn-dark)'}">
              ${esc(String(child.name || '').split(' ')[0])}
            </div>
            <div style="font-size:18px;font-weight:800;font-family:Sora,sans-serif">${pct}%</div>
            <div style="font-size:10px;color:var(--text3)">asistencia</div>
          </div>
        `).join('')}
      </div>
    `;
  };

  // ──────────────────────────────────────────────────────────────
  // TOAST NOTIFICATIONS
  // ──────────────────────────────────────────────────────────────
  
  /**
   * Show toast notification
   */
  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'toast';
    const cleanMessage = String(message || '').replace(/<[^>]*>/g, '').trim();
    toast.textContent = cleanMessage;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  };

  // ──────────────────────────────────────────────────────────────
  // PUBLIC API
  // ──────────────────────────────────────────────────────────────
  return {
    buildCalendar,
    buildWeekCalendar,
    buildYearCalendar,
    buildDayDetail,
    renderMetrics,
    renderChildrenSidebar,
    renderNotificationPreview,
    renderNotifications,
    renderPaymentTable,
    renderDonutChart,
    showToast,
    generateNotifications
  };
})();
