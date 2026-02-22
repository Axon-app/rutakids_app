/* ══════════════════════════════════════════════════════════════
   RUTAKIDS - DATA MANAGEMENT MODULE
   Handles all data storage, retrieval, and manipulation
   ══════════════════════════════════════════════════════════════ */

const DataManager = (() => {
  'use strict';

  // ──────────────────────────────────────────────────────────────
  // CONSTANTS
  // ─────────────────────────────────────────────────────────────
  const STORAGE_KEYS = {
    CHILDREN: 'rutakids_children',
    STATUSES: 'rutakids_statuses',
    CONFIG: 'rutakids_config',
    USER: 'rutakids_user',
    DEMO_DISABLED: 'rutakids_demo_disabled'
  };

  const COLORS = {
    blue: 'linear-gradient(135deg,#4c6ef5,#7048e8)',
    green: 'linear-gradient(135deg,#12b886,#339af0)',
    orange: 'linear-gradient(135deg,#f59f00,#f03e3e)',
    pink: 'linear-gradient(135deg,#e64980,#7048e8)'
  };

  const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const DAY_MAP = { 1: 'L', 2: 'M', 3: 'X', 4: 'J', 5: 'V', 6: 'S', 0: 'D' };
  
  const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  const HOLIDAYS_2026 = {
    '2026-01-01': 'Año Nuevo',
    '2026-01-12': 'Día de los Reyes Magos',
    '2026-03-23': 'Día de San José',
    '2026-04-02': 'Jueves Santo',
    '2026-04-03': 'Viernes Santo',
    '2026-05-01': 'Día del Trabajo',
    '2026-05-18': 'Ascensión del Señor',
    '2026-06-08': 'Corpus Christi',
    '2026-06-15': 'Sagrado Corazón de Jesús',
    '2026-06-29': 'San Pedro y San Pablo',
    '2026-07-20': 'Independencia de Colombia',
    '2026-08-07': 'Batalla de Boyacá',
    '2026-08-17': 'La Asunción de la Virgen',
    '2026-10-12': 'Día de la Raza',
    '2026-11-02': 'Día de Todos los Santos',
    '2026-11-16': 'Independencia de Cartagena',
    '2026-12-08': 'Inmaculada Concepción',
    '2026-12-25': 'Día de Navidad'
  };

  // ──────────────────────────────────────────────────────────────
  // STATE
  // ──────────────────────────────────────────────────────────────
  let appState = {
    children: [],
    statuses: {},
    config: {
      userName: 'María González',
      notificationsEnabled: true,
      paymentReminderDays: 2
    },
    user: {
      name: 'María González',
      initials: 'MG'
    }
  };

  // ──────────────────────────────────────────────────────────────
  // UTILITY FUNCTIONS
  // ──────────────────────────────────────────────────────────────
  
  /**
   * Format date to YYYY-MM-DD string
   */
  const formatDate = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  /**
   * Parse date string to Date object
   */
  const parseDate = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  /**
   * Format currency (Colombian Pesos)
   */
  const formatCurrency = (amount) => {
    return '$' + Number(amount).toLocaleString('es-CO');
  };

  /**
   * Convert unknown value to safe plain string
   */
  const normalizeText = (value) => {
    if (value === null || value === undefined) return '';
    return String(value).trim();
  };

  /**
   * Escape special HTML characters
   */
  const escapeHTML = (value) => {
    const text = normalizeText(value);
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  /**
   * Generate unique ID
   */
  const generateId = () => {
    return 'c' + Date.now() + Math.random().toString(36).substr(2, 9);
  };

  /**
   * Get holiday label for a date (YYYY-MM-DD)
   */
  const getHoliday = (dateStr) => {
    return HOLIDAYS_2026[dateStr] || '';
  };

  // ──────────────────────────────────────────────────────────────
  // LOCAL STORAGE FUNCTIONS
  // ──────────────────────────────────────────────────────────────
  
  /**
   * Save data to localStorage
   */
  const saveToStorage = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  };

  /**
   * Load data from localStorage
   */
  const loadFromStorage = (key, defaultValue = null) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return defaultValue;
    }
  };

  /**
   * Clear specific storage key
   */
  const clearStorage = (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  };

  /**
   * Clear all app data
   */
  const clearAllData = () => {
    Object.values(STORAGE_KEYS).forEach(key => clearStorage(key));
  };

  /**
   * Enable/disable demo data seeding
   */
  const setDemoDisabled = (disabled) => {
    saveToStorage(STORAGE_KEYS.DEMO_DISABLED, Boolean(disabled));
  };

  // ──────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ──────────────────────────────────────────────────────────────
  
  /**
   * Initialize app with demo data if no data exists
   */
  const initializeDemoData = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // Demo children
    const demoChildren = [
      {
        id: 'c1',
        name: 'Sofía González',
        school: 'Colegio Los Andes',
        address: 'Cra 15 # 80-20, Bogotá',
        fareIn: 15000,
        fareOut: 15000,
        days: [1, 2, 3, 4, 5],
        color: 'blue'
      },
      {
        id: 'c2',
        name: 'Mateo González',
        school: 'Colegio San Marcos',
        address: 'Cra 15 # 80-20, Bogotá',
        fareIn: 18000,
        fareOut: 18000,
        days: [1, 3, 5],
        color: 'green'
      }
    ];

    // Generate demo statuses for the current month
    const demoStatuses = {};
    
    for (let day = 1; day < now.getDate(); day++) {
      const date = new Date(year, month, day);
      const dow = date.getDay();
      const dateStr = formatDate(date);

      demoChildren.forEach(child => {
        if (!child.days.includes(dow)) return;

        // Create status for this day
        const key = `${child.id}_${dateStr}`;
        demoStatuses[key] = {
          att: day === 14 && child.id === 'c2' ? 'no' : 'asistio',
          pay: day < 12 ? 'pagado' : 'pendiente',
          nota: ''
        };
      });
    }

    // Today's status
    const todayStr = formatDate(now);
    demoChildren.forEach(child => {
      if (child.days.includes(now.getDay())) {
        const key = `${child.id}_${todayStr}`;
        demoStatuses[key] = {
          att: 'asistio',
          pay: 'pendiente',
          nota: ''
        };
      }
    });

    return { children: demoChildren, statuses: demoStatuses };
  };

  /**
   * Load all data from storage or initialize with demo data
   */
  const loadAllData = () => {
    let children = loadFromStorage(STORAGE_KEYS.CHILDREN);
    let statuses = loadFromStorage(STORAGE_KEYS.STATUSES);
    const demoDisabled = loadFromStorage(STORAGE_KEYS.DEMO_DISABLED, false);

    // If no data exists, use demo data
    if (!children || children.length === 0) {
      if (!demoDisabled) {
        const demoData = initializeDemoData();
        children = demoData.children;
        statuses = demoData.statuses;
        
        // Save demo data
        saveToStorage(STORAGE_KEYS.CHILDREN, children);
        saveToStorage(STORAGE_KEYS.STATUSES, statuses);
      } else {
        children = [];
        statuses = {};
      }
    }

    appState.children = children || [];
    appState.statuses = statuses || {};
    appState.config = loadFromStorage(STORAGE_KEYS.CONFIG, appState.config);
    appState.user = loadFromStorage(STORAGE_KEYS.USER, appState.user);
  };

  /**
   * Save all data to storage
   */
  const saveAllData = () => {
    saveToStorage(STORAGE_KEYS.CHILDREN, appState.children);
    saveToStorage(STORAGE_KEYS.STATUSES, appState.statuses);
    saveToStorage(STORAGE_KEYS.CONFIG, appState.config);
    saveToStorage(STORAGE_KEYS.USER, appState.user);
  };

  // ──────────────────────────────────────────────────────────────
  // CHILDREN MANAGEMENT
  // ──────────────────────────────────────────────────────────────
  
  /**
   * Get all children
   */
  const getChildren = () => {
    return [...appState.children];
  };

  /**
   * Get child by ID
   */
  const getChildById = (id) => {
    return appState.children.find(child => child.id === id);
  };

  /**
   * Add new child
   */
  const addChild = (childData) => {
    const newChild = {
      id: generateId(),
      name: normalizeText(childData.name),
      school: normalizeText(childData.school),
      address: normalizeText(childData.address),
      fareIn: parseInt(childData.fareIn) || 0,
      fareOut: parseInt(childData.fareOut) || 0,
      days: childData.days || [],
      color: childData.color || 'blue'
    };

    appState.children.push(newChild);
    saveToStorage(STORAGE_KEYS.CHILDREN, appState.children);
    return newChild;
  };

  /**
   * Update child
   */
  const updateChild = (id, childData) => {
    const index = appState.children.findIndex(child => child.id === id);
    if (index === -1) return false;

    const normalized = { ...childData };
    if (Object.prototype.hasOwnProperty.call(normalized, 'name')) {
      normalized.name = normalizeText(normalized.name);
    }
    if (Object.prototype.hasOwnProperty.call(normalized, 'school')) {
      normalized.school = normalizeText(normalized.school);
    }
    if (Object.prototype.hasOwnProperty.call(normalized, 'address')) {
      normalized.address = normalizeText(normalized.address);
    }

    appState.children[index] = {
      ...appState.children[index],
      ...normalized
    };

    saveToStorage(STORAGE_KEYS.CHILDREN, appState.children);
    return true;
  };

  /**
   * Get unique names from all children (sorted alphabetically)
   */
  const getUniqueNames = () => {
    const names = appState.children.map(child => child.name);
    return [...new Set(names)].sort();
  };

  /**
   * Delete child and all related statuses
   */
  const deleteChild = (id) => {
    // Remove child
    appState.children = appState.children.filter(child => child.id !== id);
    
    // Remove all statuses for this child
    Object.keys(appState.statuses).forEach(key => {
      if (key.startsWith(id + '_')) {
        delete appState.statuses[key];
      }
    });

    saveToStorage(STORAGE_KEYS.CHILDREN, appState.children);
    saveToStorage(STORAGE_KEYS.STATUSES, appState.statuses);
    return true;
  };

  // ──────────────────────────────────────────────────────────────
  // STATUS MANAGEMENT
  // ──────────────────────────────────────────────────────────────
  
  /**
   * Get status for a specific child and date
   */
  const getStatus = (childId, dateStr) => {
    const key = `${childId}_${dateStr}`;
    return appState.statuses[key] || null;
  };

  /**
   * Set status for a specific child and date
   */
  const setStatus = (childId, dateStr, statusData) => {
    const key = `${childId}_${dateStr}`;
    const existing = appState.statuses[key] || {};

    appState.statuses[key] = {
      att: statusData.att ?? existing.att ?? 'pendiente',
      pay: statusData.pay ?? existing.pay ?? 'pendiente',
      nota: statusData.nota ?? existing.nota ?? '',
      tripIn: statusData.tripIn ?? existing.tripIn ?? null,
      tripOut: statusData.tripOut ?? existing.tripOut ?? null,
      fareIn: statusData.fareIn ?? existing.fareIn ?? null,
      fareOut: statusData.fareOut ?? existing.fareOut ?? null
    };

    saveToStorage(STORAGE_KEYS.STATUSES, appState.statuses);
    return true;
  };

  /**
   * Clear status for a specific child and date
   */
  const clearStatus = (childId, dateStr) => {
    const key = `${childId}_${dateStr}`;
    if (appState.statuses[key]) {
      delete appState.statuses[key];
      saveToStorage(STORAGE_KEYS.STATUSES, appState.statuses);
    }
  };

  /**
   * Clear all statuses for a specific date
   */
  const clearDateStatuses = (dateStr) => {
    Object.keys(appState.statuses).forEach(key => {
      if (key.endsWith(`_${dateStr}`)) delete appState.statuses[key];
    });
    saveToStorage(STORAGE_KEYS.STATUSES, appState.statuses);
  };

  /**
   * Normalize status, filling trip flags and fares with sensible defaults
   */
  const normalizeStatus = (child, status) => {
    const safeStatus = status || {};
    const hasStatus = Boolean(status);
    const att = safeStatus.att ?? 'pendiente';
    const tripIn = safeStatus.tripIn ?? (hasStatus ? (att === 'no' ? false : true) : false);
    const tripOut = safeStatus.tripOut ?? (hasStatus ? (att === 'no' ? false : true) : false);
    const fareIn = safeStatus.fareIn ?? child.fareIn;
    const fareOut = safeStatus.fareOut ?? child.fareOut;

    return {
      att,
      pay: safeStatus.pay ?? 'pendiente',
      nota: safeStatus.nota ?? '',
      tripIn,
      tripOut,
      fareIn,
      fareOut
    };
  };

  /**
   * Calculate total fare based on trips taken
   */
  const getFareTotal = (child, status) => {
    if (!child) return 0;
    const normalized = normalizeStatus(child, status);
    const totalIn = normalized.tripIn ? Number(normalized.fareIn || 0) : 0;
    const totalOut = normalized.tripOut ? Number(normalized.fareOut || 0) : 0;
    return {
      total: totalIn + totalOut,
      fareIn: totalIn,
      fareOut: totalOut,
      tripIn: normalized.tripIn,
      tripOut: normalized.tripOut,
      pay: normalized.pay,
      att: normalized.att,
      nota: normalized.nota
    };
  };

  /**
   * Get all statuses for a child
   */
  const getChildStatuses = (childId) => {
    const statuses = {};
    Object.entries(appState.statuses).forEach(([key, value]) => {
      if (key.startsWith(childId + '_')) {
        const dateStr = key.split('_')[1];
        statuses[dateStr] = value;
      }
    });
    return statuses;
  };

  /**
   * Get month statistics
   */
  const getMonthStats = (year, month) => {
    let paid = 0;
    let pending = 0;
    let attended = 0;
    let absent = 0;
    const now = new Date();

    appState.children.forEach(child => {
      Object.entries(appState.statuses).forEach(([key, status]) => {
        if (!key.startsWith(child.id + '_')) return;

        const dateStr = key.split('_')[1];
        const date = parseDate(dateStr);

        if (date.getFullYear() !== year || date.getMonth() !== month) return;
        if (date > now) return;
        const breakdown = getFareTotal(child, status);

        if (breakdown.pay === 'pagado') {
          paid += breakdown.total;
        } else {
          pending += breakdown.total;
        }

        if (breakdown.att === 'asistio') attended++;
        else if (breakdown.att === 'no') absent++;
      });
    });

    return { paid, pending, attended, absent };
  };

  // ──────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ──────────────────────────────────────────────────────────────
  
  /**
   * Get configuration
   */
  const getConfig = () => {
    return { ...appState.config };
  };

  /**
   * Update configuration
   */
  const updateConfig = (configData) => {
    appState.config = {
      ...appState.config,
      ...configData
    };
    saveToStorage(STORAGE_KEYS.CONFIG, appState.config);
    return true;
  };

  /**
   * Get user info
   */
  const getUser = () => {
    return { ...appState.user };
  };

  /**
   * Update user info
   */
  const updateUser = (userData = {}) => {
    appState.user = {
      ...appState.user,
      ...userData,
      name: normalizeText(userData.name ?? appState.user.name),
      initials: normalizeText(userData.initials ?? appState.user.initials)
    };
    saveToStorage(STORAGE_KEYS.USER, appState.user);
    return true;
  };

  // ──────────────────────────────────────────────────────────────
  // EXPORT/IMPORT
  // ──────────────────────────────────────────────────────────────
  
  /**
   * Export all data as JSON
   */
  const exportData = () => {
    return {
      children: appState.children,
      statuses: appState.statuses,
      config: appState.config,
      user: appState.user,
      exportDate: new Date().toISOString()
    };
  };

  /**
   * Import data from JSON
   */
  const importData = (data) => {
    try {
      if (data.children) appState.children = data.children;
      if (data.statuses) appState.statuses = data.statuses;
      if (data.config) appState.config = data.config;
      if (data.user) appState.user = data.user;
      
      saveAllData();
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  };

  // ──────────────────────────────────────────────────────────────
  // PUBLIC API
  // ──────────────────────────────────────────────────────────────
  return {
    // Constants
    COLORS,
    MONTHS,
    DAY_MAP,
    DAY_NAMES,

    // Utilities
    formatDate,
    parseDate,
    formatCurrency,
    generateId,
    escapeHTML,
    getHoliday,

    // Initialization
    loadAllData,
    saveAllData,
    clearAllData,
    setDemoDisabled,

    // Children
    getChildren,
    getChildById,
    getUniqueNames,
    addChild,
    updateChild,
    deleteChild,

    // Statuses
    getStatus,
    setStatus,
    clearStatus,
    clearDateStatuses,
    normalizeStatus,
    getFareTotal,
    getChildStatuses,
    getMonthStats,

    // Config
    getConfig,
    updateConfig,
    getUser,
    updateUser,

    // Export/Import
    exportData,
    importData
  };
})();

// Initialize data on load
DataManager.loadAllData();
