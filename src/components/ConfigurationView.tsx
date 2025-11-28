import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Settings, Database, Wifi, Cloud, Code, CheckCircle2, XCircle } from 'lucide-react';

interface ConfigurationViewProps {
  isConnected: boolean;
  websocketUrl: string;
  apiUrl: string;
}

export function ConfigurationView({ isConnected, websocketUrl, apiUrl }: ConfigurationViewProps) {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 dark:text-white mb-2">
            Configuración del Sistema
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona las integraciones y configuraciones del dashboard
          </p>
        </div>
        <Badge 
          variant="outline" 
          className={isConnected 
            ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
            : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
          }
        >
          {isConnected ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Sistema Conectado
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 mr-1" />
              Sistema Desconectado
            </>
          )}
        </Badge>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="api">API & WebSocket</TabsTrigger>
          <TabsTrigger value="aws">AWS Services</TabsTrigger>
          <TabsTrigger value="advanced">Avanzado</TabsTrigger>
        </TabsList>

        {/* TAB: General */}
        <TabsContent value="general" className="space-y-4">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuración General
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Ajustes básicos del dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dashboardName">Nombre del Dashboard</Label>
                <Input 
                  id="dashboardName" 
                  defaultValue="IoT 3D Monitoring Dashboard"
                  className="dark:bg-gray-900 dark:border-gray-700"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Actualización Automática</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Actualizar KPIs cada 30 segundos
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modo Oscuro Automático</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Cambiar según hora del sistema
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificaciones de Alertas</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Mostrar toast cuando haya alertas nuevas
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Umbrales de Alertas</CardTitle>
              <CardDescription className="dark:text-gray-400">
                Configurar límites para alertas automáticas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tempMin">Temperatura Mínima (°C)</Label>
                  <Input 
                    id="tempMin" 
                    type="number" 
                    defaultValue="18"
                    className="dark:bg-gray-900 dark:border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tempMax">Temperatura Máxima (°C)</Label>
                  <Input 
                    id="tempMax" 
                    type="number" 
                    defaultValue="28"
                    className="dark:bg-gray-900 dark:border-gray-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="humMin">Humedad Mínima (%)</Label>
                  <Input 
                    id="humMin" 
                    type="number" 
                    defaultValue="40"
                    className="dark:bg-gray-900 dark:border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="humMax">Humedad Máxima (%)</Label>
                  <Input 
                    id="humMax" 
                    type="number" 
                    defaultValue="80"
                    className="dark:bg-gray-900 dark:border-gray-700"
                  />
                </div>
              </div>

              <Button className="w-full bg-blue-500 hover:bg-blue-600">
                Guardar Configuración
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: API & WebSocket */}
        <TabsContent value="api" className="space-y-4">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="w-5 h-5" />
                Conexión WebSocket
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Configuración para recibir datos en tiempo real
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wsUrl">WebSocket URL</Label>
                <Input 
                  id="wsUrl" 
                  defaultValue={websocketUrl}
                  placeholder="wss://your-api.execute-api.region.amazonaws.com/production"
                  className="font-mono text-sm dark:bg-gray-900 dark:border-gray-700"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  💡 URL del WebSocket para recibir actualizaciones de sensores
                </p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="text-blue-900 dark:text-blue-300 mb-2">
                  Estado de la Conexión
                </h4>
                <div className="space-y-1 text-sm text-blue-800 dark:text-blue-400">
                  <p>• Estado: <strong>{isConnected ? "✅ Conectado" : "❌ Desconectado"}</strong></p>
                  <p>• Reintentos automáticos: Habilitado</p>
                  <p>• Intervalo de reconexión: 3 segundos</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  Probar Conexión
                </Button>
                <Button variant="outline" className="flex-1">
                  Reconectar
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                API REST
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Endpoints para histórico, KPIs y configuración
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiUrl">API Base URL</Label>
                <Input 
                  id="apiUrl" 
                  defaultValue={apiUrl}
                  placeholder="https://your-api.execute-api.region.amazonaws.com/production"
                  className="font-mono text-sm dark:bg-gray-900 dark:border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key (opcional)</Label>
                <Input 
                  id="apiKey" 
                  type="password"
                  placeholder="your-api-key-here"
                  className="font-mono text-sm dark:bg-gray-900 dark:border-gray-700"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  💡 Necesaria si tu API Gateway requiere autenticación
                </p>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="text-green-900 dark:text-green-300 mb-2">
                  Endpoints Configurados
                </h4>
                <div className="space-y-1 text-xs text-green-800 dark:text-green-400 font-mono">
                  <p>GET /sensors</p>
                  <p>GET /sensors/{'{id}'}</p>
                  <p>GET /sensors/{'{id}'}/history</p>
                  <p>GET /sensors/summary</p>
                  <p>GET /alerts</p>
                </div>
              </div>

              <Button className="w-full bg-blue-500 hover:bg-blue-600">
                Guardar Configuración
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: AWS Services */}
        <TabsContent value="aws" className="space-y-4">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="w-5 h-5" />
                Servicios de AWS
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Configuración de recursos en Amazon Web Services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <h4 className="text-orange-900 dark:text-orange-300 mb-3">
                  <Database className="w-4 h-4 inline mr-2" />
                  DynamoDB - Almacenamiento de Histórico
                </h4>
                <div className="space-y-2 text-sm text-orange-800 dark:text-orange-400">
                  <p>• Tabla: <code className="bg-white dark:bg-gray-900 px-2 py-1 rounded">SensorHistory</code></p>
                  <p>• Partition Key: <code className="bg-white dark:bg-gray-900 px-2 py-1 rounded">sensorId</code></p>
                  <p>• Sort Key: <code className="bg-white dark:bg-gray-900 px-2 py-1 rounded">timestamp</code></p>
                  <p>• Región: <code className="bg-white dark:bg-gray-900 px-2 py-1 rounded">us-east-1</code></p>
                </div>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <h4 className="text-purple-900 dark:text-purple-300 mb-3">
                  API Gateway - Endpoints REST y WebSocket
                </h4>
                <div className="space-y-2 text-sm text-purple-800 dark:text-purple-400">
                  <p>• REST API ID: <code className="bg-white dark:bg-gray-900 px-2 py-1 rounded">abc123def</code></p>
                  <p>• WebSocket API ID: <code className="bg-white dark:bg-gray-900 px-2 py-1 rounded">xyz789ghi</code></p>
                  <p>• Stage: <code className="bg-white dark:bg-gray-900 px-2 py-1 rounded">production</code></p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="text-blue-900 dark:text-blue-300 mb-3">
                  S3 - Archivos de Nube de Puntos (Potree)
                </h4>
                <div className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
                  <p>• Bucket: <code className="bg-white dark:bg-gray-900 px-2 py-1 rounded">iot-potree-data</code></p>
                  <p>• Región: <code className="bg-white dark:bg-gray-900 px-2 py-1 rounded">us-east-1</code></p>
                  <p>• CloudFront: Habilitado para CDN</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  Ver en AWS Console
                </Button>
                <Button variant="outline" className="flex-1">
                  Verificar Permisos
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Advanced */}
        <TabsContent value="advanced" className="space-y-4">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Configuración Avanzada</CardTitle>
              <CardDescription className="dark:text-gray-400">
                Opciones para usuarios avanzados y desarrolladores
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modo Debug</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Mostrar logs en consola del navegador
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Usar Datos Mock</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Utilizar datos de prueba en lugar de API real
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <Label>Intervalo de Actualización (ms)</Label>
                <Input 
                  type="number" 
                  defaultValue="30000"
                  className="dark:bg-gray-900 dark:border-gray-700"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Tiempo entre actualizaciones de KPIs (30000ms = 30 segundos)
                </p>
              </div>

              <div className="space-y-2">
                <Label>Reintentos de Conexión WebSocket</Label>
                <Input 
                  type="number" 
                  defaultValue="5"
                  className="dark:bg-gray-900 dark:border-gray-700"
                />
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="destructive" className="w-full">
                  Restablecer Configuración a Valores por Defecto
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Información del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Versión:</span>
                  <span className="text-gray-900 dark:text-white">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Build:</span>
                  <span className="text-gray-900 dark:text-white">2024.11.07</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Entorno:</span>
                  <span className="text-gray-900 dark:text-white">Development</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">React:</span>
                  <span className="text-gray-900 dark:text-white">18.x</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
