import * as React from "react";
import { Resolve } from "@paperbits/react/decorators";
import { Router } from "@paperbits/common/routing";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { ApiListProps, ApiListRuntime } from "../../../../apis/list-of-apis/react/runtime/ApiListRuntime";

export class ProductApisRuntime extends React.Component<ApiListProps, { productName: string }> {
    @Resolve("routeHelper")
    public routeHelper: RouteHelper;

    @Resolve("router")
    public router: Router;

    constructor(props: ApiListProps) {
        super(props);

        this.state = { productName: undefined };
    }

    public componentDidMount() {
        this.router.addRouteChangeListener(() => this.setState({ productName: this.routeHelper.getProductName() }));
    }

    render() {
        return <ApiListRuntime {...this.props} productName={this.state.productName} />;
    }
}
