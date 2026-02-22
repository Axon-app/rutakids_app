# 📄 Guía de Exportación de Informes PDF - RutaKids

## 🎯 Descripción General

RutaKids ahora incluye una funcionalidad completa de exportación de informes en formato PDF profesional. Puedes generar informes detallados de un día específico, un mes completo o un año entero.

## 🚀 Cómo Usar

### Paso 1: Acceder a la Función

Hay dos lugares donde puedes exportar informes:

1. **Vista de Pagos** (`💳 Pagos`)
   - Navega a la sección "Pagos" desde el menú lateral
   - Haz clic en el botón **"📄 Exportar informe"** en la parte superior derecha

2. **Vista de Resumen** (`📊 Resumen`)
   - Navega a la sección "Resumen" desde el menú lateral
   - Haz clic en el botón **"📄 Exportar informe"** en la parte superior derecha

### Paso 2: Seleccionar Tipo de Informe

Se abrirá un modal con opciones:

#### 📅 Día Específico
- Genera un informe detallado de una fecha en particular
- Muestra:
  - Lista de niños con servicio ese día
  - Estado de asistencia de cada niño
  - Estado de pago de cada niño
  - Tarifas individuales
  - Notas adicionales
  - Resumen con totales

#### 📆 Mes Completo
- Genera un resumen mensual completo
- Muestra por cada niño:
  - Días activos en el mes
  - Total de asistencias
  - Total de ausencias
  - Total pagado
  - Total pendiente
  - Total general
- Incluye resumen total del mes

#### 📊 Año Completo
- Genera un análisis anual completo
- Muestra por cada niño:
  - Total de días activos en el año
  - Total de asistencias anuales
  - Total de ausencias anuales
  - Total pagado en el año
  - Total pendiente en el año
  - Total general del año
- Incluye resumen total del año

### Paso 3: Seleccionar Período

Según el tipo de informe seleccionado:

- **Día**: Selecciona la fecha específica usando el selector de fecha
- **Mes**: Selecciona el mes y el año deseados
- **Año**: Selecciona el año deseado

### Paso 4: Generar PDF

1. Haz clic en el botón **"📄 Generar PDF"**
2. El PDF se generará automáticamente
3. El archivo se descargará a tu carpeta de descargas
4. Verás una notificación de confirmación

## 📋 Estructura de los Informes

### Informe Diario
```
┌─────────────────────────────────────┐
│   RutaKids - Informe Diario         │
│   Fecha: Lunes 17 de febrero 2026   │
├─────────────────────────────────────┤
│ 1. María García                     │
│    Institución: Colegio San José    │
│    Tarifa: Ida $15,000 + Regreso    │
│            $15,000 = $30,000        │
│    Asistencia: Asistió              │
│    Pago: Pagado                     │
│                                     │
│ 2. Juan Pérez                       │
│    ...                              │
├─────────────────────────────────────┤
│ RESUMEN DEL DÍA                     │
│ Total de niños activos: 3           │
│ Asistencias: 2                      │
│ Ausencias: 1                        │
│ Total pagado: $60,000               │
│ Total pendiente: $30,000            │
│ TOTAL: $90,000                      │
└─────────────────────────────────────┘
```

### Informe Mensual
```
┌─────────────────────────────────────┐
│   RutaKids - Informe Mensual        │
│   Período: Febrero 2026             │
├─────────────────────────────────────┤
│ 1. María García                     │
│    Días activos: 20                 │
│    Asistencias: 18 | Ausencias: 2   │
│    Total pagado: $540,000           │
│    Total pendiente: $60,000         │
│    TOTAL: $600,000                  │
│                                     │
│ 2. Juan Pérez                       │
│    ...                              │
├─────────────────────────────────────┤
│ RESUMEN DEL MES                     │
│ Total de niños registrados: 3       │
│ Total asistencias: 54               │
│ Total ausencias: 6                  │
│ Total pagado: $1,620,000            │
│ Total pendiente: $180,000           │
│ TOTAL GENERAL: $1,800,000           │
└─────────────────────────────────────┘
```

### Informe Anual
```
┌─────────────────────────────────────┐
│   RutaKids - Informe Anual          │
│   Año: 2026                         │
├─────────────────────────────────────┤
│ 1. María García                     │
│    Total días activos: 240          │
│    Asistencias: 216 | Ausencias: 24 │
│    Total pagado: $6,480,000         │
│    Total pendiente: $720,000        │
│    TOTAL ANUAL: $7,200,000          │
│                                     │
│ 2. Juan Pérez                       │
│    ...                              │
├─────────────────────────────────────┤
│ RESUMEN ANUAL 2026                  │
│ Total de niños registrados: 3       │
│ Total asistencias: 648              │
│ Total ausencias: 72                 │
│ Total pagado: $19,440,000           │
│ Total pendiente: $2,160,000         │
│ TOTAL GENERAL 2026: $21,600,000     │
└─────────────────────────────────────┘
```

## 🎨 Características del PDF

### Diseño Profesional
- ✅ Encabezado con logo y título de RutaKids
- ✅ Fecha/período claramente visible
- ✅ Formato organizado y legible
- ✅ Colores corporativos (azul, verde, naranja)
- ✅ Tipografía clara y profesional

### Datos Incluidos
- ✅ Información completa de cada niño
- ✅ Desglose detallado de tarifas
- ✅ Estados de asistencia y pago
- ✅ Notas adicionales (cuando existen)
- ✅ Resúmenes totales
- ✅ Estadísticas consolidadas

### Funcionalidades
- ✅ Paginación automática (múltiples páginas si es necesario)
- ✅ Nombres de archivo descriptivos
- ✅ Formato PDF estándar compatible
- ✅ Descarga instantánea
- ✅ Sin necesidad de conexión a internet

## 📱 Uso en Dispositivos Móviles

La función de exportación funciona también en dispositivos móviles:

1. Toca el botón **"📄 Exportar informe"**
2. Selecciona el tipo y período
3. Toca **"📄 Generar PDF"**
4. El PDF se descargará a tu dispositivo
5. Puedes compartirlo directamente desde tu móvil

## 💡 Casos de Uso

### Para Padres de Familia
- Llevar registro mensual de pagos
- Justificar gastos de transporte escolar
- Compartir con el colegio si es necesario
- Mantener archivo personal

### Para Conductores/Administradores
- Generar reportes de cobro
- Enviar resúmenes a padres
- Llevar contabilidad mensual/anual
- Facturación y comprobantes

### Para Contabilidad
- Conciliación de pagos
- Declaraciones tributarias
- Auditorías internas
- Archivo de respaldo

## ⚙️ Configuración Técnica

### Librería Utilizada
- **jsPDF 2.5.1**: Librería JavaScript para generación de PDF
- Cargada desde CDN (sin instalación necesaria)
- Compatible con todos los navegadores modernos

### Requisitos
- ✅ Navegador moderno (Chrome, Firefox, Safari, Edge)
- ✅ JavaScript habilitado
- ✅ Permisos de descarga en el navegador
- ❌ No requiere conexión a internet (después de la primera carga)

## 🐛 Solución de Problemas

### El PDF no se descarga
1. Verifica los permisos de descarga del navegador
2. Asegúrate de que el bloqueador de pop-ups no esté activo
3. Intenta con otro navegador
4. Verifica que haya espacio en disco

### El PDF está vacío o incompleto
1. Asegúrate de tener niños registrados
2. Verifica que haya datos para el período seleccionado
3. Revisa la consola del navegador (F12) para errores
4. Intenta generar un informe de prueba

### Error al generar PDF
1. Recarga la página (Ctrl+R o Cmd+R)
2. Limpia el caché del navegador
3. Verifica que jsPDF se haya cargado correctamente
4. Revisa la consola para mensajes de error

## 📞 Soporte

Si encuentras algún problema:
1. Verifica esta guía primero
2. Revisa la consola del navegador (F12)
3. Crea un issue en el repositorio con:
   - Descripción del problema
   - Navegador y versión
   - Pasos para reproducir
   - Captura de pantalla (si aplica)

## 🎉 ¡Disfruta de tus Informes!

Ahora puedes generar informes profesionales con un solo clic. Esta funcionalidad te ayudará a mantener un mejor control de pagos y asistencias, facilitando la gestión de tu servicio de ruta escolar.

---

**RutaKids** - Gestión Profesional de Rutas Escolares 🚌
