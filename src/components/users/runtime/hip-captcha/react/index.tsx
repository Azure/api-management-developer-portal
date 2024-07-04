import * as React from "react";
import { Spinner } from "@fluentui/react-components";
import { LegacyCaptcha, TCaptchaProps } from "./LegacyCaptcha";
import { NewCaptcha } from "./NewCaptcha";

type HipCaptchaState = {
    isNewCaptcha: boolean;
    isLegacyCaptcha: boolean;
    working: boolean;
};

export class HipCaptcha extends React.Component<TCaptchaProps, HipCaptchaState> {
    constructor(props: TCaptchaProps) {
        super(props);

        this.state = {
            isNewCaptcha: false,
            isLegacyCaptcha: false,
            working: true,
        };
    }

    async componentDidMount() {
        let isNewCaptcha = false;
        let isLegacyCaptcha = false;

        try {
            const settings = await this.props.backendService.getCaptchaSettings();
            isNewCaptcha = settings?.captchaEnabled;
            isLegacyCaptcha = settings?.legacyCaptchaEnabled;
        } catch {
            // do nothing
        } finally {
            this.setState({ isNewCaptcha, isLegacyCaptcha, working: false });
        }
    }

    render() {
        return this.state.working ? (
            <Spinner />
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
