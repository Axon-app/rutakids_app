# Guía completa: Base de datos + Login con Supabase (RutaKids)

Esta guía deja la app con:
- Registro e inicio de sesión por email/contraseña.
- Datos por usuario (cada cuenta ve solo su información).
- Persistencia en la nube para que no se borre la información al cerrar navegador.

## 1) Crear proyecto en Supabase
1. Entra a https://supabase.com y crea un proyecto.
2. Espera a que termine el aprovisionamiento.
3. Ve a **Project Settings > API**.
4. Copia:
   - **Project URL**
   - **anon public key**

## 2) Crear tabla y políticas (RLS)
1. Ve a **SQL Editor**.
2. Ejecuta el archivo [supabase-setup.sql](supabase-setup.sql).
3. Verifica en **Table Editor** que exista `rutakids_data`.

## 3) Configurar credenciales en la app
1. Abre [js/config.js](js/config.js).
2. Reemplaza valores:

```js
window.RUTAKIDS_SUPABASE = {
  url: 'https://TU-PROYECTO.supabase.co',
  anonKey: 'TU_SUPABASE_ANON_KEY',
  table: 'rutakids_data'
};
```

## 4) Configurar autenticación por email
1. En Supabase, ve a **Authentication > Providers > Email**.
2. Activa **Email provider**.
3. Decide si pides confirmación por correo (recomendado en producción).

## 5) Probar flujo completo
1. Recarga la app.
2. Debe aparecer pantalla de login.
3. Crea una cuenta nueva o inicia sesión.
4. Agrega datos (hijos, estados, pagos, etc.).
5. Cierra sesión y vuelve a entrar: los datos deben permanecer.

## 6) Despliegue seguro recomendado
- Mantén [js/config.js](js/config.js) con claves de entorno del proyecto final.
- Si usas repositorio público, no subas credenciales sensibles (aunque la anon key sea pública, evita hardcodear producción en repos abiertos).
- Usa dominio HTTPS.

## 7) Diagnóstico rápido
- Si ves mensaje de configuración faltante: revisa [js/config.js](js/config.js).
- Si no guarda en nube: revisa RLS y tabla `rutakids_data`.
- Si no deja entrar: revisa proveedor Email y reglas de contraseña.

## Archivos agregados/modificados
- Cliente nube: [js/cloud.js](js/cloud.js)
- Config local: [js/config.js](js/config.js)
- Ejemplo config: [js/config.example.js](js/config.example.js)
- SQL base: [supabase-setup.sql](supabase-setup.sql)
- Integración app: [js/app.js](js/app.js)
- UI auth: [index.html](index.html), [css/styles.css](css/styles.css)
