import * as React from "react";

export class ApiProductsViewModel extends React.Component {
    public state: {
        isRedesignEnabled: boolean;
        layout: string,
        layoutDefault: string,
        detailsPageUrl: string,
    };

    constructor(props) {
        super(props);

        this.state = {...props};
    }

    public render(): JSX.Element {
        const data = JSON.stringify(this.state);

        return this.state.isRedesignEnabled
            ? <fui-api-products-runtime key={data} props={data} ></fui-api-products-runtime>
            : this.state.layout === 'tiles'
                ? <api-products-tiles-runtime params={data}></api-products-tiles-runtime>
                    : this.state.layout === 'dropdown'
                        ? <api-products-dropdown-runtime params={data}></api-products-dropdown-runtime>
                        : <api-products-runtime params={data}></api-products-runtime>;
        }
}