import * as React from "react";
import { StyleModel } from "@paperbits/common/styles";


interface ComponentState {
    isRedesignEnabled: boolean;
    styles: StyleModel;
    showTermsByDefault: boolean;
}

interface ComponentProps extends ComponentState { }

export class ProductSubscribeViewModel extends React.Component<ComponentProps, ComponentState> {
    constructor(props: ComponentProps) {
        super(props);
        this.state = { ...props };
    }

    public render(): JSX.Element {
        const data = JSON.stringify(this.state);

        return this.state.isRedesignEnabled
            ? <fui-product-subscribe-runtime key={data} props={data} ></fui-product-subscribe-runtime>
            : <product-subscribe-runtime params={data}></product-subscribe-runtime>;
    }
}