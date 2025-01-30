import { app, EventGridEvent, InvocationContext } from "@azure/functions";
import * as signalR from "@microsoft/signalr";

const SIGNALR_URL = process.env.SIGNALR_URL || "https://cookersignalr.service.signalr.net;AuthType=azure.msi;Version=1.0";
const HUB_NAME = "blobNotifications"; // Replace with your hub name
const SIGNALR_KEY = process.env.SIGNALR_KEY || "1ty5jKSckPygTbyXu55kds47hpTiIbH1L6asUDcD19KkEP3xYmneJQQJ99BAAC1i4TkXJ3w3AAAAASRSjjyS"; 

export async function CookerEventGridTrigger(event: EventGridEvent, context: InvocationContext): Promise<void> {
    context.log('Event grid function processed event:', event);

    const eventType = event.eventType; // e.g., Microsoft.Storage.BlobCreated, Microsoft.Storage.BlobDeleted
    const eventData = event.data;
    let lastAction = "UnknownEvent";
    // Extract blob name
    const blobName = (eventData.url as string).split('/').pop() || "Unknown File";

    // Format event type into a simpler string
    switch (eventType) {
        case "Microsoft.Storage.BlobCreated":
            lastAction = "BlobCreated";
            break;
        case "Microsoft.Storage.BlobDeleted":
            lastAction = "BlobDeleted";
            break;
        case "Microsoft.Storage.DirectoryCreated":
            lastAction = "DirectoryCreated";
            break;
        case "Microsoft.Storage.DirectoryDeleted":
            lastAction = "DirectoryDeleted";
            break;
        default:
            lastAction = "UnknownEvent";
    }

       // Send event data to SignalR
    try {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`${SIGNALR_URL}/client/?hub=${HUB_NAME}`, {
                accessTokenFactory: () => SIGNALR_KEY
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        await connection.start();
        context.log(`✅ Connected to SignalR Hub: ${HUB_NAME}`);

        // Send data
        await connection.send("sendMessage", { action: lastAction, file: blobName, url: eventData?.url });

        context.log(`📡 Sent message to SignalR: ${lastAction} - ${blobName}`);
        await connection.stop();
    } catch (error) {
        context.log(`❌ SignalR Error: ${error}`);
    }

}

app.eventGrid('CookerEventGridTrigger', {
    handler: CookerEventGridTrigger
});
