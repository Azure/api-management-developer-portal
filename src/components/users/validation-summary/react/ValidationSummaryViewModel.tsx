import * as React from "react";

export class ValidationSummaryViewModel extends React.Component {
    public state: any;

    constructor(props) {
        super(props);

        this.state = {
            isRedesignEnabled: props.isRedesignEnabled,
            classNames: props.styles,
        };
    }

    public render(): JSX.Element {
        return this.state.isRedesignEnabled ?
            <fui-validation-summary props={JSON.stringify(this.state)}></fui-validation-summary> :
            <validation-summary params={JSON.stringify(this.state)}></validation-summary>;
    }
}
