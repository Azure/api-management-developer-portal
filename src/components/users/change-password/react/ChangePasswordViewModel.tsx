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
        const data = JSON.stringify(this.state);
        
        return this.state.isRedesignEnabled
            ? <fui-change-password key={data} props={data} ></fui-change-password>
            : <change-password-runtime params={data}></change-password-runtime>;
    }
}