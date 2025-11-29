/**
 * Inicialización global del Dashboard
 * Se ejecuta antes de renderizar la aplicación
 */

import { awsConfig, POINTCLOUDS, LIBRARIES, EXAMPLES } from './config/aws';

// Declarar tipos globales
declare global {
  interface Window {
    __dashboard: {
      aws: typeof awsConfig;
      pointclouds: typeof POINTCLOUDS;
      libraries: typeof LIBRARIES;
      examples: typeof EXAMPLES;
      runDiagnosis: () => Promise<void>;
      testCloudFront: (url: string) => Promise<boolean>;
      testAPI: (url: string) => Promise<boolean>;
      info: () => void;
      clearLogs: () => void;
    };
  }
}

/**
 * Función de diagnosis completa
 */
export async function runDiagnosis() {
  console.clear();
  console.log('%c🔍 DIAGNOSTIC REPORT - IoT Dashboard', 'font-size: 16px; font-weight: bold; color: #1e88e5;');
  console.log('='.repeat(60) + '\n');

  // Test 1: CloudFront
  console.log('%c1️⃣ CloudFront Configuration', 'font-weight: bold; color: #1976d2; font-size: 12px;');
  console.log(`   Base URL: ${awsConfig.cloudfrontBaseURL}`);
  
  try {
    const response = await fetch(`${awsConfig.cloudfrontBaseURL}/`, { method: 'HEAD' });
    console.log(`   ✅ CloudFront accessible (Status: ${response.status})\n`);
  } catch (error) {
    console.log(`   ❌ CloudFront Error: ${error}\n`);
  }

  // Test 2: Point Cloud
  console.log('%c2️⃣ Point Cloud Configuration', 'font-weight: bold; color: #1976d2; font-size: 12px;');
  console.log(`   URL: ${POINTCLOUDS.reto_comu}`);
  
  try {
    const response = await fetch(POINTCLOUDS.reto_comu, { method: 'HEAD' });
    console.log(`   ✅ Point Cloud accessible (Status: ${response.status})\n`);
  } catch (error) {
    console.log(`   ❌ Point Cloud Error: ${error}\n`);
  }

  // Test 3: Potree Library
  console.log('%c3️⃣ Potree Library Configuration', 'font-weight: bold; color: #1976d2; font-size: 12px;');
  console.log(`   JS: ${LIBRARIES.potreeJS}`);
  console.log(`   CSS: ${LIBRARIES.potreeCSS}`);
  
  try {
    const jsResponse = await fetch(LIBRARIES.potreeJS, { method: 'HEAD' });
    const cssResponse = await fetch(LIBRARIES.potreeCSS, { method: 'HEAD' });
    console.log(`   ✅ Potree JS accessible (Status: ${jsResponse.status})`);
    console.log(`   ✅ Potree CSS accessible (Status: ${cssResponse.status})\n`);
  } catch (error) {
    console.log(`   ❌ Potree Library Error: ${error}\n`);
  }

  // Test 4: WebSocket Configuration
  console.log('%c4️⃣ WebSocket Configuration', 'font-weight: bold; color: #1976d2; font-size: 12px;');
  const wsUrl = import.meta.env.VITE_WEBSOCKET_URL || 'No configurada';
  console.log(`   WebSocket URL: ${wsUrl}`);
  if (wsUrl === 'No configurada') {
    console.log(`   ⚠️  WebSocket no configurada (esto explica el error de conexión)\n`);
  } else {
    console.log(`   ℹ️  WebSocket configurada (conectándose automáticamente)\n`);
  }

  // Test 5: API Configuration
  console.log('%c5️⃣ API Configuration', 'font-weight: bold; color: #1976d2; font-size: 12px;');
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'No configurada';
  console.log(`   API Base URL: ${apiUrl}\n`);

  // Test 6: Environment Variables
  console.log('%c6️⃣ Environment Variables', 'font-weight: bold; color: #1976d2; font-size: 12px;');
  console.log(`   VITE_CLOUDFRONT_URL: ${import.meta.env.VITE_CLOUDFRONT_URL ? '✅' : '❌'} ${import.meta.env.VITE_CLOUDFRONT_URL || 'No definida'}`);
  console.log(`   VITE_WEBSOCKET_URL: ${import.meta.env.VITE_WEBSOCKET_URL ? '✅' : '❌'} ${import.meta.env.VITE_WEBSOCKET_URL || 'No definida'}`);
  console.log(`   VITE_API_BASE_URL: ${import.meta.env.VITE_API_BASE_URL ? '✅' : '❌'} ${import.meta.env.VITE_API_BASE_URL || 'No definida'}`);
  console.log(`   MODE: ${import.meta.env.MODE}\n`);

  // Test 7: Window Objects
  console.log('%c7️⃣ Window Objects', 'font-weight: bold; color: #1976d2; font-size: 12px;');
  console.log(`   Potree: ${(window as any).Potree ? '✅ Disponible' : '❌ No disponible (se cargará con ThreeDView)'}`);
  console.log(`   THREE: ${(window as any).THREE ? '✅ Disponible' : '❌ No disponible (se cargará con Potree)'}\n`);

  console.log('='.repeat(60));
  console.log('%c✅ DIAGNOSIS COMPLETE', 'font-size: 12px; font-weight: bold; color: #4caf50;');
  console.log('%c💡 TIP: Use __dashboard.testCloudFront(url) to test any URL', 'font-size: 11px; color: #666;');
  console.log('='.repeat(60) + '\n');
}

/**
 * Testear CloudFront
 */
export async function testCloudFront(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    console.log(`✅ CloudFront OK: ${url} (Status: ${response.status})`);
    return response.ok;
  } catch (error) {
    console.error(`❌ CloudFront Error: ${url}`, error);
    return false;
  }
}

/**
 * Testear API
 */
export async function testAPI(url: string): Promise<boolean> {
  try {
    const response = await fetch(url);
    console.log(`✅ API OK: ${url} (Status: ${response.status})`);
    return response.ok;
  } catch (error) {
    console.error(`❌ API Error: ${url}`, error);
    return false;
  }
}

/**
 * Mostrar información
 */
export function info() {
  console.log('%c📋 DASHBOARD INFO', 'font-size: 12px; font-weight: bold; color: #388e3c;');
  console.log('CloudFront Base:', awsConfig.cloudfrontBaseURL);
  console.log('Point Clouds:', POINTCLOUDS);
  console.log('Libraries:', LIBRARIES);
  console.log('Examples:', EXAMPLES);
}

/**
 * Limpiar logs
 */
export function clearLogs() {
  console.clear();
  console.log('%c🧹 Logs cleared', 'color: #666;');
}

/**
 * Inicializar objeto global en window
 */
export function initializeDashboard() {
  if (typeof window !== 'undefined') {
    window.__dashboard = {
      aws: awsConfig,
      pointclouds: POINTCLOUDS,
      libraries: LIBRARIES,
      examples: EXAMPLES,
      runDiagnosis,
      testCloudFront,
      testAPI,
      info,
      clearLogs,
    };

    // Log en desarrollo
    if (import.meta.env.DEV) {
      console.log('%c✨ Dashboard Initialized', 'font-size: 12px; color: #4caf50; font-weight: bold;');
      console.log('%c💡 Available commands:', 'color: #666; font-size: 11px;');
      console.log('%c   __dashboard.runDiagnosis()     - Run full diagnosis', 'color: #666; font-size: 11px;');
      console.log('%c   __dashboard.info()             - Show configuration', 'color: #666; font-size: 11px;');
      console.log('%c   __dashboard.testCloudFront(url) - Test CloudFront URL', 'color: #666; font-size: 11px;');
      console.log('%c   __dashboard.testAPI(url)        - Test API URL', 'color: #666; font-size: 11px;');
      console.log('%c   __dashboard.clearLogs()         - Clear console', 'color: #666; font-size: 11px;');
    }
  }
}

// Auto-initialize when module loads
initializeDashboard();

export default runDiagnosis;
