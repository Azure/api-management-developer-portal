import * as React from "react";

export class SignUpSocialViewModel extends React.Component {
    public state: any;

    constructor(props) {
        super(props);

        this.state = {
            isRedesignEnabled: props.isRedesignEnabled,
            styles: props.styles,
            identityProvider: props.identityProvider,
            mode: props.mode,
            termsOfUse: props.termsOfUse,
            termsEnabled: props.termsEnabled,
            isConsentRequired: props.isConsentRequired
        };
    }

    public render(): JSX.Element {
        if (!this.state.identityProvider) {
            if (this.state.mode !== "publishing") {
                return <placeholder-content>
                    <div className="not-configured">This widget will display a sign-up form when you configure <a
                    href="https://aka.ms/apim-how-to-aad" target="_blank">Azure Active Directory</a> or <a
                    href="https://aka.ms/apim-how-to-aadb2c" target="_blank">Azure Active Directory B2C</a> integration in your API
                    Management service. This message appears only in the portal's administrative mode and the widget will be rendered as
                    an empty space in the published portal, so you don't need to remove it.
                </div>
                </placeholder-content>;
            }
        }
        return this.state.isRedesignEnabled
            ? <fui-signup-aad-runtime props={JSON.stringify(this.state)}></fui-signup-aad-runtime>
            : <signup-social-runtime params={JSON.stringify(this.state)}></signup-social-runtime>;
    }
}