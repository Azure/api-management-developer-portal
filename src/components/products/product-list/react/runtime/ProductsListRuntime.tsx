import * as React from "react";
import { useEffect, useState } from "react";
import { Stack } from "@fluentui/react";
import { FluentProvider, Spinner } from "@fluentui/react-components";
import { Resolve } from "@paperbits/react/decorators";
import { SearchQuery } from "../../../../../contracts/searchQuery";
import * as Constants from "../../../../../constants";
import { fuiTheme } from "../../../../../constants";
import { ProductService } from "../../../../../services/productService";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { Pagination } from "../../../../utils/react/Pagination";
import { TableListInfo, TLayout } from "../../../../utils/react/TableListInfo";
import { ProductsDropdown } from "./ProductsDropdown";
import { ProductsTable } from "./ProductsTable";
import { ProductsCards } from "./ProductsCards";
import { TProductsData } from "./utils";

export interface ProductsListProps {
    allowSelection?: boolean;
    allowViewSwitching?: boolean;
    detailsPageUrl: string;
    layoutDefault: TLayout;
}

const loadProducts = async (productService: ProductService, query: SearchQuery) => {
    let products: TProductsData;

    try {
        products = await productService.getProductsPage(query);
    } catch (error) {
        throw new Error(`Unable to load Products. Error: ${error.message}`);
    }

    return products;
}

export type TProductListRuntimeFCProps = Omit<ProductsListProps, "detailsPageUrl"> & {
    productService: ProductService;
    getReferenceUrl: (productName: string) => string;
};

const ProductListRuntimeFC = ({ productService, getReferenceUrl, layoutDefault, allowViewSwitching }: TProductListRuntimeFCProps) => {
    const [working, setWorking] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [products, setProducts] = useState<TProductsData>();
    const [layout, setLayout] = useState<TLayout>(layoutDefault ?? TLayout.table);
    const [pattern, setPattern] = useState<string>();

    /**
     * Loads page of Products.
     */
    useEffect(() => {
        const query: SearchQuery = {
            pattern,
            skip: (pageNumber - 1) * Constants.defaultPageSize,
            take: Constants.defaultPageSize,
        };

        setWorking(true);
        loadProducts(productService, query)
            .then((products) => setProducts(products))
            .finally(() => setWorking(false));
    }, [productService, pageNumber, pattern]);

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
            <TableListInfo
                layout={layout}
                setLayout={setLayout}
                pattern={pattern}
                setPattern={setPattern}
                allowViewSwitching={allowViewSwitching}
            />

            {working || !products ? (
                <div className="table-body">
                    <Spinner label="Loading products..." labelPosition="below" size="small" />
                </div>
            ) : (
                <>
                    <div style={{ marginTop: "2rem" }}>
                        {layout === TLayout.table ? (
                            <ProductsTable products={products} getReferenceUrl={getReferenceUrl} />
                        ) : (
                            <ProductsCards products={products} getReferenceUrl={getReferenceUrl} />
                        )}
                    </div>

                    <div style={{ margin: "1rem auto" }}>
                        <Pagination pageNumber={pageNumber} setPageNumber={setPageNumber} pageMax={Math.ceil(products?.count / 10)} />
                    </div>
                </>
            )}
        </Stack>
    );
};

export class ProductsListRuntime extends React.Component<ProductsListProps> {
    @Resolve("productService")
    public productService: ProductService;

    @Resolve("routeHelper")
    public routeHelper: RouteHelper;

    getReferenceUrl(productName: string): string {
        return this.routeHelper.getProductReferenceUrl(productName, this.props.detailsPageUrl);
    }

    render() {
        return (
            <FluentProvider theme={fuiTheme}>
                <ProductListRuntimeFC
                    {...this.props}
                    productService={this.productService}
                    getReferenceUrl={(productName) => this.getReferenceUrl(productName)}
                />
            </FluentProvider>
        );
    }
}
