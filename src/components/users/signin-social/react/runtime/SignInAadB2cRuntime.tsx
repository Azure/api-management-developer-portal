import * as React from "react";
import { Resolve } from "@paperbits/react/decorators";
import { EventManager } from "@paperbits/common/events";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { Logger } from "@paperbits/common/logging";
import { AadService, AadServiceV2, IAadService } from "../../../../../services";
import { ErrorSources } from "../../../validation-summary/constants";
import { eventTypes } from "../../../../../logging/clientLogger";
import { AadClientLibrary, SettingNames } from "../../../../../constants";
import { dispatchErrors, parseAndDispatchError } from "../../../validation-summary/utils";
import { AadB2CClientConfig } from "../../../../../contracts/aadB2CClientConfig";
import { aadb2cResetPasswordErrorCode } from "../../../../../constants";
import { BtnSpinner } from "../../../../utils/react/BtnSpinner";

type SignInAadB2cRuntimeProps = {
    label: string,
    replyUrl: string,
    classNames: string
};
type SignInAadB2cRuntimeFCProps = SignInAadB2cRuntimeProps & {
    signIn: () => Promise<void>
};

const SignInAadB2cRuntimeFC = ({ label, signIn, classNames }: SignInAadB2cRuntimeFCProps) => {
    return (
        <BtnSpinner onClick={signIn} className={classNames}>
            <i className="icon-emb icon-svg-entraId"></i>
            {label}
        </BtnSpinner>
    );
};

export class SignInAadB2cRuntime extends React.Component<SignInAadB2cRuntimeProps> {
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
    private aadConfig: AadB2CClientConfig;

    componentDidMount() {
        this.init()
    }

    async init(): Promise<void> {
        this.aadConfig = await this.settingsProvider.getSetting<AadB2CClientConfig>(SettingNames.aadB2CClientConfig);

        if (this.aadConfig) {
            if (this.aadConfig.clientLibrary === AadClientLibrary.v2) {
                this.selectedService = this.aadServiceV2;
            } else {
                this.selectedService = this.aadService;
            }

            await this.selectedService.checkCallbacks();
        } else {
            this.logger.trackEvent(eventTypes.aadB2CLogin, { message: "AAD B2C client configuration is missing." });
        }

        this.logger.trackEvent(eventTypes.aadB2CLogin, { message: "Signin AAD B2C component initialized." });
    }

    async signIn(): Promise<void> {
        this.logger.trackEvent(eventTypes.aadB2CLogin, { message: "Login initiated." });
        this.cleanValidationErrors();

        if (!this.aadConfig) {
            this.logger.trackEvent(eventTypes.aadB2CLogin, { message: "AAD B2C client configuration is missing." })
            return;
        }

        try {
            await this.selectedService.runAadB2CUserFlow(
                this.aadConfig.clientId,
                this.aadConfig.authority,
                this.aadConfig.signinTenant,
                this.aadConfig.signinPolicyName,
                this.props.replyUrl,
            );
        } catch (error) {
            if (this.aadConfig.passwordResetPolicyName && error.message.includes(aadb2cResetPasswordErrorCode)) { // Reset password requested
                try {
                    await this.selectedService.runAadB2CUserFlow(this.aadConfig.clientId, this.aadConfig.authority, this.aadConfig.signinTenant, this.aadConfig.passwordResetPolicyName);
                    return;
                } catch (resetPasswordError) {
                    error = resetPasswordError;
                }
            }

            parseAndDispatchError(this.eventManager, ErrorSources.signInOAuth, error, this.logger);
        }
    }

    private cleanValidationErrors(): void {
        dispatchErrors(this.eventManager, ErrorSources.signInOAuth, []);
    }

    render() {
        return (
                <SignInAadB2cRuntimeFC
                    {...this.props}
                    signIn={this.signIn.bind(this)}
                />
        );
    }
}
