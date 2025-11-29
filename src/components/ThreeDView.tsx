import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Maximize2, RefreshCw, Box } from 'lucide-react';
import { Button } from './ui/button';
import { useEffect, useRef, useState } from 'react';
import { POINTCLOUDS, LIBRARIES } from '../config/aws';

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

  // Usar la configuración de AWS CloudFront para cargar la nube de puntos
  const POINTCLOUD_URL = POINTCLOUDS.reto_comu;

  useEffect(() => {
    // Evitamos cargar Potree dos veces
    if (potreeLoaded || !potreeContainerRef.current) return;

    console.log('📦 Cargando Potree desde:', LIBRARIES.potreeJS);
    console.log('☁️ Cargando Point Cloud desde:', POINTCLOUD_URL);

    // Cargar CSS de Potree desde CloudFront
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = LIBRARIES.potreeCSS;
    link.onerror = () => {
      console.error('❌ Error cargando CSS de Potree:', LIBRARIES.potreeCSS);
      setError('Error cargando estilos de Potree');
    };
    link.onload = () => {
      console.log('✅ CSS de Potree cargado correctamente');
    };
    document.head.appendChild(link);

    // Cargar Potree JS desde CloudFront
    const script = document.createElement('script');
    script.src = LIBRARIES.potreeJS;
    script.async = true;
    script.crossOrigin = 'anonymous';

    script.onerror = () => {
      console.error('❌ Error cargando Potree JS:', LIBRARIES.potreeJS);
      setError('Error cargando librería Potree');
      setPotreeLoaded(false);
    };

    script.onload = () => {
      console.log('✅ Potree JS cargado correctamente');
      setPotreeLoaded(true);

      // Verificar que Potree está disponible en window
      if (!(window as any).Potree) {
        console.error('❌ Potree no está disponible en window después de cargar');
        setError('Potree no se cargó correctamente');
        return;
      }

      console.log('🎬 Inicializando visor Potree');

      // @ts-ignore – Potree se carga en window
      const viewer = new (window as any).Potree.Viewer(potreeContainerRef.current, {
        useDefaultUI: false,
      });

      viewer.setEDLEnabled(true);
      viewer.setFOV(60);
      viewer.setPointBudget(5_000_000);
      viewer.setBackground('gradient');
      viewer.setDescription('Reto Comu - Nube de puntos 3D');
      viewer.loadGUI();

      // CARGAR LA NUBE DE PUNTOS REAL
      console.log('🌐 Iniciando carga del point cloud...');
      (window as any).Potree.loadPointCloud(POINTCLOUD_URL, "reto-comu", (e: any) => {
        console.log('✅ Point cloud cargado exitosamente:', e);
        const pointcloud = e.pointcloud;
        const material = pointcloud.material;
        material.size = 1.8;
        material.pointSizeType = (window as any).Potree.PointSizeType.ADAPTIVE;
        material.shape = (window as any).Potree.PointShape.SQUARE;

        viewer.scene.addPointCloud(pointcloud);
        viewer.fitToScreen();

        // AÑADIR MARCADORES 3D PARA CADA SENSOR (coordenadas reales X,Y,Z)
        sensors.forEach((sensor) => {
          const pos = new (window as any).THREE.Vector3(sensor.x, sensor.y, (sensor.z || 10));

          const marker = viewer.scene.addMarker(pos, {
            label: sensor.name,
            color: sensor.status === 'active' ? 0x00ff00 : 0xff5555,
            size: 15,
          });

          // Hacer clicable el marcador
          marker.addEventListener('click', () => {
            onSensorClick(sensor.id);
            viewer.scene.view.position.set(pos.x + 30, pos.y + 30, pos.z + 50);
            viewer.scene.view.lookAt(pos);
          });

          // Resaltar si está seleccionado
          if (sensor.id === selectedSensorId) {
            viewer.scene.view.position.set(pos.x + 40, pos.y + 40, pos.z + 60);
            viewer.scene.view.lookAt(pos);
          }
        });
      }, (error: any) => {
        console.error('❌ Error cargando point cloud:', error);
        setError(`Error cargando point cloud: ${error.message || error}`);
      });
    };

    document.body.appendChild(script);

    return () => {
      // Limpieza opcional
      if (link.parentNode) link.parentNode.removeChild(link);
    };
  }, [potreeLoaded, sensors, onSensorClick, selectedSensorId]);

  return (
    <Card className="h-full relative bg-black overflow-hidden">
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-50 pointer-events-none">
        <Badge variant="outline" className="bg-white/95 backdrop-blur pointer-events-auto">
          <Box className="w-4 h-4 mr-2" />
          Vista 3D - Nube de Puntos en Vivo
        </Badge>
        <div className="flex gap-2 pointer-events-auto">
          <Button size="icon" variant="outline" className="bg-white/90 backdrop-blur">
            <RefreshCw className="w-4 h-4" onClick={() => window.location.reload()} />
          </Button>
          <Button size="icon" variant="outline" className="bg-white/90 backdrop-blur">
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
      <div
        ref={potreeContainerRef}
        className="absolute inset-0"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Fallback mientras carga Potree */}
      {!potreeLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
          <div className="text-white text-center">
            <div className="text-xl animate-pulse mb-4">
              Cargando nube de puntos 3D desde AWS...
            </div>
            <div className="text-xs text-gray-400">
              CloudFront: {POINTCLOUD_URL}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}