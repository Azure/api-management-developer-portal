import { Bag } from "@paperbits/common/bag";
declare const clients: any;

function sendMessageToClients(message: Bag<string>): void {
    clients.matchAll().then((items: any[]) => {
        if (items.length > 0) {
            const client = items[0];
            client.postMessage(message);
        }
    });
}

addEventListener("fetch", (event: FetchEvent) => {
    const request = event.request;

    event.respondWith(
        (async () => {
            const response = await fetch(request);

            if (request.url.endsWith("/trace")) {
                return response;
            }

            const telemetryData = {
                url: request.url,
                method: request.method.toUpperCase(),
                status: response.status.toString(),
                responseHeaders: ""
            };

            const headers: { [key: string]: string } = {};
            response.headers.forEach((value, key) => {
                if (key.toLocaleLowerCase() === "authorization") {
                    return;
                }
                headers[key] = value;
            });
            telemetryData.responseHeaders = JSON.stringify(headers);

            sendMessageToClients(telemetryData);

            return response;
        })()
    );
});

console.log("Telemetry worker started.");