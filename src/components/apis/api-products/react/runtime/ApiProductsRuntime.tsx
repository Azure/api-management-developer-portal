import * as React from "react";
import { useEffect, useState } from "react";
import { Stack } from "@fluentui/react";
import { FluentProvider, Spinner } from "@fluentui/react-components";
import { Resolve } from "@paperbits/react/decorators";
import { ApiService } from "../../../../../services/apiService";
import { SearchQuery } from "../../../../../contracts/searchQuery";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { Pagination } from "../../../../utils/react/Pagination";
import { ProductsDropdown } from "../../../../products/product-list/react/runtime/ProductsDropdown";
import { ProductsTable } from "../../../../products/product-list/react/runtime/ProductsTable";
import { ProductsCards } from "../../../../products/product-list/react/runtime/ProductsCards";
import { TProductsData } from "../../../../products/product-list/react/runtime/utils";
import { TableListInfo, TLayout } from "../../../../utils/react/TableListInfo";
import { defaultPageSize, fuiTheme } from "../../../../../constants";
import { Router } from "@paperbits/common/routing";

interface ApiProductsProps {
    allowSelection?: boolean;
    allowViewSwitching?: boolean;
    detailsPageUrl: string;
    layoutDefault: TLayout;
}

interface ApiProductsState {
    apiName: string
}

const loadProducts = async (apiService: ApiService, apiName: string, query: SearchQuery) => {
    let products: TProductsData;

    try {
        products = await apiService.getApiProductsPage(apiName, query);
    } catch (error) {
        throw new Error(`Unable to load Products. Error: ${error.message}`);
    }

    return products;
}

export type TApiProductsRuntimeFCProps = Omit<ApiProductsProps, "detailsPageUrl"> & {
    apiService: ApiService;
    apiName: string;
    getReferenceUrl: (productName: string) => string;
};

const ApiProductsRuntimeFC = ({ apiService, apiName, getReferenceUrl, layoutDefault, allowViewSwitching }: TApiProductsRuntimeFCProps) => {
    const [working, setWorking] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [products, setProducts] = useState<TProductsData>();
    const [layout, setLayout] = useState<TLayout>(layoutDefault ?? TLayout.table);
    const [pattern, setPattern] = useState<string>();

    /**
     * Loads page of Products.
     */
    useEffect(() => {
        if (apiName) {
            const query: SearchQuery = {
                pattern,
                skip: (pageNumber - 1) * defaultPageSize,
                take: defaultPageSize,
            };

            setWorking(true);
            loadProducts(apiService, apiName, query)
                .then((products) => setProducts(products))
                .finally(() => setWorking(false));
        }
    }, [apiService, apiName, pageNumber, pattern]);

    return layout === TLayout.dropdown ? (
        <ProductsDropdown
            getReferenceUrl={getReferenceUrl}
            working={working}
            products={products}
            statePageNumber={[pageNumber, setPageNumber]}
            statePattern={[pattern, setPattern]}
        />
    ) : (
        <Stack tokens={{ childrenGap: "1rem" }}>
            <Stack.Item>
                <TableListInfo
                    layout={layout}
                    setLayout={setLayout}
                    pattern={pattern}
                    setPattern={setPattern}
                    allowViewSwitching={allowViewSwitching}
                />
            </Stack.Item>

            {working || !products ? (
                <Stack.Item>
                    <div className="table-body">
                        <Spinner label="Loading products..." labelPosition="below" size="small" />
                    </div>
                </Stack.Item>
            ) : (
                <>
                    <Stack.Item style={{ marginTop: "2rem" }}>
                        {layout === TLayout.table ? (
                            <ProductsTable products={products} getReferenceUrl={getReferenceUrl} />
                        ) : (
                            <ProductsCards products={products} getReferenceUrl={getReferenceUrl} />
                        )}
                    </Stack.Item>

                    <Stack.Item align={"center"}>
                        <Pagination pageNumber={pageNumber} setPageNumber={setPageNumber} pageMax={Math.ceil(products?.count / defaultPageSize)} />
                    </Stack.Item>
                </>
            )}
        </Stack>
    );
};

export class ApiProductsRuntime extends React.Component<ApiProductsProps, ApiProductsState> {
    @Resolve("apiService")
    public apiService: ApiService;

    @Resolve("routeHelper")
    public routeHelper: RouteHelper;

    @Resolve("router")
    public router: Router;

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

        console.log("apiName", apiName);

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
                <ApiProductsRuntimeFC
                    {...this.props}
                    apiService={this.apiService}
                    apiName={this.state.apiName}
                    getReferenceUrl={(productName) => this.getReferenceUrl(productName)}
                />
            </FluentProvider>
        );
    }
}
