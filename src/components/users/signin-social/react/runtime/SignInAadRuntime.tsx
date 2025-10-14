import * as React from "react";
import { Resolve } from "@paperbits/react/decorators";
import { EventManager } from "@paperbits/common/events";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { Logger } from "@paperbits/common/logging";
import { AadService, AadServiceV2, IAadService } from "../../../../../services";
import { ErrorSources } from "../../../validation-summary/constants";
import { eventTypes } from "../../../../../logging/clientLogger";
import { AadClientConfig } from "../../../../../contracts/aadClientConfig";
import { AadClientLibrary, defaultAadTenantName, SettingNames } from "../../../../../constants";
import { dispatchErrors, parseAndDispatchError } from "../../../validation-summary/utils";
import { BtnSpinner } from "../../../../utils/react/BtnSpinner";

type SignInAadRuntimeProps = {
    label: string
    tenants: string[],
    replyUrl: string,
    classNames: string
}
type SignInAadRuntimeFCProps = SignInAadRuntimeProps & {
    signIn: (selectedTenant: string) => Promise<void>
};

const SignInAadRuntimeFC = ({ label, signIn, tenants, classNames }: SignInAadRuntimeFCProps) => {
    return (
        <div className="flex flex-wrap">
            {tenants.map(tenant => (
            <BtnSpinner key={tenant} onClick={()=>signIn(tenant)} className={classNames}>
                <i className="icon-emb icon-svg-entraId"></i>
                {tenants.length > 1 ? `${label} (${tenant.replace('.onmicrosoft.com', '')})`: label }
            </BtnSpinner>))}
        </div>
    );
};

export class SignInAadRuntime extends React.Component<SignInAadRuntimeProps> {
    @Resolve("aadService")
    public declare aadService: AadService;

    @Resolve("aadServiceV2")
    public declare aadServiceV2: AadServiceV2;

    @Resolve("eventManager")
    public declare eventManager: EventManager;

    @Resolve("settingsProvider")
    public declare settingsProvider: ISettingsProvider;

    @Resolve("logger")
    public declare logger: Logger;

    private selectedService: IAadService;
    private aadConfig: AadClientConfig;

    public async signIn(selectedTenant: string): Promise<void> {
        dispatchErrors(this.eventManager, ErrorSources.signInOAuth, []);
        this.logger.trackEvent(eventTypes.aadLogin, { message: "Initiating AAD login" });

        try {
            this.aadConfig  = await this.settingsProvider.getSetting<AadClientConfig>(SettingNames.aadClientConfig);

            if (this.aadConfig) {
                if (this.aadConfig.clientLibrary === AadClientLibrary.v2) {
                    this.selectedService = this.aadServiceV2;
                }
                else {
                    this.selectedService = this.aadService;
                }

                await this.selectedService.signInWithAad(this.aadConfig.clientId, this.aadConfig.authority, selectedTenant, this.props.replyUrl);
            } 
            else {
                this.logger.trackEvent(eventTypes.aadLogin, { message: "AAD client config is not set" });
            }
        } catch (error) {
            parseAndDispatchError(this.eventManager, ErrorSources.signInOAuth, error, this.logger);
        }
    }

    render() {
        return (<SignInAadRuntimeFC {...this.props} signIn={this.signIn.bind(this)} classNames={`${this.props.classNames} mr-20`} />);
    }
}
