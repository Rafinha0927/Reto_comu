/**
 * Archivo de diagnóstico para debugging
 * 
 * Este archivo se carga en desarrollo para ayudar a identificar problemas
 * con las cargas de assets desde CloudFront
 */

import { awsConfig, POINTCLOUDS, LIBRARIES } from './aws';

/**
 * Realizar diagnosis completa del sistema
 */
export async function runDiagnosis() {
  console.log('%c🔍 INICIANDO DIAGNOSIS DEL DASHBOARD', 'font-size: 16px; font-weight: bold; color: #0066cc;');
  console.log('='.repeat(60));

  // 1. Verificar CloudFront URL
  console.log('\n📍 CONFIGURACIÓN DE CLOUDFRONT');
  console.log(`Base URL: ${awsConfig.cloudfrontBaseURL}`);
  console.log(`Point Cloud URL: ${POINTCLOUDS.reto_comu}`);
  console.log(`Potree JS: ${LIBRARIES.potreeJS}`);
  console.log(`Potree CSS: ${LIBRARIES.potreeCSS}`);

  // 2. Verificar conectividad a CloudFront
  console.log('\n🌐 VERIFICANDO CONECTIVIDAD A CLOUDFRONT');
  try {
    const response = await fetch(awsConfig.cloudfrontBaseURL + '/', {
      method: 'HEAD',
    });
    console.log(`✅ CloudFront accesible (Status: ${response.status})`);
  } catch (error) {
    console.error(`❌ Error conectando a CloudFront:`, error);
  }

  // 3. Verificar Point Cloud
  console.log('\n☁️ VERIFICANDO POINT CLOUD');
  try {
    const response = await fetch(POINTCLOUDS.reto_comu, { method: 'HEAD' });
    console.log(`✅ Point Cloud accesible (Status: ${response.status})`);
  } catch (error) {
    console.error(`❌ Error accediendo al Point Cloud:`, error);
  }

  // 4. Verificar librerías
  console.log('\n📦 VERIFICANDO LIBRERÍAS');
  try {
    const jsResponse = await fetch(LIBRARIES.potreeJS, { method: 'HEAD' });
    console.log(`✅ Potree JS accesible (Status: ${jsResponse.status})`);
  } catch (error) {
    console.error(`❌ Error accediendo a Potree JS:`, error);
  }

  try {
    const cssResponse = await fetch(LIBRARIES.potreeCSS, { method: 'HEAD' });
    console.log(`✅ Potree CSS accesible (Status: ${cssResponse.status})`);
  } catch (error) {
    console.error(`❌ Error accediendo a Potree CSS:`, error);
  }

  // 5. Verificar variables de entorno
  console.log('\n⚙️ VARIABLES DE ENTORNO');
  console.log(`VITE_CLOUDFRONT_URL: ${import.meta.env.VITE_CLOUDFRONT_URL || 'NO CONFIGURADA (usando default)'}`);
  console.log(`VITE_WEBSOCKET_URL: ${import.meta.env.VITE_WEBSOCKET_URL || 'NO CONFIGURADA'}`);
  console.log(`VITE_API_BASE_URL: ${import.meta.env.VITE_API_BASE_URL || 'NO CONFIGURADA'}`);

  // 6. Verificar que window.Potree esté disponible
  console.log('\n🎬 VERIFICANDO POTREE EN WINDOW');
  if ((window as any).Potree) {
    console.log(`✅ Potree disponible en window`);
    console.log(`Versión: ${(window as any).Potree.VERSION || 'desconocida'}`);
  } else {
    console.log(`⚠️ Potree NO disponible en window (se cargará cuando sea necesario)`);
  }

  // 7. Verificar THREE.js
  console.log('\n🎨 VERIFICANDO THREE.JS');
  if ((window as any).THREE) {
    console.log(`✅ THREE.js disponible`);
    console.log(`Versión: ${(window as any).THREE.REVISION || 'desconocida'}`);
  } else {
    console.log(`⚠️ THREE.js NO disponible (se cargará con Potree)`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('%c✅ DIAGNOSIS COMPLETADA', 'font-size: 14px; font-weight: bold; color: #00aa00;');
}

/**
 * Registrar todas las URLs configuradas
 */
export function logAllURLs() {
  console.table({
    'CloudFront Base': awsConfig.cloudfrontBaseURL,
    'Point Cloud': POINTCLOUDS.reto_comu,
    'Potree JS': LIBRARIES.potreeJS,
    'Potree CSS': LIBRARIES.potreeCSS,
    'THREE.js': LIBRARIES.threeJS,
  });
}

/**
 * Simular carga de assets para debugging
 */
export async function testAssetLoading() {
  console.log('%c🧪 TESTING CARGA DE ASSETS', 'font-size: 14px; font-weight: bold;');

  const assets = [
    { name: 'Point Cloud', url: POINTCLOUDS.reto_comu },
    { name: 'Potree JS', url: LIBRARIES.potreeJS },
    { name: 'Potree CSS', url: LIBRARIES.potreeCSS },
  ];

  for (const asset of assets) {
    try {
      const response = await fetch(asset.url, { method: 'HEAD' });
      const status = response.ok ? '✅' : '❌';
      console.log(`${status} ${asset.name}: ${response.status}`);
    } catch (error) {
      console.error(`❌ ${asset.name}: ${error}`);
    }
  }
}

// Auto-run diagnosis en desarrollo
if (import.meta.env.DEV) {
  // Ejecutar diagnosis después de 2 segundos para permitir que la página cargue
  setTimeout(() => {
    // Descomentar la línea siguiente para ejecutar automaticamente
    // runDiagnosis();
  }, 2000);

  // Hacer funciones disponibles en consola
  (window as any).__dashboard = {
    runDiagnosis,
    logAllURLs,
    testAssetLoading,
    config: awsConfig,
    pointclouds: POINTCLOUDS,
    libraries: LIBRARIES,
  };

  console.log(
    '%c💡 HINT: Ejecuta __dashboard.runDiagnosis() en la consola para hacer diagnosis del sistema',
    'font-size: 12px; color: #666;'
  );
}
