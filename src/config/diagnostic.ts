/**
 * Archivo de diagnóstico para debugging
 */

import { POINTCLOUD_CONFIG, POTREE_FILES } from './aws'; // ← misma carpeta

export async function runDiagnosis() {
  console.log('%cINICIANDO DIAGNOSIS DEL DASHBOARD', 'font-size: 16px; font-weight: bold; color: #0066cc;');
  console.log('='.repeat(60));

  const baseUrl = import.meta.env.VITE_CLOUDFRONT_URL || 'https://d2h8nqd60uagyp.cloudfront.net';
  const pcUrl = POINTCLOUD_CONFIG.RETO_COMU.metadata;

  console.log('\nCONFIGURACIÓN CLOUDFRONT');
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Point Cloud: ${pcUrl}`);
  console.log(`Potree JS: ${POTREE_FILES.js}`);
  console.log(`Potree CSS: ${POTREE_FILES.css}`);

  console.log('\nVERIFICANDO CONECTIVIDAD');

  // Test CloudFront base
  try {
    const res = await fetch(baseUrl + '/cloud.js', { method: 'HEAD' });
    console.log(`CloudFront cloud.js → ${res.status}`);
  } catch (e) { console.error('cloud.js → ERROR', e); }

  // Test Point Cloud
  try {
    const res = await fetch(pcUrl, { method: 'HEAD' });
    console.log(`Point Cloud → ${res.status}`);
  } catch (e) { console.error('Point Cloud → ERROR', e); }

  // Test Potree JS
  try {
    const res = await fetch(POTREE_FILES.js, { method: 'HEAD' });
    console.log(`Potree JS → ${res.status}`);
  } catch (e) { console.error('Potree JS → ERROR', e); }

  // Variables de entorno
  console.log('\nVARIABLES DE ENTORNO');
  console.log('VITE_CLOUDFRONT_URL:', import.meta.env.VITE_CLOUDFRONT_URL || 'default usado');
  console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL || 'no configurada');
  console.log('VITE_WEBSOCKET_URL:', import.meta.env.VITE_WEBSOCKET_URL || 'no configurada');

  console.log('\n' + '='.repeat(60));
  console.log('%cDIAGNOSIS COMPLETADA', 'color: green; font-weight: bold;');
}

// Auto-ejecutar en desarrollo
if (import.meta.env.DEV) {
  setTimeout(runDiagnosis, 2000);

  // Exponer en consola
  (window as any).__diag = { runDiagnosis };
  console.log('%cEjecuta __diag.runDiagnosis() para diagnóstico manual', 'color: orange');
}