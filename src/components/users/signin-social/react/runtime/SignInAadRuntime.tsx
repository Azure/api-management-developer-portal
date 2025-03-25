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
    replyUrl: string,
    classNames: string
}
type SignInAadRuntimeFCProps = SignInAadRuntimeProps & {
    signIn: () => Promise<void>
};

const SignInAadRuntimeFC = ({ label, signIn, classNames }: SignInAadRuntimeFCProps) => {
    return (
        <BtnSpinner onClick={signIn} className={classNames}>
            <i className="icon-emb icon-svg-entraId"></i>
            {label}
        </BtnSpinner>
    );
};

export class SignInAadRuntime extends React.Component<SignInAadRuntimeProps> {
    @Resolve("aadService")
    public aadService: AadService;

    @Resolve("aadServiceV2")
    public aadServiceV2: AadServiceV2;

    @Resolve("eventManager")
    public eventManager: EventManager;

    @Resolve("settingsProvider")
    public settingsProvider: ISettingsProvider;

    @Resolve("logger")
    public logger: Logger;

    private selectedService: IAadService;
    private aadConfig: AadClientConfig;

    public async signIn(): Promise<void> {
        dispatchErrors(this.eventManager, ErrorSources.signInOAuth, []);
        this.logger.trackEvent(eventTypes.aadLogin, { message: "Initiating AAD login" });

        try {
            this.aadConfig  = await this.settingsProvider.getSetting<AadClientConfig>(SettingNames.aadClientConfig);

            if (this.aadConfig ) {
                if (this.aadConfig .clientLibrary === AadClientLibrary.v2) {
                    this.selectedService = this.aadServiceV2;
                }
                else {
                    this.selectedService = this.aadService;
                }

                await this.selectedService.signInWithAad(this.aadConfig .clientId, this.aadConfig .authority, this.aadConfig .signinTenant || defaultAadTenantName, this.props.replyUrl);
            } else {
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
