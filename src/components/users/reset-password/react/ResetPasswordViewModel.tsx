import * as React from "react";

export class ResetPasswordViewModel extends React.Component<any, any> {
    constructor(props) {
        super(props);

        this.state = {
            isRedesignEnabled: props.isRedesignEnabled,
            classNames: props.styles,
            requireHipCaptcha: props.requireHipCaptcha
        };
    }

    public render(): JSX.Element {
        const data = JSON.stringify(this.state);
        
        return this.state.isRedesignEnabled
            ? <fui-reset-password key={data} props={data} ></fui-reset-password>
            : <reset-password-runtime params={data}></reset-password-runtime>;
    }
}