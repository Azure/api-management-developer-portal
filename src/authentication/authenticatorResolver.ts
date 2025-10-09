import { HttpClient } from "@paperbits/common/http";
import { Logger } from "@paperbits/common/logging";
import { ConfigEndpoints } from "../constants";
import { AccessToken } from "./accessToken";
import { ArmAuthenticator } from "./armAuthenticator";
import { IAuthenticator } from "./IAuthenticator";
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
        this.logger.trackEvent("AuthenticatorResolver", { message: "Using ARM authenticator." });

        const authenticator = new ArmAuthenticator(this.logger);

        if (typeof ARM_TOKEN !== "undefined") {
            await authenticator.setAccessToken(AccessToken.parse(ARM_TOKEN));
            return authenticator;
        }

        const response = await this.httpClient.send<IEditorSettings>({ url: ConfigEndpoints.editor, method: "GET" });

        if (response.statusCode !== 200) {
            throw new Error(`Failed to load editor settings from ${ConfigEndpoints.editor}. Please ensure the file exists and is accessible.`);
        }

        const editorConfig = response.toObject();
        authenticator.setEditorSettings(editorConfig);

        return authenticator;
    }
}