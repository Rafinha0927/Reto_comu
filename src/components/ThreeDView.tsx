import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Maximize2, RefreshCw, Box } from 'lucide-react';
import { Button } from './ui/button';
import { useEffect, useRef, useState } from 'react';
import { POINTCLOUD_CONFIG, POTREE_FILES } from '../config/aws'; // Asegúrate de que esta ruta sea correcta

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

  // Usar la configuración de AWS CloudFront
  const POINTCLOUD_URL = POINTCLOUD_CONFIG.RETO_COMU.metadata;

  useEffect(() => {
    if (potreeLoaded || !potreeContainerRef.current) return;

    console.log('📦 Iniciando carga de Potree desde:', POTREE_FILES.js);
    console.log('☁️ Cargando nube desde:', POINTCLOUD_URL);

    // Cargar CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = POTREE_FILES.css;
    link.crossOrigin = 'anonymous';
    link.onload = () => console.log('✅ CSS cargado');
    link.onerror = () => setError('Error cargando CSS de Potree');
    document.head.appendChild(link);

    // Cargar JS
    const script = document.createElement('script');
    script.src = POTREE_FILES.js;
    script.async = true;
    script.crossOrigin = 'anonymous';

    script.onerror = () => {
      console.error('❌ Error cargando Potree JS:', POTREE_FILES.js);
      setError('Error cargando librería Potree');
      setPotreeLoaded(false);
    };

    script.onload = () => {
      console.log('✅ Potree JS cargado');
      setPotreeLoaded(true);

      // Verificar que Potree está disponible en window
      if (!(window as any).Potree) {
        setError('Potree no disponible en window');
        return;
      }

      try {
        const viewer = new (window as any).Potree.Viewer(potreeContainerRef.current, {
          useDefaultUI: false,
        });

        viewer.setEDLEnabled(true);
        viewer.setFOV(60);
        viewer.setPointBudget(5_000_000);
        viewer.setBackground('gradient');
        viewer.setDescription('Reto Comu - Nube de puntos 3D');
        viewer.loadGUI();

        console.log('🌐 Cargando point cloud...');
        (window as any).Potree.loadPointCloud(
          POINTCLOUD_URL,
          'reto-comu',
          (e: any) => {
            console.log('✅ Nube cargada:', e);
            const pointcloud = e.pointcloud;
            const material = pointcloud.material;
            material.size = 1.8;
            material.pointSizeType = (window as any).Potree.PointSizeType.ADAPTIVE;
            material.shape = (window as any).Potree.PointShape.SQUARE;

            viewer.scene.addPointCloud(pointcloud);
            viewer.fitToScreen();

            // Marcadores de sensores
            sensors.forEach((sensor) => {
              const pos = new (window as any).THREE.Vector3(sensor.x, sensor.y, sensor.z || 10);
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
          },
          (err: any) => {
            console.error('❌ Error en loadPointCloud:', err);
            setError(`Error cargando nube: ${err.message || 'Verifica CORS o URL'}`);
          }
        );
      } catch (err) {
        console.error('❌ Error inicializando viewer:', err);
        setError('Error inicializando Potree');
      }
    };
    script.onerror = () => setError('Error cargando Potree JS');
    document.body.appendChild(script);

    return () => {
      // Limpieza opcional
      if (link.parentNode) link.parentNode.removeChild(link);
    };
  }, [potreeLoaded, sensors, onSensorClick, selectedSensorId]);

  return (
    <Card className="h-full relative bg-black overflow-hidden">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-50 pointer-events-none">
        <Badge variant="outline" className="bg-white/95 backdrop-blur pointer-events-auto">
          <Box className="w-4 h-4 mr-2" />
          Vista 3D - Nube de Puntos en Vivo
        </Badge>
        <div className="flex gap-2 pointer-events-auto">
          <Button size="icon" variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="outline">
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Mostrar error si existe */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-900 to-black z-40">
          <div className="text-center text-white">
            <div className="text-xl font-bold mb-4">⚠️ Error cargando Point Cloud</div>
            <div className="text-sm bg-red-950/50 p-4 rounded max-w-md">{error}</div>
            <div className="mt-4 text-xs text-gray-300">
              Revisa la consola (F12) para más detalles
            </div>
          </div>
        </div>
      )}

      {/* Contenedor Potree */}
      <div ref={potreeContainerRef} className="absolute inset-0" />

      {/* Loading */}
      {!potreeLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-white text-xl animate-pulse">Cargando nube 3D...</div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-900/90 z-40">
          <div className="text-white text-center p-4">
            <div className="text-xl font-bold mb-2">⚠️ Error</div>
            <div className="text-sm">{error}</div>
            <div className="text-xs mt-2">Revisa F12 >Console</div>
          </div>
        </div>
      )}
    </Card>
  );
}