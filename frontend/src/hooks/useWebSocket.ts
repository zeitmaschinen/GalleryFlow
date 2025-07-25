import { useEffect, useCallback, useRef, useState } from 'react';
import { logger } from '../services/logger';

declare global {
  interface Window {
    _lastWsTime?: number;
  }
}

interface WebSocketOptions {
  url: string;
  onMessage?: (data: unknown) => void;
  onError?: (error: Error) => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

export const useWebSocket = ({
  url,
  onMessage,
  onError,
  reconnectAttempts = 5,
  reconnectInterval = 2000
}: WebSocketOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const attempts = useRef<number>(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleError = useCallback((event: Event) => {
    const error = new Error(`WebSocket error: ${event.type}`);
    onError?.(error);
  }, [onError]);

  const connect = useCallback(() => {
    try {
      ws.current = new WebSocket(url);
      console.debug('[WebSocket] Connecting to', url);
      ws.current.onopen = () => {
        setIsConnected(true);
        attempts.current = 0;
        console.debug('[WebSocket] Connected to', url);
        logger.info('WebSocket connected');
        // Send a keepalive message to backend on connect
        ws.current?.send(JSON.stringify({ type: 'keepalive', timestamp: Date.now() }));
      };

      ws.current.onclose = () => {
        setIsConnected(false);
        console.debug('[WebSocket] Disconnected from', url);
        if (attempts.current < reconnectAttempts) {
          attempts.current++;
          reconnectTimer.current = setTimeout(connect, reconnectInterval);
        }
        logger.warn(`WebSocket closed, attempt ${attempts.current}/${reconnectAttempts}`);
      };

      ws.current.onerror = (event) => {
        console.error('[WebSocket] Error:', event);
        handleError(event);
      };

      ws.current.onmessage = (event) => {
        console.warn('[WS RAW]', event.data); // TEMP: Log all raw incoming WS messages
        // Always log the raw message, very visibly
        console.warn('[WebSocket][ALWAYS] Message received:', event.data);
        try {

          const data = JSON.parse(event.data);
          // Print timestamp and delta since last message for diagnostics
          const now = Date.now();
          if (!window._lastWsTime) window._lastWsTime = now;
          const delta = now - window._lastWsTime;
          window._lastWsTime = now;
          console.debug(`[WebSocket] ${new Date(now).toISOString()} Δ${delta}ms Message received:`, data);
          onMessage?.(data);
        } catch (error) {
          logger.error('Failed to parse WebSocket message', error as Error);
        }
      };
    } catch (error) {
      logger.error('Failed to create WebSocket connection', error as Error);
      setIsConnected(false);
    }
  }, [url, onMessage, reconnectAttempts, reconnectInterval, handleError]);

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
    }
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    setIsConnected(false);
    attempts.current = reconnectAttempts; // Prevent auto-reconnect
  }, [reconnectAttempts]);

  const sendMessage = useCallback((data: unknown) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    } else {
      logger.warn('WebSocket is not connected');
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [url, onMessage, reconnectAttempts, reconnectInterval, handleError, connect, disconnect]);

  return {
    isConnected,
    sendMessage,
    connect,
    disconnect
  };
};