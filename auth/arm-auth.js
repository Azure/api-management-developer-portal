const { InteractiveBrowserCredential } = require('@azure/identity');

/**
 * Gets authentication ARM token using interactive browser authentication
 * @param {Object} options - Configuration options
 * @param {string} [options.tenantId] - Optional tenant ID to override default tenant
 * @param {string} [options.clientId] - Optional client ID for the application
 * @returns {Promise<string>} - Bearer token for portal.azure.com
 */
async function getArmToken(options = {}) {
    try {
        const credential = new InteractiveBrowserCredential({
            tenantId: options.tenantId,
            clientId: options.clientId,
            loginStyle: "popup"
        });
        
        console.log("Please sign in via the browser window that will open...");

        // Get the token - this will open a browser window for authentication
        const scope = "https://management.azure.com/user_impersonation";
        const response = await credential.getToken(scope);

        if (response && response.token) {
            console.log("Successfully acquired token with expiration at:", (new Date(response.expiresOnTimestamp)).toLocaleString());
            
            return `${response.tokenType} ${response.token}`;
        }
        else {
            throw new Error("Failed to acquire token: Empty response");
        }
    }
    catch (error) {
        console.error("Error acquiring portal token:", error.message);
        throw error;
    }
}

module.exports = {
    getArmToken
};
