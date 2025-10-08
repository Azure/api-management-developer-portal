import { IAuthenticator } from "./IAuthenticator";
import { HttpClient } from "@paperbits/common/http/httpClient";
import { Logger } from "@paperbits/common/logging";
import { ConfigEndpoints } from "../constants";
import { ArmAuthenticator } from "./armAuthenticator";
import { SsoAuthenticator } from "./ssoAuthenticator";
import { IEditorSettings } from "./IEditorSettings";

export class AuthenticatorResolver {
    private loadPromise: Promise<IAuthenticator>;

    constructor(
        private readonly httpClient: HttpClient,
        private readonly logger: Logger
    ) { }

    public async getAuthenticator(): Promise<IAuthenticator> {
        if (!this.loadPromise) {
            this.loadPromise = this.resolveAuthenticator();
        }
        return this.loadPromise;
    }

    public async resolveAuthenticator(): Promise<IAuthenticator> {
        // const ssoAuthenticator = new SsoAuthenticator(this.httpClient, this.logger);

        // if (await ssoAuthenticator.isAuthenticated() || location.pathname.startsWith("/signin-sso")) {
        //     this.logger.trackEvent("AuthenticatorResolver", { message: "Using SSO authenticator." });
        //     return ssoAuthenticator;
        // }

        const response = await this.httpClient.send<IEditorSettings>({ url: ConfigEndpoints.editor, method: "GET" });

        if (response.statusCode !== 200) {
            throw new Error(`Failed to load editor settings from ${ConfigEndpoints.editor}.`);
        }

        const editorConfig: any = {};  // response.toObject();

        // if (editorConfig.isArmAuthEnabled) {
            this.logger.trackEvent("AuthenticatorResolver", { message: "Using ARM authenticator." });
            return new ArmAuthenticator(editorConfig, this.logger);
        //}

        throw new Error(`Unable to authenticate: Either setting "isArmAuthEnabled": true has to be specified in editor-config.json or SSO token (/signin-sso?token=...) query parameter must be present in URL.`);
    }
}