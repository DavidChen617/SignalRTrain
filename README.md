# SignalR Train

ASP.NET Core SignalR + Angular real-time communication project.

## Project Structure

```
src/
├── SignalRServer/          # ASP.NET Core Backend
│   ├── Hubs/
│   │   ├── ChatHub.cs      # SignalR Hub
│   │   └── IChatClient.cs  # Client callback interface
│   └── Program.cs
│
└── SignalRClient/          # Angular Frontend
    └── src/app/pages/chat/
        ├── chat.ts              # Chat component
        └── signalR.service.ts   # SignalR service
```

## Features

- Real-time message broadcasting
- Room management (join/leave)
- Private messaging
- Auto-reconnection with exponential backoff
- Connection status display

## Getting Started

### Backend

```bash
cd src/SignalRServer
dotnet run
```

Server starts at `http://localhost:5080`, Hub endpoint at `/chat`

### Frontend

```bash
cd src/SignalRClient
pnpm install
pnpm start
```

Application starts at `http://localhost:4200`

## Hub Methods

| Method | Description |
|--------|-------------|
| `SendMessage(user, message)` | Broadcast message to all users |
| `JoinRoom(roomName)` | Join a room |
| `LeaveRoom(roomName)` | Leave a room |
| `SendToRoom(roomName, message)` | Send message to a room |
| `SendPrivateMessage(connectionId, message)` | Send private message |
