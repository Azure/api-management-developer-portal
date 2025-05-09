import { Logger } from "@paperbits/common/logging";
import { PublicClientApplication, SilentRequest, AuthenticationResult, Configuration } from "@azure/msal-browser";
import { SelfHostedArmAuthenticator } from "./armAuthenticator";
import { TokenType } from "./accessToken";

export class ArmTokenRefresher {
    private readonly interval: NodeJS.Timeout;
    private msalClient: PublicClientApplication;

    constructor(
        private readonly authenticator: SelfHostedArmAuthenticator,
        private readonly logger: Logger
    ) {
        this.refreshToken = this.refreshToken.bind(this);
        this.interval = setInterval(() => this.refreshToken(), 60 * 1000);
    }

    private getMsalConfig(): Configuration {
        return {
            auth: {
                clientId: this.authenticator.getClientId(),
                authority: this.authenticator.getAuthority(),
                redirectUri: window.location.origin
            },
            cache: {
              cacheLocation: "localStorage", // or "sessionStorage"
              storeAuthStateInCookie: true
            }
        };
    }

    private async acquireTokenSilently(scopes: string[]): Promise<AuthenticationResult> {
        const accounts = this.msalClient.getAllAccounts();

        if (accounts.length === 0) {
            throw new Error("No active accounts found");
        }

        const silentRequest: SilentRequest = {
            scopes: scopes,
            account: accounts[0], // Use the first logged-in account
            authority: this.authenticator.getAuthority(),
            forceRefresh: false // Set to true if you want to force a refresh token use
        };

        try {
            // This will use the refresh token if the access token is expired
            return await this.msalClient.acquireTokenSilent(silentRequest);
        } catch (error) {
            console.error("Silent token acquisition failed", error);

            // If silent acquisition fails, you might want to redirect the user to login
            // Or handle the error differently based on your app's needs
            throw error;
        }
    }

    private async refreshToken(): Promise<void> {
        try {
            const accessToken = this.authenticator.getStoredAccessToken();

            if (!accessToken || accessToken.type !== TokenType.bearer) {
                return;
            }

            // Initialize MSAL client
            if (!this.msalClient) {
                this.msalClient = new PublicClientApplication(this.getMsalConfig());
                await this.restoreAccountSilently();
                return;
            }

            const refreshBufferMs = 5 * 60 * 1000; // 5 min
            const expiresInMs = accessToken.expiresInMs();

            // Only refresh if token is about to expire
            if (expiresInMs > refreshBufferMs) {
                return;
            }

            const scopes = this.authenticator.getScopes();

            // Get MSAL accounts
            const accounts = this.msalClient.getAllAccounts();
            if (accounts.length === 0) {
                this.logger.trackEvent("TokenRefresh - No accounts found");
                await this.restoreAccountSilently();
                return;
            }

            // Acquire new token silently
            const newAccessToken = await this.acquireTokenSilently(scopes);
            if (!newAccessToken) {
                this.logger.trackEvent("TokenRefresh - Failed to acquire new token");
                return;
            }

            // Update the token in the authenticator
            this.authenticator.updateToken(newAccessToken.idToken);
            this.logger.trackEvent("TokenRefresh - Token refreshed successfully");
        } catch (error) {
            this.logger.trackError(error, { message: "Unable to refresh access token." });
        }
    }

    /**
     * Attempts to silently restore a user account session using stored tokens
     * @returns Promise<boolean> True if account was successfully restored
     */
    public async restoreAccountSilently(): Promise<boolean> {
        try {
            const accessToken = this.authenticator.getStoredAccessToken();

            if (!accessToken) {
                this.logger.trackEvent("AccountRestore - No stored token found");
                return false;
            }

            // Check if we already have MSAL accounts
            const accounts = this.msalClient.getAllAccounts();
            if (accounts.length > 0) {
                this.logger.trackEvent("AccountRestore - Account already exists");
                return true;
            }

            // Try to use stored token info to restore the session
            const scopes = this.authenticator.getScopes();

            // Use MSAL's ssoSilent to attempt restoration with minimal configuration
            const ssoSilentRequest = {
                scopes: scopes,
                authority: this.authenticator.getAuthority(),
                loginHint: this.authenticator.getLoginHint() || undefined,
                redirectUri: window.location.origin
            };

            try {
                const response = await this.msalClient.ssoSilent(ssoSilentRequest);

                if (response) {
                    this.authenticator.updateToken(response.idToken);
                    this.logger.trackEvent("AccountRestore - Account restored successfully");
                    return true;
                }
            } catch (ssoError) {
                this.logger.trackEvent("AccountRestore - SSO silent failed, trying token refresh");

                // If SSO silent fails but we have a refresh token, try using it
                // if (accessToken.refreshToken) {
                //     try {
                //         // Create custom request with refresh token
                //         const refreshRequest = {
                //             refreshToken: accessToken.refreshToken,
                //             scopes: scopes
                //         };

                //         // Use the refresh token to get a new access token
                //         const refreshResponse = await this.msalClient.acquireTokenByRefreshToken(refreshRequest);

                //         if (refreshResponse) {
                //             this.authenticator.updateToken(refreshResponse.idToken);
                //             this.logger.trackEvent("AccountRestore - Account restored using refresh token");
                //             return true;
                //         }
                //     } catch (refreshError) {
                //         this.logger.trackError(refreshError, { message: "Failed to restore account using refresh token" });
                //     }
                // }
            }

            return false;
        } catch (error) {
            this.logger.trackError(error, { message: "Failed to restore account silently" });
            return false;
        }
    }

    public async dispose() {
        clearInterval(this.interval);
    }
}