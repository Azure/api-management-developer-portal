import * as React from "react";
import { StyleModel } from "@paperbits/common/styles";


interface ComponentProps {
    isRedesignEnabled: boolean;
    styles: StyleModel,
    layout: string,
    layoutDefault: string,
    allowSelection: boolean,
    allowViewSwitching: boolean,
    filtersPosition: string,
    showApiType: boolean,
    defaultGroupByTagToEnabled: boolean,
    detailsPageUrl: string,
    detailsPageTarget: string
}

interface ComponentState extends ComponentProps { }

export class ProductApisViewModel extends React.Component<ComponentProps, ComponentState> {
    constructor(props: ComponentProps) {
        super(props);

        this.state = { ...props };
    }

    public render(): JSX.Element {
        const data = JSON.stringify(this.state);

        return this.state.isRedesignEnabled
            ? <fui-product-apis-runtime key={data} props={data} ></fui-product-apis-runtime>
            : this.state.layout === 'tiles'
                ? <product-apis-tiles-runtime params={data}></product-apis-tiles-runtime>
                : <product-apis-runtime params={data}></product-apis-runtime>;
    }
}