import * as React from "react";
import { StyleModel } from "@paperbits/common/styles";


interface ComponentProps {
    isRedesignEnabled: boolean;
    styles: StyleModel,
    layout: string,
    layoutDefault: string,
    allowSelection: boolean,
    allowViewSwitching: boolean,
    detailsPageUrl: string
}

interface ComponentState extends ComponentProps { }

export class ProductListViewModel extends React.Component<ComponentProps, ComponentState> {
    constructor(props) {
        super(props);

        this.state = { ...props };
    }

    public render(): JSX.Element {
        const data = JSON.stringify(this.state);

        return this.state.isRedesignEnabled
            ? <fui-product-list-runtime key={data} props={data} ></fui-product-list-runtime>
            : this.state.layout === 'tiles'
                ? <product-list-tiles-runtime params={data}></product-list-tiles-runtime>
                : this.state.layout === 'dropdown'
                    ? <product-list-dropdown-runtime params={data}></product-list-dropdown-runtime>
                    : <product-list-runtime params={data}></product-list-runtime>;
    }
}