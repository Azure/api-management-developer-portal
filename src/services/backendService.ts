import { MapiError } from "./../errors/mapiError";
import { HttpClient, HttpRequest, HttpResponse, HttpMethod } from "@paperbits/common/http";
import { CaptchaParams } from "../contracts/captchaParams";
import { SignupRequest } from "../contracts/signupRequest";
import { ResetRequest, ChangePasswordRequest } from "../contracts/resetRequest";
import { IAuthenticator } from "../authentication";
import { DelegationAction } from "../contracts/tenantSettings";
import { ISettingsProvider } from "@paperbits/common/configuration/ISettingsProvider";
import { SettingNames } from "../constants";
import { KnownMimeTypes } from "../models/knownMimeTypes";
import { KnownHttpHeaders } from "../models/knownHttpHeaders";

export class BackendService {
    private portalUrl: string;

    constructor(
        private readonly settingsProvider: ISettingsProvider,
        private readonly httpClient: HttpClient,
        private readonly authenticator: IAuthenticator
    ) { }

    public async getCaptchaParams(): Promise<CaptchaParams> {
        let response: HttpResponse<CaptchaParams>;
        const httpRequest: HttpRequest = {
            method: HttpMethod.get,
            url: await this.getUrl("/captcha")
        }

        try {
            response = await this.httpClient.send<any>(httpRequest);
        }
        catch (error) {
            throw new Error(`Unable to complete request. Error: ${error.message}`);
        }

        return this.handleResponse(response);
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

    public async sendChangePassword(changePasswordRequest: ChangePasswordRequest): Promise<void> {
        const authToken = await this.authenticator.getAccessTokenAsString();

        if (!authToken) {
            throw Error("Auth token not found");
        }

        const response = await this.httpClient.send({
            url: await this.getUrl("/change-password"),
            method: HttpMethod.post,
            headers: [{ name: KnownHttpHeaders.Authorization, value: authToken }, { name: KnownHttpHeaders.ContentType, value: KnownMimeTypes.Json }],
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

    public async getDelegationUrl(action: DelegationAction, delegationParameters: {}): Promise<string> {
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

    private async getUrl(path: string): Promise<string> {
        if (!this.portalUrl) {
            this.portalUrl = await this.settingsProvider.getSetting<string>(SettingNames.backendUrl) || "";
        }
        return `${this.portalUrl}${path}`;
    }

    private handleResponse(response: HttpResponse<CaptchaParams>): CaptchaParams {
        if (response.statusCode === 200) {
            return response.toObject();
        }
        else {
            throw new Error("Unable to handle Captcha response. Check captcha endpoint on server.");
        }
    }
}

