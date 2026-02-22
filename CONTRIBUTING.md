# Guía de Contribución - RutaKids

¡Gracias por tu interés en contribuir a RutaKids! 🚌

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Cómo Contribuir](#cómo-contribuir)
- [Reportar Bugs](#reportar-bugs)
- [Sugerir Mejoras](#sugerir-mejoras)
- [Pull Requests](#pull-requests)
- [Guía de Estilo](#guía-de-estilo)
- [Estructura del Código](#estructura-del-código)

## 📜 Código de Conducta

Este proyecto y todos los participantes se rigen por un código de conducta de colaboración respetuosa. Al participar, se espera que mantengas este código.

## 🤝 Cómo Contribuir

### 1. Fork el Repositorio

```bash
# Haz fork del repositorio en GitHub
# Clona tu fork localmente
git clone https://github.com/TU-USUARIO/rutakit.git
cd rutakit
```

### 2. Crea una Rama

```bash
# Crea una rama para tu feature o fix
git checkout -b feature/nueva-funcionalidad
# O
git checkout -b fix/correccion-bug
```

### 3. Realiza tus Cambios

- Escribe código limpio y bien documentado
- Sigue las convenciones de estilo del proyecto
- Prueba tus cambios en múltiples navegadores
- Asegúrate de que la aplicación funcione offline

### 4. Commit tus Cambios

```bash
# Añade tus cambios
git add .

# Commit con un mensaje descriptivo
git commit -m "feat: agrega funcionalidad de exportación PDF"
```

#### Convención de Mensajes de Commit

Usa el formato [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Formateo, no afecta el código
- `refactor:` Refactorización de código
- `test:` Añadir o modificar tests
- `chore:` Tareas de mantenimiento

Ejemplos:
```
feat: agrega tema oscuro
fix: corrige error en cálculo de totales
docs: actualiza README con instrucciones de instalación
style: formatea código según ESLint
refactor: optimiza renderizado del calendario
```

### 5. Push y Pull Request

```bash
# Push a tu fork
git push origin feature/nueva-funcionalidad
```

Luego abre un Pull Request en GitHub con:
- Descripción clara de los cambios
- Screenshots si es visual
- Referencias a issues relacionados

## 🐛 Reportar Bugs

### Antes de Reportar

1. Verifica que el bug no haya sido reportado
2. Asegúrate de usar la última versión
3. Prueba en diferentes navegadores

### Cómo Reportar

Crea un issue con:

**Título**: Descripción breve y clara

**Descripción**:
- Pasos para reproducir
- Comportamiento esperado
- Comportamiento actual
- Screenshots (si aplica)
- Navegador y versión
- Sistema operativo
- Versión de RutaKids

**Ejemplo**:

```markdown
## Bug: Error al guardar hijo sin edad

### Pasos para reproducir
1. Ir a "Mis Hijos"
2. Clic en "Agregar hijo"
3. Llenar solo nombre y colegio (dejar edad vacía)
4. Clic en "Guardar"

### Comportamiento esperado
Debería guardar con edad 0 o mostrar validación

### Comportamiento actual
Error en consola: "NaN is not a number"

### Entorno
- Navegador: Chrome 120.0
- OS: Windows 11
- Versión: 1.0.0

### Screenshots
[Adjuntar captura de pantalla]
```

## 💡 Sugerir Mejoras

Para sugerir una nueva funcionalidad:

1. Verifica que no exista ya la sugerencia
2. Crea un issue con etiqueta `enhancement`
3. Describe detalladamente:
   - El problema que resuelve
   - La solución propuesta
   - Alternativas consideradas
   - Mockups o diagramas (si aplica)

## 🔄 Pull Requests

### Checklist Antes de Enviar

- [ ] El código sigue el estilo del proyecto
- [ ] Se ejecutó y probó localmente
- [ ] Se probó en móvil y desktop
- [ ] Se probó en modo offline
- [ ] Se actualizó la documentación si es necesario
- [ ] Los commits siguen las convenciones
- [ ] No hay conflictos con main/master

### Proceso de Revisión

1. Un mantenedor revisará tu PR
2. Puede solicitar cambios
3. Realiza los cambios solicitados
4. Una vez aprobado, se hará merge

## 🎨 Guía de Estilo

### JavaScript

#### Convenciones Generales

```javascript
// ✅ Bien
const getUserName = () => {
  return user.name;
};

const totalAmount = calculateTotal(items);

// ❌ Evitar
function get_user_name() {
  return user.name;
}

var total_amount = calculateTotal(items);
```

#### Módulos

```javascript
// Usa IIFE para módulos
const MiModulo = (() => {
  'use strict';
  
  // Privado
  const privateVar = 'privado';
  
  const privateFunction = () => {
    // ...
  };
  
  // Público
  return {
    publicMethod: () => {
      // ...
    }
  };
})();
```

#### Async/Await

```javascript
// ✅ Bien
const fetchData = async () => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// ❌ Evitar callbacks anidados
fetchData(url, function(data) {
  processData(data, function(result) {
    displayResult(result, function() {
      // Callback hell
    });
  });
});
```

### CSS

#### Nomenclatura

```css
/* Usa nombres descriptivos en kebab-case */
.user-card { }
.btn-primary { }
.modal-overlay { }

/* Variables CSS para colores y valores reutilizables */
:root {
  --color-primary: #3b5bdb;
  --spacing-lg: 24px;
}
```

#### Organización

```css
/* Agrupa propiedades relacionadas */
.elemento {
  /* Posicionamiento */
  position: relative;
  top: 0;
  left: 0;
  
  /* Box Model */
  display: flex;
  width: 100%;
  padding: 16px;
  margin: 0;
  
  /* Tipografía */
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px;
  
  /* Visual */
  background: var(--color-primary);
  border-radius: 8px;
  
  /* Animación */
  transition: all 0.3s ease;
}
```

### HTML

```html
<!-- Usa estructura semántica -->
<section class="dashboard">
  <header class="dashboard-header">
    <h1>Título</h1>
  </header>
  
  <main class="dashboard-content">
    <!-- Contenido -->
  </main>
</section>

<!-- Atributos en orden -->
<button
  class="btn btn-primary"
  id="save-btn"
  data-action="save"
  aria-label="Guardar cambios"
  onclick="handleSave()"
>
  Guardar
</button>
```

### Comentarios

```javascript
/* ══════════════════════════════════════════
   SECCIÓN PRINCIPAL
   ══════════════════════════════════════════ */

// ──────────────────────────────────────────
// Subsección
// ──────────────────────────────────────────

/**
 * Descripción de la función
 * @param {string} param - Descripción del parámetro
 * @returns {Object} Descripción del retorno
 */
const funcionDocumentada = (param) => {
  // Implementación
};

// Comentario de una línea para explicar código complejo
const resultado = calculoComplejo(); // Comentario inline si es necesario
```

## 📁 Estructura del Código

### Añadir Nueva Vista

1. **HTML** (`index.html`):
```html
<div class="view" id="view-nueva">
  <!-- Contenido -->
</div>
```

2. **CSS** (`css/styles.css`):
```css
/* Nueva vista */
.view-nueva {
  /* Estilos específicos */
}
```

3. **JavaScript** (`js/app.js`):
```javascript
// En VIEW_TITLES
const VIEW_TITLES = {
  // ...
  nueva: 'Nueva Vista 🆕'
};

// Nueva función de renderizado
const renderNuevaVista = () => {
  // Implementación
};

// En renderView()
case 'nueva':
  renderNuevaVista();
  break;
```

### Añadir Componente UI

En `js/ui.js`:

```javascript
/**
 * Renderiza nuevo componente
 */
const renderNuevoComponente = (container, data) => {
  const el = document.getElementById(container);
  if (!el) return;
  
  el.innerHTML = data.map(item => `
    <div class="componente-item">
      ${item.content}
    </div>
  `).join('');
};

// Exportar en el return
return {
  // ...
  renderNuevoComponente
};
```

## 🧪 Testing

Aunque actualmente no hay suite de tests, al contribuir:

1. Prueba manualmente todas las funcionalidades afectadas
2. Verifica en diferentes navegadores:
   - Chrome/Edge (últimas 2 versiones)
   - Firefox (últimas 2 versiones)
   - Safari (últimas 2 versiones si es posible)
3. Prueba en móvil (iOS y Android)
4. Verifica funcionamiento offline
5. Revisa la consola para errores

## 📱 Consideraciones PWA

Al modificar el Service Worker:

1. Incrementa la versión del cache
2. Prueba instalación/actualización
3. Verifica funcionamiento offline
4. Comprueba que los assets se cachean correctamente

```javascript
// Incrementa la versión
const CACHE_NAME = 'rutakids-v1.0.1'; // Anterior: v1.0.0
```

## 🔍 Revisión de Código

Los revisores verificarán:

- ✅ Funcionalidad correcta
- ✅ Código limpio y mantenible
- ✅ Sin errores en consola
- ✅ Responsive design
- ✅ Accesibilidad básica
- ✅ Rendimiento aceptable
- ✅ Compatibilidad con navegadores
- ✅ Documentación actualizada

## 💬 Comunicación

- **Issues**: Para bugs, features, preguntas
- **Pull Requests**: Para contribuciones de código
- **Discussions**: Para ideas y conversaciones generales

## 🙏 Agradecimientos

Gracias por tomarte el tiempo de contribuir a RutaKids. Cada contribución, por pequeña que sea, es valiosa para mejorar el proyecto.

---

¿Tienes preguntas? No dudes en abrir un issue con la etiqueta `question`.

**¡Feliz codificación! 🚀**
