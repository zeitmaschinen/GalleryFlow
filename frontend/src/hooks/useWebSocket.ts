import { useEffect, useCallback, useRef, useState } from 'react';
import { logger } from '../services/logger';

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

      ws.current.onopen = () => {
        setIsConnected(true);
        attempts.current = 0;
        logger.info('WebSocket connected');
      };

      ws.current.onclose = () => {
        setIsConnected(false);
        if (attempts.current < reconnectAttempts) {
          attempts.current++;
          reconnectTimer.current = setTimeout(connect, reconnectInterval);
        }
        logger.warn(`WebSocket closed, attempt ${attempts.current}/${reconnectAttempts}`);
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage?.(data);
        } catch (error) {
          logger.error('Failed to parse WebSocket message', error as Error);
        }
      };

      ws.current.onerror = handleError;
    } catch (error) {
      logger.error('Failed to create WebSocket connection', error as Error);
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