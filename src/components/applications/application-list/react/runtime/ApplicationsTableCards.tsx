import * as React from "react";
import { useEffect, useState } from "react";
import { Stack } from "@fluentui/react";
import { Spinner } from "@fluentui/react-components";
import { TableListInfo, TLayout } from "../../../../utils/react/TableListInfo";
import { Pagination } from "../../../../utils/react/Pagination";
import { SearchQuery } from "../../../../../contracts/searchQuery";
import { defaultPageSize } from "../../../../../constants";
import { ApplicationsTable } from "./ApplicationsTable";
import { ApplicationsCards } from "./ApplicationsCards";
import { TProductListRuntimeFCProps } from "../../../../products/product-list/react/runtime/ProductsListRuntime";
import { application } from "./ApplicationsListRuntime";

type TProductsTableCards = TProductListRuntimeFCProps;

export const ApplicationsTableCards = ({
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
    const [applications, setApplications] = useState([application]);
    const [layout, setLayout] = useState<TLayout>(layoutDefault ?? TLayout.table);
    const [pattern, setPattern] = useState<string>();
    
    useEffect(() => {
        const query: SearchQuery = {
            pattern,
            skip: (pageNumber - 1) * defaultPageSize,
            take: defaultPageSize,
        };

        // setWorking(true);
        // loadApplications(query)
        //     .then((loadedProducts) => setProducts(loadedProducts))
        //     .finally(() => setWorking(false));
    }, [productService, apiService, apiName, isApiProducts, pageNumber, pattern]);

    // const loadApplications = async (query: SearchQuery) => {
    //     let products: TProductsData;
    
    //     try {
    //         products = await productService.getProductsPage(query);
    //     } catch (error) {
    //         throw new Error(`Unable to load Products. Error: ${error.message}`);
    //     }
    
    //     return products;
    // }

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

            {working || !applications ? (
                <div className="table-body">
                    <Spinner label="Loading applications..." labelPosition="below" size="small" />
                </div>
            ) : (
                <>
                    {/* <div style={{ margin: "1rem auto 2rem" }}>
                        <Pagination pageNumber={pageNumber} setPageNumber={setPageNumber} pageMax={Math.ceil(applications?.count / defaultPageSize)} />
                    </div> */}

                    <div>
                        {layout === TLayout.table ? (
                            <ApplicationsTable applications={applications} getReferenceUrl={getReferenceUrl} />
                        ) : (
                            <ApplicationsCards applications={applications} getReferenceUrl={getReferenceUrl} />
                        )}
                    </div>

                    {/* <div style={{ margin: "1rem auto" }}>
                        <Pagination pageNumber={pageNumber} setPageNumber={setPageNumber} pageMax={Math.ceil(applications?.count / defaultPageSize)} />
                    </div> */}
                </>
            )}
        </Stack>
    );
};
