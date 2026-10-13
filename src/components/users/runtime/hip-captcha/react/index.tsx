import * as React from "react";
import { Spinner } from "@fluentui/react-components";
import { LegacyCaptcha, TCaptchaProps } from "./LegacyCaptcha";
import { NewCaptcha } from "./NewCaptcha";
import { PowCaptcha } from "./PowCaptcha";

type HipCaptchaState = {
    skipCaptcha: boolean;
    isNewCaptcha: boolean;
    isLegacyCaptcha: boolean;
    isPowCaptcha: boolean;
    working: boolean;
};

export class HipCaptcha extends React.Component<TCaptchaProps, HipCaptchaState> {
    constructor(props: TCaptchaProps) {
        super(props);

        this.state = {
            skipCaptcha: false,
            isNewCaptcha: false,
            isLegacyCaptcha: false,
            isPowCaptcha: false,
            working: true,
        };
    }

    async componentDidMount() {
        try {
            const settings = await this.props.backendService.getCaptchaSettings();
            this.setState({
                skipCaptcha: settings?.skipCaptcha ?? false,
                isNewCaptcha: settings?.captchaEnabled,
                isLegacyCaptcha: settings?.legacyCaptchaEnabled,
                isPowCaptcha: settings?.powEnabled
            });
        } catch {
            // do nothing
        } finally {
            this.setState({ working: false });
        }
    }

    render() {
        return this.state.working ? (
            <Spinner />
        ) : this.state.skipCaptcha ? (
            <></>
        ) : this.state.isPowCaptcha ? (
            <PowCaptcha
                backendService={this.props.backendService}
                onInitComplete={this.props.onInitComplete}
            />
        ) : this.state.isNewCaptcha ? (
            <NewCaptcha
                backendService={this.props.backendService}
                onInitComplete={this.props.onInitComplete}
            />
        ) : this.state.isLegacyCaptcha ? (
            <LegacyCaptcha
                backendService={this.props.backendService}
                onInitComplete={this.props.onInitComplete}
            />
        ) : ( // Do not load Captcha component if captcha endpoints are not available
            <></>
        );
    }
}
