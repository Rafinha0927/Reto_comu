# 🌐 Dashboard IoT 3D - Monitoreo en Tiempo Real

Dashboard profesional para monitoreo de sensores IoT con visualización 3D mediante Potree, integración con AWS (DynamoDB, API Gateway, Lambda) y actualizaciones en tiempo real vía WebSocket.

---

## ✨ Características Principales

### 🎨 Interfaz de Usuario
- ✅ **Modo Oscuro/Claro** - Toggle para cambiar entre temas
- ✅ **Diseño Responsivo** - Optimizado para desktop y tablet
- ✅ **Navegación por Secciones** - Vista 3D, Sensores, Histórico, Alertas, Configuración
- ✅ **Animaciones Fluidas** - Transiciones suaves y experiencia moderna

### 📊 Visualización de Datos
- ✅ **KPIs Globales** - Temperatura promedio, humedad, sensores activos, alertas
- ✅ **Gráficos en Tiempo Real** - Líneas de tiempo para temperatura y humedad
- ✅ **Vista 3D Interactiva** - Preparada para integración con Potree
- ✅ **Histórico Detallado** - Consulta de datos almacenados en DynamoDB

### 🔌 Integraciones
- ✅ **WebSocket** - Datos en tiempo real desde sensores
- ✅ **API REST** - Endpoints para histórico, KPIs y configuración
- ✅ **AWS DynamoDB** - Almacenamiento de datos históricos
- ✅ **Potree Ready** - Visualización de nubes de puntos 3D

### 🚨 Gestión de Alertas
- ✅ **Panel de Alertas** - Visualización de alertas críticas
- ✅ **Notificaciones** - Toast notifications para eventos importantes
- ✅ **Clasificación por Severidad** - Low, Medium, High, Critical

---

## 🏗️ Arquitectura

```
src/
├── components/           # Componentes React
│   ├── Header.tsx       # Header con estado de conexión y modo oscuro
│   ├── Sidebar.tsx      # Navegación lateral
│   ├── ThreeDView.tsx   # Vista 3D con Potree
│   ├── SensorPanel.tsx  # Panel de detalles del sensor
│   ├── KPICards.tsx     # Tarjetas de KPIs
│   ├── AlertsPanel.tsx  # Panel de alertas
│   ├── HistoryView.tsx  # Vista de histórico desde DynamoDB
│   ├── SensorsListView.tsx # Lista de todos los sensores
│   └── RealtimeChart.tsx   # Gráfico de líneas en tiempo real
│
├── contexts/            # Context API de React
│   └── DarkModeContext.tsx # Gestión de modo oscuro
│
├── hooks/               # Custom React Hooks
│   └── useWebSocket.ts  # Hook para conexión WebSocket
│
├── services/            # Servicios de integración
│   └── apiService.ts    # Cliente para API REST de AWS
│
├── App.tsx             # Componente principal
└── styles/
    └── globals.css     # Estilos globales con soporte dark mode
```

---

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 18+ 
- npm o yarn
- Cuenta de AWS (para producción)

### Instalación

1. **Clonar el proyecto:**
   ```bash
   git clone <repository-url>
   cd iot-dashboard
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Ejecutar en desarrollo:**
   ```bash
   npm start
   ```

4. **Abrir en el navegador:**
   ```
   http://localhost:3000
   ```

---

## ⚙️ Configuración

### 1. Configurar Endpoints de API

Editar `/services/apiService.ts`:

```typescript
const API_BASE_URL = 'https://your-api-gateway.execute-api.region.amazonaws.com/production';
```

### 2. Configurar WebSocket

Editar `/App.tsx`:

```typescript
const WEBSOCKET_URL = "wss://your-websocket-url.execute-api.region.amazonaws.com/production";
```

### 3. Modo Desarrollo vs Producción

El dashboard incluye **datos mock** para desarrollo. Para usar APIs reales:

1. Ir a `/services/apiService.ts`
2. Descomentar las llamadas a `fetch()`
3. Comentar los métodos `getMock*()`

---

## 🔗 Integración con AWS

### Paso 1: Crear API Gateway

1. Ir a AWS Console → API Gateway
2. Crear nueva REST API
3. Configurar endpoints (ver `INTEGRATION_GUIDE.md`)

### Paso 2: Crear Funciones Lambda

```python
# ejemplo: lambda_get_sensors.py
import boto3
import json

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('SensorHistory')

def lambda_handler(event, context):
    response = table.scan()
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(response['Items'])
    }
```

### Paso 3: Crear Tabla en DynamoDB

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

### Paso 4: Configurar WebSocket

1. API Gateway → Create WebSocket API
2. Routes: `$connect`, `$disconnect`, `$default`
3. Integración con Lambda para broadcast

---

## 🎯 Uso del Dashboard

### Sección: Vista 3D
- **Funcionalidad:** Visualización de sensores en espacio 3D
- **Interacción:** Click en un sensor para ver detalles
- **Integración:** Preparado para Potree (ver `INTEGRATION_GUIDE.md`)

### Sección: Sensores
- **Funcionalidad:** Lista completa de sensores
- **Búsqueda:** Filtro por nombre o ubicación
- **Acciones:** Ver detalles de cada sensor

### Sección: Histórico
- **Funcionalidad:** Gráficos históricos desde DynamoDB
- **Filtros:** Última hora, 24h, 7 días, 30 días
- **Exportación:** Descargar datos en CSV

### Sección: Alertas
- **Funcionalidad:** Panel de alertas del sistema
- **Acciones:** Marcar alertas como leídas
- **Actualización:** Automática cada 30 segundos

### Sección: Configuración
- **Funcionalidad:** Información de integración
- **Estado:** Estado de conexión WebSocket
- **Documentación:** Links a guías de integración

---

## 📊 Estructura de Datos

### Sensor
```typescript
{
  id: string;
  name: string;
  location: string;
  x: number;    // Coordenada X en espacio 3D
  y: number;    // Coordenada Y en espacio 3D
  z?: number;   // Coordenada Z (opcional)
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
```

### Alerta
```typescript
{
  id: string;
  sensorId: string;
  sensorName: string;
  type: 'temperature' | 'humidity' | 'offline';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}
```

---

## 🎨 Personalización

### Cambiar Colores

Editar `/styles/globals.css`:

```css
:root {
  --primary: #3b82f6;  /* Azul principal */
  --success: #10b981;  /* Verde para sensores activos */
  --warning: #f59e0b;  /* Naranja para alertas */
  --danger: #ef4444;   /* Rojo para errores */
}
```

### Agregar Nuevos KPIs

Editar `/components/KPICards.tsx` y agregar al array `kpis`.

### Personalizar Gráficos

Los gráficos usan **Recharts**. Editar `/components/RealtimeChart.tsx`.

---

## 🧪 Testing

### Datos Mock

El dashboard incluye datos de prueba. Para cambiar valores:

Editar en `/App.tsx`:

```typescript
const mockKPIData = {
  avgTemperature: 22.9,
  avgHumidity: 64,
  activeSensors: 4,
  inactiveSensors: 1,
  criticalAlerts: 2,
};
```

### Simular WebSocket

En desarrollo, el WebSocket está en modo simulación. Para probar con servidor real:

```bash
# Instalar wscat
npm install -g wscat

# Conectar
wscat -c ws://localhost:8080/sensors

# Enviar mensaje
{"type":"sensor_update","sensorId":"s1","data":{"temperature":25.5,"humidity":70}}
```

---

## 📦 Build para Producción

```bash
# Crear build optimizado
npm run build

# El output estará en la carpeta build/
```

### Deploy a AWS S3

```bash
# Subir archivos
aws s3 sync build/ s3://your-bucket-name/ --delete

# Configurar bucket como sitio web
aws s3 website s3://your-bucket-name/ --index-document index.html
```

### Deploy con CloudFront (CDN)

```bash
# Crear distribución de CloudFront
aws cloudfront create-distribution \
  --origin-domain-name your-bucket.s3.amazonaws.com

# Invalidar caché después de cada deploy
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

---

## 📚 Documentación Adicional

- **Guía de Integración Completa:** Ver `INTEGRATION_GUIDE.md`
- **API Reference:** Endpoints detallados en `INTEGRATION_GUIDE.md`
- **Potree Setup:** Instrucciones de Potree en `INTEGRATION_GUIDE.md`

---

## 🐛 Troubleshooting

### WebSocket no conecta
- Verificar URL en `/App.tsx`
- Revisar CORS en API Gateway
- Comprobar logs en CloudWatch

### API retorna 403
- Verificar API Key en headers
- Comprobar permisos de IAM
- Revisar configuración de API Gateway

### Modo oscuro no funciona
- Limpiar localStorage: `localStorage.clear()`
- Verificar que el contexto esté en `App.tsx`

---

## 🛠️ Stack Tecnológico

- **Frontend:** React 18 + TypeScript
- **Styling:** Tailwind CSS v4
- **Charts:** Recharts
- **UI Components:** Shadcn/ui
- **Icons:** Lucide React
- **State Management:** React Context API
- **Backend:** AWS Lambda + API Gateway
- **Database:** AWS DynamoDB
- **Real-time:** WebSocket (AWS API Gateway WebSocket)
- **3D Visualization:** Potree (ready for integration)

---

## 📄 Licencia

Este proyecto es un template para dashboards IoT. Úsalo libremente en tus proyectos.

---

## 👨‍💻 Contribuciones

Para contribuir:

1. Fork el proyecto
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

---

## 🎯 Próximos Pasos Recomendados

1. ✅ **Conectar con API real** - Reemplazar datos mock
2. ✅ **Integrar Potree** - Visualización 3D completa
3. ✅ **Configurar WebSocket** - Datos en tiempo real
4. ✅ **Deploy a AWS** - Producción en S3 + CloudFront
5. ✅ **Agregar autenticación** - AWS Cognito o Auth0
6. ✅ **Métricas y monitoreo** - CloudWatch Dashboards

---

**Dashboard creado con ❤️ para sistemas IoT profesionales**

*Última actualización: 7 de noviembre de 2024*
