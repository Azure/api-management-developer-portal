import * as React from "react";

export class ChangePasswordViewModel extends React.Component{
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
            ? <fui-change-password props={JSON.stringify(this.state)} ></fui-change-password>
            : <change-password-runtime params={JSON.stringify(this.state)}></change-password-runtime>;
    }
}