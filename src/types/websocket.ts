export interface WebSocketMessage {
  type: 'sensor_update';
  sensorId: string;
  data: {
    temperature?: number;
    humidity?: number;
  };
  timestamp: string;
}

export interface SensorData {
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