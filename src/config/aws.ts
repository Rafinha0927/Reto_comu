/**
 * Configuración de AWS CloudFront
 * ACTUALIZADO CON LAS RUTAS REALES DE TU S3
 */

// URL base del CloudFront Distribution
const CLOUDFRONT_BASE_URL = import.meta.env.VITE_CLOUDFRONT_URL || 'https://d2h8nqd60uagyp.cloudfront.net';

/**
 * Configuración de Point Clouds
 * Basado en tu estructura real de S3: /pointclouds/Puntos/
 */
export const POINTCLOUDS = {
  // Nube de puntos del Reto Comu (ruta real de tu S3)
  reto_comu: `${CLOUDFRONT_BASE_URL}/pointclouds/Puntos/cloud.js`,
  
  // Alternativas basadas en la estructura estándar de Potree
  reto_comu_sources: `${CLOUDFRONT_BASE_URL}/pointclouds/Puntos/sources.json`,
  reto_comu_data: `${CLOUDFRONT_BASE_URL}/pointclouds/Puntos/data/`,
  reto_comu_metadata: `${CLOUDFRONT_BASE_URL}/pointclouds/Puntos/metadata.json`,
};

/**
 * Configuración de Librerías Potree
 * Basado en tu estructura real de S3: /static/build/potree/
 */
export const LIBRARIES = {
  // Ruta principal de Potree (según tu S3)
  potreeJS: `${CLOUDFRONT_BASE_URL}/static/build/potree/potree.js`,
  potreeCSS: `${CLOUDFRONT_BASE_URL}/static/build/potree/potree.css`,
  
  // Source map si existe
  potreeJSMap: `${CLOUDFRONT_BASE_URL}/static/build/potree/potree.js.map`,
  
  // Licencia
  potreeLicense: `${CLOUDFRONT_BASE_URL}/static/build/potree/LICENSE`,
  
  // LazyLibs si existen
  lazyLibs: `${CLOUDFRONT_BASE_URL}/static/build/potree/lazylibs/`,
  
  // THREE.js si está disponible en otra ubicación
  threeJS: `${CLOUDFRONT_BASE_URL}/static/libs/three.js`,
};

/**
 * Configuración de Ejemplos HTML y Templates
 * Basado en tu estructura de S3
 */
export const EXAMPLES = {
  // Profile HTML que viste en la carpeta potree
  profile: `${CLOUDFRONT_BASE_URL}/static/build/potree/profile.html`,
  
  // Si tienes templates adicionales
  templates: `${CLOUDFRONT_BASE_URL}/templates/`,
};

/**
 * Configuración de Assets Adicionales
 * Carpetas que viste en /libs/
 */
export const ASSETS = {
  // Carpetas que viste en tu S3
  brotli: `${CLOUDFRONT_BASE_URL}/static/libs/brotli/`,
  cesium: `${CLOUDFRONT_BASE_URL}/static/libs/Cesium/`,
  copc: `${CLOUDFRONT_BASE_URL}/static/libs/copc/`,
  d3: `${CLOUDFRONT_BASE_URL}/static/libs/d3/`,
  ept: `${CLOUDFRONT_BASE_URL}/static/libs/ept/`,
  geopackage: `${CLOUDFRONT_BASE_URL}/static/libs/geopackage/`,
  i18next: `${CLOUDFRONT_BASE_URL}/static/libs/i18next/`,
};

/**
 * Función auxiliar para construir URLs de CloudFront
 * Uso: buildCloudFrontURL('static/build/potree/potree.css')
 */
export function buildCloudFrontURL(path: string): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${CLOUDFRONT_BASE_URL}/${cleanPath}`.replace(/\/+/g, '/').replace('://', '://');
}

/**
 * Función para obtener la URL completa del CloudFront
 */
export function getCloudFrontBaseURL(): string {
  return CLOUDFRONT_BASE_URL;
}

// Exportar configuración completa como objeto
export const awsConfig = {
  cloudfrontBaseURL: CLOUDFRONT_BASE_URL,
  pointclouds: POINTCLOUDS,
  libraries: LIBRARIES,
  examples: EXAMPLES,
  assets: ASSETS,
  buildURL: buildCloudFrontURL,
};

/**
 * Función de diagnóstico para verificar URLs específicas de tu S3
 */
export async function testPotreeUrls() {
  console.log('🧪 Testando URLs reales de tu S3...');
  
  const urlsToTest = [
    { name: 'Potree JS', url: LIBRARIES.potreeJS },
    { name: 'Potree CSS', url: LIBRARIES.potreeCSS },
    { name: 'Point Cloud Cloud.js', url: POINTCLOUDS.reto_comu },
    { name: 'Point Cloud Sources.json', url: POINTCLOUDS.reto_comu_sources },
    { name: 'Profile HTML', url: EXAMPLES.profile },
  ];
  
  for (const { name, url } of urlsToTest) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      console.log(`${response.ok ? '✅' : '❌'} ${name}: ${url} (${response.status})`);
    } catch (error) {
      console.log(`❌ ${name}: ${url} (Error: ${error})`);
    }
  }
}

/**
 * URLs específicas para debugging
 */
export const DEBUG_URLS = {
  // URLs directas que puedes copiar para testear en navegador
  potreeJS: 'https://d2h8nqd60uagyp.cloudfront.net/static/build/potree/potree.js',
  potreeCSS: 'https://d2h8nqd60uagyp.cloudfront.net/static/build/potree/potree.css',
  pointCloud: 'https://d2h8nqd60uagyp.cloudfront.net/pointclouds/Puntos/cloud.js',
  sources: 'https://d2h8nqd60uagyp.cloudfront.net/pointclouds/Puntos/sources.json',
};