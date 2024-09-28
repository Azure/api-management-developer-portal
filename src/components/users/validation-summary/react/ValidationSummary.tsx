import * as React from "react";

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
        const renderContent = () => {
            return this.state.isRedesignEnabled
                ? `<fui-validation-summary></fui-validation-summary><p>Initial count: ${this.state.initialCount}</p>`
                : `<validation-summary></validation-summary><p>Initial count: ${this.state.initialCount}</p>`;
        };

        return (
            <div
                className={this.state.classNames}
                dangerouslySetInnerHTML={{ __html: renderContent() }}
            ></div>
        );
    }
}
