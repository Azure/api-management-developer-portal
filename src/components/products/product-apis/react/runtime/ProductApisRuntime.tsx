import * as React from "react";
import { ApiListProps, ApiListRuntime } from "../../../../apis/list-of-apis/react/runtime/ApiListRuntime";
import { Resolve } from "@paperbits/react/decorators";
import { RouteHelper } from "../../../../../routing/routeHelper";

export class ProductApisRuntime extends React.Component<ApiListProps> {
    @Resolve("routeHelper")
    public routeHelper: RouteHelper;

    render() {
        return <ApiListRuntime {...this.props} productName={this.routeHelper.getProductName()} />;
    }
}
