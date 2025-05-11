import * as React from "react";

export class ConfirmPasswordViewModel extends React.Component<any, any> {
    constructor(props) {
        super(props);

        this.state = {
            isRedesignEnabled: props.isRedesignEnabled,
            classNames: props.styles
        };
    }

    public render(): JSX.Element {
        return this.state.isRedesignEnabled
            ? <fui-confirm-password props={JSON.stringify(this.state)} ></fui-confirm-password>
            : <confirm-password params={JSON.stringify(this.state)}></confirm-password>;
    }
}