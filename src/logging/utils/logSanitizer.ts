const sensitiveParams = ["client_secret", "salt", "sig", "signature", "key", "secret", "token", "access_token", "username", "user_name", "user", "password"];
const allowedList = new Set(["state", "session_state"]);

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
        requestUrl = requestUrl.replace(/(eyJ[a-z0-9\\-_%]+\.eyJ[^&]*)/ig, "***");

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
        dataValue = dataValue.replace(/(eyJ[a-z0-9\\-_%]+\.[^&]*)/ig, "***");
    }
    return dataValue;
}