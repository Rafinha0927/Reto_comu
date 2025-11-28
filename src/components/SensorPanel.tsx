import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { RealtimeChart } from './RealtimeChart';
import { MapPin, Thermometer, Droplets, Activity } from 'lucide-react';

interface SensorData {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'inactive';
  temperature: {
    current: number;
    history: Array<{ time: string; value: number }>;
  };
  humidity: {
    current: number;
    history: Array<{ time: string; value: number }>;
  };
}

interface SensorPanelProps {
  sensor: SensorData | null;
}

export function SensorPanel({ sensor }: SensorPanelProps) {
  if (!sensor) {
    return (
      <aside className="bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 w-96 p-6 transition-colors">
        <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
          <div className="text-center">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Selecciona un sensor en la vista 3D</p>
            <p className="text-sm mt-1">para ver datos en tiempo real</p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 w-96 p-6 overflow-y-auto transition-colors">
      {/* DINÁMICO: Este panel se conectará con WebSocket para datos en tiempo real */}
      
      {/* Header del sensor */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-gray-900 dark:text-white">{sensor.name}</h2>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mt-1">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{sensor.location}</span>
            </div>
          </div>
          <Badge 
            variant={sensor.status === 'active' ? 'default' : 'secondary'}
            className={sensor.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}
          >
            {sensor.status === 'active' ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
      </div>

      {/* Tarjeta de Temperatura - DINÁMICO: Datos en tiempo real desde WebSocket */}
      <Card className="mb-4 dark:bg-gray-900 dark:border-gray-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Thermometer className="w-5 h-5 text-orange-500" />
              Temperatura
            </CardTitle>
            <span className="text-orange-500">{sensor.temperature.current}°C</span>
          </div>
          <CardDescription className="dark:text-gray-400">Gráfico en tiempo real - últimos 10 min</CardDescription>
        </CardHeader>
        <CardContent>
          <RealtimeChart 
            data={sensor.temperature.history}
            color="#f97316"
            unit="°C"
          />
        </CardContent>
      </Card>

      {/* Tarjeta de Humedad - DINÁMICO: Datos en tiempo real desde WebSocket */}
      <Card className="mb-6 dark:bg-gray-900 dark:border-gray-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Droplets className="w-5 h-5 text-blue-500" />
              Humedad
            </CardTitle>
            <span className="text-blue-500">{sensor.humidity.current}%</span>
          </div>
          <CardDescription className="dark:text-gray-400">Gráfico en tiempo real - últimos 10 min</CardDescription>
        </CardHeader>
        <CardContent>
          <RealtimeChart 
            data={sensor.humidity.history}
            color="#3b82f6"
            unit="%"
          />
        </CardContent>
      </Card>

      {/* Botón para ver histórico detallado - DINÁMICO: Abre vista de histórico desde DynamoDB */}
      <Button className="w-full bg-blue-500 hover:bg-blue-600">
        Ver Histórico Detallado
      </Button>
    </aside>
  );
}