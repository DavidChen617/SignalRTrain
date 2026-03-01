using Microsoft.AspNetCore.SignalR;

namespace SignalRServer.Hubs;

public class LoggingHubFilter(ILogger<LoggingHubFilter> logger): IHubFilter
{
    public async ValueTask<object?> InvokeMethodAsync(HubInvocationContext invocationContext, Func<HubInvocationContext, ValueTask<object?>> next)
    {
        logger.LogInformation("Calling hub method: {Method}", invocationContext.HubMethodName);                                     
        return await next(invocationContext);  
    }
}
