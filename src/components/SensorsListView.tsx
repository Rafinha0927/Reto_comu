import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Search, MapPin, Thermometer, Droplets, Activity, RefreshCw } from 'lucide-react';
import { apiService } from '../services/apiService';
import { toast } from 'sonner';

interface Sensor {
  id: string;
  name: string;
  location?: string;
  x: number;
  y: number;
  z?: number;
  status: 'active' | 'inactive';
  temperature?: number;
  humidity?: number;
}

interface SensorsListViewProps {
  onSelectSensor: (sensorId: string) => void;
}

export function SensorsListView({ onSelectSensor }: SensorsListViewProps) {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [filteredSensors, setFilteredSensors] = useState<Sensor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSensors();
  }, []);

  useEffect(() => {
    // Filtrar sensores basado en el término de búsqueda
    const filtered = sensors.filter(
      (sensor) =>
        sensor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sensor.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSensors(filtered);
  }, [searchTerm, sensors]);

  const loadSensors = async () => {
    setLoading(true);
    try {
      // DINÁMICO: Obtener lista de sensores desde la API
      const data = await apiService.getSensors();
      setSensors(data);
      setFilteredSensors(data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar sensores:', error);
      toast.error('Error al cargar sensores');
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return (
        <Badge className="bg-green-500">
          <Activity className="w-3 h-3 mr-1" />
          Activo
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-500">
        <Activity className="w-3 h-3 mr-1" />
        Inactivo
      </Badge>
    );
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Lista de Sensores
          </CardTitle>
          <Button size="icon" variant="outline" onClick={loadSensors}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre o ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        {loading ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            Cargando sensores...
          </div>
        ) : (
          <div className="h-full overflow-auto">
            {/* DINÁMICO: Lista de sensores desde la API REST */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sensor</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Coordenadas</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSensors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500">
                      No se encontraron sensores
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSensors.map((sensor) => (
                    <TableRow key={sensor.id} className="cursor-pointer hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              sensor.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                            }`}
                          />
                          <span>{sensor.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="w-3 h-3" />
                          {sensor.location || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-gray-500 font-mono">
                          X:{sensor.x} Y:{sensor.y} {sensor.z !== undefined && `Z:${sensor.z}`}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(sensor.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onSelectSensor(sensor.id)}
                        >
                          Ver Detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
