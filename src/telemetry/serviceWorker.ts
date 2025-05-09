import { Bag } from "@paperbits/common/bag";

declare const clients: any;
declare const self: ServiceWorkerGlobalScope;

// Check if running in a browser or Node.js environment
const isServiceWorker = typeof self !== "undefined" && typeof clients !== "undefined";

// Pattern for sensitive parameter names
const SENSITIVE_PARAM_PATTERN = '(client_secret|salt|sig|signature|secret|(access_)?token|user(_)?(name)?|password)';

// Regex pattern for matching sensitive parameters with various quoting styles
const SENSITIVE_PARAM_REGEX = new RegExp(`${SENSITIVE_PARAM_PATTERN}=(?:([^&,"']+)|"([^"]+)"|'([^']+)')`, 'ig');

const sensitiveParams = new Set(["client_secret", "salt", "sig", "signature", "key", "secret", "token", "access_token", "username", "user_name", "user", "password"]);
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
                try {
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
                } catch (error) {
                    console.error("Error in service worker fetch handler:", error);

                    // Send telemetry about the error
                    const errorTelemetry = {
                        url: sanitizeUrl(request.url),
                        method: request.method.toUpperCase(),
                        status: "error",
                        error: error.message || "Network error"
                    };

                    try {
                        sendMessageToClients(errorTelemetry);
                    } catch (e) {
                        // Ignore errors in sending telemetry
                    }

                    // Return a fallback response
                    return new Response("Network error occurred", {
                        status: 503,
                        statusText: errorTelemetry.error,
                        headers: { "Content-Type": "text/plain" }
                    });
                }
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
    const url = requestUrl;

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

            for (const [key, value] of params.entries()) {
                if (sensitiveParams.has(key.toLowerCase())) {
                    params.set(key, "***");
                }
            }

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
    if (!dataValue) {
        return dataValue;
    }

    // regex that handles cases:
    // 1. parameter="value" (double quotes)
    // 2. parameter='value' (single quotes)
    // 3. parameter=value (no quotes)
    return dataValue.replace(SENSITIVE_PARAM_REGEX,(match, paramName, unquotedValue, doubleQuotedValue, singleQuotedValue) => {
            return `${paramName}=***`;
        });

    return dataValue;
}