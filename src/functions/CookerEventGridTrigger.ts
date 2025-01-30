import { app, EventGridEvent, InvocationContext } from "@azure/functions";
import Pusher from "pusher";

// Initialize Pusher
const pusher = new Pusher({
    appId: '1933719',
    key: '048f35c4f35c4c9c67f7',
    secret: 'b044bfcb4c1e2a3524b6',
    cluster: 'us2',
    useTLS: true,  // Enable TLS (for security)
});

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

     // Send a notification to Pusher channel
    const channel = 'blob-notifications'; // The name of your channel (can be dynamic based on event data)
    
    // Send the event data to your frontend via Pusher
    pusher.trigger(channel, eventType, {
        message: `A new event occurred: ${eventType}`,
        blobUrl: blobName,
    });

}

app.eventGrid('CookerEventGridTrigger', {
    handler: CookerEventGridTrigger
});
