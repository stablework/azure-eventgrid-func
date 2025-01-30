import { app, EventGridEvent, InvocationContext } from "@azure/functions";

export async function CookerEventGridTrigger(event: EventGridEvent, context: InvocationContext): Promise<void> {
    context.log('Event grid function processed event:', event);

    const eventType = event.eventType; // e.g., Microsoft.Storage.BlobCreated, Microsoft.Storage.BlobDeleted
    const eventData = event.data;
    let lastAction: string;
    // Extract blob name
    const blobName = eventData?.url ? eventData.url.split('/').pop() : "Unknown File";

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

     // Construct query parameters
     const params = new URLSearchParams({
        action: lastAction,
        file: blobName,
        url: eventData?.url || "N/A",
        time: eventData?.eventTime || new Date().toISOString()
    });

    const apiUrl = `https://api.tent.brandontinder.info/?${params.toString()}`;

    try {
        // Send GET request using fetch
        const response = await fetch(apiUrl);
        context.log(`✅ Sent data to API. Response: ${response.status} - ${response.statusText}`);
    } catch (error) {
        context.log(`❌ Failed to send data. Error: ${error}`);
    }

}

app.eventGrid('CookerEventGridTrigger', {
    handler: CookerEventGridTrigger
});
