import * as React from "react";

export class SignUpViewModel extends React.Component {
    public state: any;

    constructor(props) {
        super(props);

        this.state = {
            isRedesignEnabled: props.isRedesignEnabled,
            classNames: props.styles,
            termsOfUse: props.termsOfUse,
            isConsentRequired: props.isConsentRequired,
            termsEnabled: props.termsEnabled,
            requireHipCaptcha: props.requireHipCaptcha
        };
    }

    public render(): JSX.Element {
        const data = JSON.stringify(this.state);

        return this.state.isRedesignEnabled
            ? <fui-signup-runtime key={data} props={data} ></fui-signup-runtime>
            : <signup-runtime params={JSON.stringify(this.state)}></signup-runtime>;
    }
}
