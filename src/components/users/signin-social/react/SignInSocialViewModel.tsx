import * as React from "react";
import { StyleModel } from "@paperbits/common/styles";
import { SecurityModel } from "@paperbits/common/security";


interface ComponentProps {
    isRedesignEnabled: boolean;
        styles: StyleModel;
        security: SecurityModel;
        aadConfig: string;
        aadB2CConfig: string;
        mode: string;
}

interface ComponentState extends ComponentProps { }

export class SignInSocialViewModel extends React.Component<ComponentProps, ComponentState> {
    constructor(props) {
        super(props);

        this.state = {
            isRedesignEnabled: props.isRedesignEnabled,
            styles: props.styles,
            security: props.security,
            aadConfig: props.aadConfig,
            aadB2CConfig: props.aadB2CConfig,
            mode: props.mode
        };
    }

    public render(): JSX.Element {
        if (!this.state.aadB2CConfig && !this.state.aadConfig && this.state.mode !== "publishing") {
            return
            <placeholder-content>
                <div className="not-configured">This widget will display a sign-up form when you configure <a
                    href="https://aka.ms/apim-how-to-aad" target="_blank">Microsoft Entra ID</a> or <a
                        href="https://aka.ms/apim-how-to-aadb2c" target="_blank">Azure Active Directory B2C</a> integration in your API
                    Management service. This message appears only in the portal's administrative mode and the widget will be rendered as
                    an empty space in the published portal, so you don't need to remove it.
                </div>
            </placeholder-content>;
        }

        const aadConfig = JSON.stringify(this.state.aadConfig);
        const aadB2CConfig = JSON.stringify(this.state.aadB2CConfig);
        const containerStyle = {display: "flex"};

        if (this.state.isRedesignEnabled) {
            return <div style={containerStyle}>
                {this.state.aadConfig && <fui-signin-aad-runtime key={aadConfig} props={aadConfig}></fui-signin-aad-runtime>}
                {this.state.aadB2CConfig && <fui-signin-aadb2c-runtime key={aadB2CConfig} props={aadB2CConfig}></fui-signin-aadb2c-runtime>}
            </div>;
        }
        return <div style={containerStyle}>
                {this.state.aadConfig && <signin-aad params={aadConfig}></signin-aad>}
                {this.state.aadB2CConfig && <signin-aad-b2c params={aadB2CConfig}></signin-aad-b2c>}
            </div>;
    }
}