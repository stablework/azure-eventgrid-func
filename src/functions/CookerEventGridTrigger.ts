import { app, EventGridEvent, InvocationContext } from "@azure/functions";

async function fetchData() {
    try {
        const response = await fetch("https://api.tent.brandontinder.info/");
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Response Data:", data);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}


export async function CookerEventGridTrigger(event: EventGridEvent, context: InvocationContext): Promise<void> {
    context.log('Event grid function processed event:', event);

    fetchData();

}

app.eventGrid('CookerEventGridTrigger', {
    handler: CookerEventGridTrigger
});
