# 🚀 Deployment & Testing Guide

## Pre-Deployment Checklist

### ✅ Verificaciones Técnicas

- [x] Sin errores de TypeScript
- [x] Todas las importaciones correctas
- [x] Variables de entorno configuradas
- [x] CloudFront URL validada: `https://d2h8nqd60uagyp.cloudfront.net`

### ✅ Archivos Configurados

- [x] `src/config/aws.ts` - Configuración centralizada
- [x] `src/env.d.ts` - Tipos de variables de entorno
- [x] `.env.example` - Template de variables
- [x] `src/components/ThreeDView.tsx` - Usa CloudFront
- [x] `src/components/ConfigurationView.tsx` - Muestra CloudFront

---

## 📋 Configuración Antes de Deploy

### 1. Crear archivo `.env` en la raíz del proyecto

```bash
# Copiar .env.example a .env
cp .env.example .env
```

**Contenido de `.env`:**
```env
VITE_CLOUDFRONT_URL=https://d2h8nqd60uagyp.cloudfront.net
VITE_WEBSOCKET_URL=wss://b5yrr6dcq0.execute-api.us-east-1.amazonaws.com/production/
VITE_API_BASE_URL=https://your-api-gateway.execute-api.region.amazonaws.com/production
```

### 2. Instalar dependencias

```bash
npm install
# o
yarn install
```

### 3. Verificar build local

```bash
npm run build
# o
yarn build
```

---

## 🧪 Testing Local

### Test 1: Verificar Configuración AWS

En la consola del navegador (DevTools > Console):

```javascript
// Importar la configuración
import { awsConfig, POINTCLOUDS } from './src/config/aws.ts';

// Ver configuración
console.log('CloudFront URL:', awsConfig.cloudfrontBaseURL);
console.log('Point Cloud URL:', POINTCLOUDS.reto_comu);
```

### Test 2: Verificar Carga de Point Clouds

1. Abrir el dashboard
2. Ir a la vista 3D (ThreeDView)
3. Abrir DevTools > Network
4. Buscar requests a `d2h8nqd60uagyp.cloudfront.net`
5. Verificar que devuelven status `200` o `304` (cached)

**Archivos esperados:**
- `cloud.js` (point cloud principal)
- `potree.js` (librería)
- `potree.css` (estilos)

### Test 3: Verificar ConfigurationView

1. Abrir Configuration View
2. Ir a tab "AWS Services"
3. Verificar que muestra:
   - URL del CloudFront: `https://d2h8nqd60uagyp.cloudfront.net`
   - Estructura de archivos disponibles
   - Información del bucket S3

### Test 4: Error Handling

Si ves errores como:
- **403 Forbidden** → Revisar permisos del bucket S3
- **404 Not Found** → Verificar que los archivos existan en S3
- **CORS Error** → Configurar CORS en bucket S3

---

## 🔍 Debugging

### Habilitar logs de Debug

En `src/components/ThreeDView.tsx`, agrega:

```typescript
useEffect(() => {
  // ... código existente ...
  
  (window as any).Potree.loadPointCloud(POINTCLOUD_URL, "reto-comu", (e: any) => {
    console.log('✅ Point cloud cargado exitosamente:', e);
    // ... resto del código ...
  });
}, [...]);
```

### Ver estado de CloudFront en el navegador

Agregar al `App.tsx`:

```typescript
import { reportAssetStatus } from './config/aws.examples';

useEffect(() => {
  // Opcional: Reportar estado de assets en desarrollo
  if (import.meta.env.DEV) {
    reportAssetStatus();
  }
}, []);
```

---

## 📦 Build & Deploy

### Build para Producción

```bash
npm run build
```

Esto genera carpeta `dist/` con los archivos listos para deploy.

### Verificar que no hay errores

```bash
npm run preview
# Esto inicia servidor local con la versión compilada
```

### Variables de Entorno en Producción

Asegurate de que en tu plataforma de hosting (Vercel, AWS Amplify, etc.) estén configuradas:

```env
VITE_CLOUDFRONT_URL=https://d2h8nqd60uagyp.cloudfront.net
VITE_WEBSOCKET_URL=wss://b5yrr6dcq0.execute-api.us-east-1.amazonaws.com/production/
VITE_API_BASE_URL=https://your-api-gateway.execute-api.region.amazonaws.com/production
```

---

## 🔐 Seguridad

### CORS Configuration (si es necesario)

Si el bucket S3 no permite acceso cruzado, habilitar CORS:

**En AWS S3 Console → Bucket → Permissions → CORS:**

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["https://tu-dominio.com"],
    "ExposeHeaders": ["x-amz-server-side-encryption"],
    "MaxAgeSeconds": 3000
  }
]
```

### CloudFront Origin Access Identity (OAI)

Verificar en AWS CloudFront Console que:
- [ ] Distribution está activa
- [ ] Origin apunta al bucket S3 correcto
- [ ] OAI está configurada
- [ ] Bucket policy permite acceso de CloudFront

---

## 📊 Monitoreo Post-Deploy

### Verificar en CloudFront Console

1. **Hit Ratio**: Porcentaje de requests servidas desde caché
2. **Data Transfer**: Tráfico hacia/desde el origen
3. **Requests**: Número total de requests
4. **Error Rate**: Errores 4xx y 5xx

**Objetivo:** Hit Ratio > 80% después de 24 horas

### Monitorear en Application

1. Abrir DevTools > Performance
2. Registrar carga de la vista 3D
3. Verificar que los assets se cargan rápidamente

**Timing esperado:**
- Point Cloud: < 5 segundos (depende del tamaño)
- Librerías: < 1 segundo (cached)
- Total: < 10 segundos

---

## 🆘 Troubleshooting

### Problema: Point Cloud no carga

**Solución:**
```typescript
// 1. Verificar URL es correcta
console.log(POINTCLOUDS.reto_comu);
// Debe ser: https://d2h8nqd60uagyp.cloudfront.net/pointclouds/reto-comu/cloud.js

// 2. Verificar que el archivo existe en S3
// 3. Verificar que CloudFront distribution está activa
// 4. Limpiar caché: Invalidar /pointclouds/* en CloudFront
```

### Problema: CORS error

**Solución:**
1. Ir a AWS S3 Console
2. Bucket → Permissions → CORS
3. Agregar origen de tu sitio

### Problema: Lento cargando

**Solución:**
1. Verificar que CloudFront está en caché (status 304)
2. Invalidar caché en CloudFront si actualizaste archivos
3. Revisar CloudFront Distribution performance en AWS Console

### Problema: Variable de entorno no se lee

**Solución:**
```typescript
// En desarrollo, reiniciar servidor Vite
// En producción, hacer rebuild y redeploy
// Verificar que variable existe en .env o en settings de hosting
```

---

## 📞 Contacto & Soporte

Para problemas con:
- **CloudFront/S3**: Revisar [AWS Documentation](https://docs.aws.amazon.com/)
- **Point Clouds**: Revisar [Potree Documentation](https://potree.org/)
- **Vite**: Revisar [Vite Guide](https://vitejs.dev/)

---

## ✅ Checklist Final de Deploy

- [ ] Build sin errores: `npm run build`
- [ ] Variables de entorno configuradas
- [ ] Test local en navegador
- [ ] Network requests a CloudFront exitosas
- [ ] Point cloud carga correctamente
- [ ] ConfigurationView muestra URL correcta
- [ ] No hay errores en DevTools Console
- [ ] Listo para deploy a producción

---

**Last Updated:** Noviembre 29, 2025  
**Status:** Ready for Production ✅
