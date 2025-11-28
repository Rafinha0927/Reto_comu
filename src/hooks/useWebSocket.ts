import { useState, useEffect, useCallback, useRef } from 'react';

import { WebSocketMessage } from '../types/websocket';

interface UseWebSocketOptions {
  url: string;
  autoConnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useWebSocket(options: UseWebSocketOptions) {
  const {
    url,
    autoConnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    try {
      // DINÁMICO: Reemplazar con la URL real del WebSocket
      // Ejemplo: ws://api.iotserver.com/sensors o wss://your-api-gateway.execute-api.region.amazonaws.com/production
      
      // Para desarrollo, usamos un mock que simula conexión
      console.log(`[WebSocket] Intentando conectar a: ${url}`);
      
      // Simulación de conexión exitosa (remover en producción)
      setIsConnected(true);
      setError(null);
      reconnectAttemptsRef.current = 0;
      
      /* 
      // PRODUCCIÓN: Descomentar este código para conexión real
      const ws = new WebSocket(url);
      
      ws.onopen = () => {
        console.log('[WebSocket] Conectado');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('[WebSocket] Mensaje recibido:', message);
          setLastMessage(message);
        } catch (err) {
          console.error('[WebSocket] Error al parsear mensaje:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('[WebSocket] Error:', event);
        setError('Error de conexión WebSocket');
      };

      ws.onclose = () => {
        console.log('[WebSocket] Desconectado');
        setIsConnected(false);
        
        // Intentar reconectar
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          console.log(`[WebSocket] Intentando reconectar (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else {
          setError('Máximo número de intentos de reconexión alcanzado');
        }
      };

      wsRef.current = ws;
      */
      
    } catch (err) {
      console.error('[WebSocket] Error al conectar:', err);
      setError('Error al iniciar WebSocket');
      setIsConnected(false);
    }
  }, [url, reconnectInterval, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('[WebSocket] No se puede enviar mensaje, WebSocket no conectado');
    }
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    error,
    connect,
    disconnect,
    sendMessage,
  };
}
