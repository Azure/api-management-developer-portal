import * as React from "react";

// design time
export class SignUpViewModel extends React.Component {
    public state: any;

    constructor(props) {
        super(props);

        this.state = {
            isRedesignEnabled: props.isRedesignEnabled,
            classNames: props.classNames,
            termsOfUse: props.termsOfUse,
            isConsentRequired: props.isConsentRequired,
            termsEnabled: props.termsEnabled,
            requireHipCaptcha: props.requireHipCaptcha
        };
    }

    public render(): JSX.Element {
        const renderContent = () => {
            return this.state.isRedesignEnabled
                ? `<fui-signup-runtime props=${JSON.stringify(this.state)} ></fui-signup-runtime>`
                : `<signup-runtime params=${JSON.stringify(this.state)}></signup-runtime>`;
        };

        return (
            <div dangerouslySetInnerHTML={{ __html: renderContent() }}></div>
        );
    }
}
