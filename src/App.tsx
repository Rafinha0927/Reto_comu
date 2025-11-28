import { useState, useEffect } from "react";
import { DarkModeProvider } from "./contexts/DarkModeContext";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { ThreeDView } from "./components/ThreeDView";
import { SensorPanel } from "./components/SensorPanel";
import { KPICards } from "./components/KPICards";
import { AlertsPanel } from "./components/AlertsPanel";
import { HistoryView } from "./components/HistoryView";
import { SensorsListView } from "./components/SensorsListView";
import { ConfigurationView } from "./components/ConfigurationView";
import { Toaster } from "./components/ui/sonner";
import { useWebSocket } from "./hooks/useWebSocket";
import { apiService } from "./services/apiService";
import { toast } from "sonner";

// ============================================================================
// CONFIGURACIÓN DE API Y WEBSOCKET
// ============================================================================
// DINÁMICO: Reemplazar con las URLs reales de producción
const WEBSOCKET_URL = "ws://localhost:8080/sensors"; // Ejemplo: wss://your-api.com/sensors
const API_POLLING_INTERVAL = 30000; // 30 segundos

// DATOS MOCK - DINÁMICO: Estos datos se reemplazarán con llamadas a la API REST
const mockSensors = [
  { id: "s1", name: "Sensor A1", x: 25, y: 30, status: "active" as const },
  { id: "s2", name: "Sensor B2", x: 45, y: 50, status: "active" as const },
  { id: "s3", name: "Sensor C3", x: 65, y: 35, status: "active" as const },
  { id: "s4", name: "Sensor D4", x: 75, y: 65, status: "inactive" as const },
  { id: "s5", name: "Sensor E5", x: 35, y: 70, status: "active" as const },
];

// Generar datos históricos mock
const generateMockHistory = (baseValue: number, variance: number) => {
  return Array.from({ length: 10 }, (_, i) => ({
    time: `${i}m`,
    value: Number((baseValue + (Math.random() - 0.5) * variance).toFixed(1)),
  }));
};

const mockSensorData = {
  s1: {
    id: "s1",
    name: "Sensor A1",
    location: "Zona Norte - Edificio Principal",
    status: "active" as const,
    temperature: { current: 22.5, history: generateMockHistory(22.5, 2) },
    humidity: { current: 65, history: generateMockHistory(65, 10) },
  },
  s2: {
    id: "s2",
    name: "Sensor B2",
    location: "Zona Este - Almacén",
    status: "active" as const,
    temperature: { current: 24.8, history: generateMockHistory(24.8, 2) },
    humidity: { current: 58, history: generateMockHistory(58, 10) },
  },
  s3: {
    id: "s3",
    name: "Sensor C3",
    location: "Zona Sur - Oficinas",
    status: "active" as const,
    temperature: { current: 21.2, history: generateMockHistory(21.2, 2) },
    humidity: { current: 72, history: generateMockHistory(72, 10) },
  },
  s4: {
    id: "s4",
    name: "Sensor D4",
    location: "Zona Oeste - Planta Baja",
    status: "inactive" as const,
    temperature: { current: 0, history: [] },
    humidity: { current: 0, history: [] },
  },
  s5: {
    id: "s5",
    name: "Sensor E5",
    location: "Zona Centro - Laboratorio",
    status: "active" as const,
    temperature: { current: 23.1, history: generateMockHistory(23.1, 2) },
    humidity: { current: 61, history: generateMockHistory(61, 10) },
  },
};

const mockKPIData = {
  avgTemperature: 22.9,
  avgHumidity: 64,
  activeSensors: 4,
  inactiveSensors: 1,
  criticalAlerts: 2,
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
function AppContent() {
  // ========== ESTADO ==========
  const [activeSection, setActiveSection] = useState("vista3d");
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null);
  const [kpiData, setKpiData] = useState(mockKPIData);
  const [sensors, setSensors] = useState(mockSensors);
  const [sensorData, setSensorData] = useState(mockSensorData);

  // ========== WEBSOCKET ==========
  // DINÁMICO: Conexión WebSocket para datos en tiempo real
  const { isConnected, lastMessage, error } = useWebSocket({
    url: WEBSOCKET_URL,
    autoConnect: true,
    reconnectInterval: 3000,
    maxReconnectAttempts: 5,
  });

  // Procesar mensajes del WebSocket
  useEffect(() => {
    if (lastMessage) {
      console.log("[WebSocket] Mensaje recibido:", lastMessage);
      
      // DINÁMICO: Procesar datos del WebSocket según tu formato
      // Ejemplo de estructura esperada:
      // {
      //   type: "sensor_update",
      //   sensorId: "s1",
      //   data: { temperature: 23.5, humidity: 67 },
      //   timestamp: "2024-11-07T10:30:00Z"
      // }
      
      if (lastMessage.type === "sensor_update" && lastMessage.sensorId) {
        const { sensorId, data } = lastMessage;
        
        // Actualizar datos del sensor en tiempo real
        setSensorData((prev) => {
          const sensor = prev[sensorId as keyof typeof prev];
          if (!sensor) return prev;
          
          return {
            ...prev,
            [sensorId]: {
              ...sensor,
              temperature: {
                current: data.temperature || sensor.temperature.current,
                history: [
                  ...sensor.temperature.history.slice(-9),
                  {
                    time: new Date().toLocaleTimeString(),
                    value: data.temperature || sensor.temperature.current,
                  },
                ],
              },
              humidity: {
                current: data.humidity || sensor.humidity.current,
                history: [
                  ...sensor.humidity.history.slice(-9),
                  {
                    time: new Date().toLocaleTimeString(),
                    value: data.humidity || sensor.humidity.current,
                  },
                ],
              },
            },
          };
        });
      }
    }
  }, [lastMessage]);

  // Mostrar errores de WebSocket
  useEffect(() => {
    if (error) {
      toast.error(`Error de conexión: ${error}`);
    }
  }, [error]);

  // ========== API REST ==========
  // DINÁMICO: Cargar datos iniciales y actualizar periódicamente
  useEffect(() => {
    loadInitialData();
    
    // Actualizar KPIs periódicamente
    const interval = setInterval(loadKPIs, API_POLLING_INTERVAL);
    
    return () => clearInterval(interval);
  }, []);

  const loadInitialData = async () => {
    try {
      // Cargar sensores desde la API
      const sensorsData = await apiService.getSensors();
      setSensors(sensorsData);
      
      // Cargar KPIs
      await loadKPIs();
      
      console.log("[API] Datos iniciales cargados");
    } catch (error) {
      console.error("[API] Error al cargar datos iniciales:", error);
      toast.error("Error al cargar datos del sistema");
    }
  };

  const loadKPIs = async () => {
    try {
      const data = await apiService.getKPIs();
      setKpiData(data);
    } catch (error) {
      console.error("[API] Error al cargar KPIs:", error);
    }
  };

  // ========== HANDLERS ==========
  const handleSensorClick = (sensorId: string) => {
    setSelectedSensorId(sensorId);
    console.log(`[UI] Sensor seleccionado: ${sensorId}`);
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    console.log(`[UI] Sección activa: ${section}`);
  };

  // ========== DATOS DEL SENSOR SELECCIONADO ==========
  const selectedSensor = selectedSensorId
    ? sensorData[selectedSensorId as keyof typeof sensorData]
    : null;

  // ========== RENDER ==========
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex flex-col transition-colors">
      {/* Header superior con indicador de conexión WebSocket */}
      <Header isConnected={isConnected} unreadNotifications={kpiData.criticalAlerts} />

      {/* Layout principal */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar izquierdo - Navegación */}
        <Sidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />

        {/* Contenido central - Vistas dinámicas según sección activa */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Vista 3D con Potree */}
          {activeSection === "vista3d" && (
            <>
              {/* KPIs superiores */}
              <div className="p-6 pb-4">
                <KPICards data={kpiData} />
              </div>

              {/* Vista 3D principal */}
              <div className="flex-1 px-6 pb-6">
                <ThreeDView
                  sensors={sensors}
                  onSensorClick={handleSensorClick}
                  selectedSensorId={selectedSensorId}
                />
              </div>
            </>
          )}

          {/* Vista de Lista de Sensores */}
          {activeSection === "sensores" && (
            <div className="flex-1 p-6 overflow-hidden">
              <SensorsListView onSelectSensor={handleSensorClick} />
            </div>
          )}

          {/* Vista de Histórico */}
          {activeSection === "historico" && (
            <div className="flex-1 p-6 overflow-auto">
              {selectedSensor ? (
                <HistoryView
                  sensorId={selectedSensor.id}
                  sensorName={selectedSensor.name}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <p>Selecciona un sensor para ver su histórico</p>
                    <p className="text-sm mt-1">
                      Los datos históricos se obtienen desde AWS DynamoDB
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Vista de Alertas */}
          {activeSection === "alertas" && (
            <div className="flex-1 p-6 overflow-hidden">
              <AlertsPanel />
            </div>
          )}

          {/* Vista de Configuración */}
          {activeSection === "configuracion" && (
            <div className="flex-1 p-6 overflow-auto">
              <ConfigurationView 
                isConnected={isConnected}
                websocketUrl={WEBSOCKET_URL}
                apiUrl="https://your-api-gateway.execute-api.region.amazonaws.com/production"
              />
            </div>
          )}
        </main>

        {/* Panel lateral derecho - Detalles del sensor (solo en vista 3D) */}
        {activeSection === "vista3d" && <SensorPanel sensor={selectedSensor} />}
      </div>

      {/* Toast notifications */}
      <Toaster position="top-right" richColors />
    </div>
  );
}

// ============================================================================
// EXPORT CON DARK MODE PROVIDER
// ============================================================================
export default function App() {
  return (
    <DarkModeProvider>
      <AppContent />
    </DarkModeProvider>
  );
}