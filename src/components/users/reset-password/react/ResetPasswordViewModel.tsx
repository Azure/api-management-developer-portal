import * as React from "react";

export class ResetPasswordViewModel extends React.Component{
    public state: any;

    constructor(props) {
        super(props);

        this.state = {
            isRedesignEnabled: props.isRedesignEnabled,
            classNames: props.styles,
            requireHipCaptcha: props.requireHipCaptcha
        };
    }

    public render(): JSX.Element {
        return this.state.isRedesignEnabled
            ? <fui-reset-password props={JSON.stringify(this.state)} ></fui-reset-password>
            : <reset-password-runtime params={JSON.stringify(this.state)}></reset-password-runtime>;
    }
}