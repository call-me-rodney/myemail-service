// client/src/services/socket.ts
import { io, Socket } from 'socket.io-client';

const BACKEND_URL = 'http://localhost:3000'; // Assuming your NestJS backend runs on port 3000

class SocketService {
  public socket: Socket | null = null;

  public connect(token: string): void {
    if (this.socket && this.socket.connected) {
      console.log('Socket already connected.');
      return;
    }

    this.socket = io(BACKEND_URL, {
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server.');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server.');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('WebSocket disconnected.');
    }
  }

  public on<T>(event: string, callback: (data: T) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  public off<T>(event: string, callback?: (data: T) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  public emit<T>(event: string, data: T): void {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}

const socketService = new SocketService();
export default socketService;
