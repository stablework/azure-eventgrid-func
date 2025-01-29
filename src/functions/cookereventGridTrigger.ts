import { app, EventGridEvent, InvocationContext } from "@azure/functions";

export async function cookereventGridTrigger(event: EventGridEvent, context: InvocationContext): Promise<void> {
    context.log(`Event received: ${JSON.stringify(event)}`);

    // You can access the Event Grid event details here
    const eventType = event.eventType;
    const blobUrl = event.data.url;

    context.log(`Event Type: ${eventType}`);
    context.log(`Blob URL: ${blobUrl}`);

    // Your custom logic here (e.g., sending a message to SignalR, etc.)
}

app.eventGrid('cookereventGridTrigger', {
    handler: cookereventGridTrigger
});
