import * as React from "react";
import { useEffect, useState } from "react";
import { TProductsData } from "./utils";
import { Stack } from "@fluentui/react";
import { Spinner } from "@fluentui/react-components";
import { TableListInfo, TLayout } from "../../../../utils/react/TableListInfo";
import { Pagination } from "../../../../utils/react/Pagination";
import { SearchQuery } from "../../../../../contracts/searchQuery";
import { defaultPageSize } from "../../../../../constants";
import { ProductsTable } from "./ProductsTable";
import { ProductsCards } from "./ProductsCards";
import { TProductListRuntimeFCProps } from "./ProductsListRuntime";

type TProductsTableCards = TProductListRuntimeFCProps;

export const ProductsTableCards = ({
    getReferenceUrl,
    productService,
    apiService,
    apiName,
    isApiProducts,
    layoutDefault,
    allowViewSwitching
}: TProductsTableCards) => {
    const [working, setWorking] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [products, setProducts] = useState<TProductsData>();
    const [layout, setLayout] = useState<TLayout>(layoutDefault ?? TLayout.table);
    const [pattern, setPattern] = useState<string>();
    
    useEffect(() => {
        const query: SearchQuery = {
            pattern,
            skip: (pageNumber - 1) * defaultPageSize,
            take: defaultPageSize,
        };

        setWorking(true);
        if (isApiProducts) {
            if (apiName) {
                loadApiProducts(apiName, query)
                    .then((loadedProducts) => setProducts(loadedProducts))
                    .finally(() => setWorking(false));
            }
        } else {
            loadProducts(query)
                .then((loadedProducts) => setProducts(loadedProducts))
                .finally(() => setWorking(false));
        }
    }, [productService, apiService, apiName, isApiProducts, pageNumber, pattern]);

    const loadProducts = async (query: SearchQuery) => {
        let products: TProductsData;
    
        try {
            products = await productService.getProductsPage(query);
        } catch (error) {
            throw new Error(`Unable to load Products. Error: ${error.message}`);
        }
    
        return products;
    }

    const loadApiProducts = async (apiName: string, query: SearchQuery) => {
        let products: TProductsData;
    
        try {
            products = await apiService.getApiProductsPage(apiName, query);
        } catch (error) {
            throw new Error(`Unable to load Products. Error: ${error.message}`);
        }
    
        return products;
    }

    return (
        <Stack tokens={{ childrenGap: "1rem" }}>
            <TableListInfo
                layout={layout}
                setLayout={setLayout}
                pattern={pattern}
                setPattern={setPattern}
                setPageNumber={setPageNumber}
                allowViewSwitching={allowViewSwitching}
            />

            {working || !products ? (
                <div className="table-body">
                    <Spinner label="Loading products..." labelPosition="below" size="small" />
                </div>
            ) : (
                <>
                    <div style={{ margin: "1rem auto 2rem" }}>
                        <Pagination pageNumber={pageNumber} setPageNumber={setPageNumber} pageMax={Math.ceil(products?.count / defaultPageSize)} />
                    </div>

                    <div>
                        {layout === TLayout.table ? (
                            <ProductsTable products={products.value} getReferenceUrl={getReferenceUrl} />
                        ) : (
                            <ProductsCards products={products.value} getReferenceUrl={getReferenceUrl} />
                        )}
                    </div>

                    <div style={{ margin: "1rem auto" }}>
                        <Pagination pageNumber={pageNumber} setPageNumber={setPageNumber} pageMax={Math.ceil(products?.count / defaultPageSize)} />
                    </div>
                </>
            )}
        </Stack>
    );
};
