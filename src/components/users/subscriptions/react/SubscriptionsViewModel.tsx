import * as React from "react";

export class SubscriptionsViewModel extends React.Component{
    public state: any;

    constructor(props) {
        super(props);

        this.state = {
            isRedesignEnabled: props.isRedesignEnabled,
            classNames: props.styles
        };
    }

    public render(): JSX.Element {
        return this.state.isRedesignEnabled
            ? <fui-subscriptions-runtime props={JSON.stringify(this.state)} ></fui-subscriptions-runtime>
            : <subscriptions-runtime params={JSON.stringify(this.state)}></subscriptions-runtime>;
    }
}