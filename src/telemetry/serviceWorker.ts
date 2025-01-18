import { Bag } from "@paperbits/common/bag";
declare const clients: any;

const allowedList = ["state", "session_state"];

function sendMessageToClients(message: Bag<string>): void {
    clients.matchAll().then((items: any[]) => {
        if (items.length > 0) {
            items.forEach(client => client.postMessage(message));
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

            const cleanedUrl = request.url.indexOf("#code=") > -1 ? cleanUpUrlParams(request) : request.url;

            const telemetryData = {
                url: cleanedUrl,
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

function cleanUpUrlParams(request: Request): string {
    const url = new URL(request.url);
    const hash = url.hash.substring(1); // Remove the leading '#'
    const params = new URLSearchParams(hash);

    // Remove all parameters except those in the allowedList
    for (const key of params.keys()) {
        if (!allowedList.includes(key)) {
            // Replace the 'code' parameter value
            params.set(key, "xxxxxxxxxx");
        }
    }

    url.hash = params.toString();
    return url.toString();
}
