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
 * Rutas: /libs/...
 */
export const LIBRARIES = {
  // Path a librerías si las necesitas servir desde CloudFront
  // Ejemplo: potree: `${CLOUDFRONT_BASE_URL}/libs/potree/potree.js`,
};

/**
 * Configuración de Ejemplos HTML
 * Rutas: /examples/...
 */
export const EXAMPLES = {
  // Puedes referenciar ejemplos HTML del Reto Comu
  // Ejemplo: reto_comu_main: `${CLOUDFRONT_BASE_URL}/examples/ca13.html`,
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
