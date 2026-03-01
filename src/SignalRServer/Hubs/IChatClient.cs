namespace SignalRServer.Hubs;

public interface IChatClient
{
    Task ReceiveMessage(string user, string message);                                                                      
    Task UserJoined(string user);                                                                                          
    Task UserLeft(string user);                                                                                            
    Task OnlineUsers(IEnumerable<string> users);
}