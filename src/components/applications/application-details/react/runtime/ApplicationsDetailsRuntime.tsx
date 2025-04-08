import * as React from "react";
import { FluentProvider } from "@fluentui/react-components";
import { Resolve } from "@paperbits/react/decorators";
import { fuiTheme } from "../../../../../constants";
import { Product } from "../../../../../models/product";
import { ProductService } from "../../../../../services/productService";
import { ApiService } from "../../../../../services/apiService";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { TLayout } from "../../../../utils/react/TableListInfo";
import { ScrollableTableContainer } from "../../../../utils/react/ScrollableTableContainer";
// import { ApplicationsTableCards } from "./ApplicationsTableCards";

export const application = {
    id: "1",
    name: "application",
    displayName: "Application",
    description: "Description of the application",
    clientId: 'ClientIDname',
    owner: 'Jelena Sorohova',
}

const products = [
    {
        id: "1",
        name: "product-1",
        displayName: "Product 1",
        description: "Description of the product 1",
        applicationId: '1',
        approvalStatus: 'approved',
        credentialTypes: "Oauth and API key",
        redirectUri: "api://c370ca8c-a8ad-4505-b28c-adf0624a42ab",
        audience: "Audience info",
        role: "Servoce.product name"
    },
    {
        id: "2",
        name: "product-2",
        displayName: "Product 2",
        description: "Description of the product 2",
        applicationId: '1',
        approvalStatus: 'approved',
        credentialTypes: "Oauth and API key",
        redirectUri: "api://c370ca8c-a8ad-4505-b28c-adf0624a42ab",
        audience: "Audience info",
        role: "Servoce.product name"
    },
    {
        id: "3",
        name: "product-3",
        displayName: "Product 3",
        description: "Description of the product 3",
        applicationId: '1',
        approvalStatus: 'approved',
        credentialTypes: "Oauth and API key",
        redirectUri: "api://c370ca8c-a8ad-4505-b28c-adf0624a42ab",
        audience: "Audience info",
        role: "Servoce.product name"
    },
];

export interface ProductsListProps {
    allowSelection?: boolean;
    allowViewSwitching?: boolean;
    detailsPageUrl: string;
    layoutDefault: TLayout;
}

interface ProductsListState {
    working: boolean;
    selectedProduct?: Product | null;
}

export type TProductListRuntimeFCProps = Omit<ProductsListProps, "detailsPageUrl"> & {
    getReferenceUrl: (productName: string) => string;
    productService?: ProductService;
    apiService?: ApiService;
    apiName?: string;
    selectedProduct?: Product | null;
    isApiProducts?: boolean;
};

export class ApplicationsDetailsRuntime extends React.Component<ProductsListProps, ProductsListState> {
    @Resolve("productService")
    public productService: ProductService;

    @Resolve("routeHelper")
    public routeHelper: RouteHelper;

    constructor(props) {
        super(props);

        this.state = {
            working: false,
            selectedProduct: undefined,
        };
    }

    public componentDidMount() {
        this.loadSelectedProduct();
    }

    async loadSelectedProduct() {
        const productName = this.routeHelper.getProductName();
        if (!productName) {
            this.setState({ selectedProduct: null });
            return;
        }

        this.setState({ working: true, selectedProduct: undefined });

        return this.productService
            .getProduct(`products/${productName}`)
            .then((selectedProduct) => this.setState({ selectedProduct }))
            .finally(() => this.setState({ working: false }));
    }

    getReferenceUrl(productName: string): string {
        return this.routeHelper.getProductReferenceUrl(productName, this.props.detailsPageUrl);
    }

    render() {
        return (
            <FluentProvider theme={fuiTheme}>
                <h1>{application.displayName}</h1>
                <span className="caption-1">Application</span>
                <h3>Application</h3>
                <ScrollableTableContainer>
                    <table className={"fui-table"} aria-label={"Application details table"}>
                        <thead>
                            <tr className={"fui-table-headerRow"}>
                                <th><span className="strong">Client ID</span></th>
                                <th><span className="strong">Client Secret</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr key={application.id}>
                                <td>{application.clientId}</td>
                                <td>
                                    EH***************************** {/* TODO! */}
                                    <button onClick={() => { /* TODO! */ }} className="button">+ New client secret</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </ScrollableTableContainer>
                <h3>Products</h3>
                <ScrollableTableContainer>
                    <table className={"fui-table"} aria-label={"Application's products table"}>
                        <thead>
                            <tr className={"fui-table-headerRow"}>
                                <th><span className="strong">Product name</span></th>
                                <th><span className="strong">Product application ID</span></th>
                                <th><span className="strong">Approval status</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {products?.length > 0
                                ? products.map((product) => (
                                    <tr key={product.id}>
                                        <td>
                                            <a href={this.getReferenceUrl(product.name)} title={product.displayName}>
                                                {product.displayName}
                                            </a>
                                            <div>
                                                
                                            </div>
                                        </td>
                                        <td>{product.applicationId}</td>
                                        <td>{product.approvalStatus}</td>
                                    </tr>
                                ))
                                : <tr><td colSpan={3}>No products to display</td></tr>
                            }
                        </tbody>
                    </table>
                </ScrollableTableContainer>
            </FluentProvider>
        );
    }
}
