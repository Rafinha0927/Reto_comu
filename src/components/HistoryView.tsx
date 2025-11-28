import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Download, RefreshCw } from 'lucide-react';
import { apiService } from '../services/apiService';
import { toast } from 'sonner@2.0.3';

interface HistoryViewProps {
  sensorId: string;
  sensorName: string;
}

export function HistoryView({ sensorId, sensorName }: HistoryViewProps) {
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<string>('24h');

  useEffect(() => {
    loadHistory();
  }, [sensorId, timeRange]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      // DINÁMICO: Conectar con DynamoDB a través de API Gateway + Lambda
      // Este endpoint debe devolver los datos históricos desde DynamoDB
      const data = await apiService.getSensorHistory(sensorId);
      
      // Formatear datos para el gráfico
      const formattedData = data.map((item) => ({
        time: new Date(item.timestamp).toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        timestamp: item.timestamp,
        temperatura: item.temperature,
        humedad: item.humidity,
      }));

      setHistoryData(formattedData);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar histórico:', error);
      toast.error('Error al cargar datos históricos');
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Exportar datos a CSV
    const csv = [
      ['Timestamp', 'Temperatura (°C)', 'Humedad (%)'],
      ...historyData.map((row) => [row.timestamp, row.temperatura, row.humedad]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sensor_${sensorId}_history_${new Date().toISOString()}.csv`;
    a.click();
    
    toast.success('Datos exportados exitosamente');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Histórico de {sensorName}</CardTitle>
              <CardDescription>
                Datos almacenados en AWS DynamoDB
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Última hora</SelectItem>
                  <SelectItem value="24h">Últimas 24h</SelectItem>
                  <SelectItem value="7d">Últimos 7 días</SelectItem>
                  <SelectItem value="30d">Últimos 30 días</SelectItem>
                </SelectContent>
              </Select>
              <Button size="icon" variant="outline" onClick={loadHistory}>
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button size="icon" variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-96 flex items-center justify-center text-gray-500">
              Cargando datos históricos...
            </div>
          ) : (
            <div className="h-96">
              {/* DINÁMICO: Gráfico con datos de DynamoDB */}
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    stroke="#9ca3af"
                  />
                  <YAxis
                    yAxisId="temp"
                    orientation="left"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    stroke="#f97316"
                    label={{ value: 'Temperatura (°C)', angle: -90, position: 'insideLeft' }}
                  />
                  <YAxis
                    yAxisId="humidity"
                    orientation="right"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    stroke="#3b82f6"
                    label={{ value: 'Humedad (%)', angle: 90, position: 'insideRight' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="temp"
                    type="monotone"
                    dataKey="temperatura"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={false}
                    name="Temperatura (°C)"
                  />
                  <Line
                    yAxisId="humidity"
                    type="monotone"
                    dataKey="humedad"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    name="Humedad (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estadísticas del período */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Temp. Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-orange-500">
              {historyData.length > 0
                ? (
                    historyData.reduce((sum, item) => sum + item.temperatura, 0) /
                    historyData.length
                  ).toFixed(1)
                : '0'}
              °C
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Humedad Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-blue-500">
              {historyData.length > 0
                ? (
                    historyData.reduce((sum, item) => sum + item.humedad, 0) /
                    historyData.length
                  ).toFixed(1)
                : '0'}
              %
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Registros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">
              {historyData.length} puntos
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
