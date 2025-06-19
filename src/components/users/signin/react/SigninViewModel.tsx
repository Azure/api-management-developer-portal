import * as React from "react";

export class SigninViewModel extends React.Component<any, any> {
    constructor(props) {
        super(props);

        this.state = {
            runtimeConfig: props.runtimeConfig,
            styles: props.styles,
            isRedesignEnabled: props.isRedesignEnabled
        };
    }

    public render(): JSX.Element {
        return this.state.isRedesignEnabled
            ? <fui-signin-runtime props={JSON.stringify(this.state.runtimeConfig)}></fui-signin-runtime>
            : <signin-runtime params={JSON.stringify(this.state.runtimeConfig)}></signin-runtime>;
    }
}