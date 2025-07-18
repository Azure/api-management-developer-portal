import * as React from "react";
import { StyleModel } from "@paperbits/common/styles";


interface ComponentProps {
    isRedesignEnabled: boolean;
    styles: StyleModel
}

interface ComponentState extends ComponentProps { }

export class ProductDetailsViewModel extends React.Component<ComponentProps, ComponentState> {
    constructor(props) {
        super(props);

        this.state = { ...props };
    }

    public render(): JSX.Element {
        const data = JSON.stringify(this.state);

        return this.state.isRedesignEnabled
            ? <fui-product-details-runtime props={data} ></fui-product-details-runtime>
            : <product-details-runtime params={data}></product-details-runtime>;
    }
}