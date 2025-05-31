import * as React from "react";
import { FluentProvider } from "@fluentui/react-components";
import { Resolve } from "@paperbits/react/decorators";
import { Router } from "@paperbits/common/routing";
import { ApiService } from "../../../../../services/apiService";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { fuiTheme } from "../../../../../constants";
import { TLayout } from "../../../../utils/react/TableListInfo";
import { ProductsDropdown } from "../../../../products/product-list/react/runtime/ProductsDropdown";
import { ProductsTableCards } from "../../../../products/product-list/react/runtime/ProductsTableCards";

interface ApiProductsProps {
    allowViewSwitching?: boolean;
    detailsPageUrl: string;
    layoutDefault: TLayout;
}

interface ApiProductsState {
    apiName: string
}

export class ApiProductsRuntime extends React.Component<ApiProductsProps, ApiProductsState> {
    @Resolve("apiService")
    public declare apiService: ApiService;

    @Resolve("routeHelper")
    public declare routeHelper: RouteHelper;

    @Resolve("router")
    public declare router: Router;

    constructor(props: ApiProductsProps) {
        super(props);

        this.state = {
            apiName: null
        }
    }

    componentDidMount(): void {
        this.getApi();
        this.router.addRouteChangeListener(() => this.getApi());
    }

    componentWillUnmount(): void {
        this.router.removeRouteChangeListener(() => this.getApi());
    }

    getApi = (): void => {
        const apiName = this.routeHelper.getApiName();

        if (apiName && apiName !== this.state.apiName) {
            this.setState({ apiName });
        }
    }

    getReferenceUrl(productName: string): string {
        return this.routeHelper.getProductReferenceUrl(productName, this.props.detailsPageUrl);
    }

    render() {
        return (
            <FluentProvider theme={fuiTheme}>
                {this.props.layoutDefault == TLayout.dropdown
                    ? <ProductsDropdown
                        {...this.props}
                        apiService={this.apiService}
                        apiName={this.state.apiName}
                        getReferenceUrl={(productName) => this.getReferenceUrl(productName)}
                        isApiProducts
                    />
                    : <ProductsTableCards
                        {...this.props}
                        apiService={this.apiService}
                        apiName={this.state.apiName}
                        getReferenceUrl={(productName) => this.getReferenceUrl(productName)}
                        isApiProducts
                    />
                }
            </FluentProvider>
        );
    }
}
