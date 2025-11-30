import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Maximize2, RefreshCw, Box } from 'lucide-react';
import { Button } from './ui/button';
import { useEffect, useRef, useState } from 'react';

interface Sensor {
  id: string;
  name: string;
  x: number;
  y: number;
  z?: number;
  status: 'active' | 'inactive';
}

interface ThreeDViewProps {
  sensors: Sensor[];
  onSensorClick: (sensorId: string) => void;
  selectedSensorId: string | null;
}

export function ThreeDView({ sensors, onSensorClick, selectedSensorId }: ThreeDViewProps) {
  const potreeContainerRef = useRef<HTMLDivElement>(null);
  const [potreeLoaded, setPotreeLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState('Iniciando carga...');

  // URLs basadas en tu configuración CloudFront REAL
  const CLOUDFRONT_BASE = 'https://d2h8nqd60uagyp.cloudfront.net';
  
  // Rutas exactas según tu estructura de S3
  const POTREE_URLS = [
    `${CLOUDFRONT_BASE}/static/build/potree/potree.js`,
  ];
  
  const POTREE_CSS_URLS = [
    `${CLOUDFRONT_BASE}/static/build/potree/potree.css`,
  ];
  
  // Múltiples opciones para el point cloud basadas en estructura estándar de Potree
  const POINTCLOUD_URLS = [
    `${CLOUDFRONT_BASE}/pointclouds/Puntos/cloud.js`,
    `${CLOUDFRONT_BASE}/pointclouds/Puntos/sources.json`,
    `${CLOUDFRONT_BASE}/pointclouds/Puntos/metadata.json`,
    `${CLOUDFRONT_BASE}/pointclouds/Puntos/`,
  ];

  useEffect(() => {
    if (potreeLoaded || !potreeContainerRef.current) return;

    loadPotreeWithFallbacks();
  }, [potreeLoaded, sensors, onSensorClick, selectedSensorId]);

  const loadPotreeWithFallbacks = async () => {
    setLoadingStatus('Cargando CSS de Potree...');
    
    // Intentar cargar CSS de Potree
    const cssLoaded = await loadCSSWithFallbacks();
    if (!cssLoaded) {
      setError('No se pudo cargar el CSS de Potree desde ninguna URL');
      return;
    }

    setLoadingStatus('Cargando JavaScript de Potree...');
    
    // Intentar cargar JS de Potree
    const jsLoaded = await loadJSWithFallbacks();
    if (!jsLoaded) {
      setError('No se pudo cargar el JavaScript de Potree desde ninguna URL');
      return;
    }

    setLoadingStatus('Configurando visor 3D...');
    
    // Verificar que Potree esté disponible
    if (!(window as any).Potree) {
      setError('Potree se cargó pero no está disponible en window');
      return;
    }

    try {
      await initializePotreeViewer();
    } catch (err: any) {
      setError(`Error inicializando Potree: ${err.message}`);
    }
  };

  const loadCSSWithFallbacks = async (): Promise<boolean> => {
    for (const url of POTREE_CSS_URLS) {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = url;
          link.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            link.onload = resolve;
            link.onerror = reject;
            document.head.appendChild(link);
          });
          
          console.log(`✅ CSS cargado desde: ${url}`);
          return true;
        }
      } catch (error) {
        console.log(`❌ CSS no disponible en: ${url}`);
      }
    }
    return false;
  };

  const loadJSWithFallbacks = async (): Promise<boolean> => {
    for (const url of POTREE_URLS) {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.crossOrigin = 'anonymous';
            script.async = true;
            
            script.onload = () => {
              console.log(`✅ JavaScript cargado desde: ${url}`);
              resolve(true);
            };
            script.onerror = reject;
            
            document.body.appendChild(script);
          });
          
          setPotreeLoaded(true);
          return true;
        }
      } catch (error) {
        console.log(`❌ JavaScript no disponible en: ${url}`);
      }
    }
    return false;
  };

  const initializePotreeViewer = async () => {
    if (!potreeContainerRef.current) return;

    setLoadingStatus('Creando visor de Potree...');

    // Crear visor
    const viewer = new (window as any).Potree.Viewer(potreeContainerRef.current, {
      useDefaultUI: false,
    });

    viewer.setEDLEnabled(true);
    viewer.setFOV(60);
    viewer.setPointBudget(5_000_000);
    viewer.setBackground('gradient');
    viewer.setDescription('Reto Comu - Nube de puntos 3D');

    setLoadingStatus('Cargando nube de puntos...');

    // Intentar cargar point cloud con fallbacks
    let pointCloudLoaded = false;
    
    for (const url of POINTCLOUD_URLS) {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
          await loadPointCloudFromUrl(viewer, url);
          pointCloudLoaded = true;
          break;
        }
      } catch (error) {
        console.log(`❌ Point cloud no disponible en: ${url}`);
      }
    }

    if (!pointCloudLoaded) {
      setError('No se pudo cargar la nube de puntos desde ninguna URL');
      return;
    }

    setLoadingStatus('¡Listo!');
    setError(null);
  };

  const loadPointCloudFromUrl = async (viewer: any, url: string) => {
    return new Promise((resolve, reject) => {
      console.log(`🌐 Cargando point cloud desde: ${url}`);
      
      (window as any).Potree.loadPointCloud(url, "reto-comu", (e: any) => {
        if (e.type === 'loading_failed') {
          reject(new Error('Error cargando point cloud'));
          return;
        }

        const pointcloud = e.pointcloud;
        const material = pointcloud.material;
        material.size = 1.8;
        material.pointSizeType = (window as any).Potree.PointSizeType.ADAPTIVE;
        material.shape = (window as any).Potree.PointShape.SQUARE;

        viewer.scene.addPointCloud(pointcloud);
        viewer.fitToScreen();

        // Añadir marcadores para sensores
        sensors.forEach((sensor) => {
          const pos = new (window as any).THREE.Vector3(sensor.x, sensor.y, (sensor.z || 10));

          const marker = viewer.scene.addMarker(pos, {
            label: sensor.name,
            color: sensor.status === 'active' ? 0x00ff00 : 0xff5555,
            size: 15,
          });

          marker.addEventListener('click', () => {
            onSensorClick(sensor.id);
            viewer.scene.view.position.set(pos.x + 30, pos.y + 30, pos.z + 50);
            viewer.scene.view.lookAt(pos);
          });

          if (sensor.id === selectedSensorId) {
            viewer.scene.view.position.set(pos.x + 40, pos.y + 40, pos.z + 60);
            viewer.scene.view.lookAt(pos);
          }
        });

        console.log(`✅ Point cloud cargado exitosamente desde: ${url}`);
        resolve(true);
      });
    });
  };

  const handleTestUrls = async () => {
    console.log('🧪 Testando todas las URLs...');
    
    const allUrls = [
      ...POTREE_CSS_URLS.map(url => ({ type: 'CSS', url })),
      ...POTREE_URLS.map(url => ({ type: 'JS', url })),
      ...POINTCLOUD_URLS.map(url => ({ type: 'PointCloud', url })),
    ];

    for (const { type, url } of allUrls) {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        console.log(`${response.ok ? '✅' : '❌'} ${type}: ${url} (${response.status})`);
      } catch (error) {
        console.log(`❌ ${type}: ${url} (Error de red)`);
      }
    }
  };

  return (
    <Card className="h-full relative bg-black overflow-hidden">
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-50 pointer-events-none">
        <Badge variant="outline" className="bg-white/95 backdrop-blur pointer-events-auto">
          <Box className="w-4 h-4 mr-2" />
          Vista 3D - {loadingStatus}
        </Badge>
        <div className="flex gap-2 pointer-events-auto">
          <Button 
            size="icon" 
            variant="outline" 
            className="bg-white/90 backdrop-blur"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button 
            size="icon" 
            variant="outline" 
            className="bg-white/90 backdrop-blur"
            onClick={handleTestUrls}
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-900 to-black z-40">
          <div className="text-center text-white p-8 max-w-lg">
            <div className="text-xl font-bold mb-4">⚠️ Error cargando Vista 3D</div>
            <div className="text-sm bg-red-950/50 p-4 rounded mb-4">{error}</div>
            <div className="text-xs text-gray-300 mb-4">
              Revisa la consola (F12) para más detalles
            </div>
            <Button 
              onClick={() => {
                setError(null);
                setPotreeLoaded(false);
                setLoadingStatus('Reintentando...');
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Reintentar
            </Button>
          </div>
        </div>
      )}

      <div
        ref={potreeContainerRef}
        className="absolute inset-0"
        style={{ width: '100%', height: '100%' }}
      />

      {!potreeLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900 to-black">
          <div className="text-white text-center">
            <div className="text-xl animate-pulse mb-4">
              {loadingStatus}
            </div>
            <div className="text-xs text-gray-400">
              CloudFront: {CLOUDFRONT_BASE}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}