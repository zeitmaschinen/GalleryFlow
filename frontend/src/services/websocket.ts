import { config } from '../config';
import { logger } from './logger';
import type { ScanProgress } from '../types/index';

type MessageHandler = (data: unknown) => void;
type ErrorHandler = (error: Event) => void;

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 1000;
  private messageHandlers: Set<MessageHandler> = new Set();
  private errorHandlers: Set<ErrorHandler> = new Set();

  constructor(private url: string) {}

  connect(): void {
    try {
      this.ws = new WebSocket(this.url);
      this.setupEventListeners();
    } catch {
      this.handleReconnect();
    }
  }

  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      logger.info('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onclose = () => {
      logger.warn('WebSocket connection closed');
      this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      logger.error('WebSocket error', error instanceof Error ? error : new Error(String(error)));
      this.errorHandlers.forEach(handler => handler(error));
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
}

// Helper function to create a WebSocketService for a specific folder
export function createScanProgressWS(folderId: number) {
  return new WebSocketService(`${config.api.wsUrl}/ws/scan-progress/${folderId}`);
}

// Helper function to subscribe to scan progress for a specific folder
export function subscribeScanProgress(
  folderId: number,
  onProgress: (progress: ScanProgress) => void,
  onError?: ErrorHandler
): () => void {
  const wsService = createScanProgressWS(folderId);
  wsService.addMessageHandler(onProgress as MessageHandler);
  if (onError) {
    wsService.addErrorHandler(onError);
  }
  wsService.connect();
  // Cleanup function
  return () => {
    wsService.removeMessageHandler(onProgress as MessageHandler);
    if (onError) {
      wsService.removeErrorHandler(onError);
    }
    wsService.disconnect();
  };
}