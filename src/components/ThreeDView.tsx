import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Maximize2, RefreshCw, Box } from 'lucide-react';
import { Button } from './ui/button';
import { useEffect, useRef } from 'react';

interface Sensor {
  id: string;
  name: string;
  x: number;
  y: number;
  status: 'active' | 'inactive';
}

interface ThreeDViewProps {
  sensors: Sensor[];
  onSensorClick: (sensorId: string) => void;
  selectedSensorId: string | null;
}

export function ThreeDView({ sensors, onSensorClick, selectedSensorId }: ThreeDViewProps) {
  const potreeContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // DINÁMICO: Integración con Potree para nube de puntos 3D
    // 
    // INSTRUCCIONES PARA INTEGRAR POTREE:
    // 
    // 1. Incluir Potree en tu proyecto:
    //    - Descarga Potree desde: https://github.com/potree/potree
    //    - Copia los archivos build/potree a tu carpeta public/potree
    // 
    // 2. Agregar script de Potree en public/index.html:
    //    <script src="/potree/potree.js"></script>
    //    <link rel="stylesheet" href="/potree/potree.css">
    // 
    // 3. Inicializar Potree en este useEffect:
    /*
    if (potreeContainerRef.current && window.Potree) {
      const viewer = new window.Potree.Viewer(potreeContainerRef.current);
      
      // Cargar nube de puntos desde AWS S3 o servidor
      window.Potree.loadPointCloud(
        "cloud.js", // URL de tu nube de puntos
        "pointcloud", // nombre
        (e) => {
          viewer.scene.addPointCloud(e.pointcloud);
          viewer.fitToScreen();
          
          // Agregar marcadores para sensores
          sensors.forEach((sensor) => {
            const position = new THREE.Vector3(sensor.x, sensor.y, 0);
            const marker = viewer.scene.addMarker(position, {
              label: sensor.name,
              color: sensor.status === 'active' ? 0x00ff00 : 0x888888
            });
            
            marker.addEventListener('click', () => {
              onSensorClick(sensor.id);
            });
          });
        }
      );
      
      return () => {
        viewer.dispose();
      };
    }
    */
    
    console.log('[ThreeDView] Potree container ready for integration');
  }, [sensors, onSensorClick]);

  return (
    <Card className="h-full relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 transition-colors overflow-hidden">
      {/* DINÁMICO: Este contenedor está preparado para integrar Potree */}
      
      {/* Header de la vista 3D */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <Badge variant="outline" className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
          <Box className="w-3 h-3 mr-1" />
          Vista 3D - Nube de Puntos
        </Badge>
        <div className="flex gap-2">
          <Button size="icon" variant="outline" className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="outline" className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Contenedor para Potree - PRODUCCIÓN: Aquí se renderizará Potree */}
      <div 
        ref={potreeContainerRef}
        className="absolute inset-0"
        style={{ width: '100%', height: '100%' }}
      >
        {/* Vista de desarrollo: Simulación de sensores en espacio 3D */}
        <div className="relative h-full flex items-center justify-center">
          <div className="relative w-full h-full p-20">
            {/* DINÁMICO: Sensores desde la API REST */}
            {sensors.map((sensor) => (
              <button
                key={sensor.id}
                onClick={() => onSensorClick(sensor.id)}
                className="absolute group"
                style={{
                  left: `${sensor.x}%`,
                  top: `${sensor.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {/* Punto del sensor */}
                <div
                  className={`w-4 h-4 rounded-full transition-all ${
                    selectedSensorId === sensor.id
                      ? 'scale-150 ring-4 ring-blue-300 dark:ring-blue-600'
                      : 'group-hover:scale-125'
                  } ${
                    sensor.status === 'active'
                      ? 'bg-green-500 shadow-lg shadow-green-300 dark:shadow-green-600'
                      : 'bg-gray-400 shadow-lg shadow-gray-300 dark:shadow-gray-600'
                  }`}
                >
                  {/* Pulso animado para sensores activos */}
                  {sensor.status === 'active' && (
                    <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></span>
                  )}
                </div>

                {/* Etiqueta del sensor */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-lg whitespace-nowrap text-xs border border-gray-200 dark:border-gray-700">
                    {sensor.name}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Overlay informativo */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur px-4 py-2 rounded-lg shadow text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
            💡 Haz clic en un sensor para ver detalles • Integración Potree lista
          </div>
        </div>
      </div>
    </Card>
  );
}