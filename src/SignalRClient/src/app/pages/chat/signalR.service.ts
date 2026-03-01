import { Injectable, signal, computed } from '@angular/core';
import {
  HubConnectionBuilder,
  HubConnection,
  LogLevel,
  HubConnectionState,
} from '@microsoft/signalr';

export interface ChatMessage {
  user: string;
  message: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private readonly connection: HubConnection;

  // State signals
  private readonly _connectionState = signal<HubConnectionState>(HubConnectionState.Disconnected);
  private readonly _messages = signal<ChatMessage[]>([]);
  private readonly _error = signal<string | null>(null);

  // Public readonly signals
  public readonly connectionState = this._connectionState.asReadonly();
  public readonly messages = this._messages.asReadonly();
  public readonly error = this._error.asReadonly();

  // Computed state
  public readonly isConnected = computed(
    () => this._connectionState() === HubConnectionState.Connected,
  );
  public readonly isConnecting = computed(
    () => this._connectionState() === HubConnectionState.Connecting,
  );
  public readonly isReconnecting = computed(
    () => this._connectionState() === HubConnectionState.Reconnecting,
  );

  constructor() {
    this.connection = new HubConnectionBuilder()
      .withUrl('http://localhost:5080/chat')
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          if (retryContext.elapsedMilliseconds < 60000) {
            return Math.random() * 10000;
          }
          return null;
        },
      })
      .build();

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Receive message
    this.connection.on('ReceiveMessage', (user: string, message: string) => {
      this._messages.update((msgs) => [...msgs, { user, message, timestamp: new Date() }]);
    });

    // Connection closed
    this.connection.onclose((error) => {
      this._connectionState.set(HubConnectionState.Disconnected);
      if (error) {
        this._error.set(`Connection closed: ${error.message}`);
      }
    });

    // Reconnecting
    this.connection.onreconnecting((error) => {
      this._connectionState.set(HubConnectionState.Reconnecting);
      this._error.set(
        error ? `Connection lost, reconnecting: ${error.message}` : 'Reconnecting...',
      );
    });

    // Reconnected
    this.connection.onreconnected((connectionId) => {
      this._connectionState.set(HubConnectionState.Connected);
      this._error.set(null);
      console.log(`Reconnected, connectionId: ${connectionId}`);
    });
  }

  async start(): Promise<void> {
    if (this.connection.state !== HubConnectionState.Disconnected) {
      return;
    }

    this._connectionState.set(HubConnectionState.Connecting);
    this._error.set(null);

    try {
      await this.connection.start();
      this._connectionState.set(HubConnectionState.Connected);
      console.log('SignalR Connected.');
    } catch (err) {
      this._connectionState.set(HubConnectionState.Disconnected);
      this._error.set(`Connection failed: ${err}`);
      console.error('SignalR Connection Error:', err);
      // Retry after 5 seconds
      setTimeout(() => this.start(), 5000);
    }
  }

  async stop(): Promise<void> {
    await this.connection.stop();
  }

  async sendMessage(user: string, message: string): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('Not connected to server');
    }
    await this.connection.invoke('SendMessage', user, message);
  }

  clearMessages(): void {
    this._messages.set([]);
  }
}
