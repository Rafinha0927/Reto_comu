import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Thermometer, Droplets, Activity, AlertTriangle } from 'lucide-react';

interface KPIData {
  avgTemperature: number;
  avgHumidity: number;
  activeSensors: number;
  inactiveSensors: number;
  criticalAlerts: number;
}

interface KPICardsProps {
  data: KPIData;
}

export function KPICards({ data }: KPICardsProps) {
  // DINÁMICO: KPIs calculados en backend y expuestos vía API REST
  const kpis = [
    {
      title: 'Temperatura Promedio',
      value: `${data.avgTemperature}°C`,
      icon: Thermometer,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      title: 'Humedad Promedio',
      value: `${data.avgHumidity}%`,
      icon: Droplets,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Sensores Activos',
      value: `${data.activeSensors} / ${data.activeSensors + data.inactiveSensors}`,
      icon: Activity,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Alertas Críticas',
      value: data.criticalAlerts.toString(),
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* DINÁMICO: Estos valores se conectarán con la API REST - GET /sensors/summary */}
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <Card key={index} className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600 dark:text-gray-400">{kpi.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className={`${kpi.bgColor} p-3 rounded-lg transition-colors`}>
                  <Icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
                <span className="text-gray-900 dark:text-white">{kpi.value}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}