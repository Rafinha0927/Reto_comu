# Integración de AWS CloudFront - Guía de Uso

## Descripción General

Este proyecto está integrado con AWS CloudFront para servir los assets del proyecto **reto-comu-arreglado-main**, incluyendo:

- **Point Clouds 3D** (Nubes de puntos Potree)
- **Librerías y dependencias** (shaders, potree libraries, etc.)
- **Ejemplos HTML** y documentación
- **Otros assets estáticos**

La URL base del CloudFront Distribution es: `https://d2h8nqd60uagyp.cloudfront.net`

---

## Configuración

### Variables de Entorno

En tu archivo `.env` (o usa `.env.example` como referencia), asegúrate de tener configurada:

```env
# URL base del CloudFront Distribution
VITE_CLOUDFRONT_URL=https://d2h8nqd60uagyp.cloudfront.net
```

Si no configuras esta variable, el código usará el valor por defecto.

---

## Uso en el Código

### 1. **Importar la configuración de AWS**

```typescript
import { POINTCLOUDS, buildCloudFrontURL, awsConfig } from '../config/aws';
```

### 2. **Acceder a los Point Clouds**

```typescript
// Usar un point cloud específico
const url = POINTCLOUDS.reto_comu; 
// Resultado: https://d2h8nqd60uagyp.cloudfront.net/pointclouds/reto-comu/cloud.js

// En ThreeDView.tsx ya está implementado:
const POINTCLOUD_URL = POINTCLOUDS.reto_comu;
```

### 3. **Construir URLs personalizadas**

```typescript
// Para cualquier archivo en el CloudFront:
const customURL = buildCloudFrontURL('build/potree/potree.css');
// Resultado: https://d2h8nqd60uagyp.cloudfront.net/build/potree/potree.css
```

### 4. **Acceder a la URL base del CloudFront**

```typescript
const baseURL = awsConfig.cloudfrontBaseURL;
// Resultado: https://d2h8nqd60uagyp.cloudfront.net
```

---

## Estructura de Archivos en S3/CloudFront

Los archivos están organizados así en el bucket S3 y disponibles a través de CloudFront:

```
reto-comu-pointcloud/reto-comu-arreglado-main/static/
├── build/
│   └── potree/
│       ├── potree.js
│       ├── potree.css
│       ├── workers/
│       └── shaders/
├── docs/
├── examples/
│   ├── ca13.html
│   ├── animation_paths.html
│   └── ... (más ejemplos)
├── libs/
│   └── ... (librerías)
└── pointclouds/
    ├── reto-comu/
    │   ├── cloud.js
    │   ├── metadata.json
    │   └── ... (datos del point cloud)
    └── ... (otros projects)
```

### Ejemplos de URLs disponibles:

```
Point Cloud Reto Comu:
https://d2h8nqd60uagyp.cloudfront.net/pointclouds/reto-comu/cloud.js

Librerías Potree:
https://d2h8nqd60uagyp.cloudfront.net/build/potree/potree.js
https://d2h8nqd60uagyp.cloudfront.net/build/potree/potree.css

Ejemplos HTML:
https://d2h8nqd60uagyp.cloudfront.net/examples/ca13.html
https://d2h8nqd60uagyp.cloudfront.net/examples/animations_paths.html
```

---

## Casos de Uso

### ✅ Cargar un Point Cloud en ThreeDView

**Ya está implementado en `src/components/ThreeDView.tsx`:**

```typescript
import { POINTCLOUDS } from '../config/aws';

export function ThreeDView({ ... }) {
  // Usar la configuración de AWS CloudFront
  const POINTCLOUD_URL = POINTCLOUDS.reto_comu;
  
  // Luego en el useEffect:
  (window as any).Potree.loadPointCloud(POINTCLOUD_URL, "reto-comu", (e: any) => {
    // Cargar la nube de puntos
  });
}
```

### 📱 Agregar otro Point Cloud

Si necesitas agregar otro point cloud en el futuro:

1. **Actualiza `src/config/aws.ts`:**

```typescript
export const POINTCLOUDS = {
  reto_comu: `${CLOUDFRONT_BASE_URL}/pointclouds/reto-comu/cloud.js`,
  // Nuevo point cloud:
  otro_proyecto: `${CLOUDFRONT_BASE_URL}/pointclouds/otro-proyecto/cloud.js`,
};
```

2. **Úsalo en tu componente:**

```typescript
const url = POINTCLOUDS.otro_proyecto;
```

### 🎨 Cargar assets dinámicamente

```typescript
// CSS desde CloudFront
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = buildCloudFrontURL('build/potree/potree.css');
document.head.appendChild(link);

// JS desde CloudFront
const script = document.createElement('script');
script.src = buildCloudFrontURL('build/potree/potree.js');
document.body.appendChild(script);
```

---

## Monitoreo y Debugging

### Ver configuración actual en el navegador

En la sección de **Configuración** del dashboard, ve al tab **AWS Services** para ver:
- URL del CloudFront Distribution
- Bucket y región
- Archivos disponibles

### Verificar que funciona

1. Abre las **DevTools** del navegador (F12)
2. Ve a la pestaña **Network**
3. Recarga la página
4. Busca requests a `d2h8nqd60uagyp.cloudfront.net`
5. Verifica que todas las request tengan status `200` o `304` (cached)

### Problemas comunes

| Problema | Solución |
|----------|----------|
| Error 403 Forbidden | Verifica que el bucket tenga permisos públicos o que CloudFront tenga acceso |
| Error 404 Not Found | Verifica que el archivo exista en la estructura correcta en S3 |
| Slow loading | Verifica que CloudFront esté en caché (status 304) |
| CORS errors | Configura CORS en el bucket S3 si es necesario |

---

## Próximos Pasos

### 📝 Para añadir más recursos:

1. **Actualiza la estructura en `src/config/aws.ts`:**
   ```typescript
   export const EXAMPLES = {
     reto_comu_ca13: `${CLOUDFRONT_BASE_URL}/examples/ca13.html`,
   };
   
   export const LIBRARIES = {
     potree_main: `${CLOUDFRONT_BASE_URL}/build/potree/potree.js`,
   };
   ```

2. **Úsalos en tus componentes:**
   ```typescript
   import { EXAMPLES, LIBRARIES, buildCloudFrontURL } from '../config/aws';
   ```

### 🚀 Para modificar la URL del CloudFront:

1. En archivo `.env`:
   ```env
   VITE_CLOUDFRONT_URL=https://nueva-distribucion.cloudfront.net
   ```

2. O en `src/config/aws.ts` (hardcoded):
   ```typescript
   const CLOUDFRONT_BASE_URL = 'https://nueva-distribucion.cloudfront.net';
   ```

---

## Referencia Rápida

```typescript
// Importar configuración
import { 
  POINTCLOUDS, 
  LIBRARIES, 
  EXAMPLES, 
  buildCloudFrontURL, 
  awsConfig 
} from '../config/aws';

// Usar point clouds
const url1 = POINTCLOUDS.reto_comu;

// Construir URLs personalizadas
const url2 = buildCloudFrontURL('custom/path/file.js');

// Obtener URL base
const baseURL = awsConfig.cloudfrontBaseURL;
```

---

## Documentación Relacionada

- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [S3 Bucket Configuration](https://docs.aws.amazon.com/s3/)
- [Potree Documentation](https://potree.org/)

---

**Última actualización:** Noviembre 2025
