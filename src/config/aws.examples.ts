/**
 * EJEMPLO: Cómo extender la configuración de AWS
 * 
 * Este archivo muestra patrones avanzados para trabajar con CloudFront
 * en tu aplicación React/Vite.
 */

import { buildCloudFrontURL, awsConfig } from '../config/aws';

// ============================================================================
// EJEMPLO 1: Cargar múltiples point clouds dinámicamente
// ============================================================================

interface PointCloudConfig {
  id: string;
  name: string;
  path: string;
  description?: string;
}

const availablePointClouds: PointCloudConfig[] = [
  {
    id: 'reto-comu',
    name: 'Reto Comu - Nube de Puntos Principal',
    path: '/pointclouds/reto-comu/cloud.js',
    description: 'Nube de puntos 3D del proyecto Reto Comu'
  },
  // Agrega más point clouds aquí cuando estén disponibles
  // {
  //   id: 'otro-proyecto',
  //   name: 'Otro Proyecto',
  //   path: '/pointclouds/otro-proyecto/cloud.js',
  // }
];

export function getPointCloudURL(pointCloudId: string): string | null {
  const config = availablePointClouds.find(pc => pc.id === pointCloudId);
  if (!config) return null;
  return buildCloudFrontURL(config.path);
}

// ============================================================================
// EJEMPLO 2: Precargar assets necesarios
// ============================================================================

export interface PreloadConfig {
  type: 'script' | 'link' | 'image';
  href: string;
  attributes?: Record<string, string>;
}

export const preloadAssets: PreloadConfig[] = [
  {
    type: 'link',
    href: buildCloudFrontURL('build/potree/potree.css'),
    attributes: {
      rel: 'stylesheet',
      crossOrigin: 'anonymous'
    }
  },
  {
    type: 'script',
    href: buildCloudFrontURL('build/potree/potree.js'),
    attributes: {
      async: 'true',
      crossOrigin: 'anonymous'
    }
  },
];

/**
 * Función para precargar todos los assets necesarios
 */
export function preloadAllAssets(): void {
  preloadAssets.forEach(asset => {
    if (asset.type === 'link') {
      const link = document.createElement('link');
      link.href = asset.href;
      Object.entries(asset.attributes || {}).forEach(([key, value]) => {
        link.setAttribute(key, value);
      });
      document.head.appendChild(link);
    } else if (asset.type === 'script') {
      const script = document.createElement('script');
      script.src = asset.href;
      Object.entries(asset.attributes || {}).forEach(([key, value]) => {
        script.setAttribute(key, value);
      });
      document.head.appendChild(script);
    }
  });
}

// ============================================================================
// EJEMPLO 3: Sistema de caché y versionado
// ============================================================================

interface CachedAsset {
  url: string;
  version: string;
  timestamp: number;
}

class CloudFrontAssetManager {
  private cache = new Map<string, CachedAsset>();
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Obtener URL con versionado (útil para cache busting)
   */
  getVersionedURL(path: string, version?: string): string {
    const url = buildCloudFrontURL(path);
    if (!version) return url;
    
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}v=${version}`;
  }

  /**
   * Verificar si un asset existe (hacer HEAD request)
   */
  async checkAssetExists(path: string): Promise<boolean> {
    try {
      const url = buildCloudFrontURL(path);
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Precargar un asset y guardarlo en caché
   */
  async preloadAsset(path: string, version?: string): Promise<string> {
    const url = this.getVersionedURL(path, version);
    
    try {
      const response = await fetch(url);
      if (response.ok) {
        this.cache.set(path, {
          url,
          version: version || 'unknown',
          timestamp: Date.now()
        });
        return url;
      }
    } catch (error) {
      console.error(`Error precargando asset: ${path}`, error);
    }
    
    return url;
  }
}

export const assetManager = new CloudFrontAssetManager(awsConfig.cloudfrontBaseURL);

// ============================================================================
// EJEMPLO 4: Validar integridad de URLs
// ============================================================================

export function validateCloudFrontURL(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('cloudfront.net');
  } catch {
    return false;
  }
}

/**
 * Obtener lista de todos los assets configurados
 */
export function getAllConfiguredAssets(): string[] {
  return [
    ...Object.values(awsConfig.pointclouds || {}),
  ] as string[];
}

/**
 * Reportar estado de assets
 */
export async function reportAssetStatus(): Promise<void> {
  const assets = getAllConfiguredAssets();
  
  console.log('📊 Estado de Assets en CloudFront:');
  console.log(`Base URL: ${awsConfig.cloudfrontBaseURL}`);
  console.log(`Assets configurados: ${assets.length}`);
  
  for (const asset of assets) {
    const exists = await assetManager.checkAssetExists(asset);
    console.log(`  ${exists ? '✅' : '❌'} ${asset}`);
  }
}

// ============================================================================
// EJEMPLO 5: Hook de React para usar CloudFront
// ============================================================================

/**
 * Hook personalizado para cargar point clouds desde CloudFront
 * 
 * Uso en componentes (crear en archivo .tsx):
 * 
 * import { useState, useEffect, useMemo } from 'react';
 * import { getPointCloudURL, assetManager } from './aws.examples';
 * 
 * export function useCloudFrontPointCloud(pointCloudId: string) {
 *   const [loading, setLoading] = useState(false);
 *   const [error, setError] = useState<string | null>(null);
 * 
 *   const url = useMemo(() => {
 *     return getPointCloudURL(pointCloudId);
 *   }, [pointCloudId]);
 * 
 *   useEffect(() => {
 *     if (!url) {
 *       setError(`Point cloud no encontrado: ${pointCloudId}`);
 *       return;
 *     }
 * 
 *     setLoading(true);
 *     assetManager
 *       .preloadAsset(url)
 *       .then(() => setLoading(false))
 *       .catch((err) => {
 *         setError(err.message);
 *         setLoading(false);
 *       });
 *   }, [url, pointCloudId]);
 * 
 *   return { url, loading, error };
 * }
 */
