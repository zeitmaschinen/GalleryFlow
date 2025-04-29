import { config } from '../config';
import { logger } from './logger';
import type { ScanProgress } from '../types/index';

interface WebSocketError {
  lineno?: number;
  colno?: number;
  eventType: string;
}

type MessageHandler = (data: unknown) => void;
type ErrorHandler = (error: Event) => void;

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 1000;
  private messageHandlers: Set<MessageHandler> = new Set();
  private errorHandlers: Set<ErrorHandler> = new Set();
  private connectionFailed = false;

  constructor(private url: string) {}

  connect(): void {
    try {
      console.log(`[WebSocket] Attempting to connect to ${this.url}`);
      this.ws = new WebSocket(this.url);
      this.setupEventListeners();
    } catch (error) {
      console.error('[WebSocket] Error creating connection:', error);
      this.connectionFailed = true;
      this.handleReconnect();
    }
  }

  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      logger.info('WebSocket connected');
      this.reconnectAttempts = 0;
      this.connectionFailed = false;
      
      // Send a keepalive message to backend on connect
      try {
        this.ws?.send(JSON.stringify({ type: 'keepalive', timestamp: Date.now() }));
      } catch (error) {
        console.error('[WebSocket] Error sending keepalive:', error);
      }
    };

    this.ws.onclose = (event) => {
      logger.warn(`WebSocket closed with code ${event.code}`);
      
      // Check if the connection was closed abnormally
      if (event.code !== 1000 && event.code !== 1001) {
        this.connectionFailed = true;
      }
      
      this.handleReconnect();
    };

    this.ws.onerror = (event) => {
      // Provide a more useful error log
      const errorContext: WebSocketError = {
        eventType: event instanceof ErrorEvent ? event.type : 'unknown'
      };
      
      if (event instanceof ErrorEvent) {
        if (event.lineno) errorContext.lineno = event.lineno;
        if (event.colno) errorContext.colno = event.colno;
        
        logger.error('WebSocket error', new Error(event.message), errorContext);
      } else {
        logger.error('WebSocket error', new Error('Unknown WebSocket error'), errorContext);
      }
      
      this.connectionFailed = true;
      this.errorHandlers.forEach(handler => handler(event));
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.messageHandlers.forEach(handler => handler(data));
      } catch (error) {
        logger.error('Error parsing WebSocket message', error instanceof Error ? error : new Error(String(error)));
      }
    };
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        logger.info(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, this.reconnectTimeout * this.reconnectAttempts);
    } else {
      logger.error('Max reconnection attempts reached', new Error('Max reconnection attempts reached'));
      // Notify all error handlers that max reconnection attempts have been reached
      const maxRetriesError = new ErrorEvent('error', {
        message: 'Max reconnection attempts reached',
        error: new Error('Max reconnection attempts reached')
      });
      this.errorHandlers.forEach(handler => handler(maxRetriesError));
    }
  }

  addMessageHandler(handler: MessageHandler): void {
    this.messageHandlers.add(handler);
  }

  removeMessageHandler(handler: MessageHandler): void {
    this.messageHandlers.delete(handler);
  }

  addErrorHandler(handler: ErrorHandler): void {
    this.errorHandlers.add(handler);
    
    // If connection already failed, immediately notify the new handler
    if (this.connectionFailed && this.reconnectAttempts >= this.maxReconnectAttempts) {
      const maxRetriesError = new ErrorEvent('error', {
        message: 'Max reconnection attempts reached',
        error: new Error('Max reconnection attempts reached')
      });
      handler(maxRetriesError);
    }
  }

  removeErrorHandler(handler: ErrorHandler): void {
    this.errorHandlers.delete(handler);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  hasConnectionFailed(): boolean {
    return this.connectionFailed && this.reconnectAttempts >= this.maxReconnectAttempts;
  }
}

// Helper function to create a WebSocketService for a specific folder
export function createScanProgressWS(folderId: number) {
  return new WebSocketService(`${config.api.wsUrl}/ws/scan-progress/${folderId}`);
}

// --- Singleton WebSocketService per folderId ---
const scanProgressWebSockets = new Map<number, { ws: WebSocketService, refCount: number }>();

export function subscribeScanProgress(
  folderId: number,
  onProgress: (progress: ScanProgress) => void,
  onError?: ErrorHandler
): () => void {
  let entry = scanProgressWebSockets.get(folderId);
  if (!entry) {
    const wsService = createScanProgressWS(folderId);
    entry = { ws: wsService, refCount: 0 };
    scanProgressWebSockets.set(folderId, entry);
  }
  entry.refCount++;
  entry.ws.addMessageHandler(onProgress as MessageHandler);
  if (onError) {
    entry.ws.addErrorHandler(onError);
  }
  if (entry.refCount === 1) {
    entry.ws.connect();
  }

  // Cleanup function
  return () => {
    entry!.refCount--;
    entry!.ws.removeMessageHandler(onProgress as MessageHandler);
    if (onError) {
      entry!.ws.removeErrorHandler(onError);
    }
    if (entry!.refCount <= 0) {
      entry!.ws.disconnect();
      scanProgressWebSockets.delete(folderId);
    }
  };
}