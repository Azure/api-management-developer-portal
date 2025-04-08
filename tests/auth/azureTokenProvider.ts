import { ClientCertificateCredential, ClientCertificatePEMCertificate, AccessToken } from "@azure/identity";
import { TestUtils } from "../testUtils";
import { CertificateUtils } from "./certificateUtils";

export class AuthHeaderGenerator {
    private static _instance: AuthHeaderGenerator;

    private constructor(private readonly tokenProvider: AzureTokenProvider) { }

    public static get Instance() {
        return this._instance || (this._instance = new this(new AzureTokenProvider()));
    }

    public async getAuthHeader(): Promise<string> {
        const settings = await TestUtils.getConfigAsync();
        if (settings["useArmAuth"] == "true" || !settings["accessToken"]) {
            console.log("AuthHeaderGenerator: Generate token from AzureTokenProvider");
            return `Bearer ${await this.tokenProvider.getToken()}`;
        } else {
            console.log("AuthHeaderGenerator: Using token from settings");
            return settings["accessToken"];
        }
    }
}

export class AzureTokenProvider {
    private readonly apiManagementBvtApplicationId = "1e85ea6a-35ac-4a3b-9fdb-ce1b87a8a737";
    private readonly adTenantId = "72f988bf-86f1-41af-91ab-2d7cd011db47";
    private readonly defaultScope = ["https://management.azure.com/.default"];

    private static tokenCache: AccessToken;

    public async getToken(): Promise<string> {
        if (AzureTokenProvider.tokenCache && AzureTokenProvider.tokenCache.expiresOnTimestamp > (Date.now() - 5 * 60 * 1000)) {
            console.log("AzureTokenProvider: Using cached token");
            return AzureTokenProvider.tokenCache.token;
        }

        const cert = await this.getCertificate();
        if (!cert) {
            console.log("AzureTokenProvider: Certificate is not available");
            throw new Error("Certificate is not available");
        }

        const certConfig = <ClientCertificatePEMCertificate>{
            certificate: cert
        };

        const cred = new ClientCertificateCredential(
            this.adTenantId,
            this.apiManagementBvtApplicationId,
            certConfig,
            {
                sendCertificateChain: true
            }
        );

        let token;
        try {
            token = await cred.getToken(this.defaultScope);
        }
        catch(error) {
            console.log("Failed to get token. Error: " + error.message);
            throw new Error("Failed to get token");
        }

        console.log("AzureTokenProvider: resolved token with expiration: " + token.expiresOnTimestamp);

        AzureTokenProvider.tokenCache = token;
        return token.token;
    }

    private async getCertificate(): Promise<string> {
        const settings = await TestUtils.getConfigAsync();
        return CertificateUtils.getFullPemCertificate(settings["certificate"]);
    }
}