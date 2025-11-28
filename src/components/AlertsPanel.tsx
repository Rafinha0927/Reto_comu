import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { apiService, type Alert } from '../services/apiService';
import { toast } from 'sonner@2.0.3';

export function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
    
    // DINÁMICO: Actualizar alertas cada 30 segundos
    const interval = setInterval(loadAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = async () => {
    try {
      const data = await apiService.getAlerts(10);
      setAlerts(data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar alertas:', error);
      toast.error('Error al cargar alertas');
      setLoading(false);
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      await apiService.acknowledgeAlert(alertId);
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId ? { ...alert, acknowledged: true } : alert
        )
      );
      toast.success('Alerta marcada como leída');
    } catch (error) {
      console.error('Error al actualizar alerta:', error);
      toast.error('Error al actualizar alerta');
    }
  };

  const getSeverityColor = (severity: Alert['severity']) => {
    const colors = {
      low: 'bg-blue-100 text-blue-700 border-blue-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      high: 'bg-orange-100 text-orange-700 border-orange-200',
      critical: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[severity];
  };

  const getSeverityIcon = (severity: Alert['severity']) => {
    if (severity === 'critical' || severity === 'high') {
      return <XCircle className="w-5 h-5" />;
    }
    return <AlertTriangle className="w-5 h-5" />;
  };

  const getTypeLabel = (type: Alert['type']) => {
    const labels = {
      temperature: 'Temperatura',
      humidity: 'Humedad',
      offline: 'Desconectado',
    };
    return labels[type];
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Alertas del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">Cargando alertas...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Alertas del Sistema
          </div>
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            {alerts.filter((a) => !a.acknowledged).length} sin leer
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          {alerts.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No hay alertas recientes</p>
              <p className="text-sm mt-1">El sistema está funcionando correctamente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* DINÁMICO: Estas alertas vienen de la API REST */}
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border transition-all ${
                    alert.acknowledged
                      ? 'bg-gray-50 border-gray-200 opacity-60'
                      : getSeverityColor(alert.severity)
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getSeverityIcon(alert.severity)}</div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{alert.sensorName}</span>
                          <Badge variant="outline" className="text-xs">
                            {getTypeLabel(alert.type)}
                          </Badge>
                        </div>
                        <p className="text-sm">{alert.message}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-600 mt-2">
                          <Clock className="w-3 h-3" />
                          {formatTime(alert.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                  {!alert.acknowledged && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() => handleAcknowledge(alert.id)}
                    >
                      Marcar como leída
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
