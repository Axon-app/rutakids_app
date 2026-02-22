# 🚌 RutaKids - Gestión Profesional de Rutas Escolares

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![PWA](https://img.shields.io/badge/PWA-enabled-success.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🌐 Demo en producción

- Aplicación: https://rutakids-app.web.app/
- Sitio Axon App: https://www.axonapp.com.co/

## ℹ️ Información rápida

- **Aplicación hecha por:** Axon App
- **Uso actual:** Gratuito
- **Licencia del repositorio:** MIT
- **Stack principal:** HTML5, CSS3, JavaScript (Vanilla), Supabase (Auth + PostgreSQL), Firebase Hosting

**RutaKids** es una aplicación web profesional (PWA) para la gestión integral de rutas escolares, control de pagos, asistencia y administración de información de estudiantes.

## ✨ Características Principales

### 📊 Dashboard Intuitivo
- **Métricas en tiempo real**: Visualización de pagos, pendientes, asistencias y niños registrados
- **Calendario interactivo**: Navegación mensual con indicadores visuales de estado
- **Gráficos y estadísticas**: Análisis semanal y mensual de pagos y asistencia
- **Notificaciones inteligentes**: Alertas de pagos pendientes e inasistencias

### 👶 Gestión de Niños
- Registro completo de información personal
- Configuración de tarifas individuales (ida y regreso)
- Selección de días de servicio
- Identificación por colores
- Historial completo de pagos y asistencias

### 💳 Control de Pagos
- Registro rápido de pagos
- Vista de pendientes por niño y fecha
- Resúmenes mensuales y anuales
- Análisis de pagos semanales
- **Exportación de informes en PDF** 📄

### 📄 Exportación de Informes PDF
- **Informes diarios**: Detalle completo de un día específico
- **Informes mensuales**: Resumen mensual por cada niño
- **Informes anuales**: Análisis completo del año
- Incluye: pagos, asistencias, ausencias y totales
- Formato profesional listo para compartir
- Generación instantánea con jsPDF

### 📅 Calendario Completo
- Vista mensual con codificación por colores
- Detalles diarios de servicio
- Edición rápida de estado (asistencia/pago)
- Indicadores visuales de estado

### 🔔 Sistema de Notificaciones
- Alertas de pagos pendientes
- Avisos de inasistencias
- Actualizaciones del sistema
- Contador de notificaciones sin leer

### ⚙️ Configuración Personalizable
- Ajustes de usuario
- Preferencias de notificaciones
- Días de anticipación para recordatorios
- Opciones de privacidad

## 📱 Progressive Web App (PWA)

RutaKids es una **PWA completa** que se puede instalar en cualquier dispositivo:

### Beneficios de la PWA:
- ✅ **Instalación en dispositivos**: Funciona como una app nativa
- ✅ **Funcionalidad offline**: Acceso sin conexión a internet
- ✅ **Actualizaciones automáticas**: Siempre la última versión
- ✅ **Notificaciones push**: Alertas en tiempo real
- ✅ **Rendimiento optimizado**: Carga rápida y fluida
- ✅ **Almacenamiento local**: Datos guardados en el dispositivo

### Instalación en Dispositivos:

#### 📱 Android/iOS (Chrome, Safari)
1. Abre la aplicación en el navegador
2. Toca el menú (⋮) o el botón de compartir
3. Selecciona "Añadir a pantalla de inicio" o "Instalar app"
4. Confirma la instalación

#### 💻 Windows/Mac/Linux (Chrome, Edge)
1. Abre la aplicación en el navegador
2. Haz clic en el icono de instalación (➕) en la barra de direcciones
3. O ve a Menú → "Instalar RutaKids"
4. Confirma la instalación

## 🏗️ Arquitectura del Proyecto

```
rutakit/
├── index.html              # Página principal
├── manifest.json           # Configuración PWA
├── service-worker.js       # Service Worker para offline
│
├── css/
│   ├── styles.css         # Estilos principales
│   └── animations.css     # Animaciones y transiciones
│
├── js/
│   ├── data.js           # Gestión de datos y almacenamiento
│   ├── ui.js             # Componentes de interfaz
│   ├── cloud.js          # Autenticación + sincronización con Supabase
│   ├── config.js         # Configuración local de Supabase
│   ├── config.example.js # Plantilla de configuración
│   └── app.js            # Lógica principal de la aplicación
│
├── assets/
│   ├── icons/            # Iconos de la PWA (diversos tamaños)
│   ├── screenshots/      # Capturas para el manifest
│   └── icon-generator.html  # Generador de iconos
│
└── README.md             # Esta documentación
```

## 🚀 Instalación y Configuración

## 🔐 Base de datos + Login (Supabase)

La app ahora soporta autenticación y persistencia en nube por usuario.

1. Crea un proyecto en Supabase.
2. Ejecuta [supabase-setup.sql](supabase-setup.sql) en SQL Editor.
3. Configura [js/config.js](js/config.js) con URL y ANON KEY.
4. Inicia la app y regístrate/inicia sesión.

Guía completa paso a paso: [GUIA-BD-AUTH-SUPABASE.md](GUIA-BD-AUTH-SUPABASE.md)

### Requisitos Previos
- Navegador web moderno (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Servidor web local o hosting para producción

### Instalación Local

#### Opción 1: Servidor Python
```bash
# Navega a la carpeta del proyecto
cd rutakit

# Python 3
python -m http.server 8000

# O Python 2
python -m SimpleHTTPServer 8000

# Abre http://localhost:8000 en tu navegador
```

#### Opción 2: Node.js (http-server)
```bash
# Instala http-server globalmente
npm install -g http-server

# Navega a la carpeta del proyecto
cd rutakit

# Inicia el servidor
http-server -p 8000

# Abre http://localhost:8000 en tu navegador
```

#### Opción 3: VS Code Live Server
1. Instala la extensión "Live Server" en VS Code
2. Abre la carpeta del proyecto en VS Code
3. Haz clic derecho en `index.html`
4. Selecciona "Open with Live Server"

### Generación de Iconos

1. Abre `assets/icon-generator.html` en tu navegador
2. Haz clic en "Descargar Todos los Iconos"
3. Guarda todos los iconos en la carpeta `assets/icons/`
4. Los iconos se generarán automáticamente en los tamaños requeridos

## � Uso de la Aplicación

### Agregar un Niño
1. Haz clic en el botón **"+ Agregar hijo"** (barra superior o vista "Mis Hijos")
2. Completa la información:
   - Nombre completo
   - Edad y colegio
   - Dirección de recogida
   - Tarifas de ida y regreso
   - Días de servicio (L-M-X-J-V-S-D)
   - Color identificador
3. Haz clic en **"✓ Guardar"**

### Registrar Asistencia y Pagos
1. En el **Dashboard** o vista **Calendario**, haz clic en un día del calendario
2. En la sección de detalle del día, haz clic en la tarjeta de un niño
3. Selecciona:
   - **Asistencia**: Asistió / No asistió
   - **Pago**: Pagado / Pendiente
   - **Nota**: (opcional) Observaciones adicionales
4. Haz clic en **"✓ Guardar"**

### Exportar Informes en PDF 📄
1. Ve a la vista **"Pagos"** o **"Resumen"**
2. Haz clic en el botón **"📄 Exportar informe"**
3. Selecciona el tipo de informe:
   - **Día específico**: Informe detallado de una fecha
   - **Mes completo**: Resumen mensual por cada niño
   - **Año completo**: Análisis anual completo
4. Selecciona el período (fecha, mes y/o año)
5. Haz clic en **"📄 Generar PDF"**
6. El archivo PDF se descargará automáticamente

#### Contenido de los Informes PDF:
- **Informe Diario**: Niños activos, asistencias, pagos y totales del día
- **Informe Mensual**: Días activos, asistencias, ausencias, pagos y totales por niño
- **Informe Anual**: Resumen completo del año con totales generales

### Ver Resúmenes
- **Dashboard**: Métricas principales, calendario interactivo y gráficos
- **Pagos**: Lista de días pendientes por niño con opción de registro rápido
- **Resumen**: Tablas detalladas por mes con asistencias y pagos

### Notificaciones
- El contador de notificaciones aparece en el icono 🔔
- Haz clic en el icono para ver todas las notificaciones
- Las notificaciones incluyen:
  - Pagos pendientes próximos
  - Inasistencias recientes
  - Recordatorios de servicio

## �💾 Gestión de Datos

### Almacenamiento Local
- Los datos se almacenan en **localStorage** del navegador
- Persistencia automática de cambios
- Sin necesidad de servidor backend
- Datos accesibles offline

### Estructura de Datos

#### Niños (Children)
```javascript
{
  id: "c1629384756789",
  name: "María García",
  age: 8,
  school: "Colegio San José",
  address: "Calle 123 # 45-67",
  fareIn: 15000,
  fareOut: 15000,
  days: [1, 2, 3, 4, 5],  // L-V
  color: "blue"
}
```

#### Estados (Statuses)
```javascript
{
  "c1_2025-02-17": {
    att: "asistio",      // asistio | no | pendiente
    pay: "pagado",       // pagado | pendiente
    nota: "Salida temprana"
  }
}
```

### Exportar/Importar Datos

Para exportar tus datos:
```javascript
// En la consola del navegador
const data = DataManager.exportData();
console.log(JSON.stringify(data, null, 2));
```

Para importar datos:
```javascript
const importedData = {/* tus datos */};
DataManager.importData(importedData);
```

## 🎨 Diseño y Estética

### Sistema de Colores

```css
--primary: #3b5bdb       /* Azul principal */
--accent: #12b886        /* Verde acentuado */
--warn: #f59f00          /* Amarillo de advertencia */
--danger: #f03e3e        /* Rojo de peligro */
--purple: #7048e8        /* Púrpura */
```

### Tipografía

- **Principal**: Plus Jakarta Sans (sans-serif moderna)
- **Títulos**: Sora (tipografía display)
- **Pesos**: 300, 400, 500, 600, 700, 800

### Animaciones

Todas las animaciones están optimizadas para rendimiento:
- Transiciones suaves (easing functions)
- Animaciones por GPU (transform, opacity)
- Respeta `prefers-reduced-motion`
- Animaciones de entrada/salida para vistas

## 📱 Responsive Design

### Breakpoints

- **Desktop**: > 900px
- **Tablet**: 600px - 900px
- **Mobile**: < 600px

### Adaptaciones Móviles

- Navegación inferior en dispositivos móviles
- Grids adaptables (4 columnas → 2 → 1)
- Modales de pantalla completa
- Touch-friendly (botones de 44px+ mínimo)
- Tipografía escalable

## 🔒 Seguridad y Privacidad

- ✅ No requiere backend ni base de datos externa
- ✅ Todos los datos se almacenan localmente
- ✅ Sin tracking ni analytics
- ✅ Sin recopilación de datos personales
- ✅ Funciona 100% offline
- ✅ Los datos nunca salen del dispositivo

## 🛠️ Tecnologías Utilizadas

### Frontend
- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos, Grid, Flexbox
- **JavaScript (ES6+)**: Lógica de aplicación
- **Web APIs**: localStorage, Service Workers, Cache API

### Librerías Externas
- **jsPDF**: Generación de informes en formato PDF
- **Google Fonts**: Plus Jakarta Sans, Sora

### PWA
- **Service Workers**: Funcionalidad offline
- **Web App Manifest**: Instalación en dispositivos
- **Cache API**: Almacenamiento de assets
- **IndexedDB-ready**: Preparado para bases de datos locales

### Patrones de Diseño
- **Module Pattern**: Encapsulación de código
- **Observer Pattern**: Gestión de eventos
- **MVC-like**: Separación de responsabilidades
  - `data.js`: Model (datos)
  - `ui.js`: View (interfaz)
  - `app.js`: Controller (lógica)

## 🐛 Resolución de Problemas

### Los iconos no se muestran
1. Verifica que los archivos estén en `assets/icons/`
2. Genera los iconos con `icon-generator.html`
3. Verifica las rutas en `manifest.json`

### La app no funciona offline
1. Verifica que el Service Worker esté registrado
2. Abre DevTools → Application → Service Workers
3. Verifica el estado del cache
4. Intenta "Update on reload"

### Los datos no se guardan
1. Verifica que localStorage esté habilitado
2. Comprueba el espacio disponible (5-10MB)
3. Revisa la consola para errores
4. Intenta en modo incógnito (sin extensiones)

### Errores en dispositivos móviles
1. Actualiza el navegador a la última versión
2. Limpia el cache y datos del sitio
3. Reinstala la PWA
4. Verifica que HTTPS esté habilitado (requerido para PWA)

## 📈 Mejoras Futuras

### Versión 1.1
- [ ] Sincronización en la nube (Firebase/Supabase)
- [ ] Cuentas de usuario múltiples
- [x] **Reportes en PDF** ✅ (Completado)
- [ ] Exportación a Excel
- [ ] Tema oscuro

### Versión 1.2
- [ ] Notificaciones push programadas
- [ ] Integración con Google Calendar
- [ ] Chat con conductor
- [ ] Tracking GPS de rutas
- [ ] Pagos integrados (PSE, tarjetas)

### Versión 2.0
- [ ] App nativa (React Native)
- [ ] Panel para conductores
- [ ] Sistema de mensajería
- [ ] Geolocalización en tiempo real
- [ ] Integraciones con colegios

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guía de Estilo
- Usa ES6+ syntax
- Comenta código complejo
- Mantén la consistencia con el código existente
- Prueba en múltiples navegadores

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

Desarrollado con ❤️ por Edwin González

## 📞 Soporte

Si encuentras algún problema o tienes sugerencias:

- 🐛 Abre un issue en GitHub
- 💬 Contacta al desarrollador
- 📧 Email de soporte

---

## 🌟 Agradecimientos

- Diseño inspirado en las mejores prácticas de UI/UX
- Iconos y emojis de Unicode
- Fuentes de Google Fonts
- Comunidad de desarrolladores web

---

<div align="center">

**¡Gracias por usar RutaKids! 🚌**

[⬆ Volver arriba](#-rutakids---gestión-profesional-de-rutas-escolares)

</div>
