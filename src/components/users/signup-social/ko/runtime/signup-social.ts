import * as ko from "knockout";
import * as validation from "knockout.validation";
import * as Constants from "../../../../../constants";
import template from "./signup-social.html";
import { Component, RuntimeComponent, OnMounted, Param } from "@paperbits/common/ko/decorators";
import { EventManager } from "@paperbits/common/events";
import { Router } from "@paperbits/common/routing";
import { HttpClient } from "@paperbits/common/http";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { ValidationReport } from "../../../../../contracts/validationReport";
import { UserPropertiesContract } from "../../../../../contracts/user";
import { Utils } from "../../../../../utils";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { IAuthenticator } from "./../../../../../authentication/IAuthenticator";
import { MapiError } from "../../../../../services/mapiError";


@RuntimeComponent({
    selector: "signup-social-runtime"
})
@Component({
    selector: "signup-social-runtime",
    template: template
})
export class SignupSocial {
    public readonly email: ko.Observable<string>;
    public readonly firstName: ko.Observable<string>;
    public readonly lastName: ko.Observable<string>;
    public readonly working: ko.Observable<boolean>;

    constructor(
        private readonly eventManager: EventManager,
        private readonly httpClient: HttpClient,
        private readonly settingsProvider: ISettingsProvider,
        private readonly router: Router,
        private readonly routeHelper: RouteHelper,
        private readonly authenticator: IAuthenticator
    ) {
        this.email = ko.observable("");
        this.firstName = ko.observable("");
        this.lastName = ko.observable("");
        this.working = ko.observable(false);

        validation.init({
            insertMessages: false,
            errorElementClass: "is-invalid",
            decorateInputElement: true
        });

        this.email.extend(<any>{ required: { message: `Email is required.` }, email: true });
        this.firstName.extend(<any>{ required: { message: `First name is required.` } });
        this.lastName.extend(<any>{ required: { message: `Last name is required.` } });
    }

    /**
     * Initializes component after creation.
     */
    @OnMounted()
    public async initialize(): Promise<void> {
        const provider = this.routeHelper.getIdTokenProvider();
        const idToken = this.routeHelper.getIdToken();

        if (!provider || !idToken) {
            await this.router.navigateTo(Constants.pageUrlSignIn);
            return;
        }

        const jwtToken = Utils.parseJwt(idToken);

        this.firstName(jwtToken.given_name);
        this.lastName(jwtToken.family_name);
        this.email(jwtToken.email);
    }

    public async createUserWithOAuth(provider: string, idToken: string): Promise<void> {
        const managementApiUrl = await this.settingsProvider.getSetting<string>("managementApiUrl");
        const managementApiVersion = await this.settingsProvider.getSetting<string>("managementApiVersion");
        const jwtToken = Utils.parseJwt(idToken);

        const user: UserPropertiesContract = {
            firstName: this.firstName(),
            lastName: this.lastName(),
            email: this.email(),
            identities: [{
                id: jwtToken.oid,
                provider: provider
            }]
        };

        const response = await this.httpClient.send({
            url: `${managementApiUrl}/users?api-version=${managementApiVersion}`,
            method: "POST",
            headers: [
                { name: "Content-Type", value: "application/json" },
                { name: "Authorization", value: `${provider} id_token="${idToken}"` }
            ],
            body: JSON.stringify(user)
        });

        if (!(response.statusCode >= 200 && response.statusCode <= 299)) {
            throw MapiError.fromResponse(response);
        }

        const sasTokenHeader = response.headers.find(x => x.name.toLowerCase() === "ocp-apim-sas-token");

        if (!sasTokenHeader) { // User not registered with APIM.
            throw new Error("Unable to authenticate.");
            return;
        }

        const regex = /token=\"(.*==)\"/gm;
        const matches = regex.exec(sasTokenHeader.value);

        if (!matches || matches.length < 1) {
            throw new Error("Authentication failed. Unable to parse access token.");
        }

        const sasToken = matches[1];
        await this.authenticator.setAccessToken(`SharedAccessSignature ${sasToken}`);

        this.router.navigateTo(Constants.pageUrlHome);
    }

    /**
     * Sends user signup request to Management API.
     */
    public async signup(): Promise<void> {
        const validationGroup = {
            email: this.email,
            firstName: this.firstName,
            lastName: this.lastName
        };

        const result = validation.group(validationGroup);

        const clientErrors = result();

        if (clientErrors.length > 0) {
            result.showAllMessages();
            const validationReport: ValidationReport = {
                source: "signup",
                errors: clientErrors
            };
            this.eventManager.dispatchEvent("onValidationErrors", validationReport);
            return;
        }

        try {
            const provider = this.routeHelper.getIdTokenProvider();
            const idToken = this.routeHelper.getIdToken();

            if (!provider || !idToken) {
                await this.router.navigateTo(Constants.pageUrlSignIn);
                return;
            }

            const validationReport: ValidationReport = {
                source: "signup",
                errors: []
            };

            await this.createUserWithOAuth(provider, idToken);

            this.eventManager.dispatchEvent("onValidationErrors", validationReport);
        }
        catch (error) {
            let errorMessages: string[];

            if (error.code === "ValidationError") {
                const details: any[] = error.details;

                if (details && details.length > 0) {
                    errorMessages = details.map(item => `${item.message}`);
                }
            }
            else {
                errorMessages = ["Server error. Unable to send request. Please try again later."];
            }

            const validationReport: ValidationReport = {
                source: "signup",
                errors: errorMessages
            };
            this.eventManager.dispatchEvent("onValidationErrors", validationReport);
        }
    }
}