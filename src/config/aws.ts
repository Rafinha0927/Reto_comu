/**
 * Configuración definitiva de Potree desde AWS CloudFront
 * Probado y funcionando con tu bucket reto-comu-pointcloud
 */

const CLOUDFRONT_BASE_URL =
  import.meta.env.VITE_CLOUDFRONT_URL || 'https://d2h8nqd60uagyp.cloudfront.net';

/**
 * Rutas reales según tus capturas de S3
 */
export const POINTCLOUD_CONFIG = {
  // Nube principal del Reto Comu
  RETO_COMU: {
    metadata: `${CLOUDFRONT_BASE_URL}/cloud.js`,                                    // ← archivo principal
    pointcloudFolder: `${CLOUDFRONT_BASE_URL}/pointclouds/reto-comu`,              // ← carpeta con los .bin
  },

  // Puedes añadir más nubes aquí fácilmente
  // EDIFICIO_B: {
  //   metadata: `${CLOUDFRONT_BASE_URL}/cloud-edificio-b.js`,
  //   pointcloudFolder: `${CLOUDFRONT_BASE_URL}/pointclouds/edificio-b`,
  // },
};

/**
 * Archivos de Potree (los que están en build/potree/)
 */
export const POTREE_FILES = {
  js: `${CLOUDFRONT_BASE_URL}/build/potree/potree.js`,
  css: `${CLOUDFRONT_BASE_URL}/build/potree/potree.css`,
  worker: `${CLOUDFRONT_BASE_URL}/build/potree/workers/potree.worker.js`,
  // Si usas lazylibs o otros workers, también aquí
};

/**
 * Utilidad para construir URLs limpias
 */
export const buildCFUrl = (path: string): string => {
  return `${CLOUDFRONT_BASE_URL}/${path.replace(/^\/+/, '')}`;
};