import * as React from "react";
import { useEffect, useState } from "react";
import { Combobox, Option, Spinner } from "@fluentui/react-components";
import { Product } from "../../../../../models/product";
import { SearchQuery } from "../../../../../contracts/searchQuery";
import { defaultPageSize } from "../../../../../constants";
import { TProductsData } from "./utils";
import { TProductListRuntimeFCProps } from "./ProductsListRuntime";

type TProductListDropdown = Omit<
    TProductListRuntimeFCProps,
    "layoutDefault" | "productName"
>;

const Options = ({
    products,
    getReferenceUrl,
}: {
    products: Product[];
    getReferenceUrl: TProductListRuntimeFCProps["getReferenceUrl"];
}) => (
    <>
        {products.map((product) => (
            <Option key={product.id} value={product.name} text={product.displayName}>
                <a href={getReferenceUrl(product.name)} className="dropdown-link">{product.displayName}</a>
            </Option>
        ))}
    </>
);

export const ProductsDropdown = ({
    getReferenceUrl,
    productService,
    apiService,
    apiName,
    selectedProduct,
    isApiProducts
}: TProductListDropdown & { selectedProduct?: Product | null }) => {
    const [working, setWorking] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [hasNextPage, setHasNextPage] = useState<boolean>(false);
    const [products, setProducts] = useState<Product[]>([]);
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
                    .then((loadedProducts) => {
                        if (pageNumber > 1) {
                            setProducts([...products, ...loadedProducts.value]);
                        } else {
                            setProducts([...loadedProducts.value]);
                        }
                        setHasNextPage(!!loadedProducts.nextLink);
                    })
                    .finally(() => setWorking(false));
            }
        } else {
            loadProducts(query)
                .then((loadedProducts) => {
                    if (pageNumber > 1) {
                        setProducts([...products, ...loadedProducts.value]);
                    } else {
                        setProducts([...loadedProducts.value]);
                    }
                    setHasNextPage(!!loadedProducts.nextLink);
                })
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

    const content = !products || (!isApiProducts && selectedProduct === undefined) ? (
        <>Loading Products</> // if data are not loaded yet ComboBox sometimes fails to initialize properly - edge case, in most cases almost instant from the cache
    ) : (
        <Combobox
            style={{ width: "100%", minWidth: 0 }}
            placeholder={"Select Product"}
            onInput={(event) => setPattern(event.target?.["value"])}
            defaultValue={selectedProduct?.displayName}
            defaultSelectedOptions={[selectedProduct?.name]}
            onOptionSelect={(_, { optionValue }) => {
                if (!optionValue) return;
                window.location.hash = getReferenceUrl(optionValue);
            }}
        >
            {working ? (
                <Spinner
                    label={"Loading Products"}
                    labelPosition={"above"}
                    size={"small"}
                    style={{ padding: "1rem" }}
                />
            ) : (
                <>
                   <Options
                        products={products}
                        getReferenceUrl={getReferenceUrl}
                    />

                    {hasNextPage && (
                        <Option
                            disabled
                            value={"pagination"}
                            text={"pagination"}
                            checkIcon={<></>}
                            style={{ columnGap: 0 }}
                        >
                            <button className={"button button-default show-more-options"} onClick={() => setPageNumber(prev => prev + 1)}>Show more</button>
                        </Option>
                    )}
                </>
            )}
        </Combobox>
    );

    return (
        <>
            <span className="strong">Product</span>
            <div style={{ padding: ".25rem 0 1rem" }}>{content}</div>
        </>
    );
};