import { MapiError } from "./../errors/mapiError";
import { HttpClient, HttpRequest, HttpResponse, HttpMethod } from "@paperbits/common/http";
import { CaptchaChallenge, CaptchaParams, CaptchaSettings } from "../contracts/captchaParams";
import { SignupRequest } from "../contracts/signupRequest";
import { ResetRequest, ChangePasswordRequest } from "../contracts/resetRequest";
import { IAuthenticator } from "../authentication";
import { DelegationAction, DelegationActionPath } from "../contracts/tenantSettings";
import { ISettingsProvider } from "@paperbits/common/configuration/ISettingsProvider";
import { DeveloperPortalType, SettingNames, WarningBackendUrlMissing } from "../constants";
import { KnownMimeTypes } from "../models/knownMimeTypes";
import { KnownHttpHeaders } from "../models/knownHttpHeaders";
import { Utils } from "../utils";
import { AuthorizationServerForClient } from "../contracts/authorizationServer";
import { AuthorizationServer } from "../models/authorizationServer";
import { Bag } from "@paperbits/common/bag";

export class BackendService {
    private portalUrl: string;
    private developerPortalType: string;

    constructor(
        private readonly settingsProvider: ISettingsProvider,
        private readonly httpClient: HttpClient,
        private readonly authenticator: IAuthenticator
    ) { }

    public async getCaptchaSettings(): Promise<CaptchaSettings> {
        let response: HttpResponse<CaptchaSettings>;
        const httpRequest: HttpRequest = {
            method: HttpMethod.get,
            url: await this.getUrl("/captcha-available")
        };

        try {
            response = await this.httpClient.send<any>(httpRequest);
        }
        catch (error) {
            throw new Error(`Unable to complete request. Error: ${error.message}`);
        }

        return this.handleResponse<CaptchaSettings>(response, httpRequest.url);
    }

    public async getCaptchaChallenge(challengeType?: string): Promise<CaptchaChallenge> {
        let response: HttpResponse<CaptchaChallenge>;
        let requestUrl = "/captcha-challenge";
        if (challengeType) {
            requestUrl = Utils.addQueryParameter(requestUrl, "challengeType", challengeType);
        }
        const httpRequest: HttpRequest = {
            method: HttpMethod.get,
            url: await this.getUrl(requestUrl)
        };

        try {
            response = await this.httpClient.send<any>(httpRequest);
        }
        catch (error) {
            throw new Error(`Unable to complete request. Error: ${error.message}`);
        }

        return this.handleResponse<CaptchaChallenge>(response, httpRequest.url);
    }

    public async getCaptchaParams(): Promise<CaptchaParams> {
        let response: HttpResponse<CaptchaParams>;
        const httpRequest: HttpRequest = {
            method: HttpMethod.get,
            url: await this.getUrl("/captcha")
        };

        try {
            response = await this.httpClient.send<any>(httpRequest);
        }
        catch (error) {
            throw new Error(`Unable to complete request. Error: ${error.message}`);
        }

        return this.handleResponse<CaptchaParams>(response, httpRequest.url);
    }

    public async sendSignupRequest(signupRequest: SignupRequest): Promise<void> {
        const response = await this.httpClient.send({
            url: await this.getUrl("/signup"),
            method: HttpMethod.post,
            headers: [{ name: KnownHttpHeaders.ContentType, value: KnownMimeTypes.Json }],
            body: JSON.stringify(signupRequest)
        });

        if (response.statusCode === 200) {
            return;
        }

        if (response.statusCode === 400) {
            const responseObj = <any>response.toObject();
            throw new MapiError(responseObj.code, responseObj.message, responseObj.details);
        }

        throw new MapiError("Unhandled", "Unable to complete sign up request.");
    }

    public async sendResetRequest(resetRequest: ResetRequest): Promise<void> {
        const response = await this.httpClient.send({
            url: await this.getUrl("/reset-password-request"),
            method: HttpMethod.post,
            headers: [{ name: KnownHttpHeaders.ContentType, value: KnownMimeTypes.Json }],
            body: JSON.stringify(resetRequest)
        });

        if (response.statusCode === 200) {
            return;
        }

        if (response.statusCode === 400) {
            const responseObj = <any>response.toObject();
            throw new MapiError(responseObj.code, responseObj.message, responseObj.details);
        }

        throw new MapiError("Unhandled", "Unable to complete reset password request.");
    }

    public async sendChangePassword(changePasswordRequest: ChangePasswordRequest, token: string): Promise<void> {
        const response = await this.httpClient.send({
            url: await this.getUrl("/change-password"),
            method: HttpMethod.post,
            headers: [{ name: KnownHttpHeaders.Authorization, value: token }, { name: KnownHttpHeaders.ContentType, value: KnownMimeTypes.Json }],
            body: JSON.stringify(changePasswordRequest)
        });

        if (response.statusCode === 200) {
            return;
        }

        if (response.statusCode === 400) {
            const responseObj = <any>response.toObject();
            throw new MapiError(responseObj.code, responseObj.message, responseObj.details);
        }

        throw new MapiError("Unhandled", "Unable to complete change password request.");
    }

    public async getDelegationString(action: DelegationAction, delegationParameters: Bag<string>): Promise<string> {
        if (this.developerPortalType === DeveloperPortalType.managed) {
            const queryParams = new URLSearchParams();
            Object.keys(delegationParameters).map(key => {
                const val = delegationParameters[key];
                queryParams.append(key, val);
            });
            return `/${DelegationActionPath[action]}?${queryParams.toString()}`;
        } else {
            const delegationUrl = await this.getDelegationUrlFromServer(action, delegationParameters);
            return delegationUrl;
        }
    }

    public async getDelegationUrlFromServer(action: DelegationAction, delegationParameters: Bag<string>): Promise<string> {
        const authToken = await this.authenticator.getAccessTokenAsString();

        if (!authToken) {
            throw Error("Auth token not found");
        }

        const payload = {
            delegationAction: action,
            delegationParameters: delegationParameters
        };

        const response = await this.httpClient.send(
            {
                url: await this.getUrl("/delegation-url"),
                method: HttpMethod.post,
                headers: [{ name: KnownHttpHeaders.Authorization, value: authToken }, { name: KnownHttpHeaders.ContentType, value: KnownMimeTypes.Json }],
                body: JSON.stringify(payload)
            });

        if (response.statusCode === 200) {
            const result = response.toObject();
            return result["url"];
        }
        else {
            throw Error(response.toText());
        }
    }

    public async getAuthorizationServer(authorizationServerId: string): Promise<AuthorizationServer> {
        let response: HttpResponse<AuthorizationServerForClient>;
        const httpRequest: HttpRequest = {
            method: HttpMethod.get,
            url: await this.getUrl(`/authorizationServers/${authorizationServerId}`)
        };

        try {
            response = await this.httpClient.send<any>(httpRequest);
        }
        catch (error) {
            throw new Error(`Unable to complete request. Error: ${error.message}`);
        }

        const contract = this.handleResponse<AuthorizationServerForClient>(response, httpRequest.url);
        return new AuthorizationServer(contract);
    }

    public async getOpenIdConnectProvider(provider: string): Promise<AuthorizationServer> {
        let response: HttpResponse<AuthorizationServerForClient>;
        const httpRequest: HttpRequest = {
            method: HttpMethod.get,
            url: await this.getUrl(`/openidConnectProviders/${provider}`)
        };

        try {
            response = await this.httpClient.send<any>(httpRequest);
        }
        catch (error) {
            throw new Error(`Unable to complete request. Error: ${error.message}`);
        }

        const contract = this.handleResponse<AuthorizationServerForClient>(response, httpRequest.url);
        return new AuthorizationServer(contract);
    }

    public async getOpenIdConnectProvidersByApi(apiId: string): Promise<AuthorizationServerForClient[]> {
        let response: HttpResponse<AuthorizationServerForClient[]>;
        const httpRequest: HttpRequest = {
            method: HttpMethod.get,
            url: await this.getUrl(`${apiId}/openidConnectProviders`)
        };

        try {
            response = await this.httpClient.send<any>(httpRequest);
        }
        catch (error) {
            throw new Error(`Unable to complete request. Error: ${error.message}`);
        }

        return this.handleResponse<AuthorizationServerForClient[]>(response, httpRequest.url);
    }

    public async getAuthorizationServersByApi(apiId: string): Promise<AuthorizationServerForClient[]> {
        let response: HttpResponse<AuthorizationServerForClient[]>;
        const httpRequest: HttpRequest = {
            method: HttpMethod.get,
            url: await this.getUrl(`${apiId}/authorizationServers`)
        };

        try {
            response = await this.httpClient.send<any>(httpRequest);
        }
        catch (error) {
            throw new Error(`Unable to complete request. Error: ${error.message}`);
        }

        return this.handleResponse<AuthorizationServerForClient[]>(response, httpRequest.url);

    }

    private async getUrl(path: string): Promise<string> {
        if (!this.portalUrl && !this.developerPortalType) {
            const settings = await this.settingsProvider.getSettings();
            this.portalUrl = settings[SettingNames.backendUrl] || "";
            this.developerPortalType = settings[SettingNames.developerPortalType] || DeveloperPortalType.selfHosted;
        }
        return `${this.portalUrl}${path}`;
    }

    private handleResponse<T>(response: HttpResponse<T>, url: string): T {
        if (response.statusCode === 200) {
            const contentType = response.headers.find(header => header.name === "content-type");
            if (contentType.value.startsWith(KnownMimeTypes.Json)) {
                return response.toObject();
            }
            if (!this.portalUrl && this.developerPortalType === DeveloperPortalType.selfHosted) {
                console.error(WarningBackendUrlMissing);
            }
        }
        else {
            throw new Error(`Unable to handle response from URL ${url}.`);
        }
    }
}

