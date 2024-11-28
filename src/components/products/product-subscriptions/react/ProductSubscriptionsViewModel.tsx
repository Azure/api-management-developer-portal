import * as React from "react";
import { StyleModel } from "@paperbits/common/styles";

export class ProductSubscriptionsViewModel extends React.Component {
    public state: {
        isRedesignEnabled: boolean;
        styles: StyleModel
    };

    constructor(props) {
        super(props);

        this.state = {...props};
    }

    public render(): JSX.Element {
        const data = JSON.stringify(this.state);

        return this.state.isRedesignEnabled
            ? <fui-product-subscriptions-runtime props={data} ></fui-product-subscriptions-runtime>
            : <product-subscriptions-runtime params={data}></product-subscriptions-runtime>;
        }
}