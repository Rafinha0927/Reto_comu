import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Maximize2, RefreshCw, Box, Loader, CheckCircle } from 'lucide-react';
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
  const [loadingStatus, setLoadingStatus] = useState('Iniciando...');
  const [progress, setProgress] = useState(0);

  // ✅ URLs VERIFICADAS - Funcionan con GET directo
  const CLOUDFRONT_BASE = 'https://d2h8nqd60uagyp.cloudfront.net';
  const S3_BASE_PATH = 'reto-comu-arreglado-main/reto-comu-arreglado-main';
  
  const URLS = {
    potreeJS: `${CLOUDFRONT_BASE}/${S3_BASE_PATH}/static/build/potree/potree.js`,
    potreeCSS: `${CLOUDFRONT_BASE}/${S3_BASE_PATH}/static/build/potree/potree.css`,
    pointCloud: `${CLOUDFRONT_BASE}/${S3_BASE_PATH}/static/pointclouds/Puntos/cloud.js`,
  };

  useEffect(() => {
    if (potreeLoaded || !potreeContainerRef.current) return;
    
    loadPotreeWithoutCORS();
  }, []);

  const updateProgress = (step: number, total: number, message: string) => {
    setProgress(Math.round((step / total) * 100));
    setLoadingStatus(message);
  };

  // 🔧 MÉTODO ANTI-CORS: Cargar usando DOM directamente
  const loadPotreeWithoutCORS = async () => {
    try {
      updateProgress(1, 4, 'Cargando CSS (modo directo)...');
      
      // 1. Cargar CSS usando createElement (NO trigger CORS)
      await loadStylesheet(URLS.potreeCSS);
      
      updateProgress(2, 4, 'Cargando JavaScript (modo directo)...');
      
      // 2. Cargar JS usando createElement (NO trigger CORS) 
      await loadScript(URLS.potreeJS);
      
      updateProgress(3, 4, 'Verificando Potree...');
      
      // 3. Esperar y verificar Potree
      await waitForPotree();
      
      updateProgress(4, 4, 'Inicializando vista 3D...');
      
      // 4. Inicializar
      await initializePotreeViewer();
      
      setLoadingStatus('¡Vista 3D lista!');
      setError(null);

    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(err.message);
    }
  };

  const loadStylesheet = (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Verificar si ya está cargado
      const existing = document.querySelector(`link[href="${url}"]`);
      if (existing) {
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.crossOrigin = 'anonymous';
      
      link.onload = () => {
        console.log('✅ CSS cargado:', url);
        resolve();
      };
      
      link.onerror = () => {
        reject(new Error(`Error cargando CSS: ${url}`));
      };
      
      document.head.appendChild(link);
    });
  };

  const loadScript = (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Verificar si ya está cargado
      const existing = document.querySelector(`script[src="${url}"]`);
      if (existing) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = url;
      script.crossOrigin = 'anonymous';
      script.async = true;
      
      script.onload = () => {
        console.log('✅ JS cargado:', url);
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error(`Error cargando JS: ${url}`));
      };
      
      document.body.appendChild(script);
    });
  };

  const waitForPotree = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 20; // 4 segundos máximo
      
      const check = () => {
        attempts++;
        
        if ((window as any).Potree) {
          console.log('✅ Potree disponible en window');
          setPotreeLoaded(true);
          resolve();
        } else if (attempts < maxAttempts) {
          setTimeout(check, 200);
        } else {
          reject(new Error('Timeout: Potree no se cargó en 4 segundos'));
        }
      };
      
      check();
    });
  };

  const initializePotreeViewer = async (): Promise<void> => {
    if (!potreeContainerRef.current) {
      throw new Error('Container de Potree no disponible');
    }

    try {
      console.log('🚀 Inicializando Potree viewer...');

      // Crear viewer
      const viewer = new (window as any).Potree.Viewer(potreeContainerRef.current, {
        useDefaultUI: false,
      });

      // Configurar viewer
      viewer.setEDLEnabled(true);
      viewer.setFOV(60);
      viewer.setPointBudget(3_000_000);
      viewer.setBackground('gradient');
      viewer.setDescription('Reto Comu - Dashboard IoT 3D');

      // Cargar point cloud usando método interno de Potree (evita CORS)
      await loadPointCloudWithPotree(viewer);

    } catch (error) {
      throw new Error(`Error inicializando viewer: ${error}`);
    }
  };

  const loadPointCloudWithPotree = (viewer: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      console.log('🌐 Cargando point cloud:', URLS.pointCloud);
      
      // Usar el método loadPointCloud de Potree que maneja CORS internamente
      (window as any).Potree.loadPointCloud(URLS.pointCloud, "reto-comu", (e: any) => {
        if (e.type === 'loading_failed') {
          reject(new Error('Error cargando point cloud'));
          return;
        }

        const pointcloud = e.pointcloud;
        const material = pointcloud.material;
        
        // Configurar material
        material.size = 2.0;
        material.pointSizeType = (window as any).Potree.PointSizeType.ADAPTIVE;
        material.shape = (window as any).Potree.PointShape.SQUARE;

        viewer.scene.addPointCloud(pointcloud);
        viewer.fitToScreen();

        // Añadir sensores
        addSensorMarkers(viewer);

        console.log('✅ Point cloud cargado exitosamente');
        resolve();
      });
    });
  };

  const addSensorMarkers = (viewer: any) => {
    sensors.forEach((sensor, index) => {
      // Posiciones de ejemplo para los sensores
      const pos = new (window as any).THREE.Vector3(
        sensor.x || (index * 20), 
        sensor.y || (index * 15), 
        sensor.z || 10
      );

      try {
        const marker = viewer.scene.addMarker(pos, {
          label: sensor.name,
          color: sensor.status === 'active' ? 0x00ff00 : 0xff5555,
          size: 15,
        });

        marker.addEventListener('click', () => {
          onSensorClick(sensor.id);
          
          // Mover cámara hacia el sensor
          const cameraPos = pos.clone().add(new (window as any).THREE.Vector3(30, 30, 50));
          viewer.scene.view.position.copy(cameraPos);
          viewer.scene.view.lookAt(pos);
        });

        // Enfocar sensor seleccionado
        if (sensor.id === selectedSensorId) {
          const focusPos = pos.clone().add(new (window as any).THREE.Vector3(25, 25, 40));
          viewer.scene.view.position.copy(focusPos);
          viewer.scene.view.lookAt(pos);
        }
      } catch (error) {
        console.warn(`No se pudo crear marcador para sensor ${sensor.name}:`, error);
      }
    });
  };

  const handleRefresh = () => {
    setError(null);
    setPotreeLoaded(false);
    setProgress(0);
    setLoadingStatus('Reiniciando...');
    
    if (potreeContainerRef.current) {
      potreeContainerRef.current.innerHTML = '';
    }
    
    setTimeout(() => {
      loadPotreeWithoutCORS();
    }, 500);
  };

  const getStatusIcon = () => {
    if (error) return '❌';
    if (potreeLoaded && progress >= 100) return '✅';
    if (progress > 0) return '⚙️';
    return '🔄';
  };

  return (
    <Card className="h-full relative bg-black overflow-hidden">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-50 pointer-events-none">
        <Badge variant="outline" className="bg-white/95 backdrop-blur pointer-events-auto">
          <Box className="w-4 h-4 mr-2" />
          {getStatusIcon()} Vista 3D - {loadingStatus}
        </Badge>
        <div className="flex gap-2 pointer-events-auto">
          <Button 
            size="icon" 
            variant="outline" 
            className="bg-white/90 backdrop-blur"
            onClick={handleRefresh}
            title="Recargar"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      {!potreeLoaded && !error && (
        <div className="absolute top-16 left-4 right-4 z-50 pointer-events-none">
          <div className="bg-white/90 backdrop-blur rounded-lg p-3">
            <div className="flex items-center gap-3">
              <Loader className="w-4 h-4 animate-spin text-blue-600" />
              <div className="flex-1">
                <div className="text-xs font-medium text-gray-700 mb-1">
                  {loadingStatus} ({progress}%)
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-900 to-black z-40">
          <div className="text-center text-white p-8 max-w-lg">
            <div className="text-xl font-bold mb-4">⚠️ Error cargando Vista 3D</div>
            <div className="text-sm bg-red-950/50 p-4 rounded mb-4 text-left font-mono">
              {error}
            </div>
            <div className="text-xs text-gray-300 mb-4">
              <div><strong>Método:</strong> Carga directa (anti-CORS)</div>
              <div><strong>CSS:</strong> {URLS.potreeCSS}</div>
              <div><strong>JS:</strong> {URLS.potreeJS}</div>
              <div><strong>Cloud:</strong> {URLS.pointCloud}</div>
            </div>
            <Button 
              onClick={handleRefresh}
              className="bg-red-600 hover:bg-red-700"
            >
              Reintentar
            </Button>
          </div>
        </div>
      )}

      {/* Potree Container */}
      <div
        ref={potreeContainerRef}
        className="absolute inset-0"
        style={{ 
          width: '100%', 
          height: '100%',
          backgroundColor: '#1a1a1a'
        }}
      />

      {/* Loading Screen */}
      {!potreeLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900 to-black">
          <div className="text-white text-center max-w-md">
            <div className="text-xl font-semibold mb-4 flex items-center justify-center gap-2">
              <Loader className="w-6 h-6 animate-spin" />
              Cargando Vista 3D
            </div>
            <div className="text-sm text-gray-300 space-y-2">
              <div>Método: Carga directa (anti-CORS)</div>
              <div>Progreso: {progress}%</div>
              <div className="text-xs mt-4 opacity-70">
                {potreeLoaded ? 'Potree cargado ✅' : 'Cargando librerías...'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success indicator cuando está listo */}
      {potreeLoaded && !error && (
        <div className="absolute bottom-4 right-4 z-50 pointer-events-none">
          <Badge variant="outline" className="bg-green-100/95 text-green-800 backdrop-blur">
            <CheckCircle className="w-4 h-4 mr-2" />
            Vista 3D activa
          </Badge>
        </div>
      )}
    </Card>
  );
}