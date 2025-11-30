import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Maximize2, RefreshCw, Box, TestTube, Loader } from 'lucide-react';
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

  // ✅ URLs VERIFICADAS Y FUNCIONANDO (HTTP 200)
  const CLOUDFRONT_BASE = 'https://d2h8nqd60uagyp.cloudfront.net';
  const S3_BASE_PATH = 'reto-comu-arreglado-main/reto-comu-arreglado-main';
  
  const URLS = {
    potreeJS: `${CLOUDFRONT_BASE}/${S3_BASE_PATH}/static/build/potree/potree.js`,
    potreeCSS: `${CLOUDFRONT_BASE}/${S3_BASE_PATH}/static/build/potree/potree.css`,
    pointCloud: `${CLOUDFRONT_BASE}/${S3_BASE_PATH}/static/pointclouds/Puntos/cloud.js`,
  };

  useEffect(() => {
    if (potreeLoaded || !potreeContainerRef.current) return;
    
    loadPotreeLibrary();
  }, []);

  const updateProgress = (step: number, total: number, message: string) => {
    setProgress(Math.round((step / total) * 100));
    setLoadingStatus(message);
  };

  const loadPotreeLibrary = async () => {
    try {
      updateProgress(1, 5, 'Cargando CSS de Potree...');
      
      // 1. Cargar CSS de Potree
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = URLS.potreeCSS;
      cssLink.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        cssLink.onload = () => {
          console.log('✅ CSS de Potree cargado');
          resolve(true);
        };
        cssLink.onerror = () => reject(new Error('Error cargando CSS'));
        document.head.appendChild(cssLink);
      });

      updateProgress(2, 5, 'Cargando JavaScript de Potree...');
      
      // 2. Cargar JS de Potree
      const jsScript = document.createElement('script');
      jsScript.src = URLS.potreeJS;
      jsScript.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        jsScript.onload = () => {
          console.log('✅ JavaScript de Potree cargado');
          resolve(true);
        };
        jsScript.onerror = () => reject(new Error('Error cargando JavaScript'));
        document.body.appendChild(jsScript);
      });

      updateProgress(3, 5, 'Verificando disponibilidad de Potree...');
      
      // 3. Verificar que Potree esté disponible
      let attempts = 0;
      const maxAttempts = 10;
      
      const checkPotree = () => {
        attempts++;
        if ((window as any).Potree) {
          console.log('✅ Potree está disponible en window');
          setPotreeLoaded(true);
          initializePotreeViewer();
        } else if (attempts < maxAttempts) {
          setTimeout(checkPotree, 200);
        } else {
          throw new Error('Potree no está disponible después de cargar');
        }
      };
      
      checkPotree();

    } catch (err: any) {
      console.error('❌ Error cargando Potree:', err);
      setError(`Error cargando Potree: ${err.message}`);
    }
  };

  const initializePotreeViewer = async () => {
    if (!potreeContainerRef.current) return;

    try {
      updateProgress(4, 5, 'Inicializando visor 3D...');

      // Crear visor de Potree
      const viewer = new (window as any).Potree.Viewer(potreeContainerRef.current);
      
      // Configurar visor
      viewer.setEDLEnabled(true);
      viewer.setFOV(60);
      viewer.setPointBudget(5_000_000);
      viewer.setBackground('gradient');
      viewer.setDescription('Reto Comu - Dashboard IoT 3D');

      updateProgress(5, 5, 'Cargando nube de puntos...');

      // Cargar point cloud
      await new Promise((resolve, reject) => {
        console.log('🌐 Cargando point cloud desde:', URLS.pointCloud);
        
        (window as any).Potree.loadPointCloud(URLS.pointCloud, "reto-comu-pointcloud", (e: any) => {
          if (e.type === 'loading_failed') {
            reject(new Error('Error cargando nube de puntos'));
            return;
          }

          const pointcloud = e.pointcloud;
          const material = pointcloud.material;
          
          // Configurar material
          material.size = 2.0;
          material.pointSizeType = (window as any).Potree.PointSizeType.ADAPTIVE;
          material.shape = (window as any).Potree.PointShape.SQUARE;
          material.activeAttributeName = 'rgba';

          viewer.scene.addPointCloud(pointcloud);
          
          // Ajustar vista automáticamente
          viewer.fitToScreen();

          // Añadir marcadores para sensores
          addSensorMarkers(viewer);

          console.log('✅ Point cloud cargado exitosamente');
          resolve(true);
        });
      });

      updateProgress(5, 5, '¡Vista 3D lista!');
      setError(null);

    } catch (err: any) {
      console.error('❌ Error inicializando visor:', err);
      setError(`Error inicializando visor: ${err.message}`);
    }
  };

  const addSensorMarkers = (viewer: any) => {
    sensors.forEach((sensor) => {
      const pos = new (window as any).THREE.Vector3(
        sensor.x, 
        sensor.y, 
        sensor.z || 10
      );

      // Crear marcador
      const marker = viewer.scene.addMarker(pos, {
        label: sensor.name,
        color: sensor.status === 'active' ? 0x00ff00 : 0xff5555,
        size: 20,
      });

      // Añadir evento click
      marker.addEventListener('click', () => {
        onSensorClick(sensor.id);
        
        // Mover cámara al sensor seleccionado
        const cameraPos = pos.clone().add(new (window as any).THREE.Vector3(50, 50, 80));
        viewer.scene.view.position.copy(cameraPos);
        viewer.scene.view.lookAt(pos);
      });

      // Resaltar sensor seleccionado
      if (sensor.id === selectedSensorId) {
        const highlightPos = pos.clone().add(new (window as any).THREE.Vector3(30, 30, 60));
        viewer.scene.view.position.copy(highlightPos);
        viewer.scene.view.lookAt(pos);
      }
    });
  };

  const handleRefresh = () => {
    setError(null);
    setPotreeLoaded(false);
    setProgress(0);
    setLoadingStatus('Reiniciando...');
    
    // Limpiar container
    if (potreeContainerRef.current) {
      potreeContainerRef.current.innerHTML = '';
    }
    
    // Reiniciar carga
    setTimeout(() => {
      loadPotreeLibrary();
    }, 500);
  };

  const getStatusIcon = () => {
    if (error) return '❌';
    if (potreeLoaded && progress === 100) return '✅';
    if (progress > 0) return '⚙️';
    return '🔄';
  };

  return (
    <Card className="h-full relative bg-black overflow-hidden">
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
            title="Recargar Vista 3D"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button 
            size="icon" 
            variant="outline" 
            className="bg-white/90 backdrop-blur"
            onClick={() => {
              console.log('🧪 URLs utilizadas:', URLS);
              console.log('📊 Estado:', { potreeLoaded, progress, error });
            }}
            title="Mostrar información de debug"
          >
            <TestTube className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Barra de progreso */}
      {!potreeLoaded && !error && (
        <div className="absolute top-16 left-4 right-4 z-50 pointer-events-none">
          <div className="bg-white/90 backdrop-blur rounded-lg p-3">
            <div className="flex items-center gap-3">
              <Loader className="w-4 h-4 animate-spin" />
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

      {/* Error display */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-900 to-black z-40">
          <div className="text-center text-white p-8 max-w-lg">
            <div className="text-xl font-bold mb-4">⚠️ Error en Vista 3D</div>
            <div className="text-sm bg-red-950/50 p-4 rounded mb-4 text-left font-mono">
              {error}
            </div>
            <div className="text-xs text-gray-300 mb-4">
              URLs utilizadas:
              <div className="mt-2 space-y-1">
                <div>JS: {URLS.potreeJS}</div>
                <div>CSS: {URLS.potreeCSS}</div>
                <div>Cloud: {URLS.pointCloud}</div>
              </div>
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

      {/* Potree container */}
      <div
        ref={potreeContainerRef}
        className="absolute inset-0"
        style={{ 
          width: '100%', 
          height: '100%',
          backgroundColor: '#000'
        }}
      />

      {/* Loading screen */}
      {!potreeLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900 to-black">
          <div className="text-white text-center max-w-md">
            <div className="text-xl font-semibold mb-4">
              Cargando Vista 3D
            </div>
            <div className="text-sm text-gray-300 space-y-2">
              <div>CloudFront: {CLOUDFRONT_BASE}</div>
              <div>Progreso: {progress}%</div>
              <div className="text-xs mt-4 opacity-70">
                Primer acceso puede tomar 30-60 segundos
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}