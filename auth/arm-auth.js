const { InteractiveBrowserCredential } = require('@azure/identity');

/**
 * Gets authentication ARM token using interactive browser authentication
 * @param {Object} options - Configuration options
 * @param {string} [options.tenantId] - Optional tenant ID to override default tenant
 * @param {string} [options.clientId] - Optional client ID for the application
 * @param {string} [options.redirectUri] - Optional redirect URI for the authentication flow
 * @returns {Promise<string>} - Bearer token for portal.azure.com
 */
async function getArmToken(options = {}) {
    try {
        const credential = new InteractiveBrowserCredential({
            tenantId: options.tenantId,
            clientId: options.clientId,
            redirectUri: options.redirectUri || 'http://localhost:8080'
        });

        const scope = "https://management.azure.com/user_impersonation";

        console.log("Please sign in via the browser window that will open...");

        // Get the token - this will open a browser window for authentication
        const response = await credential.getToken(scope);

        if (response && response.token) {
            console.log("Successfully acquired token with expiration at:", (new Date(response.expiresOnTimestamp)).toLocaleString());
            return `Bearer ${response.token}`;
        } else {
            throw new Error("Failed to acquire token: Empty response");
        }
    } catch (error) {
        console.error("Error acquiring portal token:", error.message);
        throw error;
    }
}

module.exports = {
    getArmToken
};
