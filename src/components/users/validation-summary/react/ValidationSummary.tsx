import * as React from "react";

declare global {
    namespace JSX {
        interface IntrinsicElements {
            "fui-validation-summary": any;
            "validation-summary": any;
        }
    }
}

export class ValidationSummary extends React.Component {
    public state: any;

    constructor(props) {
        super(props);

        this.state = {
            isRedesignEnabled: props.isRedesignEnabled,
            classNames: props.classNames,
        };
    }

    public render(): JSX.Element {
        if (this.state.isRedesignEnabled) {
            return <fui-validation-summary className="abc" class="cds"></fui-validation-summary>;
        }
        return <validation-summary></validation-summary>;
    }
}
