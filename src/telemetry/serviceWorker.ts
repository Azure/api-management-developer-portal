import { Bag } from "@paperbits/common/bag";

declare const clients: any;
declare const self: ServiceWorkerGlobalScope;

// Check if running in a browser or Node.js environment
const isServiceWorker = typeof self !== 'undefined' && typeof clients !== 'undefined';

const sensitiveParams = ["client_secret", "salt", "sig", "signature", "key", "secret", "token", "access_token", "username", "user_name", "user", "password"];
const allowedList = new Set(["state", "session_state"]);
const allowedHeaders = new Set([
    "accept",
    "accept-charset",
    "accept-datetime",
    "accept-encoding",
    "accept-language",
    "cache-control",
    "connection",
    "content-length",
    "content-md5",
    "content-type",
    "date",
    "expect",
    "expires",
    "forwarded",
    "from",
    "host",
    "if-match",
    "if-modified-since",
    "if-none-match",
    "if-range",
    "if-unmodified-since",
    "max-forwards",
    "origin",
    "pragma",
    "range",
    "referer",
    "server",
    "te",
    "upgrade",
    "user-agent",
    "useragent",
    "via",
    "warning",
    "x-correlation-id",
    "x-ms-client-app-id",
    "x-ms-client-app-id-acr",
    "x-ms-client-audience",
    "x-ms-client-authentication-methods",
    "x-ms-client-authorization-source",
    "x-ms-client-identity-provider",
    "x-ms-client-issuer",
    "x-ms-client-object-id",
    "x-ms-client-principal-id",
    "x-ms-client-request-id",
    "x-ms-client-tenant-id",
    "x-ms-client-wids",
    "x-ms-correlation-id",
    "x-ms-correlation-request-id",
    "x-ms-original-url",
    "x-ms-request-id",
    "x-ms-return-client-request-id",
    "x-ms-routing-id",
    "x-ms-scenario-id",
    "x-ms-user-agent",
    "x-request-id"
]);

if (isServiceWorker) {
    addEventListener("fetch", (event: FetchEvent) => {
        const request = event.request;

        event.respondWith(
            (async () => {
                const response = await fetch(request);

                if (request.url.endsWith("/trace")) {
                    return response;
                }

                const cleanedUrl = sanitizeUrl(request.url);

                const telemetryData = {
                    url: cleanedUrl,
                    method: request.method.toUpperCase(),
                    status: response.status.toString(),
                    responseHeaders: ""
                };

                const headers: { [key: string]: string } = {};

                response.headers.forEach((value, key) => {
                    if (allowedHeaders.has(key.toLowerCase())) {
                        headers[key] = cleanUrlSensitiveDataFromValue(value);
                    }
                });
                telemetryData.responseHeaders = JSON.stringify(headers);

                sendMessageToClients(telemetryData);

                return response;
            })()
        );
    });
    console.log("Telemetry worker started.");
} else {
    console.log("Telemetry worker not started. Not in a service worker context.");
}


export function sendMessageToClients(message: Bag<string>): void {
    clients.matchAll().then((items: any[]) => {
        if (items.length > 0) {
            items.forEach(client => client.postMessage(message));
        }
    });
}

export function sanitizeUrl(requestUrl: string): string {
    if (!requestUrl) {
        return requestUrl;
    }
    let url = requestUrl;

    // Clean hash parameters if they exist
    if (url.match(/#.*=/)) {
        return cleanUpUrlParams(url);
    } else {
        return cleanUrlSensitiveDataFromQuery(url);
    }
}

export function cleanUpUrlParams(requestUrl: string): string {
    if (!requestUrl) {
        return requestUrl;
    }
    try {
        const url = new URL(requestUrl);
        const hash = url.hash.substring(1); // Remove the leading '#'
        const params = new URLSearchParams(hash);

        // Remove all parameters except those in the allowedList
        for (const key of params.keys()) {
            if (!allowedList.has(key)) {
                // Replace the 'code' parameter value
                params.set(key, "***");
            }
        }

        url.hash = params.toString();
        return url.toString();
    } catch (e) {
        // Fallback to empty string if URL parsing fails
        return "";
    }
}

export function cleanUrlSensitiveDataFromQuery(requestUrl: string): string {
    if (requestUrl) {
        requestUrl = requestUrl.replace(/([?|&])(client_secret|salt|sig|signature|key|secret|(access_)?token|user(_)?(name)?|password)=([^&]+)/ig, "$1$2=***");

        // Parse the URL to handle the query parameters correctly
        try {
            const url = new URL(requestUrl);
            const params = new URLSearchParams(url.search);

            sensitiveParams.forEach(param => {
                if (params.has(param)) {
                    params.set(param, "***");
                }
            });

            url.search = params.toString();
            return url.toString();
        } catch (e) {
            // Fallback to the current implementation if URL parsing fails
            return requestUrl;
        }
    }
    return requestUrl;
}

export function cleanUrlSensitiveDataFromValue(dataValue: string): string {
    if (dataValue) {
        dataValue = dataValue.replace(/((client_secret|salt|sig|signature|secret|(access_)?token|user(_)?(name)?|password))=([^&]+)/ig, "$1$3=***");
    }
    return dataValue;
}