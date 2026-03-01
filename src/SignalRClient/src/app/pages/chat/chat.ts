import { Component, inject, signal } from '@angular/core';
import { SignalRService } from './signalR.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'chat',
  imports: [FormsModule],
  template: `
    <div class="container mx-auto max-w-2xl p-4">
      <h1 class="text-2xl font-bold mb-4">SignalR Chat</h1>

      <!-- Connection status -->
      <div class="mb-4 flex items-center gap-2">
        <span
          class="w-3 h-3 rounded-full"
          [class.bg-green-500]="signalR.isConnected()"
          [class.bg-yellow-500]="signalR.isConnecting() || signalR.isReconnecting()"
          [class.bg-red-500]="
            !signalR.isConnected() && !signalR.isConnecting() && !signalR.isReconnecting()
          "
        ></span>
        <span>
          @if (signalR.isConnected()) {
            Connected
          } @else if (signalR.isConnecting()) {
            Connecting...
          } @else if (signalR.isReconnecting()) {
            Reconnecting...
          } @else {
            Disconnected
          }
        </span>
      </div>

      <!-- Error message -->
      @if (signalR.error()) {
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
          {{ signalR.error() }}
        </div>
      }

      <!-- Message list -->
      <div class="border rounded-lg h-80 overflow-y-auto mb-4 p-4 bg-gray-50">
        @if (signalR.messages().length === 0) {
          <p class="text-gray-500 text-center">No messages yet</p>
        } @else {
          <ul class="space-y-2">
            @for (msg of signalR.messages(); track msg.timestamp) {
              <li class="p-2 bg-white rounded shadow-sm">
                <span class="font-semibold text-blue-600">{{ msg.user }}:</span>
                <span class="ml-2">{{ msg.message }}</span>
                <span class="text-xs text-gray-400 ml-2">
                  {{ msg.timestamp.toLocaleTimeString() }}
                </span>
              </li>
            }
          </ul>
        }
      </div>

      <!-- Send message form -->
      <form (ngSubmit)="sendMessage()" class="flex gap-2">
        <input
          type="text"
          [(ngModel)]="userName"
          name="userName"
          placeholder="Username"
          class="border rounded px-3 py-2 w-32"
          [disabled]="!signalR.isConnected()"
          required
        />
        <input
          type="text"
          [(ngModel)]="messageText"
          name="messageText"
          placeholder="Type a message..."
          class="border rounded px-3 py-2 flex-1"
          [disabled]="!signalR.isConnected()"
          required
        />
        <button
          type="submit"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          [disabled]="!signalR.isConnected() || !userName() || !messageText()"
        >
          Send
        </button>
      </form>
    </div>
  `,
  styles: ``,
})
export class Chat {
  protected readonly signalR = inject(SignalRService);

  protected readonly userName = signal('');
  protected readonly messageText = signal('');

  async ngOnInit(): Promise<void> {
    await this.signalR.start();
  }

  async ngOnDestroy(): Promise<void> {
    await this.signalR.stop();
  }

  async sendMessage(): Promise<void> {
    const user = this.userName();
    const message = this.messageText();

    if (!user || !message) return;

    try {
      await this.signalR.sendMessage(user, message);
      this.messageText.set(''); // Clear message input
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  }
}
