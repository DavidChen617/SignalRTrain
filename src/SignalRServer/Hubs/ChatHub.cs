using Microsoft.AspNetCore.SignalR;

namespace SignalRServer.Hubs;

public class ChatHub : Hub<IChatClient>
{
    public async Task SendMessage(string user, string message)
    {
        await Clients.All.ReceiveMessage(user, message);
    }

    public async Task JoinRoom(string roomName)                                                                                
    {                                                                                                                          
        await Groups.AddToGroupAsync(Context.ConnectionId, roomName);                                                          
        await Clients.Group(roomName).UserJoined(Context.User?.Identity?.Name ?? "Anonymous");                                 
    } 
    
    public async Task LeaveRoom(string roomName)                                                                               
    {                                                                                                                          
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomName);                                                     
    }                                                                                                                          
                                                                                                                             
    public async Task SendToRoom(string roomName, string message)                                                              
    {                                                                                                                          
        await Clients.Group(roomName).ReceiveMessage("user", message);                                                         
    }
    
    public async Task SendPrivateMessage(string targetConnectionId, string message)                                            
    {                                                                                                                          
        await Clients.Client(targetConnectionId).ReceiveMessage("private", message);                                           
    }
    
    public async Task SendToUser(string userId, string message)                                                                
    {                                                                                                                          
        await Clients.User(userId).ReceiveMessage("private", message);                                                         
    }
}
