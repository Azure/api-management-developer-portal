import * as React from "react";
import { StyleModel } from "@paperbits/common/styles";


interface ComponentProps {
    isRedesignEnabled: boolean;
    styles: StyleModel
}

interface ComponentState extends ComponentProps { }

export class ProductSubscriptionsViewModel extends React.Component<ComponentProps, ComponentState> {
    constructor(props: ComponentProps) {
        super(props);

        this.state = { ...props };
    }

    public render(): JSX.Element {
        const data = JSON.stringify(this.state);

        return this.state.isRedesignEnabled
            ? <fui-product-subscriptions-runtime props={data} ></fui-product-subscriptions-runtime>
            : <product-subscriptions-runtime params={data}></product-subscriptions-runtime>;
    }
}