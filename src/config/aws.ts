/**
 * Configuración de AWS CloudFront
 * 
 * Este archivo centraliza todas las URLs de CloudFront para:
 * - Point Clouds (modelos 3D)
 * - Librerías necesarias
 * - Ejemplos HTML
 * - Otros assets
 */

// URL base del CloudFront Distribution
const CLOUDFRONT_BASE_URL = import.meta.env.VITE_CLOUDFRONT_URL || 'https://d2h8nqd60uagyp.cloudfront.net';

// Debug logging
if (import.meta.env.DEV) {
  console.log('🌩️ CloudFront Base URL:', CLOUDFRONT_BASE_URL);
  console.log('🔍 Environment:', import.meta.env.MODE);
}

/**
 * Configuración de Point Clouds
 * Rutas: /pointclouds/...
 */
export const POINTCLOUDS = {
  // Ejemplo: nube de puntos del Reto Comu
  reto_comu: `${CLOUDFRONT_BASE_URL}/pointclouds/reto-comu/cloud.js`,
  
  // Puedes añadir más point clouds aquí
  // ejemplo: `${CLOUDFRONT_BASE_URL}/pointclouds/otro-proyecto/cloud.js`,
};

/**
 * Configuración de Librerías
 * Rutas: /libs/... y /build/...
 */
export const LIBRARIES = {
  // Potree Main Library
  potreeJS: `${CLOUDFRONT_BASE_URL}/build/potree/potree.js`,
  potreeCSS: `${CLOUDFRONT_BASE_URL}/build/potree/potree.css`,
  
  // Three.js (requerido por Potree)
  threeJS: 'https://cdn.jsdelivr.net/npm/three@r128/build/three.min.js',
  
  // Potree Workers
  potreeWorkers: `${CLOUDFRONT_BASE_URL}/build/potree/workers/`,
  
  // Shaders
  potreeShaders: `${CLOUDFRONT_BASE_URL}/build/potree/shaders/`,
};

/**
 * Configuración de Ejemplos HTML
 * Rutas: /examples/...
 */
export const EXAMPLES = {
  // Ejemplos del Reto Comu
  ca13: `${CLOUDFRONT_BASE_URL}/examples/ca13.html`,
  animationPaths: `${CLOUDFRONT_BASE_URL}/examples/animation_paths.html`,
  annotations: `${CLOUDFRONT_BASE_URL}/examples/annotations.html`,
  cesiumCA13: `${CLOUDFRONT_BASE_URL}/examples/cesium_ca13.html`,
  clippingVolume: `${CLOUDFRONT_BASE_URL}/examples/clipping_volume.html`,
  elevationProfile: `${CLOUDFRONT_BASE_URL}/examples/elevation_profile.html`,
  measurements: `${CLOUDFRONT_BASE_URL}/examples/measurements.html`,
  lightCA13: `${CLOUDFRONT_BASE_URL}/examples/light_ca13.html`,
  
  // Agrega más ejemplos según necesites
};

/**
 * Función auxiliar para construir URLs de CloudFront
 * Uso: buildCloudFrontURL('build/potree/potree.css')
 */
export function buildCloudFrontURL(path: string): string {
  return `${CLOUDFRONT_BASE_URL}/${path}`.replace(/\/+/g, '/');
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
  buildURL: buildCloudFrontURL,
};
