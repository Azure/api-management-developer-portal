import * as ko from "knockout";
import template from "./signin-aad.html";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { EventManager } from "@paperbits/common/events";
import { Component, Param, RuntimeComponent } from "@paperbits/common/ko/decorators";
import { AadService, AadServiceV2, IAadService } from "../../../../../services";
import { AadClientLibrary, SettingNames, defaultAadTenantName } from "../../../../../constants";
import { AadClientConfig } from "../../../../../contracts/aadClientConfig";
import { dispatchErrors, parseAndDispatchError } from "../../../validation-summary/utils";
import { ErrorSources } from "../../../validation-summary/constants";

@RuntimeComponent({
    selector: "signin-aad"
})
@Component({
    selector: "signin-aad",
    template: template
})
export class SignInAad {
    private selectedService: IAadService;

    constructor(
        private readonly aadService: AadService,
        private readonly aadServiceV2: AadServiceV2,
        private readonly eventManager: EventManager,
        private readonly settingsProvider: ISettingsProvider
    ) {
        this.classNames = ko.observable();
        this.label = ko.observable();
        this.replyUrl = ko.observable();
        // Is necessary for displaying Terms of Use. Will be called when the back-end implementation is done
        this.termsOfUse = ko.observable();
    }

    @Param()
    public classNames: ko.Observable<string>;

    @Param()
    public label: ko.Observable<string>;

    @Param()
    public replyUrl: ko.Observable<string>;

    @Param()
    public termsOfUse: ko.Observable<string>;

    /**
     * Initiates signing-in with Azure Active Directory.
     */
    public async signIn(): Promise<void> {
        dispatchErrors(this.eventManager, ErrorSources.signInOAuth, []);
        try {
            const config = await this.settingsProvider.getSetting<AadClientConfig>(SettingNames.aadClientConfig);

            if (config) {
                if (config.clientLibrary === AadClientLibrary.v2) {
                    this.selectedService = this.aadServiceV2;
                } else {
                    this.selectedService = this.aadService;
                }

                await this.selectedService.signInWithAad(config.clientId, config.authority, config.signinTenant || defaultAadTenantName, this.replyUrl());
            }
        } catch (error) {
            parseAndDispatchError(this.eventManager, ErrorSources.signInOAuth, error);
        }
    }
}
