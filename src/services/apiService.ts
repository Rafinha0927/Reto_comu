// Servicio para conectar con la API REST de AWS
// DINÁMICO: Configurar estas URLs con los endpoints reales de AWS API Gateway
// Ahora leemos la URL desde las variables de entorno de Vite: VITE_API_BASE_URL
// Para desarrollo crea un fichero `.env.local` en la raíz con:
// VITE_API_BASE_URL=https://your-api-gateway.execute-api.region.amazonaws.com/production

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) ||
  'https://8gcbzi8fzk.execute-api.us-east-1.amazonaws.com/production';
// Ejemplo real: arn:aws:dynamodb:us-east-2:836149532384:table/Dashboard_IoT_User

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

interface KPIData {
  avgTemperature: number;
  avgHumidity: number;
  activeSensors: number;
  inactiveSensors: number;
  criticalAlerts: number;
}

interface Alert {
  id: string;
  sensorId: string;
  sensorName: string;
  type: 'temperature' | 'humidity' | 'offline';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

class ApiService {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.headers = {
      'Content-Type': 'application/json',
      // DINÁMICO: Agregar autenticación si es necesario
      // 'Authorization': 'Bearer YOUR_TOKEN_HERE',
      // 'x-api-key': 'YOUR_API_KEY_HERE', // Para AWS API Gateway con API Key
    };
  }

  // GET: Obtener lista de todos los sensores
  // Endpoint: GET /sensors
  async getSensors(): Promise<any[]> {
    try {
      // PRODUCCIÓN: Descomentar para usar API real
      // const response = await fetch(`${this.baseUrl}/sensors`, {
      //   method: 'GET',
      //   headers: this.headers,
      // });
      // if (!response.ok) throw new Error('Error al obtener sensores');
      // return await response.json();

      // MOCK: Datos de ejemplo (remover en producción)
      console.log('[API] Obteniendo lista de sensores...');
      return this.getMockSensors();
    } catch (error) {
      console.error('[API] Error al obtener sensores:', error);
      throw error;
    }
  }

  // GET: Obtener datos detallados de un sensor específico
  // Endpoint: GET /sensors/{id}
  async getSensorById(sensorId: string): Promise<SensorData> {
    try {
      // PRODUCCIÓN: Descomentar para usar API real
      // const response = await fetch(`${this.baseUrl}/sensors/${sensorId}`, {
      //   method: 'GET',
      //   headers: this.headers,
      // });
      // if (!response.ok) throw new Error(`Error al obtener sensor ${sensorId}`);
      // return await response.json();

      // MOCK: Datos de ejemplo
      console.log(`[API] Obteniendo datos del sensor: ${sensorId}`);
      return this.getMockSensorData(sensorId);
    } catch (error) {
      console.error(`[API] Error al obtener sensor ${sensorId}:`, error);
      throw error;
    }
  }

  // GET: Obtener histórico de un sensor desde DynamoDB
  // Endpoint: GET /sensors/{id}/history?startDate={start}&endDate={end}
  async getSensorHistory(
    sensorId: string,
    startDate?: string,
    endDate?: string
  ): Promise<Array<{ timestamp: string; temperature: number; humidity: number }>> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      // PRODUCCIÓN: Descomentar para usar API real
      // const response = await fetch(
      //   `${this.baseUrl}/sensors/${sensorId}/history?${params.toString()}`,
      //   {
      //     method: 'GET',
      //     headers: this.headers,
      //   }
      // );
      // if (!response.ok) throw new Error('Error al obtener histórico');
      // return await response.json();

      // MOCK: Datos de ejemplo
      console.log(`[API] Obteniendo histórico del sensor: ${sensorId}`);
      return this.getMockSensorHistory(sensorId);
    } catch (error) {
      console.error(`[API] Error al obtener histórico de ${sensorId}:`, error);
      throw error;
    }
  }

  // GET: Obtener KPIs globales del sistema
  // Endpoint: GET /sensors/summary
  async getKPIs(): Promise<KPIData> {
    try {
      // PRODUCCIÓN: Descomentar para usar API real
      // const response = await fetch(`${this.baseUrl}/sensors/summary`, {
      //   method: 'GET',
      //   headers: this.headers,
      // });
      // if (!response.ok) throw new Error('Error al obtener KPIs');
      // return await response.json();

      // MOCK: Datos de ejemplo
      console.log('[API] Obteniendo KPIs globales...');
      return this.getMockKPIs();
    } catch (error) {
      console.error('[API] Error al obtener KPIs:', error);
      throw error;
    }
  }

  // GET: Obtener alertas del sistema
  // Endpoint: GET /alerts?limit={limit}
  async getAlerts(limit: number = 10): Promise<Alert[]> {
    try {
      // PRODUCCIÓN: Descomentar para usar API real
      // const response = await fetch(`${this.baseUrl}/alerts?limit=${limit}`, {
      //   method: 'GET',
      //   headers: this.headers,
      // });
      // if (!response.ok) throw new Error('Error al obtener alertas');
      // return await response.json();

      // MOCK: Datos de ejemplo
      console.log('[API] Obteniendo alertas...');
      return this.getMockAlerts();
    } catch (error) {
      console.error('[API] Error al obtener alertas:', error);
      throw error;
    }
  }

  // PUT: Actualizar estado de alerta (marcar como leída)
  // Endpoint: PUT /alerts/{id}/acknowledge
  async acknowledgeAlert(alertId: string): Promise<void> {
    try {
      // PRODUCCIÓN: Descomentar para usar API real
      // const response = await fetch(`${this.baseUrl}/alerts/${alertId}/acknowledge`, {
      //   method: 'PUT',
      //   headers: this.headers,
      // });
      // if (!response.ok) throw new Error('Error al actualizar alerta');

      console.log(`[API] Alerta ${alertId} marcada como leída`);
    } catch (error) {
      console.error(`[API] Error al actualizar alerta ${alertId}:`, error);
      throw error;
    }
  }

  // ========== MÉTODOS MOCK (Remover en producción) ==========

  private getMockSensors() {
    return [
      { id: 's1', name: 'Sensor A1', x: 25, y: 30, z: 15, status: 'active' },
      { id: 's2', name: 'Sensor B2', x: 45, y: 50, z: 20, status: 'active' },
      { id: 's3', name: 'Sensor C3', x: 65, y: 35, z: 10, status: 'active' },
      { id: 's4', name: 'Sensor D4', x: 75, y: 65, z: 25, status: 'inactive' },
      { id: 's5', name: 'Sensor E5', x: 35, y: 70, z: 18, status: 'active' },
    ];
  }

  private getMockSensorData(sensorId: string): SensorData {
    const generateHistory = (baseValue: number, variance: number) => {
      return Array.from({ length: 10 }, (_, i) => ({
        time: `${i}m`,
        value: Number((baseValue + (Math.random() - 0.5) * variance).toFixed(1)),
      }));
    };

    const mockData: Record<string, SensorData> = {
      s1: {
        id: 's1',
        name: 'Sensor A1',
        location: 'Zona Norte - Edificio Principal',
        status: 'active',
        temperature: { current: 22.5, history: generateHistory(22.5, 2) },
        humidity: { current: 65, history: generateHistory(65, 10) },
      },
      s2: {
        id: 's2',
        name: 'Sensor B2',
        location: 'Zona Este - Almacén',
        status: 'active',
        temperature: { current: 24.8, history: generateHistory(24.8, 2) },
        humidity: { current: 58, history: generateHistory(58, 10) },
      },
      s3: {
        id: 's3',
        name: 'Sensor C3',
        location: 'Zona Sur - Oficinas',
        status: 'active',
        temperature: { current: 21.2, history: generateHistory(21.2, 2) },
        humidity: { current: 72, history: generateHistory(72, 10) },
      },
      s4: {
        id: 's4',
        name: 'Sensor D4',
        location: 'Zona Oeste - Planta Baja',
        status: 'inactive',
        temperature: { current: 0, history: [] },
        humidity: { current: 0, history: [] },
      },
      s5: {
        id: 's5',
        name: 'Sensor E5',
        location: 'Zona Centro - Laboratorio',
        status: 'active',
        temperature: { current: 23.1, history: generateHistory(23.1, 2) },
        humidity: { current: 61, history: generateHistory(61, 10) },
      },
    };

    return mockData[sensorId] || mockData.s1;
  }

  private getMockSensorHistory(sensorId: string) {
    return Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
      temperature: Number((20 + Math.random() * 5).toFixed(1)),
      humidity: Number((55 + Math.random() * 20).toFixed(1)),
    }));
  }

  private getMockKPIs(): KPIData {
    return {
      avgTemperature: 22.9,
      avgHumidity: 64,
      activeSensors: 4,
      inactiveSensors: 1,
      criticalAlerts: 2,
    };
  }

  private getMockAlerts(): Alert[] {
    return [
      {
        id: 'a1',
        sensorId: 's1',
        sensorName: 'Sensor A1',
        type: 'temperature',
        severity: 'high',
        message: 'Temperatura superior al umbral permitido',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        acknowledged: false,
      },
      {
        id: 'a2',
        sensorId: 's4',
        sensorName: 'Sensor D4',
        type: 'offline',
        severity: 'critical',
        message: 'Sensor desconectado',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        acknowledged: false,
      },
    ];
  }
}

// Exportar instancia única del servicio
export const apiService = new ApiService();
export type { SensorData, KPIData, Alert };
