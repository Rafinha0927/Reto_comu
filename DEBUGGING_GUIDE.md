# 🚨 GUÍA DE DEBUGGING - Dashboard IoT

## Problema: El dashboard no se visualiza correctamente

Si estás viendo una pantalla en blanco o los componentes no cargan, aquí te muestro cómo debuggear paso a paso.

---

## 1. Verificar la Consola del Navegador (F12)

Abre las DevTools (F12 o Cmd+Option+I en Mac) y ve a la pestaña **Console**.

### 🔍 Qué buscar:

**Errores rojos (Errors):**
- `Failed to fetch from cloudfront...` → Problema con CloudFront
- `Cannot find module...` → Problema con imports
- `Uncaught SyntaxError...` → Problema de sintaxis

**Avisos amarillos (Warnings):**
- Generalmente no son críticos, pero revisa si están relacionados con tus cambios

---

## 2. Diagnosticar Automáticamente

He añadido un sistema de diagnosis automático que puedes ejecutar:

### Opción A: Desde la Consola (Recomendado)

1. Abre DevTools (F12)
2. Ve a la pestaña **Console**
3. Copia y pega:

```javascript
__dashboard.runDiagnosis()
```

4. Presiona Enter y revisa la salida

### Qué hace:
- ✅ Verifica que CloudFront está accesible
- ✅ Comprueba que los archivos existen
- ✅ Verifica variables de entorno
- ✅ Comprueba que THREE.js y Potree están disponibles

---

## 3. Verificaciones Específicas por Componente

### A. Vista 3D (ThreeDView) - No carga Point Cloud

**Síntomas:**
- Ves "Cargando nube de puntos 3D desde AWS..." pero nunca carga
- Ves un error rojo en lugar de la vista 3D

**Qué revisar en Console:**

```
// Busca estos mensajes:
✅ CSS de Potree cargado correctamente
✅ Potree JS cargado correctamente
✅ Inicializando visor Potree
✅ Iniciando carga del point cloud...
✅ Point cloud cargado exitosamente
```

**Si ves errores:**

1. Verifica la URL del Point Cloud:
```javascript
__dashboard.pointclouds.reto_comu
// Debe mostrar: https://d2h8nqd60uagyp.cloudfront.net/pointclouds/reto-comu/cloud.js
```

2. Verifica que el archivo existe en AWS:
```javascript
__dashboard.testAssetLoading()
// Verifica cada asset uno por uno
```

3. Revisa la pestaña **Network** de DevTools:
   - Filtra por `cloudfront.net`
   - Busca el archivo `cloud.js`
   - Si ves `404` → El archivo no existe en S3
   - Si ves `403` → Problema de permisos
   - Si ves `200` o `304` → OK, funcionó

### B. Componentes UI - No aparecen o están rotos

**Síntomas:**
- Header, Sidebar, Cards no aparecen
- Parece que la página está en blanco

**Qué revisar:**

1. Abre la pestaña **Elements** en DevTools
2. Busca el `<div id="root">` 
3. Verifica que tiene contenido (no debe estar vacío)

Si está vacío:
```javascript
// En Console, verifica:
console.log(document.getElementById('root'))
// Debe mostrar el div con contenido React
```

### C. Variables de Entorno - No se leen

**Síntomas:**
- Mensaje que dice "usando default" en lugar de tu URL

**Qué revisar:**

```javascript
// En la consola, ejecuta:
import.meta.env.VITE_CLOUDFRONT_URL
// Debe mostrar: https://d2h8nqd60uagyp.cloudfront.net

import.meta.env.VITE_WEBSOCKET_URL
// Debe mostrar: wss://b5yrr6dcq0.execute-api.us-east-1.amazonaws.com/production/
```

Si muestra `undefined`, necesitas:
1. Crear archivo `.env` en la raíz del proyecto
2. Reiniciar servidor de desarrollo (`npm run dev`)

---

## 4. Problemas Comunes y Soluciones

### ❌ "Error 403 Forbidden" en CloudFront

**Causa:** Permisos incorrectos en S3/CloudFront

**Solución:**
1. Ir a AWS Console → S3 → Bucket `reto-comu-pointcloud`
2. Verificar permisos públicos
3. Ir a CloudFront → Distibution → Verificar Origin Access

### ❌ "Error 404 Not Found"

**Causa:** El archivo no existe en la estructura de S3

**Solución:**
1. Verificar estructura exacta en S3
2. Actualizar URLs en `src/config/aws.ts` si la estructura es diferente
3. Ejemplo incorrecto: `/pointclouds/reto-comu/cloud.js`
4. Ejemplo correcto: `/reto-comu-arreglado-main/static/pointclouds/reto-comu/cloud.js`

### ❌ "CORS Error"

**Síntoma:** Error diciendo "Access-Control-Allow-Origin"

**Solución:**
1. Ir a AWS S3 Console → Bucket
2. Ir a "Permissions" → "CORS configuration"
3. Agregar:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3000
  }
]
```

### ❌ WebSocket no conecta

**Síntoma:** "Sistema Desconectado" en el Header

**Solución:**
1. Verificar URL del WebSocket:
```javascript
import.meta.env.VITE_WEBSOCKET_URL
```
2. Verificar en AWS que el API Gateway existe y está activo
3. Verificar que la URL está correcta (incluye `/production/` al final)

---

## 5. Pasos para Debugging Completo

### Paso 1: Reiniciar todo
```bash
# Detener el servidor
# Presionar Ctrl+C en terminal

# Eliminar cache
rm -rf node_modules/.vite

# Reiniciar servidor
npm run dev
```

### Paso 2: Limpiar caché del navegador
1. Abre DevTools (F12)
2. Click derecho en botón "Reload" en la barra de direcciones
3. Selecciona "Empty Cache and Hard Refresh"

### Paso 3: Revisar Console
```javascript
// Ejecutar diagnosis
__dashboard.runDiagnosis()

// Ver todas las URLs configuradas
__dashboard.logAllURLs()

// Probar acceso a cada asset
__dashboard.testAssetLoading()
```

### Paso 4: Revisar Network
1. Abre DevTools → Network tab
2. Recarga la página (F5)
3. Busca errores (status rojo)
4. Haz clic en cada request para ver detalles

---

## 6. Información para Copiar-Pegar en Búsqueda de Errores

Si necesitas pedir ayuda, copia esto en la consola y pásame la salida:

```javascript
console.log('=== INFORMACIÓN DEL DASHBOARD ===');
console.log('URL CloudFront:', import.meta.env.VITE_CLOUDFRONT_URL);
console.log('URL WebSocket:', import.meta.env.VITE_WEBSOCKET_URL);
console.log('URL API:', import.meta.env.VITE_API_BASE_URL);
console.log('Point Cloud URL:', __dashboard.pointclouds.reto_comu);
console.log('Potree JS:', __dashboard.libraries.potreeJS);
console.log('Potree Disponible:', !!(window).Potree);
console.log('THREE Disponible:', !!(window).THREE);
```

---

## 7. Checklist Rápido

Marca estos items para asegurar que todo está configurado:

- [ ] Archivo `.env` existe en la raíz del proyecto
- [ ] `.env` tiene `VITE_CLOUDFRONT_URL=https://d2h8nqd60uagyp.cloudfront.net`
- [ ] Servidor reiniciado después de crear `.env`
- [ ] DevTools Console no tiene errores rojos
- [ ] `__dashboard.runDiagnosis()` muestra todos ✅
- [ ] Network tab muestra requests a CloudFront con status 200 o 304
- [ ] Vista 3D muestra "Cargando nube de puntos..." en lugar de pantalla en blanco

---

## 8. Contactar por Soporte

Si después de todo esto sigue sin funcionar, proporciona:

1. Screenshot de los errores en Console
2. Salida de `__dashboard.runDiagnosis()`
3. URL actual que ves en el navegador
4. Qué esperas ver vs. qué ves

---

## 🎯 Resumen Rápido

| Problema | Comando Console |
|----------|-----------------|
| Diagnosis completa | `__dashboard.runDiagnosis()` |
| Ver todas las URLs | `__dashboard.logAllURLs()` |
| Probar assets | `__dashboard.testAssetLoading()` |
| Ver configuración | `__dashboard.config` |
| Ver point clouds | `__dashboard.pointclouds` |
| Ver librerías | `__dashboard.libraries` |

---

**Última actualización:** 29 de Noviembre, 2025

Mantén esta guía a mano mientras debuggeas.
