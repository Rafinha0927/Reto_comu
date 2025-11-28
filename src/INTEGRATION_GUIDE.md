# 📘 Guía de Integración - Dashboard IoT 3D

Este documento detalla cómo conectar el dashboard con APIs REST, WebSocket, AWS DynamoDB y Potree para visualización 3D.

---

## 🎯 Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    Dashboard Frontend                       │
│  (React + TypeScript + Tailwind CSS + Recharts)            │
└────────┬──────────────────────────────┬────────────────────┘
         │                              │
         │ WebSocket                    │ API REST
         │ (Tiempo Real)                │ (Histórico + KPIs)
         │                              │
    ┌────▼────┐                    ┌────▼─────────────────┐
    │ WebSocket│                    │  AWS API Gateway     │
    │  Server  │                    │  + Lambda Functions  │
    └──────────┘                    └────┬─────────────────┘
                                         │
                                    ┌────▼──────┐
                                    │  DynamoDB │
                                    │ (Histórico)│
                                    └───────────┘
```

---

## 🔌 1. Integración con WebSocket

### Configuración

**Archivo:** `/hooks/useWebSocket.ts`

```typescript
const WEBSOCKET_URL = "wss://your-api-gateway.execute-api.region.amazonaws.com/production";
```

### Estructura de Mensajes

El dashboard espera mensajes WebSocket en el siguiente formato:

```json
{
  "type": "sensor_update",
  "sensorId": "s1",
  "data": {
    "temperature": 23.5,
    "humidity": 67
  },
  "timestamp": "2024-11-07T10:30:00Z"
}
```

### Implementación en Backend

**Ejemplo con AWS API Gateway WebSocket:**

1. Crear API WebSocket en AWS Console
2. Configurar routes: `$connect`, `$disconnect`, `$default`
3. Lambda para broadcast de datos:

```python
import boto3
import json

def lambda_handler(event, context):
    # Obtener datos del sensor
    sensor_data = {
        "type": "sensor_update",
        "sensorId": "s1",
        "data": {
            "temperature": 23.5,
            "humidity": 67
        },
        "timestamp": "2024-11-07T10:30:00Z"
    }
    
    # Enviar a todos los clientes conectados
    apigw_management = boto3.client('apigatewaymanagementapi')
    apigw_management.post_to_connection(
        ConnectionId=connection_id,
        Data=json.dumps(sensor_data).encode('utf-8')
    )
```

### Uso en Frontend

El hook `useWebSocket` se utiliza automáticamente en `App.tsx`:

```typescript
const { isConnected, lastMessage } = useWebSocket({
  url: WEBSOCKET_URL,
  autoConnect: true,
});
```

Los mensajes recibidos actualizan automáticamente los gráficos en tiempo real.

---

## 🌐 2. Integración con API REST (AWS)

### Endpoints Requeridos

**Archivo de configuración:** `/services/apiService.ts`

```typescript
const API_BASE_URL = "https://your-api-gateway.execute-api.region.amazonaws.com/production";
```

### Endpoints Necesarios

#### 2.1. Obtener Lista de Sensores
```
GET /sensors
```

**Respuesta:**
```json
[
  {
    "id": "s1",
    "name": "Sensor A1",
    "location": "Zona Norte",
    "x": 25,
    "y": 30,
    "z": 15,
    "status": "active"
  }
]
```

#### 2.2. Obtener Datos de un Sensor
```
GET /sensors/{id}
```

**Respuesta:**
```json
{
  "id": "s1",
  "name": "Sensor A1",
  "location": "Zona Norte - Edificio Principal",
  "status": "active",
  "temperature": {
    "current": 22.5,
    "history": [
      { "time": "0m", "value": 22.1 },
      { "time": "1m", "value": 22.3 }
    ]
  },
  "humidity": {
    "current": 65,
    "history": [
      { "time": "0m", "value": 63 },
      { "time": "1m", "value": 64 }
    ]
  }
}
```

#### 2.3. Obtener Histórico desde DynamoDB
```
GET /sensors/{id}/history?startDate={start}&endDate={end}
```

**Respuesta:**
```json
[
  {
    "timestamp": "2024-11-07T10:00:00Z",
    "temperature": 22.5,
    "humidity": 65
  }
]
```

#### 2.4. Obtener KPIs Globales
```
GET /sensors/summary
```

**Respuesta:**
```json
{
  "avgTemperature": 22.9,
  "avgHumidity": 64,
  "activeSensors": 4,
  "inactiveSensors": 1,
  "criticalAlerts": 2
}
```

#### 2.5. Obtener Alertas
```
GET /alerts?limit=10
```

**Respuesta:**
```json
[
  {
    "id": "a1",
    "sensorId": "s1",
    "sensorName": "Sensor A1",
    "type": "temperature",
    "severity": "high",
    "message": "Temperatura superior al umbral permitido",
    "timestamp": "2024-11-07T10:30:00Z",
    "acknowledged": false
  }
]
```

#### 2.6. Marcar Alerta como Leída
```
PUT /alerts/{id}/acknowledge
```

### Implementación en Backend (AWS Lambda + DynamoDB)

**Ejemplo: Lambda para obtener histórico**

```python
import boto3
import json
from datetime import datetime
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('SensorHistory')

def lambda_handler(event, context):
    sensor_id = event['pathParameters']['id']
    start_date = event['queryStringParameters'].get('startDate')
    end_date = event['queryStringParameters'].get('endDate')
    
    response = table.query(
        KeyConditionExpression=Key('sensorId').eq(sensor_id) & 
                              Key('timestamp').between(start_date, end_date)
    )
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(response['Items'])
    }
```

### Estructura de DynamoDB

**Tabla: SensorHistory**

```
Partition Key: sensorId (String)
Sort Key: timestamp (String)

Attributes:
- temperature (Number)
- humidity (Number)
- status (String)
```

**Índice secundario:** GSI por `timestamp` para consultas globales.

---

## 🗄️ 3. Configuración de DynamoDB

### Crear Tabla

```bash
aws dynamodb create-table \
  --table-name SensorHistory \
  --attribute-definitions \
    AttributeName=sensorId,AttributeType=S \
    AttributeName=timestamp,AttributeType=S \
  --key-schema \
    AttributeName=sensorId,KeyType=HASH \
    AttributeName=timestamp,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST
```

### Ejemplo de Inserción de Datos

```python
import boto3
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('SensorHistory')

table.put_item(
    Item={
        'sensorId': 's1',
        'timestamp': datetime.utcnow().isoformat(),
        'temperature': 22.5,
        'humidity': 65,
        'status': 'active'
    }
)
```

---

## 🎨 4. Integración con Potree (Nube de Puntos 3D)

### Instalación de Potree

1. **Descargar Potree:**
   ```bash
   git clone https://github.com/potree/potree.git
   ```

2. **Copiar archivos a tu proyecto:**
   ```bash
   cp -r potree/build/potree public/potree
   ```

3. **Agregar scripts en `public/index.html`:**
   ```html
   <script src="/potree/potree.js"></script>
   <link rel="stylesheet" href="/potree/potree.css">
   ```

### Preparar Nube de Puntos

Usar `PotreeConverter` para convertir archivos LAS/LAZ a formato Potree:

```bash
./PotreeConverter input.las -o output_potree -p index
```

### Subir a AWS S3

```bash
aws s3 sync output_potree s3://your-bucket/potree-data/ --acl public-read
```

### Configuración en el Dashboard

**Archivo:** `/components/ThreeDView.tsx`

Descomentar el código de integración en el `useEffect`:

```typescript
if (potreeContainerRef.current && window.Potree) {
  const viewer = new window.Potree.Viewer(potreeContainerRef.current);
  
  // URL de tu nube de puntos en S3
  const cloudUrl = "https://your-bucket.s3.amazonaws.com/potree-data/cloud.js";
  
  window.Potree.loadPointCloud(cloudUrl, "pointcloud", (e) => {
    viewer.scene.addPointCloud(e.pointcloud);
    viewer.fitToScreen();
    
    // Agregar marcadores para sensores
    sensors.forEach((sensor) => {
      const position = new THREE.Vector3(sensor.x, sensor.y, sensor.z || 0);
      const marker = viewer.scene.addMarker(position, {
        label: sensor.name,
        color: sensor.status === 'active' ? 0x00ff00 : 0x888888
      });
      
      marker.addEventListener('click', () => {
        onSensorClick(sensor.id);
      });
    });
  });
}
```

---

## 🔐 5. Seguridad y Autenticación

### API Key en AWS API Gateway

```typescript
// En apiService.ts
this.headers = {
  'Content-Type': 'application/json',
  'x-api-key': 'YOUR_API_KEY_HERE',
};
```

### JWT Authentication (Opcional)

```typescript
const token = localStorage.getItem('authToken');
this.headers = {
  'Authorization': `Bearer ${token}`,
};
```

---

## 🚀 6. Deploy en AWS

### Frontend (S3 + CloudFront)

```bash
# Build
npm run build

# Deploy a S3
aws s3 sync build/ s3://your-bucket/ --delete

# Invalidar caché de CloudFront
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### Backend (Lambda + API Gateway)

Usar AWS SAM o Serverless Framework:

```yaml
# serverless.yml
service: iot-dashboard-api

provider:
  name: aws
  runtime: python3.9

functions:
  getSensors:
    handler: handlers/sensors.get_all
    events:
      - http:
          path: sensors
          method: get
          cors: true

  getSensorHistory:
    handler: handlers/history.get
    events:
      - http:
          path: sensors/{id}/history
          method: get
          cors: true
```

Deploy:
```bash
serverless deploy --stage production
```

---

## 📊 7. Monitoreo y Logs

### CloudWatch Logs

Todos los logs de Lambda se envían automáticamente a CloudWatch.

### Métricas Personalizadas

```python
import boto3

cloudwatch = boto3.client('cloudwatch')

cloudwatch.put_metric_data(
    Namespace='IoTDashboard',
    MetricData=[
        {
            'MetricName': 'SensorReadings',
            'Value': 1,
            'Unit': 'Count'
        }
    ]
)
```

---

## 🧪 8. Testing

### Mock Data

El dashboard incluye datos mock que simulan respuestas de la API. Para cambiar a producción:

1. Descomentar las llamadas reales en `/services/apiService.ts`
2. Comentar los retornos mock
3. Configurar las URLs correctas

### Variables de Entorno

Crear `.env`:

```env
REACT_APP_API_URL=https://your-api.execute-api.region.amazonaws.com/production
REACT_APP_WS_URL=wss://your-websocket.execute-api.region.amazonaws.com/production
REACT_APP_API_KEY=your-api-key-here
```

---

## 📞 Soporte

Para dudas o problemas, revisa:

- Logs de CloudWatch
- Consola de desarrollador del navegador
- Logs de la aplicación (busca `[WebSocket]`, `[API]`, `[UI]`)

---

**Última actualización:** 7 de noviembre de 2024
