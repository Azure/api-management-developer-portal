import * as React from "react";
import { useState } from "react";
import { Button, FluentProvider, Spinner } from "@fluentui/react-components";
import { Resolve } from "@paperbits/react/decorators";
import { EventManager } from "@paperbits/common/events";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { Logger } from "@paperbits/common/logging";
import * as Constants from "../../../../constants";
import { AadService, AadServiceV2, IAadService } from "../../../../services";
import { ErrorSources } from "../../validation-summary/constants";
import { eventTypes } from "../../../../logging/clientLogger";
import { AadClientConfig } from "../../../../contracts/aadClientConfig";
import { AadClientLibrary, defaultAadTenantName, SettingNames } from "../../../../constants";
import { dispatchErrors, parseAndDispatchError } from "../../validation-summary/utils";
import { BtnSpinner } from "../../../BtnSpinner";

type SignInAadRuntimeProps = {
    label: string
    replyUrl: string
}
type SignInAadRuntimeFCProps = SignInAadRuntimeProps & {
    signIn: () => Promise<void>
};

const ProductSubscribeRuntimeFC = ({ label, signIn }: SignInAadRuntimeFCProps) => {
    return (
        <BtnSpinner onClick={signIn}>
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

    public async signIn(): Promise<void> {
        dispatchErrors(this.eventManager, ErrorSources.signInOAuth, []);
        this.logger.trackEvent(eventTypes.aadLogin, { message: "Initiating AAD login" });

        try {
            const config = await this.settingsProvider.getSetting<AadClientConfig>(SettingNames.aadClientConfig);

            if (config) {
                if (config.clientLibrary === AadClientLibrary.v2) {
                    this.selectedService = this.aadServiceV2;
                }
                else {
                    this.selectedService = this.aadService;
                }

                await this.selectedService.signInWithAad(config.clientId, config.authority, config.signinTenant || defaultAadTenantName, this.props.replyUrl);
            } else {
                this.logger.trackEvent(eventTypes.aadLogin, { message: "AAD client config is not set" });
            }
        } catch (error) {
            parseAndDispatchError(this.eventManager, ErrorSources.signInOAuth, error, this.logger);
        }
    }

    render() {
        return (
            <FluentProvider theme={Constants.fuiTheme} style={{ display: "inline" }}>
                <ProductSubscribeRuntimeFC
                    {...this.props}
                    signIn={this.signIn.bind(this)}
                />
            </FluentProvider>
        );
    }
}
